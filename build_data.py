#!/usr/bin/env python3
"""
Build frontend-optimized data files from scraped raw data.
Creates paginated index chunks and per-thread body files.
"""

import json
import os
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent / "data"
EMAILS_PER_PAGE = 50


def main():
    print("Loading raw data...")
    with open(DATA_DIR / "emails.json") as f:
        emails = json.load(f)
    with open(DATA_DIR / "contacts.json") as f:
        contacts = json.load(f)

    print(f"  {len(emails)} emails, {len(contacts)} contacts")

    # 1. Build compact index (no bodies)
    print("Building email index...")
    index = []
    for e in emails:
        index.append({
            "id": e["id"],
            "did": e["doc_id"],
            "f": e["from"],
            "fe": e.get("from_email", ""),
            "t": e["to"],
            "s": e["subject"],
            "sn": e["snippet"],
            "d": e["date"],
            "fd": e.get("formatted_date", ""),
            "ft": e.get("formatted_time", ""),
            "ep": e.get("is_from_epstein", False),
            "sent": e.get("is_sent", False),
            "att": e.get("attachments", 0),
            "ac": e.get("avatar_color", "#666"),
            "st": e.get("stars", 0),
            "r": e.get("is_redacted", False),
        })

    # 2. Save paginated index pages
    pages_dir = DATA_DIR / "pages"
    pages_dir.mkdir(exist_ok=True)
    total_pages = (len(index) + EMAILS_PER_PAGE - 1) // EMAILS_PER_PAGE

    for page_num in range(total_pages):
        start = page_num * EMAILS_PER_PAGE
        end = start + EMAILS_PER_PAGE
        page_data = index[start:end]
        with open(pages_dir / f"{page_num}.json", "w") as f:
            json.dump(page_data, f, ensure_ascii=True, separators=(",", ":"))

    print(f"  {total_pages} index pages")

    # Also save metadata
    meta = {
        "totalEmails": len(index),
        "totalPages": total_pages,
        "perPage": EMAILS_PER_PAGE,
        "totalContacts": len(contacts),
    }
    with open(DATA_DIR / "meta.json", "w") as f:
        json.dump(meta, f, ensure_ascii=True)

    # 3. Build per-thread body files
    print("Building thread files...")
    threads_dir = DATA_DIR / "threads"
    threads_dir.mkdir(exist_ok=True)

    threads = defaultdict(list)
    for e in emails:
        threads[e["doc_id"]].append({
            "id": e["id"],
            "from": e["from"],
            "from_email": e.get("from_email", ""),
            "to": e["to"],
            "to_list": e.get("to_list", []),
            "cc_list": e.get("cc_list", []),
            "subject": e["subject"],
            "date": e["date"],
            "formatted_date": e.get("formatted_date", ""),
            "formatted_time": e.get("formatted_time", ""),
            "body": e.get("body", ""),
            "body_html": e.get("body_html", ""),
            "is_from_epstein": e.get("is_from_epstein", False),
            "attachments": e.get("attachments", 0),
            "avatar_color": e.get("avatar_color", "#666"),
            "stars": e.get("stars", 0),
            "is_redacted": e.get("is_redacted", False),
        })

    for doc_id, msgs in threads.items():
        with open(threads_dir / f"{doc_id}.json", "w") as f:
            json.dump(msgs, f, ensure_ascii=True, separators=(",", ":"))

    print(f"  {len(threads)} thread files")

    # 4. Save contacts as paginated JSON
    contacts_cleaned = []
    for c in contacts[:500]:  # top 500 contacts
        contacts_cleaned.append({
            "n": c["name"],
            "e": c["email"],
            "s": c.get("sent", 0),
            "r": c.get("received", 0),
            "ac": c.get("avatar_color", "#666"),
        })
    with open(DATA_DIR / "contacts-index.json", "w") as f:
        json.dump(contacts_cleaned, f, ensure_ascii=True, separators=(",", ":"))

    # 5. Print stats
    total_size = 0
    for root, dirs, files in os.walk(DATA_DIR):
        for fname in files:
            if fname.endswith(".json"):
                total_size += os.path.getsize(os.path.join(root, fname))

    print(f"\nTotal data size: {total_size / (1024*1024):.1f} MB")
    print(f"  pages/: {sum(os.path.getsize(pages_dir/f) for f in os.listdir(pages_dir))/(1024*1024):.1f} MB")
    print(f"  threads/: {sum(os.path.getsize(threads_dir/f) for f in os.listdir(threads_dir))/(1024*1024):.1f} MB")
    print("Done!")


if __name__ == "__main__":
    main()
