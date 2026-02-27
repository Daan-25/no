#!/usr/bin/env python3
"""
Scrape jmail.world for real Epstein email data.
Outputs data/emails.json, data/contacts.json with real thread data.
"""

import asyncio
import json
import re
import sys
import time
from pathlib import Path

import aiohttp

CONCURRENCY_PAGES = 10
CONCURRENCY_THREADS = 40
RETRY_LIMIT = 3
RETRY_DELAY = 1.5
OUTPUT_DIR = Path(__file__).parent / "data"

COOKIE = "jmail_anim_suppress=1"
HEADERS_RSC = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:149.0) Gecko/20100101 Firefox/149.0",
    "Accept": "text/x-component",
    "RSC": "1",
    "Cookie": COOKIE,
}
HEADERS_API = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:149.0) Gecko/20100101 Firefox/149.0",
    "Accept": "*/*",
    "Cookie": COOKIE,
}
BASE = "https://jmail.world"


async def fetch_page_ids(session, path, sem):
    url = f"{BASE}{path}"
    headers = {**HEADERS_RSC, "Next-Url": path}
    for attempt in range(RETRY_LIMIT):
        try:
            async with sem:
                async with session.get(url, headers=headers, params={"_rsc": "1"}) as resp:
                    raw = await resp.read()
                    text = raw.decode("utf-8", errors="replace")
                    ids = re.findall(r'"doc_id":"([^"]+)"', text)
                    return ids
        except Exception as e:
            if attempt < RETRY_LIMIT - 1:
                await asyncio.sleep(RETRY_DELAY * (attempt + 1))
            else:
                print(f"  WARN: failed {path}: {e}", file=sys.stderr)
                return []


async def collect_all_ids(session):
    sem = asyncio.Semaphore(CONCURRENCY_PAGES)

    print("Phase 1: discovering pages...")
    inbox_p1 = await fetch_page_ids(session, "/", sem)

    try:
        async with session.get(f"{BASE}/api/thread-counts", headers=HEADERS_API,
                               params={"source": "all", "newReleasesOnly": "false"}) as resp:
            counts = await resp.json()
        inbox_total = counts.get("inbox", 7545)
        sent_total = counts.get("sent", 4340)
    except:
        inbox_total = 7545
        sent_total = 4340

    inbox_pages = (inbox_total + 99) // 100
    sent_pages = (sent_total + 99) // 100
    print(f"  Inbox: {inbox_total} threads ({inbox_pages} pages)")
    print(f"  Sent:  {sent_total} threads ({sent_pages} pages)")

    paths = []
    for p in range(2, inbox_pages + 1):
        paths.append(f"/page/{p}")
    paths.append("/sent")
    for p in range(2, sent_pages + 1):
        paths.append(f"/sent/page/{p}")

    print(f"  Fetching {len(paths) + 1} pages...")
    tasks = [fetch_page_ids(session, path, sem) for path in paths]
    results = await asyncio.gather(*tasks)

    all_ids = set(inbox_p1)
    for ids in results:
        all_ids.update(ids)
    
    print(f"  Found {len(all_ids)} unique doc_ids")
    return sorted(all_ids)


async def fetch_thread(session, doc_id, sem, stats):
    url = f"{BASE}/api/threads/{doc_id}"
    for attempt in range(RETRY_LIMIT):
        try:
            async with sem:
                async with session.get(url, headers=HEADERS_API) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        stats["ok"] += 1
                        return data
                    elif resp.status == 404:
                        stats["not_found"] += 1
                        return None
                    else:
                        if attempt < RETRY_LIMIT - 1:
                            await asyncio.sleep(RETRY_DELAY * (attempt + 1))
                        else:
                            stats["errors"] += 1
                            return None
        except Exception as e:
            if attempt < RETRY_LIMIT - 1:
                await asyncio.sleep(RETRY_DELAY * (attempt + 1))
            else:
                stats["errors"] += 1
                return None


async def fetch_all_threads(session, doc_ids):
    sem = asyncio.Semaphore(CONCURRENCY_THREADS)
    stats = {"ok": 0, "not_found": 0, "errors": 0}
    all_threads = []
    total = len(doc_ids)
    t0 = time.time()

    print(f"Phase 2: fetching {total} threads (concurrency={CONCURRENCY_THREADS})...")

    batch_size = 200
    for batch_start in range(0, total, batch_size):
        batch = doc_ids[batch_start:batch_start + batch_size]
        tasks = [fetch_thread(session, did, sem, stats) for did in batch]
        results = await asyncio.gather(*tasks)

        for data in results:
            if data is not None:
                all_threads.append(data)

        done = min(batch_start + batch_size, total)
        elapsed = time.time() - t0
        rate = done / elapsed if elapsed > 0 else 0
        eta = (total - done) / rate if rate > 0 else 0
        print(f"  {done}/{total} ({stats['ok']} ok) — {rate:.1f} req/s, ETA {eta:.0f}s")

    elapsed = time.time() - t0
    print(f"\nFetched {stats['ok']} threads in {elapsed:.1f}s")
    return all_threads


def parse_recipient(raw):
    """Parse recipient string like '<email>' or 'Name <email>' into dict."""
    raw = raw.strip()
    m = re.match(r'^(.*?)\s*<([^>]+)>', raw)
    if m:
        name = m.group(1).strip().strip('"').strip("'")
        email = m.group(2).strip()
        return {"name": name or email, "email": email}
    raw = raw.strip('<>').strip()
    return {"name": raw, "email": raw}


def process_data(raw_threads):
    """Convert raw thread data into clean emails + contacts."""
    emails = []
    contact_map = {}
    
    for thread_data in raw_threads:
        thread = thread_data.get("thread", {})
        messages = thread.get("messages", [])
        star_counts = thread_data.get("starCounts", {})
        
        doc_id = thread.get("doc_id", "")
        subject = thread.get("subject", "(no subject)")
        is_sent = thread.get("isSent", False)
        
        for msg in messages:
            msg_id = msg.get("id", "")
            sender_name = msg.get("sender_name", "") or "Unknown"
            sender_email = msg.get("sender_email", "")
            sent_at = msg.get("sent_at", "")
            content = msg.get("content_markdown", "") or ""
            is_from_epstein = msg.get("is_from_epstein", False)
            
            to_raw = msg.get("to_recipients", [])
            cc_raw = msg.get("cc_recipients", [])
            bcc_raw = msg.get("bcc_recipients", [])
            
            to_parsed = [parse_recipient(r) for r in to_raw]
            cc_parsed = [parse_recipient(r) for r in cc_raw]
            
            to_str = ", ".join(r["name"] for r in to_parsed) if to_parsed else "Unknown"
            
            preview = msg.get("preview", "") or content[:200].replace("\n", " ").strip()
            
            email_obj = {
                "id": msg_id,
                "doc_id": doc_id,
                "from": sender_name,
                "from_email": sender_email,
                "to": to_str,
                "to_list": to_parsed,
                "cc_list": cc_parsed,
                "subject": subject,
                "snippet": preview[:120],
                "date": sent_at,
                "formatted_date": msg.get("formatted_date", ""),
                "formatted_time": msg.get("formatted_time", ""),
                "body": content,
                "body_html": msg.get("content_html", ""),
                "is_from_epstein": is_from_epstein,
                "is_sent": is_sent,
                "attachments": msg.get("attachments", 0),
                "avatar_color": msg.get("avatar_color", "#666"),
                "stars": star_counts.get(msg_id, 0),
                "is_redacted": msg.get("isRedacted", False),
            }
            emails.append(email_obj)
            
            # Track contacts
            if sender_email and sender_email not in contact_map:
                contact_map[sender_email] = {
                    "name": sender_name, "email": sender_email,
                    "sent": 0, "received": 0, "avatar_color": msg.get("avatar_color", "#666")
                }
            if sender_email in contact_map:
                contact_map[sender_email]["sent"] += 1
            
            for r in to_parsed + cc_parsed:
                addr = r["email"]
                if addr and addr not in contact_map:
                    contact_map[addr] = {"name": r["name"], "email": addr, "sent": 0, "received": 0, "avatar_color": "#666"}
                if addr in contact_map:
                    contact_map[addr]["received"] += 1

    # Sort emails by date (newest first)
    emails.sort(key=lambda e: e.get("date") or "", reverse=True)
    
    # Sort contacts by total messages
    contacts = sorted(contact_map.values(), key=lambda c: c["sent"] + c["received"], reverse=True)
    
    return emails, contacts


async def main():
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    connector = aiohttp.TCPConnector(limit=60, limit_per_host=60)
    timeout = aiohttp.ClientTimeout(total=30)
    
    async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
        doc_ids = await collect_all_ids(session)
        raw_threads = await fetch_all_threads(session, doc_ids)
    
    print("\nProcessing data...")
    emails, contacts = process_data(raw_threads)
    
    print(f"  {len(emails)} emails, {len(contacts)} contacts")
    
    # Save full data
    with open(OUTPUT_DIR / "emails.json", "w", errors="surrogatepass") as f:
        json.dump(emails, f, ensure_ascii=True)
    
    with open(OUTPUT_DIR / "contacts.json", "w") as f:
        json.dump(contacts, f, ensure_ascii=True)
    
    # Stats
    email_size = (OUTPUT_DIR / "emails.json").stat().st_size / 1024 / 1024
    contact_size = (OUTPUT_DIR / "contacts.json").stat().st_size / 1024 / 1024
    print(f"  emails.json: {email_size:.1f} MB")
    print(f"  contacts.json: {contact_size:.2f} MB")
    print("Done!")


if __name__ == "__main__":
    print("jmail.world scraper\n")
    asyncio.run(main())
