// === CINEMATIC INTRO ===
(function initIntro() {
    const overlay = document.getElementById('intro-overlay');
    if (!overlay) return;

    // Skip intro if already seen (or replaying)
    const seen = localStorage.getItem('unsealed_intro_seen');
    if (seen && !sessionStorage.getItem('replay_intro')) {
        overlay.remove();
        return;
    }
    sessionStorage.removeItem('replay_intro');

    // Particle background
    const canvas = document.getElementById('intro-particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create floating document particles
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: -Math.random() * 0.5 - 0.1,
            opacity: Math.random() * 0.4 + 0.1,
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const p of particles) {
            ctx.fillStyle = `rgba(192, 57, 43, ${p.opacity})`;
            ctx.fillRect(p.x, p.y, p.size, p.size * 1.4);
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
            if (p.x < -10) p.x = canvas.width + 10;
            if (p.x > canvas.width + 10) p.x = -10;
        }
        // Draw subtle connection lines between close particles
        ctx.strokeStyle = 'rgba(192, 57, 43, 0.06)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                if (dx * dx + dy * dy < 15000) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[j].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        animFrame = requestAnimationFrame(drawParticles);
    }
    drawParticles();

    // Sequenced reveal
    const stamp = document.getElementById('intro-stamp');
    const line1 = document.getElementById('intro-line-1');
    const line2 = document.getElementById('intro-line-2');
    const stats = document.getElementById('intro-stats');
    const line3 = document.getElementById('intro-line-3');
    const enterBtn = document.getElementById('intro-enter');

    function countUp(el, target, duration) {
        const start = performance.now();
        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target).toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    setTimeout(() => stamp.classList.add('visible'), 400);
    setTimeout(() => line1.classList.add('visible'), 1200);
    setTimeout(() => line2.classList.add('visible'), 2600);
    setTimeout(() => {
        stats.classList.add('visible');
        stats.querySelectorAll('.intro-stat-num').forEach(el => {
            countUp(el, parseInt(el.dataset.target), 2000);
        });
    }, 3200);
    setTimeout(() => line3.classList.add('visible'), 5600);
    setTimeout(() => enterBtn.classList.add('visible'), 6400);

    enterBtn.addEventListener('click', () => {
        localStorage.setItem('unsealed_intro_seen', '1');
        overlay.classList.add('hidden');
        cancelAnimationFrame(animFrame);
        setTimeout(() => overlay.remove(), 900);
    });

    // Allow skip with Escape
    document.addEventListener('keydown', function introEsc(e) {
        if (e.key === 'Escape' && overlay.parentNode) {
            localStorage.setItem('unsealed_intro_seen', '1');
            overlay.classList.add('hidden');
            cancelAnimationFrame(animFrame);
            setTimeout(() => overlay.remove(), 900);
            document.removeEventListener('keydown', introEsc);
        }
    });
})();

// === HELPERS ===
const COLORS = ['#1a73e8','#ea4335','#34a853','#fbbc04','#ff6d01','#46bdc6','#7baaf7','#e07070','#a142f4','#24c1e0'];
function getColor(str) { let h = 0; for (let i = 0; i < (str||'').length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return COLORS[Math.abs(h) % COLORS.length]; }
function initials(name) { if (!name) return '?'; const parts = name.trim().split(/\s+/); return parts.map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

// === STATE ===
const state = {
    meta: null,
    pages: {},          // pageNum -> array of email index entries
    allLoaded: [],      // flat array of all loaded emails for the current view
    threadCache: {},    // doc_id -> thread messages array
    contacts: [],
    currentPage: 0,
    loading: false,
    folder: 'inbox',   // inbox, sent, starred
    filter: 'all',
    searchQuery: '',
    searchResults: null,
    starred: JSON.parse(localStorage.getItem('jmail_starred') || '{}'),
};

// === DATA LOADING ===
async function loadMeta() {
    const resp = await fetch('data/meta.json');
    state.meta = await resp.json();
}

async function loadPage(pageNum) {
    if (state.pages[pageNum]) return state.pages[pageNum];
    const resp = await fetch(`data/pages/${pageNum}.json`);
    if (!resp.ok) return [];
    const data = await resp.json();
    state.pages[pageNum] = data;
    return data;
}

async function loadThread(docId) {
    if (state.threadCache[docId]) return state.threadCache[docId];
    const resp = await fetch(`data/threads/${docId}.json`);
    if (!resp.ok) return null;
    const data = await resp.json();
    state.threadCache[docId] = data;
    return data;
}

async function loadContacts() {
    const resp = await fetch('data/contacts-index.json');
    state.contacts = await resp.json();
}

// === EMAIL LIST ===
function applyFilters(emails) {
    let result = emails;
    if (state.folder === 'sent') result = result.filter(e => e.sent);
    else if (state.folder === 'starred') result = result.filter(e => state.starred[e.id]);
    else if (state.folder === 'all') { /* show everything */ }
    else result = result.filter(e => !e.sent); // inbox

    if (state.filter === 'from-epstein') result = result.filter(e => e.ep);
    else if (state.filter === 'to-epstein') result = result.filter(e => !e.ep);
    else if (state.filter === 'attachments') result = result.filter(e => e.att > 0);

    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();
        result = result.filter(e =>
            (e.f||'').toLowerCase().includes(q) ||
            (e.s||'').toLowerCase().includes(q) ||
            (e.sn||'').toLowerCase().includes(q) ||
            (e.t||'').toLowerCase().includes(q)
        );
    }
    return result;
}

function renderEmailRow(e) {
    const isStarred = state.starred[e.id];
    const color = e.ac || getColor(e.f);
    const sentiment = analyzeSentiment((e.sn || '') + ' ' + (e.s || ''));
    return `<div class="email-row" data-id="${esc(e.id)}" data-did="${esc(e.did)}">
        <span class="email-star ${isStarred ? 'starred' : ''}" data-id="${esc(e.id)}">★</span>
        ${sentimentDot(sentiment)}
        <div class="email-avatar-sm" style="background:${color}">${initials(e.f)}</div>
        <span class="email-sender">${esc(e.f)}</span>
        <span class="email-subject">${esc(e.s)} <span class="email-snippet">— ${esc(e.sn)}</span></span>
        ${e.att > 0 ? '<span class="email-attachment">📎</span>' : ''}
        <span class="email-date">${esc(e.fd || '')}</span>
    </div>`;
}

function renderEmailList(emails) {
    const list = document.getElementById('email-list');
    if (!emails || emails.length === 0) {
        list.innerHTML = '<div class="empty-state">No emails found</div>';
        return;
    }
    // Render first 500, show "load more" button if there are more
    const RENDER_LIMIT = 500;
    const toRender = emails.slice(0, RENDER_LIMIT);
    let html = toRender.map(renderEmailRow).join('');
    if (emails.length > RENDER_LIMIT) {
        html += `<div class="load-more-wrap"><button class="load-more-btn" id="load-more-btn">Show all ${emails.length.toLocaleString()} emails</button></div>`;
    }
    list.innerHTML = html;
    bindEmailListEvents();

    if (emails.length > RENDER_LIMIT) {
        document.getElementById('load-more-btn').addEventListener('click', () => {
            list.innerHTML = emails.map(renderEmailRow).join('');
            bindEmailListEvents();
        });
    }
}

function bindEmailListEvents() {
    const list = document.getElementById('email-list');
    list.querySelectorAll('.email-row').forEach(row => {
        row.addEventListener('click', (ev) => {
            if (ev.target.classList.contains('email-star')) return;
            openEmail(row.dataset.id, row.dataset.did);
        });
    });
    list.querySelectorAll('.email-star').forEach(star => {
        star.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const id = star.dataset.id;
            state.starred[id] = !state.starred[id];
            if (!state.starred[id]) delete state.starred[id];
            localStorage.setItem('jmail_starred', JSON.stringify(state.starred));
            star.classList.toggle('starred');
        });
    });
}

function updateEmailCount(shown, total) {
    const countEl = document.querySelector('.email-count');
    if (countEl) {
        const label = {sent:'Sent', starred:'Starred', all:'All Mail'}[state.folder] || 'Inbox';
        countEl.textContent = state.searchQuery
            ? `${shown.toLocaleString()} results`
            : `${label}: ${shown.toLocaleString()} emails`;
    }
}

// === PAGINATION ===
async function loadAllEmails() {
    if (state.loading) return;
    state.loading = true;
    showLoading(true);

    const totalPages = state.meta ? state.meta.totalPages : 303;
    const CONCURRENT = 20;

    for (let start = 0; start < totalPages; start += CONCURRENT) {
        const promises = [];
        for (let i = start; i < Math.min(start + CONCURRENT, totalPages); i++) {
            promises.push(loadPage(i));
        }
        const results = await Promise.all(promises);
        results.forEach(pageData => {
            state.allLoaded.push(...pageData);
        });

        // Update count periodically
        const filtered = applyFilters(state.allLoaded);
        renderEmailList(filtered);
        updateEmailCount(filtered.length, state.meta ? state.meta.totalEmails : state.allLoaded.length);
    }

    state.loading = false;
    showLoading(false);
}

function showLoading(on) {
    let el = document.getElementById('loading-indicator');
    if (on) {
        if (!el) {
            el = document.createElement('div');
            el.id = 'loading-indicator';
            el.className = 'loading-indicator';
            el.innerHTML = '<div class="spinner"></div> Loading emails...';
            document.getElementById('email-list').after(el);
        }
        el.style.display = 'flex';
    } else if (el) {
        el.style.display = 'none';
    }
}

// (infinite scroll removed — all data loaded at startup)

// === EMAIL DETAIL ===
async function openEmail(emailId, docId) {
    if (readingPaneActive) {
        // In reading pane mode, load in side pane instead
        openInReadingPane(emailId, docId);
        return;
    }
    const detail = document.getElementById('email-detail');
    detail.innerHTML = '<div class="loading-indicator"><div class="spinner"></div> Loading thread...</div>';
    switchView('email-detail');

    const thread = await loadThread(docId);
    if (!thread) {
        detail.innerHTML = '<div class="empty-state">Failed to load email</div>';
        return;
    }

    detail.innerHTML = buildEmailDetailHTML(thread);

    // Thread timeline dot click -> scroll to message
    detail.querySelectorAll('.tt-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const idx = parseInt(dot.dataset.idx);
            const msgs = detail.querySelectorAll('.email-detail-message');
            if (msgs[idx]) msgs[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
            detail.querySelectorAll('.tt-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });
}

// === CONTACTS ===
function renderContacts(search) {
    const grid = document.getElementById('contacts-grid');
    let filtered = state.contacts;
    if (search) {
        const q = search.toLowerCase();
        filtered = state.contacts.filter(c =>
            (c.n||'').toLowerCase().includes(q) || (c.e||'').toLowerCase().includes(q)
        );
    }
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state">No contacts found</div>';
        return;
    }
    // Sort pinned contacts to top
    const sorted = [...filtered].sort((a, b) => {
        const ap = isPinned(a.e) ? 0 : 1;
        const bp = isPinned(b.e) ? 0 : 1;
        return ap - bp;
    });
    grid.innerHTML = sorted.slice(0, 200).map(c => {
        const color = c.ac || getColor(c.n);
        const total = (c.s || 0) + (c.r || 0);
        const pinned = isPinned(c.e);
        return `<div class="contact-card ${pinned ? 'pinned-card' : ''}" data-email="${esc(c.e)}">
            <div class="contact-avatar" style="background:${color}">${initials(c.n)}</div>
            <div class="contact-info">
                <h3>${esc(c.n)}</h3>
                <p>${esc(c.e)}</p>
            </div>
            <span class="contact-count">${total} emails</span>
            <button class="contact-pin ${pinned ? 'pinned' : ''}" data-email="${esc(c.e)}" title="${pinned ? 'Unpin' : 'Pin to top'}">📌</button>
        </div>`;
    }).join('');

    grid.querySelectorAll('.contact-pin').forEach(pin => {
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePinContact(pin.dataset.email);
            renderContacts(search);
        });
    });

    grid.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.contact-pin')) return;
            const email = card.dataset.email;
            document.getElementById('search-input').value = email;
            state.searchQuery = email;
            switchView('inbox');
            refreshInbox();
        });
    });
}

// === FLIGHT DATA (loaded from real court records) ===
const flightState = { data: null, searchQuery: '', filtered: [] };

async function loadFlights() {
    try {
        const resp = await fetch('data/flights-index.json');
        flightState.data = await resp.json();
        flightState.filtered = flightState.data.flights;
    } catch(e) { console.error('Failed to load flights:', e); }
}

const timelineData = [
    { date:'Mar 2005', title:'Palm Beach police begin investigation', desc:'Investigation initiated after a parent reports abuse of her 14-year-old daughter.', tag:'investigation' },
    { date:'May 2006', title:'FBI takes over case', desc:'The FBI begins a federal investigation, identifying dozens of potential victims. A grand jury is convened.', tag:'investigation' },
    { date:'Jun 2007', title:'Controversial plea deal signed', desc:'US Attorney Alexander Acosta signs a Non-Prosecution Agreement. Epstein pleads guilty to state charges, avoiding federal prosecution.', tag:'legal' },
    { date:'Jul 2008', title:'13-month sentence begins', desc:'Epstein begins serving time at Palm Beach County Stockade with extraordinary work release privileges — 12 hours/day, 6 days/week.', tag:'legal' },
    { date:'Nov 2018', title:'Miami Herald: "Perversion of Justice"', desc:'Julie K. Brown publishes a groundbreaking investigative series exposing the failures of the original plea deal.', tag:'media' },
    { date:'Jul 6, 2019', title:'Federal arrest at Teterboro', desc:'Epstein arrested on federal sex trafficking charges by the SDNY. Hundreds of photos of minors found at his Manhattan residence.', tag:'legal' },
    { date:'Aug 10, 2019', title:'Death in custody at MCC', desc:'Epstein found dead in his cell at the Metropolitan Correctional Center. Official cause: suicide by hanging. Guards had falsified logs.', tag:'legal' },
    { date:'Jul 2, 2020', title:'Ghislaine Maxwell arrested', desc:'Maxwell arrested in New Hampshire on charges of conspiracy and sex trafficking of minors. She had been hiding for months.', tag:'aftermath' },
    { date:'Dec 29, 2021', title:'Maxwell found guilty', desc:'Convicted on 5 of 6 counts including sex trafficking. Sentenced to 20 years in prison in June 2022.', tag:'aftermath' },
    { date:'Jan 2024', title:'Court documents unsealed', desc:'Thousands of pages released revealing depositions, flight logs, and correspondence related to Epstein\'s network.', tag:'aftermath' },
    { date:'Nov 2025', title:'House Oversight Committee data release', desc:'Congressional release of Epstein\'s emails, photos, documents, Amazon orders, and other records to the public.', tag:'aftermath' },
];

function renderFlights(search) {
    if (!flightState.data) return;
    const airports = flightState.data.airports || {};
    let filtered = flightState.data.flights;
    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(f =>
            f.date.includes(q) || f.aircraft.toLowerCase().includes(q) ||
            f.dep.toLowerCase().includes(q) || f.arr.toLowerCase().includes(q) ||
            (airports[f.dep]||'').toLowerCase().includes(q) ||
            (airports[f.arr]||'').toLowerCase().includes(q) ||
            f.passengers.some(p => p.toLowerCase().includes(q)) ||
            f.source.toLowerCase().includes(q)
        );
    }
    flightState.filtered = filtered;
    const body = document.getElementById('flights-body');
    body.innerHTML = filtered.map(f => {
        const depName = airports[f.dep] || f.dep;
        const arrName = airports[f.arr] || f.arr;
        const d = new Date(f.date);
        const dateStr = d.toLocaleDateString('en-US', {year:'numeric',month:'short',day:'numeric'});
        return `<tr>
            <td>${dateStr}</td>
            <td>${f.aircraft} (${f.type})</td>
            <td><strong>${f.dep} → ${f.arr}</strong><br><small>${depName} → ${arrName}</small></td>
            <td><div class="passenger-tags">${f.passengers.map(p =>
                `<span class="passenger-tag">${esc(p)}</span>`
            ).join('')}</div></td>
            <td>${f.pilot || ''}</td>
            <td>${f.source}</td>
        </tr>`;
    }).join('');
    const countEl = document.getElementById('flights-count');
    if (countEl) countEl.textContent = search
        ? `${filtered.length} results for "${search}"`
        : `${filtered.length} flights from pilot logs, FAA records, and court documents (1997–2015)`;
}

function renderTimeline() {
    const view = document.getElementById('timeline-view');
    view.innerHTML = timelineData.map(t => `
        <div class="tl-item">
            <div class="tl-date">${t.date}</div>
            <div class="tl-dot"></div>
            <div class="tl-body">
                <h3>${t.title}</h3>
                <p>${t.desc}</p>
                <span class="tl-tag ${t.tag}">${t.tag.charAt(0).toUpperCase() + t.tag.slice(1)}</span>
            </div>
        </div>
    `).join('');
}

// === PHOTOS ===
const photoState = {
    all: [],
    filtered: [],
    shown: 0,
    PAGE_SIZE: 100,
    sourceFilter: 'all',
    searchQuery: '',
    lightboxIndex: -1,
    descMap: {},        // id -> description text (from AI/OCR)
};

const PHOTO_CDN = 'https://assets.getkino.com/photos/';

async function loadPhotosIndex() {
    const [photosResp, searchResp] = await Promise.all([
        fetch('data/photos-index.json'),
        fetch('data/photo-search-index.json'),
    ]);
    photoState.all = await photosResp.json();
    const searchEntries = await searchResp.json();
    for (const entry of searchEntries) {
        photoState.descMap[entry.id] = entry.d;
    }
    photoState.filtered = photoState.all;
}

function filterPhotos() {
    let result = photoState.all;
    if (photoState.sourceFilter !== 'all') {
        result = result.filter(p => p.s === photoState.sourceFilter);
    }
    if (photoState.searchQuery) {
        const q = photoState.searchQuery.toLowerCase();
        const terms = q.split(/\s+/).filter(Boolean);
        result = result.filter(p => {
            const id = p.id.toLowerCase();
            const desc = (photoState.descMap[p.id] || '').toLowerCase();
            return terms.every(t => id.includes(t) || desc.includes(t));
        });
    }
    photoState.filtered = result;
    photoState.shown = 0;
    document.getElementById('photos-grid').innerHTML = '';
    showMorePhotos();
    const countEl = document.getElementById('photos-count');
    if (photoState.searchQuery) {
        countEl.textContent = `${result.length.toLocaleString()} results for "${photoState.searchQuery}"`;
    } else {
        countEl.textContent = `${result.length.toLocaleString()} photos from DOJ and House Oversight releases`;
    }
}

function showMorePhotos() {
    const grid = document.getElementById('photos-grid');
    const end = Math.min(photoState.shown + photoState.PAGE_SIZE, photoState.filtered.length);
    const fragment = document.createDocumentFragment();

    for (let i = photoState.shown; i < end; i++) {
        const p = photoState.filtered[i];
        const desc = photoState.descMap[p.id] || '';
        const card = document.createElement('div');
        card.className = 'photo-card';
        card.dataset.index = i;
        const descHtml = desc ? `<div class="photo-desc">${esc(desc)}</div>` : '';
        card.innerHTML = `
            <img data-src="${PHOTO_CDN}${p.id}" alt="${desc || p.id}" loading="lazy">
            <div class="photo-overlay">${p.id} · ${p.s === 'doj' ? 'DOJ' : 'House Oversight'}${p.w ? ` · ${p.w}×${p.h}` : ''}${descHtml}</div>
        `;
        card.addEventListener('click', () => openLightbox(i));
        fragment.appendChild(card);
    }
    grid.appendChild(fragment);
    photoState.shown = end;

    // Lazy load images with IntersectionObserver
    const images = grid.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.onload = () => img.classList.add('loaded');
                img.onerror = () => { img.parentElement.style.background = '#e8eaed'; };
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '200px' });
    images.forEach(img => observer.observe(img));

    // Toggle load-more button
    const moreWrap = document.getElementById('photos-load-more');
    moreWrap.style.display = photoState.shown >= photoState.filtered.length ? 'none' : 'block';
}

function openLightbox(index) {
    photoState.lightboxIndex = index;
    const p = photoState.filtered[index];
    const desc = photoState.descMap[p.id] || '';
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const info = document.getElementById('lightbox-info');
    img.src = PHOTO_CDN + p.id;
    let infoText = `${p.id} · ${p.s === 'doj' ? 'DOJ' : 'House Oversight'}${p.w ? ` · ${p.w}×${p.h}px` : ''} · ${index + 1} of ${photoState.filtered.length.toLocaleString()}`;
    if (desc) infoText += `\n${desc}`;
    info.textContent = infoText;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    const newIdx = photoState.lightboxIndex + dir;
    if (newIdx >= 0 && newIdx < photoState.filtered.length) {
        openLightbox(newIdx);
    }
}

// === DOCUMENTS ===
const docState = {
    all: [],
    searchIndex: [],   // full-text OCR index
    filtered: [],
    shown: 0,
    PAGE_SIZE: 60,
    sourceFilter: 'all',
    searchQuery: '',
    textSearchMode: false,
};

const DOC_CDN = 'https://assets.getkino.com/documents/';

async function loadDocumentsIndex() {
    const [listResp, textResp] = await Promise.all([
        fetch('data/documents-index.json'),
        fetch('data/doc-search-index.json'),
    ]);
    docState.all = await listResp.json();
    docState.searchIndex = await textResp.json();
    docState.filtered = docState.all;
}

function filterDocuments() {
    const q = docState.searchQuery.toLowerCase().trim();

    if (q.length >= 2) {
        // Full-text search across OCR content
        const terms = q.split(/\s+/);
        let results = docState.searchIndex.filter(d => {
            const haystack = (d.text + ' ' + d.filename).toLowerCase();
            return terms.every(term => haystack.includes(term));
        });
        if (docState.sourceFilter !== 'all') {
            results = results.filter(d => d.folder.startsWith(docState.sourceFilter === 'house_oversight' ? 'house' : 'doj'));
        }
        // Map to display format with text snippets
        docState.filtered = results.map(d => {
            // Find a relevant snippet around the first match
            const idx = d.text.toLowerCase().indexOf(terms[0]);
            const start = Math.max(0, idx - 60);
            const end = Math.min(d.text.length, idx + 140);
            const snippet = (start > 0 ? '...' : '') + d.text.slice(start, end).trim() + (end < d.text.length ? '...' : '');
            return { ...d, snippet, _isTextResult: true };
        });
        docState.textSearchMode = true;
    } else {
        // No search or too short: show file listing
        let result = docState.all;
        if (docState.sourceFilter !== 'all') {
            result = result.filter(d => d.source === docState.sourceFilter);
        }
        docState.filtered = result;
        docState.textSearchMode = false;
    }

    docState.shown = 0;
    document.getElementById('docs-grid').innerHTML = '';
    showMoreDocuments();
    const countText = docState.textSearchMode
        ? `${docState.filtered.length.toLocaleString()} results for "${esc(docState.searchQuery)}"`
        : `${docState.filtered.length.toLocaleString()} documents from DOJ and House Oversight releases`;
    document.getElementById('docs-count').textContent = countText;
}

function showMoreDocuments() {
    const grid = document.getElementById('docs-grid');
    const end = Math.min(docState.shown + docState.PAGE_SIZE, docState.filtered.length);

    for (let i = docState.shown; i < end; i++) {
        const d = docState.filtered[i];
        const link = document.createElement('div');
        link.className = 'doc-card' + (d._isTextResult ? ' doc-card-search' : '');
        link.style.cursor = 'pointer';
        link.addEventListener('click', () => {
            openPdfViewer(DOC_CDN + d.filename, d.filename);
        });

        if (d._isTextResult && d.snippet) {
            // Show text snippet for search results
            const highlighted = highlightTerms(d.snippet, docState.searchQuery);
            link.innerHTML = `
                <div class="doc-info doc-info-search">
                    <div class="doc-info-header">
                        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#c5221f" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z"/></svg>
                        <h3>${esc(d.filename)}</h3>
                        <span class="doc-pages">${d.pages} page${d.pages > 1 ? 's' : ''}</span>
                    </div>
                    <p class="doc-snippet">${highlighted}</p>
                </div>
            `;
        } else {
            link.innerHTML = `
                <div class="doc-preview">
                    <svg viewBox="0 0 24 24"><path fill="#c5221f" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z"/></svg>
                </div>
                <div class="doc-info">
                    <h3>${esc(d.filename)}</h3>
                    <p>${d.source === 'doj' ? 'DOJ' : 'House Oversight'}</p>
                </div>
            `;
        }
        grid.appendChild(link);
    }
    docState.shown = end;

    const moreWrap = document.getElementById('docs-load-more');
    moreWrap.style.display = docState.shown >= docState.filtered.length ? 'none' : 'block';
}

function highlightTerms(text, query) {
    const escaped = esc(text);
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    let result = escaped;
    for (const term of terms) {
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        result = result.replace(regex, '<mark>$1</mark>');
    }
    return result;
}

function renderDocuments() {
    filterDocuments();
}

// === NETWORK GRAPH (Canvas-based force layout) ===
const netState = { nodes: [], links: [], selected: null, sim: null, rendered: false };

function buildNetworkData(minEmails) {
    const contactMap = {};
    for (const c of state.contacts) {
        const total = (c.s || 0) + (c.r || 0);
        if (total >= minEmails) {
            contactMap[c.e] = { id: c.e, name: c.n, sent: c.s || 0, recv: c.r || 0, total, x: 0, y: 0, vx: 0, vy: 0 };
        }
    }
    // Build links from email data: from_email -> to field (may be email or name)
    const linkMap = {};
    const contactByName = {};
    for (const c of Object.values(contactMap)) {
        contactByName[c.name.toLowerCase()] = c.id;
    }
    for (const e of state.allLoaded) {
        const from = (e.fe || '').toLowerCase();
        const toRaw = (e.t || '').toLowerCase().trim();
        // Try matching 'to' as email first, then as contact name
        let to = contactMap[toRaw] ? toRaw : contactByName[toRaw] || null;
        if (from && to && contactMap[from] && contactMap[to] && from !== to) {
            const key = from < to ? `${from}|${to}` : `${to}|${from}`;
            linkMap[key] = (linkMap[key] || 0) + 1;
        }
    }
    const nodes = Object.values(contactMap);
    const links = Object.entries(linkMap).map(([key, count]) => {
        const [a, b] = key.split('|');
        return { source: a, target: b, count };
    });
    return { nodes, links };
}

function renderNetwork() {
    if (netState.rendered) return;
    netState.rendered = true;

    const minEmails = parseInt(document.getElementById('network-min-emails').value) || 25;
    const { nodes, links } = buildNetworkData(minEmails);
    netState.nodes = nodes;
    netState.links = links;

    document.getElementById('network-info').textContent =
        `${nodes.length} people, ${links.length} connections. Click a node to highlight.`;

    const canvas = document.getElementById('network-canvas');
    const container = document.getElementById('network-container');
    const dpr = window.devicePixelRatio || 1;
    const nw = container.clientWidth;
    const nh = container.clientHeight;
    canvas.width = nw * dpr;
    canvas.height = nh * dpr;
    canvas.style.width = nw + 'px';
    canvas.style.height = nh + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    netState.ctx = ctx;
    netState.w = nw;
    netState.h = nh;

    // Initialize positions in a circle
    nodes.forEach((n, i) => {
        const angle = (i / nodes.length) * Math.PI * 2;
        n.x = nw / 2 + (nw * 0.35) * Math.cos(angle);
        n.y = nh / 2 + (nh * 0.35) * Math.sin(angle);
        n.vx = 0;
        n.vy = 0;
        n.radius = Math.max(4, Math.min(20, Math.sqrt(n.total) * 1.2));
    });

    netState.nodeMap = {};
    nodes.forEach(n => netState.nodeMap[n.id] = n);

    // Simple force simulation
    netState.alpha = 1;
    function tick() {
        const ns = netState.nodes, ls = netState.links, nm = netState.nodeMap;
        const w = netState.w, h = netState.h;
        netState.alpha *= 0.995;
        if (netState.alpha < 0.001) netState.alpha = 0;

        for (const n of ns) {
            n.vx += (w / 2 - n.x) * 0.0005;
            n.vy += (h / 2 - n.y) * 0.0005;
        }
        for (let i = 0; i < ns.length; i++) {
            for (let j = i + 1; j < ns.length; j++) {
                let dx = ns[j].x - ns[i].x;
                let dy = ns[j].y - ns[i].y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;
                let force = 800 / (dist * dist);
                const fx = dx / dist * force;
                const fy = dy / dist * force;
                ns[i].vx -= fx; ns[i].vy -= fy;
                ns[j].vx += fx; ns[j].vy += fy;
            }
        }
        for (const l of ls) {
            const s = nm[l.source], t = nm[l.target];
            if (!s || !t) continue;
            let dx = t.x - s.x, dy = t.y - s.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;
            let force = (dist - 100) * 0.001 * Math.min(l.count, 10);
            s.vx += dx / dist * force; s.vy += dy / dist * force;
            t.vx -= dx / dist * force; t.vy -= dy / dist * force;
        }
        for (const n of ns) {
            n.vx *= 0.85; n.vy *= 0.85;
            n.x += n.vx * netState.alpha; n.y += n.vy * netState.alpha;
            n.x = Math.max(n.radius, Math.min(w - n.radius, n.x));
            n.y = Math.max(n.radius, Math.min(h - n.radius, n.y));
        }
        netState.draw();
        if (netState.alpha > 0) requestAnimationFrame(tick);
    }

    netState.draw = function() {
        const ns = netState.nodes, ls = netState.links, nm = netState.nodeMap;
        const w = netState.w, h = netState.h;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.clearRect(0, 0, w, h);

        for (const l of ls) {
            const s = nm[l.source], t = nm[l.target];
            if (!s || !t) continue;
            const highlight = netState.selected &&
                (l.source === netState.selected || l.target === netState.selected);
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(t.x, t.y);
            ctx.strokeStyle = highlight ? (isDark ? '#8ab4f8' : '#1a73e8') :
                (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)');
            ctx.lineWidth = highlight ? Math.min(3, l.count * 0.3) : 0.5;
            ctx.stroke();
        }
        for (const n of ns) {
            const highlight = !netState.selected || netState.selected === n.id ||
                ls.some(l => (l.source === netState.selected && l.target === n.id) ||
                                (l.target === netState.selected && l.source === n.id));
            ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = highlight ? getColor(n.name) : (isDark ? '#444' : '#ddd');
            ctx.globalAlpha = highlight ? 1 : 0.3;
            ctx.fill(); ctx.globalAlpha = 1;
            if (n.radius > 6 && highlight) {
                ctx.fillStyle = isDark ? '#e8eaed' : '#202124';
                ctx.font = `${Math.max(9, n.radius * 0.7)}px Roboto, sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText(n.name.split(/[\s@]/)[0], n.x, n.y + n.radius + 12);
            }
        }
    };

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        let clicked = null;
        for (const n of netState.nodes) {
            const dx = mx - n.x, dy = my - n.y;
            if (dx * dx + dy * dy < (n.radius + 4) * (n.radius + 4)) { clicked = n; break; }
        }
        netState.selected = clicked ? clicked.id : null;
        document.getElementById('network-info').textContent = clicked
            ? `${clicked.name} — ${clicked.total} emails, ${netState.links.filter(l => l.source === clicked.id || l.target === clicked.id).length} connections`
            : `${netState.nodes.length} people, ${netState.links.length} connections. Click a node to highlight.`;
        netState.draw();
    });

    tick();
    netState.tick = tick;
    netState.rebuild = () => { netState.rendered = false; renderNetwork(); };
}

// === STATISTICS DASHBOARD ===
function renderStats() {
    const emails = state.allLoaded;
    if (!emails.length) return;

    // Render heatmap calendar
    renderHeatmap();

    // 1. Email Volume Over Time (by month)
    const monthCounts = {};
    const dowCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const senderCounts = {};
    const recipientCounts = {};
    const domainCounts = {};
    let sentByEpstein = 0;
    let sentToEpstein = 0;

    for (const e of emails) {
        // Parse date
        if (e.d) {
            const d = new Date(e.d);
            if (!isNaN(d)) {
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                monthCounts[key] = (monthCounts[key] || 0) + 1;
                dowCounts[d.getDay()]++;
            }
        }
        // Senders/Recipients
        const from = e.f || 'Unknown';
        senderCounts[from] = (senderCounts[from] || 0) + 1;
        const to = e.t || 'Unknown';
        recipientCounts[to] = (recipientCounts[to] || 0) + 1;

        // Domains
        const email = e.fe || '';
        const domain = email.split('@')[1] || '';
        if (domain) domainCounts[domain] = (domainCounts[domain] || 0) + 1;

        if (e.ep) sentByEpstein++;
        else sentToEpstein++;
    }

    // Volume chart (Canvas)
    const months = Object.keys(monthCounts).sort();
    const volumeCanvas = document.getElementById('chart-volume');
    if (volumeCanvas && months.length > 0) {
        const vCtx = volumeCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const cw = volumeCanvas.parentElement.clientWidth - 40;
        const ch = 200;
        volumeCanvas.width = cw * dpr;
        volumeCanvas.height = ch * dpr;
        volumeCanvas.style.width = cw + 'px';
        volumeCanvas.style.height = ch + 'px';
        vCtx.scale(dpr, dpr);

        const values = months.map(m => monthCounts[m]);
        const maxVal = Math.max(...values);
        const barW = Math.max(2, (cw - 40) / months.length - 1);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        vCtx.fillStyle = isDark ? '#9aa0a6' : '#5f6368';
        vCtx.font = '10px Roboto, sans-serif';
        vCtx.textAlign = 'center';

        for (let i = 0; i < months.length; i++) {
            const x = 30 + i * ((cw - 40) / months.length);
            const barH = (values[i] / maxVal) * (ch - 30);
            vCtx.fillStyle = isDark ? '#8ab4f8' : '#1a73e8';
            vCtx.fillRect(x, ch - 20 - barH, barW, barH);
            // Label every 6th month
            if (i % Math.max(1, Math.floor(months.length / 10)) === 0) {
                vCtx.fillStyle = isDark ? '#9aa0a6' : '#5f6368';
                vCtx.font = '9px Roboto, sans-serif';
                vCtx.fillText(months[i], x + barW / 2, ch - 4);
            }
        }
    }

    // Day of week chart (Canvas)
    const dowCanvas = document.getElementById('chart-dow');
    if (dowCanvas) {
        const dCtx = dowCanvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const cw = dowCanvas.parentElement.clientWidth - 40;
        const ch = 140;
        dowCanvas.width = cw * dpr;
        dowCanvas.height = ch * dpr;
        dowCanvas.style.width = cw + 'px';
        dowCanvas.style.height = ch + 'px';
        dCtx.scale(dpr, dpr);

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxDow = Math.max(...dowCounts);
        const barW = Math.min(60, (cw - 60) / 7 - 8);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        for (let i = 0; i < 7; i++) {
            const x = 40 + i * ((cw - 60) / 7);
            const barH = (dowCounts[i] / maxDow) * (ch - 40);
            dCtx.fillStyle = isDark ? '#8ab4f8' : '#1a73e8';
            dCtx.fillRect(x, ch - 25 - barH, barW, barH);
            dCtx.fillStyle = isDark ? '#9aa0a6' : '#5f6368';
            dCtx.font = '11px Roboto, sans-serif';
            dCtx.textAlign = 'center';
            dCtx.fillText(days[i], x + barW / 2, ch - 8);
            dCtx.fillText(dowCounts[i].toLocaleString(), x + barW / 2, ch - 30 - barH);
        }
    }

    // Bar charts (HTML)
    renderBarChart('chart-senders', senderCounts, 15);
    renderBarChart('chart-recipients', recipientCounts, 15);
    renderBarChart('chart-domains', domainCounts, 15);

    // Sources
    const sourcesEl = document.getElementById('chart-sources');
    if (sourcesEl) {
        const srcData = { 'From Epstein': sentByEpstein, 'To Epstein': sentToEpstein };
        renderBarChart('chart-sources', srcData, 5);
    }

    // Word cloud
    setTimeout(renderWordCloud, 100);
}

function renderBarChart(elementId, countsObj, limit) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const sorted = Object.entries(countsObj).sort((a, b) => b[1] - a[1]).slice(0, limit);
    const maxVal = sorted[0] ? sorted[0][1] : 1;
    el.innerHTML = sorted.map(([label, count]) => {
        const pct = (count / maxVal * 100).toFixed(1);
        return `<div class="bar-row">
            <span class="bar-label" title="${esc(label)}">${esc(label)}</span>
            <div class="bar-fill-wrap"><div class="bar-fill" style="width:${pct}%"></div></div>
            <span class="bar-value">${count.toLocaleString()}</span>
        </div>`;
    }).join('');
}

// ===== SIX DEGREES OF EPSTEIN =====
const sixDegState = { graph: null, initialized: false };

function buildSixDegreesGraph() {
    if (sixDegState.graph) return sixDegState.graph;
    const adj = {}; // adjacency list: name -> Set of { name, via, evidence }
    const nameMap = {}; // normalized name -> display name

    function normName(n) { return (n || '').trim().toLowerCase(); }
    function addNode(name) {
        const k = normName(name);
        if (!k) return k;
        if (!nameMap[k]) nameMap[k] = name;
        if (!adj[k]) adj[k] = {};
        return k;
    }
    function addEdge(a, b, via, evidence) {
        const ka = addNode(a);
        const kb = addNode(b);
        if (!ka || !kb || ka === kb) return;
        if (!adj[ka][kb]) adj[ka][kb] = { via: new Set(), evidence: [] };
        adj[ka][kb].via.add(via);
        adj[ka][kb].evidence.push(evidence);
        if (!adj[kb][ka]) adj[kb][ka] = { via: new Set(), evidence: [] };
        adj[kb][ka].via.add(via);
        adj[kb][ka].evidence.push(evidence);
    }

    // Build from emails
    const contactByEmail = {};
    for (const c of state.contacts) {
        contactByEmail[(c.e || '').toLowerCase()] = c.n;
    }
    for (const e of state.allLoaded) {
        const fromName = e.f || contactByEmail[(e.fe || '').toLowerCase()] || e.fe;
        const toName = e.t || '';
        if (fromName && toName) {
            addEdge(fromName, toName, 'email', `📧 "${(e.s || 'No subject').substring(0, 60)}" (${e.d || '?'})`);
        }
    }

    // Build from flights
    if (flightState.data && flightState.data.flights) {
        for (const fl of flightState.data.flights) {
            const allPax = [...(fl.passengers || [])];
            for (let i = 0; i < allPax.length; i++) {
                for (let j = i + 1; j < allPax.length; j++) {
                    addEdge(allPax[i], allPax[j], 'flight',
                        `✈️ ${fl.dep}→${fl.arr} on ${fl.date} (${fl.aircraft})`);
                }
            }
        }
    }

    sixDegState.graph = { adj, nameMap };
    return sixDegState.graph;
}

function sixDegreesBFS(graph, startName) {
    const { adj, nameMap } = graph;
    const startKey = startName.trim().toLowerCase();
    // Find Epstein key
    const epsteinKey = Object.keys(nameMap).find(k => k.includes('epstein') && k.includes('j'));
    if (!epsteinKey) return null;
    if (startKey === epsteinKey) return [{ name: nameMap[epsteinKey], key: epsteinKey }];

    if (!adj[startKey]) return null;

    const visited = new Set([startKey]);
    const queue = [[startKey]];
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        const neighbors = adj[current] || {};
        for (const nk of Object.keys(neighbors)) {
            if (visited.has(nk)) continue;
            visited.add(nk);
            const newPath = [...path, nk];
            if (nk === epsteinKey) {
                return newPath.map(k => ({ name: nameMap[k], key: k }));
            }
            if (newPath.length < 8) queue.push(newPath);
        }
    }
    return null;
}

function getEdgeInfo(graph, keyA, keyB) {
    const edge = graph.adj[keyA] && graph.adj[keyA][keyB];
    if (!edge) return { via: 'unknown', evidence: [] };
    const vias = [...edge.via];
    const via = vias.length > 1 ? 'both' : vias[0];
    return { via, evidence: edge.evidence.slice(0, 5) };
}

function initSixDegrees() {
    if (sixDegState.initialized) return;
    sixDegState.initialized = true;

    const input = document.getElementById('sixdeg-input');
    const sugBox = document.getElementById('sixdeg-suggestions');
    const searchBtn = document.getElementById('sixdeg-search-btn');
    const quickPicks = document.getElementById('sixdeg-quick-picks');

    // Build graph
    const graph = buildSixDegreesGraph();
    const allNames = Object.entries(graph.nameMap)
        .map(([k, v]) => ({ key: k, name: v }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Quick picks
    const picks = ['B. Clinton', 'Prince Andrew', 'A. Dershowitz', 'G. Maxwell', 'L. Wexner', 'E. Barak'];
    for (const p of picks) {
        const found = allNames.find(n => n.name === p);
        if (found) {
            const btn = document.createElement('button');
            btn.className = 'sixdeg-pick';
            btn.textContent = p;
            btn.onclick = () => { input.value = p; runSixDegreesSearch(p); };
            quickPicks.appendChild(btn);
        }
    }

    // Autocomplete
    let selectedSug = -1;
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        sugBox.innerHTML = '';
        selectedSug = -1;
        if (q.length < 2) { sugBox.classList.remove('active'); return; }
        const matches = allNames.filter(n => n.name.toLowerCase().includes(q)).slice(0, 12);
        if (!matches.length) { sugBox.classList.remove('active'); return; }
        for (const m of matches) {
            const div = document.createElement('div');
            div.className = 'sixdeg-sug-item';
            // Check if in flights or emails
            const inFlights = flightState.data && flightState.data.flights &&
                flightState.data.flights.some(f => f.passengers.some(p => p.toLowerCase() === m.key));
            const inEmails = state.contacts.some(c => (c.n || '').toLowerCase() === m.key || (c.e || '').toLowerCase() === m.key);
            div.innerHTML = `<span>${m.name}</span>
                ${inFlights ? '<span class="sug-type flight">Flight</span>' : ''}
                ${inEmails ? '<span class="sug-type email">Email</span>' : ''}`;
            div.onclick = () => {
                input.value = m.name;
                sugBox.classList.remove('active');
                runSixDegreesSearch(m.name);
            };
            sugBox.appendChild(div);
        }
        sugBox.classList.add('active');
    });

    input.addEventListener('keydown', (e) => {
        const items = sugBox.querySelectorAll('.sixdeg-sug-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSug = Math.min(selectedSug + 1, items.length - 1);
            items.forEach((it, i) => it.style.background = i === selectedSug ? 'var(--bg-hover)' : '');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSug = Math.max(selectedSug - 1, 0);
            items.forEach((it, i) => it.style.background = i === selectedSug ? 'var(--bg-hover)' : '');
        } else if (e.key === 'Enter') {
            if (selectedSug >= 0 && items[selectedSug]) {
                items[selectedSug].click();
            } else {
                runSixDegreesSearch(input.value);
            }
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sixdeg-input-wrap')) sugBox.classList.remove('active');
    });

    searchBtn.addEventListener('click', () => runSixDegreesSearch(input.value));
}

function runSixDegreesSearch(query) {
    const graph = sixDegState.graph;
    if (!graph || !query.trim()) return;

    const resultWrap = document.getElementById('sixdeg-result');
    const emptyEl = document.getElementById('sixdeg-empty');
    const pathWrap = document.getElementById('sixdeg-path-wrap');
    const noResult = document.getElementById('sixdeg-noresult');
    const sugBox = document.getElementById('sixdeg-suggestions');
    sugBox.classList.remove('active');

    emptyEl.style.display = 'none';
    pathWrap.style.display = 'none';
    noResult.style.display = 'none';

    // Find closest matching name
    const q = query.trim().toLowerCase();
    const match = Object.keys(graph.nameMap).find(k => k === q) ||
        Object.keys(graph.nameMap).find(k => graph.nameMap[k].toLowerCase() === q) ||
        Object.keys(graph.nameMap).find(k => k.includes(q));

    if (!match) {
        noResult.style.display = 'block';
        noResult.querySelector('p').textContent = `"${query}" not found in the dataset.`;
        return;
    }

    const path = sixDegreesBFS(graph, graph.nameMap[match]);
    if (!path) {
        noResult.style.display = 'block';
        noResult.querySelector('p').textContent = `No connection path found from ${graph.nameMap[match]} to J. Epstein.`;
        return;
    }

    // Show result
    pathWrap.style.display = 'block';
    const degrees = path.length - 1;
    const headerEl = document.getElementById('sixdeg-path-header');
    headerEl.innerHTML = `
        <div class="deg-count">${degrees}</div>
        <div class="deg-label">degree${degrees !== 1 ? 's' : ''} of separation</div>`;

    // Build chain
    const chainEl = document.getElementById('sixdeg-chain');
    chainEl.innerHTML = '';
    const colors = ['#2980b9', '#8e44ad', '#27ae60', '#e67e22', '#c0392b', '#16a085', '#d35400'];

    for (let i = 0; i < path.length; i++) {
        const node = path[i];
        const isFirst = i === 0;
        const isLast = i === path.length - 1;
        const initials = node.name.split(/[\s.]+/).filter(Boolean).map(w => w[0]).join('').substring(0, 2).toUpperCase();
        const color = isLast ? '' : isFirst ? '' : colors[i % colors.length];
        const delay = i * 300;

        const nodeEl = document.createElement('div');
        nodeEl.className = 'sixdeg-node';
        nodeEl.style.animationDelay = delay + 'ms';

        const circleClass = isLast ? 'epstein' : isFirst ? 'target' : 'mid';
        const roleText = isLast ? 'Target' : isFirst ? 'Start' : `Degree ${i}`;

        nodeEl.innerHTML = `
            <div class="sixdeg-node-circle ${circleClass}" ${circleClass === 'mid' ? `style="background:linear-gradient(135deg,${color},${color}cc)"` : ''}>
                ${initials}
                <div class="node-ring"></div>
            </div>
            <div class="sixdeg-node-name">${node.name}</div>
            <div class="sixdeg-node-role">${roleText}</div>`;
        chainEl.appendChild(nodeEl);

        // Add link between nodes
        if (i < path.length - 1) {
            const edge = getEdgeInfo(graph, path[i].key, path[i + 1].key);
            const linkEl = document.createElement('div');
            linkEl.className = 'sixdeg-link';
            linkEl.style.animationDelay = (delay + 150) + 'ms';
            const viaClass = edge.via === 'both' ? 'via-both' : edge.via === 'flight' ? 'via-flight' : 'via-email';
            const viaText = edge.via === 'both' ? '✈️ + 📧' : edge.via === 'flight' ? '✈️ Flight' : '📧 Email';
            linkEl.innerHTML = `
                <div class="sixdeg-link-line"></div>
                <span class="sixdeg-link-type ${viaClass}">${viaText}</span>`;
            chainEl.appendChild(linkEl);
        }
    }

    // Build details
    const detailsEl = document.getElementById('sixdeg-details');
    detailsEl.innerHTML = '';
    for (let i = 0; i < path.length - 1; i++) {
        const edge = getEdgeInfo(graph, path[i].key, path[i + 1].key);
        const card = document.createElement('div');
        card.className = 'sixdeg-detail-card';
        card.style.animationDelay = ((path.length * 300) + i * 200) + 'ms';

        let evHtml = edge.evidence.map(ev =>
            `<div class="ev-item"><span class="ev-icon">${ev.startsWith('✈') ? '✈️' : '📧'}</span><span>${ev.replace(/^[✈📧️\s]+/, '')}</span></div>`
        ).join('');

        card.innerHTML = `
            <div class="sixdeg-detail-step">
                <div class="step-num">${i + 1}</div>
                <div class="step-names">${path[i].name} <span class="arrow">→</span> ${path[i + 1].name}</div>
            </div>
            <div class="sixdeg-detail-evidence">${evHtml || '<em>Connection via shared communications</em>'}</div>`;
        detailsEl.appendChild(card);
    }
}

// ===== SQL EXPLORER (DuckDB-WASM) =====
const sqlState = { db: null, conn: null, initialized: false, loading: false };

const SQL_EXAMPLES = {
    top_senders: `SELECT sender, COUNT(*) as email_count
FROM read_parquet('https://data.jmail.world/v1/emails.parquet')
GROUP BY sender
ORDER BY email_count DESC
LIMIT 20;`,
    epstein_sent: `SELECT subject, to_recipients, sent_at
FROM read_parquet('https://data.jmail.world/v1/emails.parquet')
WHERE epstein_is_sender = true
  AND subject IS NOT NULL
  AND subject != ''
ORDER BY sent_at DESC
LIMIT 50;`,
    by_year: `SELECT EXTRACT(YEAR FROM CAST(sent_at AS TIMESTAMP)) as year,
       COUNT(*) as emails
FROM read_parquet('https://data.jmail.world/v1/emails.parquet')
WHERE sent_at IS NOT NULL
GROUP BY year
ORDER BY year;`,
    to_recipients: `SELECT to_recipients, COUNT(*) as times_received
FROM read_parquet('https://data.jmail.world/v1/emails.parquet')
WHERE epstein_is_sender = true
GROUP BY to_recipients
ORDER BY times_received DESC
LIMIT 30;`,
    subjects: `SELECT subject, sender, sent_at
FROM read_parquet('https://data.jmail.world/v1/emails.parquet')
WHERE subject ILIKE '%island%'
   OR subject ILIKE '%flight%'
   OR subject ILIKE '%private%'
ORDER BY sent_at
LIMIT 50;`,
    accounts: `SELECT account_email, COUNT(*) as emails
FROM read_parquet('https://data.jmail.world/v1/emails.parquet')
GROUP BY account_email
ORDER BY emails DESC;`,
    doc_sources: `SELECT source, COUNT(*) as docs, SUM(page_count) as total_pages
FROM read_parquet('https://data.jmail.world/v1/documents.parquet')
GROUP BY source
ORDER BY docs DESC;`,
    doc_largest: `SELECT original_filename, page_count, size,
       document_description, source
FROM read_parquet('https://data.jmail.world/v1/documents.parquet')
WHERE page_count IS NOT NULL
ORDER BY page_count DESC
LIMIT 30;`
};

async function initDuckDB() {
    const badge = document.getElementById('sql-status-badge');
    badge.className = 'sql-badge loading';
    badge.textContent = 'Loading DuckDB...';
    try {
        const CDN = 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.29.0/dist/';
        const duckdb = await import(CDN + 'duckdb-browser.mjs');
        const bundles = duckdb.getJsDelivrBundles();
        const bundle = await duckdb.selectBundle(bundles);

        // Create worker via blob URL (required for cross-origin CDN)
        const workerUrl = URL.createObjectURL(
            new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' })
        );
        const worker = new Worker(workerUrl);
        const logger = new duckdb.ConsoleLogger();
        const db = new duckdb.AsyncDuckDB(logger, worker);
        await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);

        const conn = await db.connect();

        sqlState.db = db;
        sqlState.conn = conn;
        badge.className = 'sql-badge ready';
        badge.textContent = 'Ready';
        return true;
    } catch(e) {
        console.error('DuckDB init error:', e);
        badge.className = 'sql-badge error';
        badge.textContent = 'Error';
        return false;
    }
}

async function initSQLExplorer() {
    if (sqlState.initialized) return;
    sqlState.initialized = true;

    const editor = document.getElementById('sql-editor');
    const runBtn = document.getElementById('sql-run-btn');
    const exSelect = document.getElementById('sql-examples');

    // Init DuckDB
    initDuckDB();

    // Example selector
    exSelect.addEventListener('change', () => {
        const key = exSelect.value;
        if (key && SQL_EXAMPLES[key]) {
            editor.value = SQL_EXAMPLES[key];
            exSelect.value = '';
        }
    });

    // Run button
    runBtn.addEventListener('click', () => runSQLQuery(editor.value));

    // Ctrl+Enter to run
    editor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            runSQLQuery(editor.value);
        }
        // Tab inserts spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(editor.selectionEnd);
            editor.selectionStart = editor.selectionEnd = start + 2;
        }
    });
}

async function runSQLQuery(sql) {
    if (!sql.trim()) return;
    const emptyEl = document.getElementById('sql-result-empty');
    const loadingEl = document.getElementById('sql-loading');
    const tableWrap = document.getElementById('sql-result-table-wrap');
    const errorEl = document.getElementById('sql-error');
    const loadingText = document.getElementById('sql-loading-text');
    const runBtn = document.getElementById('sql-run-btn');

    // Hide all, show loading
    emptyEl.style.display = 'none';
    tableWrap.style.display = 'none';
    errorEl.style.display = 'none';
    loadingEl.style.display = 'flex';
    loadingText.textContent = 'Executing query...';
    runBtn.disabled = true;

    // Init DuckDB if not ready
    if (!sqlState.conn) {
        loadingText.textContent = 'Initializing DuckDB-WASM...';
        const ok = await initDuckDB();
        if (!ok) {
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            errorEl.textContent = 'Failed to initialize DuckDB. Try refreshing the page.';
            runBtn.disabled = false;
            return;
        }
    }

    const startTime = performance.now();
    loadingText.textContent = 'Querying data.jmail.world...';

    try {
        const result = await sqlState.conn.query(sql);
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        const rows = result.toArray();
        const schema = result.schema.fields;

        loadingEl.style.display = 'none';

        if (rows.length === 0) {
            emptyEl.style.display = 'block';
            emptyEl.innerHTML = `<p>Query returned 0 rows (${elapsed}s)</p>`;
            runBtn.disabled = false;
            return;
        }

        // Render table
        tableWrap.style.display = 'block';
        const metaEl = document.getElementById('sql-result-meta');
        metaEl.innerHTML = `<span>${rows.length.toLocaleString()} rows</span><span>${elapsed}s</span>`;

        const table = document.getElementById('sql-result-table');
        const cols = schema.map(f => f.name);

        let html = '<thead><tr>' + cols.map(c => `<th>${esc(c)}</th>`).join('') + '</tr></thead><tbody>';
        const maxRows = Math.min(rows.length, 500);
        for (let i = 0; i < maxRows; i++) {
            const row = rows[i];
            html += '<tr>';
            for (const col of cols) {
                let val = row[col];
                if (val === null || val === undefined) {
                    html += '<td class="null">NULL</td>';
                } else if (typeof val === 'bigint' || typeof val === 'number') {
                    html += `<td class="num">${val.toLocaleString()}</td>`;
                } else {
                    const s = String(val);
                    html += `<td title="${esc(s)}">${esc(s.length > 200 ? s.substring(0, 200) + '…' : s)}</td>`;
                }
            }
            html += '</tr>';
        }
        if (rows.length > 500) {
            html += `<tr><td colspan="${cols.length}" style="text-align:center;color:var(--text-secondary);font-style:italic">Showing 500 of ${rows.length.toLocaleString()} rows</td></tr>`;
        }
        html += '</tbody>';
        table.innerHTML = html;
    } catch(e) {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = '❌ ' + (e.message || String(e));
    }
    runBtn.disabled = false;
}

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    document.querySelectorAll('.app-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.app-btn[data-view="${viewId}"]`);
    if (btn) btn.classList.add('active');
    document.getElementById('sidebar-folders').style.display =
        (viewId === 'inbox' || viewId === 'email-detail') ? 'flex' : 'none';
    if (viewId === 'network' && !netState.rendered) setTimeout(renderNetwork, 50);
    if (viewId === 'stats') renderStats();
    if (viewId === 'bookmarks') renderBookmarks();
    if (viewId === 'profiles') renderProfiles();
    if (viewId === 'board') initBoard();
    if (viewId === 'sixdegrees') initSixDegrees();
    if (viewId === 'sqlexplorer') initSQLExplorer();
}

// === FOLDER / FILTER / SEARCH ===
async function refreshInbox() {
    const filtered = (typeof applyFiltersAdvanced === 'function') ? applyFiltersAdvanced(state.allLoaded) : applyFilters(state.allLoaded);
    renderEmailList(filtered);
    updateEmailCount(filtered.length, state.meta ? state.meta.totalEmails : filtered.length);
}

function setFolder(folder) {
    state.folder = folder;
    document.querySelectorAll('.folder').forEach(f => f.classList.remove('active'));
    const el = document.querySelector(`.folder[data-folder="${folder}"]`);
    if (el) el.classList.add('active');
    refreshInbox();
}

// === INIT ===
async function init() {
    // Show loading state
    document.getElementById('email-list').innerHTML =
        '<div class="loading-indicator"><div class="spinner"></div> Loading Unsealed...</div>';

    try {
        await Promise.all([loadMeta(), loadContacts(), loadPhotosIndex(), loadDocumentsIndex(), loadFlights()]);

        // Load all email index data (~6MB, loads in batches of 20 pages)
        await loadAllEmails();

        // Update badges now that all data is loaded
        const inboxCount = state.allLoaded.filter(e => !e.sent).length;
        const sentCount = state.allLoaded.filter(e => e.sent).length;
        const allCount = state.allLoaded.length;
        const inboxBadge = document.getElementById('inbox-badge');
        const sentBadge = document.getElementById('sent-badge');
        const allBadge = document.getElementById('all-badge');
        if (inboxBadge) inboxBadge.textContent = inboxCount.toLocaleString();
        if (sentBadge) sentBadge.textContent = sentCount.toLocaleString();
        if (allBadge) allBadge.textContent = allCount.toLocaleString();

        // Render other views
        renderContacts();
        renderFlights();
        renderTimeline();
        renderDocuments();

        // Show initial photos (load-on-view)
        showMorePhotos();

        // Update contacts count
        const contactsP = document.querySelector('#view-contacts .contacts-header p');
        if (contactsP) contactsP.textContent = `${state.contacts.length.toLocaleString()} entities extracted from email correspondence`;

    } catch (err) {
        document.getElementById('email-list').innerHTML =
            `<div class="empty-state">Failed to load data. Make sure to serve this site with a local HTTP server.<br><code>python3 -m http.server 8000</code></div>`;
        console.error(err);
    }
}

// Event listeners
document.querySelectorAll('.app-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
});

document.getElementById('back-to-inbox').addEventListener('click', () => {
    navigateTo('inbox');
});

document.querySelectorAll('.folder').forEach(f => {
    f.addEventListener('click', () => setFolder(f.dataset.folder));
});

document.getElementById('filter-select').addEventListener('change', (e) => {
    state.filter = e.target.value;
    refreshInbox();
});

let searchTimeout;
document.getElementById('search-input').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const q = e.target.value.trim();
        state.searchQuery = q;
        if (q.length < 2) {
            document.getElementById('global-search-results').classList.remove('active');
            refreshInbox();
            return;
        }
        showGlobalSearchResults(q);
    }, 250);
});

document.getElementById('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('global-search-results').classList.remove('active');
        document.getElementById('search-history').classList.remove('active');
        state.searchQuery = e.target.value.trim();
        addSearchHistory(state.searchQuery);
        switchView('inbox');
        refreshInbox();
    }
    if (e.key === 'Escape') {
        document.getElementById('global-search-results').classList.remove('active');
        document.getElementById('search-history').classList.remove('active');
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
        document.getElementById('global-search-results').classList.remove('active');
        document.getElementById('search-history').classList.remove('active');
    }
});

function showGlobalSearchResults(query) {
    const q = query.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const container = document.getElementById('global-search-results');
    let html = '';

    // Email results (top 5)
    const emailResults = state.allLoaded.filter(e =>
        (e.f||'').toLowerCase().includes(q) ||
        (e.s||'').toLowerCase().includes(q) ||
        (e.sn||'').toLowerCase().includes(q) ||
        (e.t||'').toLowerCase().includes(q)
    ).slice(0, 5);

    if (emailResults.length) {
        html += `<div class="gsr-section"><div class="gsr-title">Emails</div>`;
        for (const e of emailResults) {
            html += `<div class="gsr-item" data-type="email" data-id="${esc(e.id)}" data-did="${esc(e.did)}">
                <svg class="gsr-item-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                <span class="gsr-item-text">${esc(e.s || '(no subject)')}</span>
                <span class="gsr-item-sub">${esc(e.f)}</span>
            </div>`;
        }
        const totalEmails = state.allLoaded.filter(e =>
            (e.f||'').toLowerCase().includes(q) || (e.s||'').toLowerCase().includes(q) ||
            (e.sn||'').toLowerCase().includes(q) || (e.t||'').toLowerCase().includes(q)
        ).length;
        if (totalEmails > 5) {
            html += `<div class="gsr-item" data-type="email-all" style="color:var(--accent)">
                <span class="gsr-item-text">View all ${totalEmails.toLocaleString()} email results →</span>
            </div>`;
        }
        html += `</div>`;
    }

    // Photo results (top 5)
    const photoResults = photoState.all.filter(p => {
        const id = p.id.toLowerCase();
        const desc = (photoState.descMap[p.id] || '').toLowerCase();
        return terms.every(t => id.includes(t) || desc.includes(t));
    }).slice(0, 5);

    if (photoResults.length) {
        html += `<div class="gsr-section"><div class="gsr-title">Photos</div>`;
        for (const p of photoResults) {
            const desc = photoState.descMap[p.id] || p.id;
            html += `<div class="gsr-item" data-type="photo" data-pid="${esc(p.id)}">
                <svg class="gsr-item-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                <span class="gsr-item-text">${esc(desc)}</span>
            </div>`;
        }
        const totalPhotos = photoState.all.filter(p => {
            const id = p.id.toLowerCase();
            const desc = (photoState.descMap[p.id] || '').toLowerCase();
            return terms.every(t => id.includes(t) || desc.includes(t));
        }).length;
        if (totalPhotos > 5) {
            html += `<div class="gsr-item" data-type="photo-all" style="color:var(--accent)">
                <span class="gsr-item-text">View all ${totalPhotos.toLocaleString()} photo results →</span>
            </div>`;
        }
        html += `</div>`;
    }

    // Document results (top 5)
    const docResults = docState.searchIndex.filter(d => {
        const text = (d.text || '').toLowerCase();
        const fn = (d.filename || '').toLowerCase();
        return terms.every(t => text.includes(t) || fn.includes(t));
    }).slice(0, 5);

    if (docResults.length) {
        html += `<div class="gsr-section"><div class="gsr-title">Documents</div>`;
        for (const d of docResults) {
            html += `<div class="gsr-item" data-type="doc" data-docid="${esc(d.id)}">
                <svg class="gsr-item-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z"/></svg>
                <span class="gsr-item-text">${esc(d.filename)}</span>
                <span class="gsr-item-sub">${d.pages || '?'} pages</span>
            </div>`;
        }
        const totalDocs = docState.searchIndex.filter(d => {
            const text = (d.text || '').toLowerCase();
            const fn = (d.filename || '').toLowerCase();
            return terms.every(t => text.includes(t) || fn.includes(t));
        }).length;
        if (totalDocs > 5) {
            html += `<div class="gsr-item" data-type="doc-all" style="color:var(--accent)">
                <span class="gsr-item-text">View all ${totalDocs.toLocaleString()} document results →</span>
            </div>`;
        }
        html += `</div>`;
    }

    // Contact results (top 3)
    const contactResults = state.contacts.filter(c =>
        (c.n||'').toLowerCase().includes(q) || (c.e||'').toLowerCase().includes(q)
    ).slice(0, 3);

    if (contactResults.length) {
        html += `<div class="gsr-section"><div class="gsr-title">Contacts</div>`;
        for (const c of contactResults) {
            html += `<div class="gsr-item" data-type="contact" data-email="${esc(c.e)}">
                <svg class="gsr-item-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span class="gsr-item-text">${esc(c.n)}</span>
                <span class="gsr-item-sub">${((c.s||0)+(c.r||0))} emails</span>
            </div>`;
        }
        html += `</div>`;
    }

    if (!html) {
        html = '<div class="gsr-section"><div class="gsr-title">No results</div></div>';
    }

    container.innerHTML = html;
    container.classList.add('active');

    // Bind click handlers
    container.querySelectorAll('.gsr-item').forEach(item => {
        item.addEventListener('click', () => {
            container.classList.remove('active');
            const type = item.dataset.type;
            if (type === 'email') {
                openEmail(item.dataset.id, item.dataset.did);
            } else if (type === 'email-all') {
                switchView('inbox');
                refreshInbox();
            } else if (type === 'photo' || type === 'photo-all') {
                switchView('photos');
                document.getElementById('photos-search').value = query;
                photoState.searchQuery = query;
                filterPhotos();
            } else if (type === 'doc' || type === 'doc-all') {
                switchView('documents');
                document.getElementById('docs-search').value = query;
                docState.searchQuery = query;
                filterDocuments();
            } else if (type === 'contact') {
                document.getElementById('search-input').value = item.dataset.email;
                state.searchQuery = item.dataset.email;
                switchView('inbox');
                refreshInbox();
            }
        });
    });
}

document.getElementById('contacts-search').addEventListener('input', (e) => {
    renderContacts(e.target.value);
});

// Photos event listeners
document.getElementById('photos-source-filter').addEventListener('change', (e) => {
    photoState.sourceFilter = e.target.value;
    filterPhotos();
});
let photosSearchTimeout;
document.getElementById('photos-search').addEventListener('input', (e) => {
    clearTimeout(photosSearchTimeout);
    photosSearchTimeout = setTimeout(() => {
        photoState.searchQuery = e.target.value;
        filterPhotos();
    }, 200);
});
document.getElementById('photos-more-btn').addEventListener('click', showMorePhotos);

// Lightbox event listeners
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => navigateLightbox(-1));
document.getElementById('lightbox-next').addEventListener('click', () => navigateLightbox(1));
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
});

// Documents event listeners
document.getElementById('docs-source-filter').addEventListener('change', (e) => {
    docState.sourceFilter = e.target.value;
    filterDocuments();
});
let docsSearchTimeout;
document.getElementById('docs-search').addEventListener('input', (e) => {
    clearTimeout(docsSearchTimeout);
    docsSearchTimeout = setTimeout(() => {
        docState.searchQuery = e.target.value;
        filterDocuments();
    }, 200);
});
document.getElementById('docs-more-btn').addEventListener('click', showMoreDocuments);

// Network event listeners
document.getElementById('network-min-emails').addEventListener('change', () => {
    netState.rendered = false;
    renderNetwork();
});
let netSearchTimeout;
document.getElementById('network-search').addEventListener('input', (e) => {
    clearTimeout(netSearchTimeout);
    netSearchTimeout = setTimeout(() => {
        const q = e.target.value.toLowerCase();
        if (!q) { netState.selected = null; }
        else {
            const found = netState.nodes.find(n => n.name.toLowerCase().includes(q) || n.id.includes(q));
            netState.selected = found ? found.id : null;
        }
        if (netState.draw) netState.draw();
    }, 200);
});

document.addEventListener('keydown', (e) => {
    // Command palette takes precedence (handled by its own listener)
    if (cmdPaletteOverlay.classList.contains('active')) return;
    // PDF viewer
    if (document.getElementById('pdf-viewer-overlay').classList.contains('active')) {
        if (e.key === 'Escape') closePdfViewer();
        return;
    }
    if (document.getElementById('lightbox').classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
        return;
    }
    // Shortcuts modal
    if (document.getElementById('shortcuts-modal').classList.contains('active')) {
        if (e.key === 'Escape') document.getElementById('shortcuts-modal').classList.remove('active');
        return;
    }
    // Ignore if typing in input
    const tag = document.activeElement.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    if (isInput) {
        if (e.key === 'Escape') { document.activeElement.blur(); e.preventDefault(); }
        return;
    }
    // Gmail-style keyboard shortcuts
    handleKeyboardShortcut(e);
});

// === KEYBOARD SHORTCUTS ===
let kbSelectedIdx = -1;
let gPending = false;

function handleKeyboardShortcut(e) {
    const currentView = document.querySelector('.view.active')?.id || '';
    // 'g' then letter for navigation
    if (gPending) {
        gPending = false;
        const viewMap = {i:'inbox',c:'contacts',p:'photos',d:'documents',f:'flights',n:'network',s:'stats',t:'timeline',b:'bookmarks',r:'profiles',e:'board'};
        if (viewMap[e.key]) { navigateTo(viewMap[e.key]); e.preventDefault(); }
        return;
    }
    switch(e.key) {
        case '?':
            document.getElementById('shortcuts-modal').classList.add('active');
            e.preventDefault();
            break;
        case '/':
            document.getElementById('search-input').focus();
            e.preventDefault();
            break;
        case 'g':
            gPending = true;
            setTimeout(() => gPending = false, 1500);
            break;
        case '.':
            toggleTheme();
            break;
        case 'j': case 'ArrowDown':
            if (currentView === 'view-inbox') { kbNavigateEmail(1); e.preventDefault(); }
            break;
        case 'k': case 'ArrowUp':
            if (currentView === 'view-inbox') { kbNavigateEmail(-1); e.preventDefault(); }
            break;
        case 'o': case 'Enter':
            if (currentView === 'view-inbox') { kbOpenSelected(); e.preventDefault(); }
            break;
        case 'u':
            if (currentView === 'view-email-detail') { navigateTo('inbox'); e.preventDefault(); }
            break;
        case 'Escape':
            if (currentView === 'view-email-detail') navigateTo('inbox');
            break;
        case 's':
            if (currentView === 'view-inbox') kbStarSelected();
            break;
    }
}

function kbNavigateEmail(dir) {
    const rows = document.querySelectorAll('#email-list .email-row');
    if (!rows.length) return;
    document.querySelectorAll('.email-row.kb-selected').forEach(r => r.classList.remove('kb-selected'));
    kbSelectedIdx = Math.max(0, Math.min(rows.length - 1, kbSelectedIdx + dir));
    rows[kbSelectedIdx].classList.add('kb-selected');
    rows[kbSelectedIdx].scrollIntoView({block:'nearest'});
}

function kbOpenSelected() {
    const rows = document.querySelectorAll('#email-list .email-row');
    if (kbSelectedIdx >= 0 && kbSelectedIdx < rows.length) {
        const row = rows[kbSelectedIdx];
        openEmail(row.dataset.id, row.dataset.did);
    }
}

function kbStarSelected() {
    const rows = document.querySelectorAll('#email-list .email-row');
    if (kbSelectedIdx >= 0 && kbSelectedIdx < rows.length) {
        const star = rows[kbSelectedIdx].querySelector('.email-star');
        if (star) star.click();
    }
}

document.getElementById('shortcuts-close').addEventListener('click', () => {
    document.getElementById('shortcuts-modal').classList.remove('active');
});
document.getElementById('shortcuts-modal').addEventListener('click', (e) => {
    if (e.target.id === 'shortcuts-modal') e.target.classList.remove('active');
});

// Flights search
let flightsSearchTimeout;
document.getElementById('flights-search').addEventListener('input', (e) => {
    clearTimeout(flightsSearchTimeout);
    flightsSearchTimeout = setTimeout(() => renderFlights(e.target.value.trim()), 200);
});

// === URL ROUTING (Hash-based deep links) ===
function navigateTo(viewId, params) {
    let hash = '#' + viewId;
    if (params) {
        const p = new URLSearchParams(params);
        hash += '?' + p.toString();
    }
    history.pushState(null, '', hash);
    applyRoute();
}

function applyRoute() {
    const hash = location.hash.slice(1) || 'inbox';
    const [path, query] = hash.split('?');
    const params = new URLSearchParams(query || '');

    // email/{id}/{did} -> open email detail
    if (path.startsWith('email/')) {
        const parts = path.split('/');
        const emailId = parts[1] || '';
        const docId = parts[2] || '';
        if (emailId && docId) {
            openEmail(emailId, docId);
            return;
        }
    }

    // Map route to view
    const viewMap = {
        inbox:'inbox', contacts:'contacts', flights:'flights', photos:'photos',
        documents:'documents', timeline:'timeline', network:'network', stats:'stats',
        bookmarks:'bookmarks', profiles:'profiles',
    };
    const viewId = viewMap[path] || 'inbox';
    switchView(viewId);

    // Apply query params
    if (path === 'inbox' || path === '') {
        const q = params.get('q');
        const folder = params.get('folder');
        if (q) { document.getElementById('search-input').value = q; state.searchQuery = q; }
        if (folder) setFolder(folder);
        refreshInbox();
    }
    if (path === 'photos' && params.get('q')) {
        document.getElementById('photos-search').value = params.get('q');
        photoState.searchQuery = params.get('q');
        filterPhotos();
    }
    if (path === 'documents' && params.get('q')) {
        document.getElementById('docs-search').value = params.get('q');
        docState.searchQuery = params.get('q');
        filterDocuments();
    }
    if (path === 'flights' && params.get('q')) {
        document.getElementById('flights-search').value = params.get('q');
        renderFlights(params.get('q'));
    }
    if (path === 'contacts' && params.get('q')) {
        document.getElementById('contacts-search').value = params.get('q');
        renderContacts(params.get('q'));
    }
}

// Update hash when switching views
const _origSwitchView = switchView;
switchView = function(viewId) {
    _origSwitchView(viewId);
    // Only update hash if not already matching (avoid loops)
    const currentHash = location.hash.slice(1).split('?')[0] || 'inbox';
    if (viewId !== 'email-detail' && currentHash !== viewId) {
        history.replaceState(null, '', '#' + viewId);
    }
    kbSelectedIdx = -1;
};

// Update hash when opening email
const _origOpenEmail = openEmail;
openEmail = async function(emailId, docId) {
    history.pushState(null, '', '#email/' + emailId + '/' + docId);
    await _origOpenEmail(emailId, docId);
};

// Listen for back/forward
window.addEventListener('popstate', applyRoute);

// === BOOKMARKS ===
const bookmarks = JSON.parse(localStorage.getItem('unsealed_bookmarks') || '[]');

function addBookmark(type, id, title, sub) {
    if (bookmarks.find(b => b.type === type && b.id === id)) return;
    bookmarks.push({ type, id, title, sub, ts: Date.now() });
    localStorage.setItem('unsealed_bookmarks', JSON.stringify(bookmarks));
    showToast('Saved to bookmarks');
}

function removeBookmark(type, id) {
    const idx = bookmarks.findIndex(b => b.type === type && b.id === id);
    if (idx >= 0) { bookmarks.splice(idx, 1); localStorage.setItem('unsealed_bookmarks', JSON.stringify(bookmarks)); }
}

function isBookmarked(type, id) { return bookmarks.some(b => b.type === type && b.id === id); }

function renderBookmarks(filter) {
    const grid = document.getElementById('bookmarks-grid');
    let items = bookmarks;
    if (filter && filter !== 'all') items = items.filter(b => b.type === filter);
    if (!items.length) { grid.innerHTML = '<div class="empty-state">No saved items yet. Bookmark emails, photos, and documents to see them here.</div>'; return; }
    grid.innerHTML = items.map((b, i) => {
        const icons = { email: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
            photo: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
            document: '<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>' };
        return `<div class="bm-item" data-idx="${i}" data-type="${b.type}" data-id="${esc(b.id)}">
            <span class="bm-item-icon">${icons[b.type] || ''}</span>
            <div class="bm-item-text"><h4>${esc(b.title)}</h4><p>${esc(b.sub || b.type)}</p></div>
            <button class="bm-item-remove" data-idx="${i}" title="Remove">×</button>
        </div>`;
    }).join('');
    grid.querySelectorAll('.bm-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('bm-item-remove')) {
                const idx = parseInt(e.target.dataset.idx);
                bookmarks.splice(idx, 1);
                localStorage.setItem('unsealed_bookmarks', JSON.stringify(bookmarks));
                renderBookmarks(document.querySelector('.bm-tab.active')?.dataset.bm);
                return;
            }
            const b = bookmarks[parseInt(item.dataset.idx)];
            if (b.type === 'email') { const [eid, did] = b.id.split('|'); openEmail(eid, did); }
            else if (b.type === 'photo') { switchView('photos'); }
            else if (b.type === 'document') { openPdfViewer(DOC_CDN + b.id, b.title); }
        });
    });
    document.getElementById('bookmarks-count').textContent = `${items.length} saved items`;
}

document.querySelectorAll('.bm-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.bm-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderBookmarks(tab.dataset.bm);
    });
});

// === EXPORT & SHARE ===
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

document.getElementById('copy-link-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(location.href).then(() => showToast('Link copied to clipboard'));
});

document.getElementById('download-email-btn').addEventListener('click', () => {
    const detail = document.getElementById('email-detail');
    const subject = detail.querySelector('.email-detail-subject')?.textContent || 'email';
    const text = detail.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = subject.replace(/[^a-z0-9]/gi, '_').slice(0, 50) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Email downloaded');
});

document.getElementById('bookmark-email-btn').addEventListener('click', () => {
    const hash = location.hash.slice(1);
    if (!hash.startsWith('email/')) return;
    const parts = hash.split('/');
    const emailId = parts[1], docId = parts[2];
    const subject = document.querySelector('.email-detail-subject')?.textContent || 'Email';
    if (isBookmarked('email', emailId + '|' + docId)) {
        removeBookmark('email', emailId + '|' + docId);
        showToast('Removed from bookmarks');
    } else {
        addBookmark('email', emailId + '|' + docId, subject, 'Email');
        showToast('Saved to bookmarks');
    }
});

document.getElementById('export-csv-btn').addEventListener('click', () => {
    const filtered = applyFilters(state.allLoaded);
    let csv = 'From,To,Subject,Date\n';
    for (const e of filtered.slice(0, 5000)) {
        csv += `"${(e.f||'').replace(/"/g,'""')}","${(e.t||'').replace(/"/g,'""')}","${(e.s||'').replace(/"/g,'""')}","${e.fd||''}"\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'unsealed-emails.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`Exported ${Math.min(filtered.length, 5000)} emails as CSV`);
});

// === ADVANCED FILTERS ===
document.getElementById('toggle-advanced-filters').addEventListener('click', () => {
    const panel = document.getElementById('advanced-filters');
    panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('af-clear').addEventListener('click', () => {
    document.getElementById('af-from').value = '';
    document.getElementById('af-to').value = '';
    document.getElementById('af-date-from').value = '';
    document.getElementById('af-date-to').value = '';
    refreshInbox();
});

['af-from', 'af-to', 'af-date-from', 'af-date-to'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => refreshInbox());
});

// Extend applyFilters with advanced filters
const _origApplyFilters = applyFilters;
function applyFiltersAdvanced(emails) {
    let result = _origApplyFilters(emails);
    const afFrom = (document.getElementById('af-from')?.value || '').toLowerCase();
    const afTo = (document.getElementById('af-to')?.value || '').toLowerCase();
    const afDateFrom = document.getElementById('af-date-from')?.value;
    const afDateTo = document.getElementById('af-date-to')?.value;
    if (afFrom) result = result.filter(e => (e.f||'').toLowerCase().includes(afFrom) || (e.fe||'').toLowerCase().includes(afFrom));
    if (afTo) result = result.filter(e => (e.t||'').toLowerCase().includes(afTo));
    if (afDateFrom) result = result.filter(e => e.d && e.d >= afDateFrom);
    if (afDateTo) result = result.filter(e => e.d && e.d <= afDateTo + 'T23:59:59');
    return result;
}

// === READING PANE ===
let readingPaneActive = false;

document.getElementById('toggle-reading-pane').addEventListener('click', () => {
    readingPaneActive = !readingPaneActive;
    const pane = document.getElementById('reading-pane');
    const btn = document.getElementById('toggle-reading-pane');
    pane.style.display = readingPaneActive ? 'block' : 'none';
    btn.classList.toggle('active', readingPaneActive);
    if (!readingPaneActive) document.getElementById('reading-pane-content').innerHTML = '<div class="empty-state">Select an email to read</div>';
});

async function openInReadingPane(emailId, docId) {
    const pane = document.getElementById('reading-pane-content');
    pane.innerHTML = '<div class="loading-indicator"><div class="spinner"></div></div>';
    const thread = await loadThread(docId);
    if (!thread) { pane.innerHTML = '<div class="empty-state">Failed to load</div>'; return; }
    pane.innerHTML = buildEmailDetailHTML(thread);
}

// === AI SUMMARY (extractive) ===
function generateSummary(text) {
    if (!text || text.length < 100) return '';
    // Split into sentences, pick the first 2-3 meaningful ones
    const sentences = text.replace(/\n+/g, ' ').split(/(?<=[.!?])\s+/).filter(s => s.length > 20 && s.length < 300);
    if (sentences.length === 0) return '';
    return sentences.slice(0, 3).join(' ');
}

// === THREAD TIMELINE ===
function buildThreadTimeline(messages) {
    if (messages.length < 2) return '';
    return `<div class="thread-timeline">` +
        messages.map((msg, i) => {
            const date = msg.formatted_date || '';
            const dot = `<div class="tt-dot ${i === 0 ? 'active' : ''}" title="${esc(msg.from)} — ${esc(date)}" data-idx="${i}"></div>`;
            return (i > 0 ? '<div class="tt-line"></div>' : '') + dot;
        }).join('') + `</div>`;
}

// Shared email detail renderer (used by both detail view and reading pane)
function buildEmailDetailHTML(thread) {
    const firstBody = thread[0]?.body || '';
    const summary = generateSummary(firstBody);
    const summaryHTML = summary ? `<div class="email-summary"><strong>Summary:</strong> ${esc(summary)}</div>` : '';
    const timeline = buildThreadTimeline(thread);

    return (thread[0] ? `<h1 class="email-detail-subject">${esc(thread[0].subject)}</h1>` : '') +
        summaryHTML + timeline +
        thread.map((msg, i) => {
            const color = msg.avatar_color || getColor(msg.from);
            const body = msg.body || '(no content)';
            const bodyHtml = body.replace(/\n/g, '<br>');
            return `<div class="email-detail-message ${thread.length > 1 ? 'threaded' : ''}">
                <div class="email-detail-header">
                    <div class="detail-avatar" style="background:${color}">${initials(msg.from)}</div>
                    <div class="detail-meta">
                        <div class="detail-sender">${esc(msg.from)} <span>&lt;${esc(msg.from_email)}&gt;</span></div>
                        <div class="detail-recipients">to ${esc(msg.to)}</div>
                    </div>
                    <div class="detail-date-wrap">
                        <div class="detail-date">${esc(msg.formatted_date)} ${esc(msg.formatted_time)}</div>
                        ${msg.stars > 0 ? `<div class="detail-stars">★ ${msg.stars.toLocaleString()}</div>` : ''}
                    </div>
                </div>
                <div class="email-detail-body">${bodyHtml}</div>
                ${msg.attachments > 0 ? `<div class="email-detail-attachments"><span class="attachment-chip">📎 ${msg.attachments} attachment${msg.attachments > 1 ? 's' : ''}</span></div>` : ''}
            </div>`;
        }).join('');
}

// === HEATMAP CALENDAR ===
function renderHeatmap() {
    const wrap = document.getElementById('heatmap-wrap');
    if (!wrap || !state.allLoaded.length) return;

    const dayCounts = {};
    for (const e of state.allLoaded) {
        if (e.d) {
            const day = e.d.slice(0, 10);
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
    }

    const days = Object.keys(dayCounts).sort();
    if (!days.length) return;
    const startDate = new Date(days[0]);
    const endDate = new Date(days[days.length - 1]);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Group by year
    const years = {};
    for (const [day, count] of Object.entries(dayCounts)) {
        const yr = day.slice(0, 4);
        if (!years[yr]) years[yr] = {};
        years[yr][day] = count;
    }

    const maxCount = Math.max(...Object.values(dayCounts));
    const colorScale = (count) => {
        if (!count) return isDark ? '#161b22' : '#ebedf0';
        const intensity = Math.min(count / Math.max(maxCount * 0.3, 1), 1);
        if (isDark) {
            const greens = ['#0e4429', '#006d32', '#26a641', '#39d353'];
            return greens[Math.min(Math.floor(intensity * 4), 3)];
        } else {
            const greens = ['#9be9a8', '#40c463', '#30a14e', '#216e39'];
            return greens[Math.min(Math.floor(intensity * 4), 3)];
        }
    };

    let html = '';
    const sortedYears = Object.keys(years).sort();
    for (const yr of sortedYears) {
        const cellSize = 11, gap = 2, total = cellSize + gap;
        const jan1 = new Date(yr + '-01-01');
        const startDow = jan1.getDay();
        const svgW = 53 * total + 40;

        html += `<div style="margin-bottom:8px"><svg width="${svgW}" height="${7 * total + 20}">`;
        html += `<text x="0" y="12" style="font-size:12px;fill:var(--text-primary);font-weight:500">${yr}</text>`;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        for (let m = 0; m < 12; m++) {
            const mDate = new Date(yr, m, 1);
            const dayOfYear = Math.floor((mDate - jan1) / 86400000);
            const weekOfYear = Math.floor((dayOfYear + startDow) / 7);
            html += `<text x="${35 + weekOfYear * total}" y="28">${months[m]}</text>`;
        }

        // Draw day cells
        for (let d = 0; d < 366; d++) {
            const date = new Date(jan1);
            date.setDate(date.getDate() + d);
            if (date.getFullYear() !== parseInt(yr)) break;
            const key = date.toISOString().slice(0, 10);
            const dow = date.getDay();
            const week = Math.floor((d + startDow) / 7);
            const count = years[yr][key] || 0;
            html += `<rect x="${35 + week * total}" y="${32 + dow * total}" width="${cellSize}" height="${cellSize}" rx="2" fill="${colorScale(count)}" data-date="${key}" data-count="${count}"><title>${key}: ${count} emails</title></rect>`;
        }
        html += `</svg></div>`;
    }
    wrap.innerHTML = html;
}

// === FLIGHT ROUTE MAP ===
let flightMap = null;

function renderFlightMap() {
    if (!flightState.data || flightMap) return;
    const flights = flightState.data.flights;
    const airportNames = flightState.data.airports || {};

    const coords = {
        TEB:[40.850,-74.061], PBI:[26.683,-80.096], STT:[18.337,-64.973],
        SJU:[18.439,-66.002], AZS:[19.267,-69.742], LBG:[48.969,2.441],
        BDA:[32.364,-64.679], CYUL:[45.471,-73.741], MYNN:[25.039,-77.466],
        CPT:[-33.965,18.602], NRT:[35.764,140.386], SAL:[32.011,34.887],
        EGGW:[51.875,-0.368], MCO:[28.431,-81.308], CMH:[39.998,-82.892],
        JFK:[40.641,-73.778], BED:[42.470,-71.289], SFB:[28.778,-81.238],
        FXE:[26.197,-80.171], HPN:[41.067,-73.708], MKJS:[18.504,-77.913],
        TIST:[18.337,-64.973]
    };

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    flightMap = L.map('flights-map', { zoomControl: false, attributionControl: false }).setView([25, -40], 3);
    L.control.zoom({ position: 'bottomright' }).addTo(flightMap);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
    }).addTo(flightMap);

    // Build stats
    const passengerFlights = {};
    const airportCount = {};
    flights.forEach(f => {
        f.passengers.forEach(p => { if (!passengerFlights[p]) passengerFlights[p] = []; passengerFlights[p].push(f); });
        airportCount[f.dep] = (airportCount[f.dep] || 0) + 1;
        airportCount[f.arr] = (airportCount[f.arr] || 0) + 1;
    });
    const topAirport = Object.entries(airportCount).sort((a,b) => b[1]-a[1])[0];
    const uniquePassengers = Object.keys(passengerFlights).length;

    // Render stats
    document.getElementById('fmap-stats').innerHTML = `
        <div class="fmap-stat-card"><div class="fsc-value">${flights.length}</div><div class="fsc-label">Total Flights</div></div>
        <div class="fmap-stat-card"><div class="fsc-value">${uniquePassengers}</div><div class="fsc-label">Passengers</div></div>
        <div class="fmap-stat-card"><div class="fsc-value">${Object.keys(airportCount).length}</div><div class="fsc-label">Airports</div></div>
        <div class="fmap-stat-card"><div class="fsc-value">${topAirport ? (airportNames[topAirport[0]] || topAirport[0]) : '-'}</div><div class="fsc-label">Busiest Airport</div></div>
    `;

    // Render passenger pills
    const pillsHTML = Object.entries(passengerFlights).sort((a,b) => b[1].length - a[1].length)
        .map(([name, fl]) => `<button class="fmap-passenger-pill" data-passenger="${esc(name)}">${esc(name)} (${fl.length})</button>`).join('');
    document.getElementById('fmap-passengers').innerHTML = pillsHTML;

    // Route layer group for easy clear/re-draw
    const routeLayer = L.layerGroup().addTo(flightMap);
    const markerLayer = L.layerGroup().addTo(flightMap);
    let planeMarker = null;
    let selectedPassenger = null;

    function curvedArc(from, to, numPoints) {
        // Compute a curved arc between two points
        const points = [];
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const lat = from[0] + (to[0] - from[0]) * t;
            const lng = from[1] + (to[1] - from[1]) * t;
            // Add curvature based on distance
            const dist = Math.sqrt(Math.pow(to[0]-from[0],2) + Math.pow(to[1]-from[1],2));
            const curve = Math.sin(t * Math.PI) * dist * 0.15;
            points.push([lat + curve * 0.3, lng]);
        }
        return points;
    }

    function drawFlights(flightsToShow, animate) {
        routeLayer.clearLayers();
        markerLayer.clearLayers();

        // Count routes for this subset
        const routeCounts = {};
        const activeAirports = {};
        for (const f of flightsToShow) {
            if (!coords[f.dep] || !coords[f.arr]) continue;
            const key = f.dep < f.arr ? `${f.dep}|${f.arr}` : `${f.arr}|${f.dep}`;
            if (!routeCounts[key]) routeCounts[key] = { count: 0, passengers: new Set(), flights: [] };
            routeCounts[key].count++;
            routeCounts[key].flights.push(f);
            f.passengers.forEach(p => routeCounts[key].passengers.add(p));
            activeAirports[f.dep] = (activeAirports[f.dep] || 0) + 1;
            activeAirports[f.arr] = (activeAirports[f.arr] || 0) + 1;
        }

        // Draw curved arcs
        for (const [key, data] of Object.entries(routeCounts)) {
            const [a, b] = key.split('|');
            const arc = curvedArc(coords[a], coords[b], 30);
            const weight = Math.min(2 + data.count * 0.5, 8);
            const opacity = Math.min(0.3 + data.count * 0.05, 0.9);

            // Glow layer (wider, transparent)
            L.polyline(arc, {
                color: selectedPassenger ? '#e74c3c' : '#3498db',
                weight: weight + 4, opacity: opacity * 0.3, className: 'flight-arc'
            }).addTo(routeLayer);
            // Main arc
            const line = L.polyline(arc, {
                color: selectedPassenger ? '#e74c3c' : '#3498db',
                weight: weight, opacity: opacity, dashArray: data.count > 3 ? null : '8 4',
                className: 'flight-arc'
            }).addTo(routeLayer);
            line.bindPopup(`<b>${airportNames[a] || a} ↔ ${airportNames[b] || b}</b><br>
                ${data.count} flight${data.count > 1 ? 's' : ''}<br>
                <em>${[...data.passengers].slice(0, 8).join(', ')}${data.passengers.size > 8 ? '...' : ''}</em>`);
        }

        // Draw airport markers with pulse
        for (const [code, count] of Object.entries(activeAirports)) {
            if (!coords[code]) continue;
            const size = Math.min(10 + count * 2, 28);
            const marker = L.marker(coords[code], {
                icon: L.divIcon({
                    className: '',
                    html: `<div class="airport-pulse" style="width:${size}px;height:${size}px;background:rgba(231,76,60,0.8);border:2px solid rgba(255,255,255,0.8);"></div>
                           <div class="airport-label">${code}</div>`,
                    iconSize: [size, size],
                    iconAnchor: [size/2, size/2],
                })
            }).addTo(markerLayer);
            marker.bindPopup(`<b>${airportNames[code] || code}</b><br>${count} flights`);
        }
    }

    // Initial draw with all flights
    drawFlights(flights, false);

    // Passenger filter pills
    document.getElementById('fmap-passengers').addEventListener('click', (e) => {
        const pill = e.target.closest('.fmap-passenger-pill');
        if (!pill) return;
        const name = pill.dataset.passenger;
        if (selectedPassenger === name) {
            selectedPassenger = null;
            document.querySelectorAll('.fmap-passenger-pill').forEach(p => p.classList.remove('active'));
            drawFlights(flights, false);
            document.getElementById('fmap-date-label').textContent = '';
        } else {
            selectedPassenger = name;
            document.querySelectorAll('.fmap-passenger-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            drawFlights(passengerFlights[name] || [], false);
            document.getElementById('fmap-date-label').textContent = `${name}: ${(passengerFlights[name] || []).length} flights`;
        }
    });

    // Flight playback timeline
    let playInterval = null;
    let playing = false;
    const slider = document.getElementById('fmap-slider');
    slider.max = flights.length - 1;
    slider.value = flights.length - 1;

    slider.addEventListener('input', () => {
        const idx = parseInt(slider.value);
        const subset = flights.slice(0, idx + 1);
        drawFlights(selectedPassenger ? subset.filter(f => f.passengers.includes(selectedPassenger)) : subset, false);
        const f = flights[idx];
        document.getElementById('fmap-date-label').textContent = f ? `${f.date} — ${airportNames[f.dep]||f.dep} → ${airportNames[f.arr]||f.arr}` : '';
        // Animate plane on last flight
        showPlane(f);
    });

    function showPlane(f) {
        if (planeMarker) { flightMap.removeLayer(planeMarker); planeMarker = null; }
        if (!f || !coords[f.arr]) return;
        const depCoord = coords[f.dep];
        const arrCoord = coords[f.arr];
        if (!depCoord || !arrCoord) return;
        // Compute bearing for rotation
        const dLng = (arrCoord[1] - depCoord[1]) * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(arrCoord[0] * Math.PI / 180);
        const x = Math.cos(depCoord[0] * Math.PI / 180) * Math.sin(arrCoord[0] * Math.PI / 180) -
                  Math.sin(depCoord[0] * Math.PI / 180) * Math.cos(arrCoord[0] * Math.PI / 180) * Math.cos(dLng);
        const bearing = Math.atan2(y, x) * 180 / Math.PI;

        planeMarker = L.marker(arrCoord, {
            icon: L.divIcon({
                className: '',
                html: `<div class="plane-marker" style="transform:rotate(${bearing - 45}deg)">✈️</div>`,
                iconSize: [24, 24], iconAnchor: [12, 12]
            }),
            zIndexOffset: 1000
        }).addTo(flightMap);
    }

    document.getElementById('fmap-play-btn').addEventListener('click', () => {
        const btn = document.getElementById('fmap-play-btn');
        if (playing) {
            clearInterval(playInterval);
            playing = false;
            btn.textContent = '▶ Play Timeline';
            btn.classList.remove('playing');
            return;
        }
        playing = true;
        btn.textContent = '⏸ Pause';
        btn.classList.add('playing');
        let idx = 0;
        slider.value = 0;

        playInterval = setInterval(() => {
            if (idx >= flights.length) {
                clearInterval(playInterval);
                playing = false;
                btn.textContent = '▶ Play Timeline';
                btn.classList.remove('playing');
                return;
            }
            slider.value = idx;
            const subset = flights.slice(0, idx + 1);
            drawFlights(selectedPassenger ? subset.filter(f => f.passengers.includes(selectedPassenger)) : subset, false);
            const f = flights[idx];
            document.getElementById('fmap-date-label').textContent = f ? `${f.date} — ${airportNames[f.dep]||f.dep} → ${airportNames[f.arr]||f.arr}` : '';
            showPlane(f);
            idx++;
        }, 350);
    });
}

// Flight tabs
document.querySelectorAll('.flights-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.flights-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isMap = tab.dataset.tab === 'map';
        document.getElementById('flights-table-wrap').style.display = isMap ? 'none' : 'block';
        document.getElementById('flights-map-wrap').style.display = isMap ? 'block' : 'none';
        if (isMap) { setTimeout(() => { renderFlightMap(); if (flightMap) flightMap.invalidateSize(); }, 100); }
    });
});

// === PASSENGER PROFILES ===
function buildProfiles() {
    const profiles = {};

    // From contacts
    for (const c of state.contacts) {
        const key = (c.n || c.e || '').toLowerCase();
        if (!key) continue;
        if (!profiles[key]) profiles[key] = { name: c.n || c.e, email: c.e, emails: (c.s||0)+(c.r||0), sent: c.s||0, recv: c.r||0, flights: 0, flightList: [], photos: 0 };
        else { profiles[key].emails += (c.s||0)+(c.r||0); profiles[key].email = profiles[key].email || c.e; }
    }

    // From flights
    if (flightState.data) {
        for (const f of flightState.data.flights) {
            for (const p of f.passengers) {
                const key = p.toLowerCase();
                if (!profiles[key]) profiles[key] = { name: p, email: '', emails: 0, sent: 0, recv: 0, flights: 0, flightList: [], photos: 0 };
                profiles[key].flights++;
                profiles[key].flightList.push(f);
            }
        }
    }

    return Object.values(profiles).sort((a, b) => (b.emails + b.flights * 10) - (a.emails + a.flights * 10));
}

function renderProfiles(search) {
    const list = document.getElementById('profiles-list');
    const detail = document.getElementById('profile-detail');
    detail.style.display = 'none';
    list.style.display = 'grid';

    let profiles = buildProfiles();
    if (search) {
        const q = search.toLowerCase();
        profiles = profiles.filter(p => p.name.toLowerCase().includes(q) || (p.email||'').toLowerCase().includes(q));
    }

    list.innerHTML = profiles.slice(0, 200).map((p, i) => {
        const color = getColor(p.name);
        const badges = [];
        if (p.emails > 0) badges.push(`✉ ${p.emails}`);
        if (p.flights > 0) badges.push(`✈ ${p.flights}`);
        return `<div class="profile-card" data-idx="${i}">
            <div class="contact-avatar" style="background:${color};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:500;font-size:14px">${initials(p.name)}</div>
            <div class="profile-card-info">
                <h3>${esc(p.name)}</h3>
                <p>${esc(p.email || '')}</p>
                <div class="profile-card-badges">${badges.map(b => `<span class="profile-badge">${b}</span>`).join('')}</div>
            </div>
        </div>`;
    }).join('');

    const allProfiles = profiles;
    list.querySelectorAll('.profile-card').forEach(card => {
        card.addEventListener('click', () => openProfile(allProfiles[parseInt(card.dataset.idx)]));
    });
}

function openProfile(profile) {
    const list = document.getElementById('profiles-list');
    const detail = document.getElementById('profile-detail');
    list.style.display = 'none';
    detail.style.display = 'block';

    const color = getColor(profile.name);
    const airports = flightState.data?.airports || {};

    // Find related emails
    const relatedEmails = state.allLoaded.filter(e =>
        (e.f||'').toLowerCase().includes(profile.name.toLowerCase()) ||
        (e.t||'').toLowerCase().includes(profile.name.toLowerCase()) ||
        (e.fe||'').toLowerCase() === (profile.email||'').toLowerCase()
    ).slice(0, 20);

    let html = `<button class="back-btn" id="back-to-profiles">
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg> Back to Profiles
    </button>
    <div class="profile-detail-header">
        <div class="contact-avatar" style="background:${color};width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:500;font-size:24px">${initials(profile.name)}</div>
        <div>
            <h2>${esc(profile.name)}</h2>
            <p style="color:var(--text-secondary)">${esc(profile.email || '')} · ${profile.emails} emails · ${profile.flights} flights</p>
        </div>
    </div>
    <div class="profile-sections">`;

    if (relatedEmails.length) {
        html += `<div class="profile-section"><h3>Recent Emails (${relatedEmails.length})</h3>`;
        html += relatedEmails.map(e => `<div class="email-row" data-id="${esc(e.id)}" data-did="${esc(e.did)}" style="cursor:pointer;padding:6px 0">
            <span class="email-sender" style="font-size:12px">${esc(e.f)}</span>
            <span class="email-subject" style="font-size:12px">${esc(e.s)}</span>
            <span class="email-date" style="font-size:11px">${esc(e.fd||'')}</span>
        </div>`).join('');
        html += `</div>`;
    }

    if (profile.flightList.length) {
        html += `<div class="profile-section"><h3>Flights (${profile.flights})</h3>`;
        html += profile.flightList.slice(0, 20).map(f => {
            const d = new Date(f.date);
            return `<div style="padding:4px 0;font-size:12px;border-bottom:1px solid var(--border-light)">
                ${d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'})} — 
                <strong>${f.dep} → ${f.arr}</strong>
                <span style="color:var(--text-secondary)"> (${airports[f.dep]||f.dep} → ${airports[f.arr]||f.arr})</span>
            </div>`;
        }).join('');
        html += `</div>`;
    }

    html += `</div>`;
    detail.innerHTML = html;

    // Bind events
    detail.querySelector('#back-to-profiles')?.addEventListener('click', () => renderProfiles());
    detail.querySelectorAll('.email-row[data-id]').forEach(row => {
        row.addEventListener('click', () => openEmail(row.dataset.id, row.dataset.did));
    });
}

let profilesSearchTimeout;
document.getElementById('profiles-search').addEventListener('input', (e) => {
    clearTimeout(profilesSearchTimeout);
    profilesSearchTimeout = setTimeout(() => renderProfiles(e.target.value.trim()), 200);
});

// === SENTIMENT ANALYSIS ===
const POSITIVE_WORDS = new Set(['thank','thanks','great','good','excellent','wonderful','happy','pleased','appreciate','glad','love','best','congratulations','delighted','fantastic','perfect','enjoy','kind','welcome','amazing','beautiful']);
const NEGATIVE_WORDS = new Set(['sorry','unfortunately','problem','issue','complaint','angry','disappointed','terrible','bad','worst','urgent','fail','failed','wrong','error','concerned','worried','regret','damage','danger','serious','critical']);

function analyzeSentiment(text) {
    if (!text) return 'neutral';
    const words = text.toLowerCase().split(/\W+/);
    let pos = 0, neg = 0;
    for (const w of words) {
        if (POSITIVE_WORDS.has(w)) pos++;
        if (NEGATIVE_WORDS.has(w)) neg++;
    }
    if (pos > neg && pos >= 2) return 'positive';
    if (neg > pos && neg >= 2) return 'negative';
    return 'neutral';
}

function sentimentDot(sentiment) {
    const cls = {positive:'sentiment-pos', negative:'sentiment-neg', neutral:'sentiment-neu'}[sentiment] || 'sentiment-neu';
    return `<span class="sentiment-dot ${cls}" title="${sentiment}"></span>`;
}

// === SEARCH HISTORY ===
const searchHistory = JSON.parse(localStorage.getItem('unsealed_search_history') || '[]');

function addSearchHistory(query) {
    if (!query || query.length < 2) return;
    const idx = searchHistory.indexOf(query);
    if (idx >= 0) searchHistory.splice(idx, 1);
    searchHistory.unshift(query);
    if (searchHistory.length > 20) searchHistory.pop();
    localStorage.setItem('unsealed_search_history', JSON.stringify(searchHistory));
}

function showSearchHistory() {
    const container = document.getElementById('search-history');
    if (!searchHistory.length) { container.classList.remove('active'); return; }
    container.innerHTML = `<div class="sh-title">Recent Searches</div>` +
        searchHistory.slice(0, 10).map((q, i) => `<div class="sh-item" data-idx="${i}">
            <svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>
            <span class="sh-item-text">${esc(q)}</span>
            <button class="sh-item-remove" data-idx="${i}" title="Remove">×</button>
        </div>`).join('') +
        `<button class="sh-clear" id="sh-clear-all">Clear search history</button>`;
    container.classList.add('active');

    container.querySelectorAll('.sh-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('sh-item-remove')) {
                searchHistory.splice(parseInt(e.target.dataset.idx), 1);
                localStorage.setItem('unsealed_search_history', JSON.stringify(searchHistory));
                showSearchHistory();
                return;
            }
            const q = searchHistory[parseInt(item.dataset.idx)];
            document.getElementById('search-input').value = q;
            state.searchQuery = q;
            container.classList.remove('active');
            showGlobalSearchResults(q);
        });
    });
    document.getElementById('sh-clear-all')?.addEventListener('click', () => {
        searchHistory.length = 0;
        localStorage.setItem('unsealed_search_history', JSON.stringify(searchHistory));
        container.classList.remove('active');
    });
}

// Show history on focus when empty
document.getElementById('search-input').addEventListener('focus', () => {
    const val = document.getElementById('search-input').value.trim();
    if (!val) showSearchHistory();
});

// === PIN CONTACTS ===
const pinnedContacts = JSON.parse(localStorage.getItem('unsealed_pinned_contacts') || '[]');

function togglePinContact(email) {
    const idx = pinnedContacts.indexOf(email);
    if (idx >= 0) pinnedContacts.splice(idx, 1);
    else pinnedContacts.push(email);
    localStorage.setItem('unsealed_pinned_contacts', JSON.stringify(pinnedContacts));
}

function isPinned(email) { return pinnedContacts.includes(email); }

// === PDF VIEWER ===
function openPdfViewer(url, title) {
    document.getElementById('pdf-viewer-title').textContent = title || 'Document';
    document.getElementById('pdf-viewer-iframe').src = url;
    document.getElementById('pdf-viewer-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePdfViewer() {
    document.getElementById('pdf-viewer-overlay').classList.remove('active');
    document.getElementById('pdf-viewer-iframe').src = '';
    document.body.style.overflow = '';
}

document.getElementById('pdf-viewer-close').addEventListener('click', closePdfViewer);
document.getElementById('pdf-viewer-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'pdf-viewer-overlay') closePdfViewer();
});

// === MOBILE SIDEBAR ===
const sidebarOverlay = document.getElementById('sidebar-overlay');

document.getElementById('sidebar-toggle').addEventListener('click', () => {
    const sb = document.getElementById('sidebar');
    if (window.innerWidth <= 768) {
        sb.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active', sb.classList.contains('mobile-open'));
    } else {
        sb.classList.toggle('collapsed');
    }
});

sidebarOverlay.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('mobile-open');
    sidebarOverlay.classList.remove('active');
});

// Close sidebar on nav (mobile)
document.querySelectorAll('.app-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        }
    });
});

// === INFINITE SCROLL for Photos & Docs ===
function setupInfiniteScroll(sentinelId, loadMoreFn) {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) loadMoreFn();
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
}

// Replace click-to-load with auto-load for photos
const origPhotosMoreBtn = document.getElementById('photos-more-btn');
if (origPhotosMoreBtn) {
    setupInfiniteScroll('photos-load-more', () => {
        if (photoState.shown < photoState.filtered.length) showMorePhotos();
    });
}

// Replace click-to-load with auto-load for docs
const origDocsMoreBtn = document.getElementById('docs-more-btn');
if (origDocsMoreBtn) {
    setupInfiniteScroll('docs-load-more', () => {
        if (docState.shown < docState.filtered.length) showMoreDocuments();
    });
}

// === PWA SERVICE WORKER ===
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// === REPLAY INTRO ===
document.getElementById('replay-intro').addEventListener('click', () => {
    sessionStorage.setItem('replay_intro', '1');
    localStorage.removeItem('unsealed_intro_seen');
    location.reload();
});

(function initTheme() {
    const saved = localStorage.getItem('unsealed_theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcon();
})();

function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('unsealed_theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('unsealed_theme', 'dark');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.getElementById('theme-icon-light').style.display = isDark ? 'none' : 'block';
    document.getElementById('theme-icon-dark').style.display = isDark ? 'block' : 'none';
}

document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

// === COMMAND PALETTE (⌘K) ===
const cmdPaletteOverlay = document.getElementById('cmd-palette-overlay');
const cmdPaletteInput = document.getElementById('cmd-palette-input');
const cmdPaletteResults = document.getElementById('cmd-palette-results');
let cmdSelectedIdx = -1;

function openCmdPalette() {
    cmdPaletteOverlay.classList.add('active');
    cmdPaletteInput.value = '';
    cmdPaletteResults.innerHTML = '';
    cmdSelectedIdx = -1;
    setTimeout(() => cmdPaletteInput.focus(), 50);
    renderCmdDefault();
}

function closeCmdPalette() {
    cmdPaletteOverlay.classList.remove('active');
    cmdPaletteInput.blur();
}

function renderCmdDefault() {
    const views = [
        { id: 'inbox', icon: '📧', label: 'Inbox', desc: 'View emails' },
        { id: 'contacts', icon: '👤', label: 'Contacts', desc: 'Browse contacts' },
        { id: 'flights', icon: '✈️', label: 'Flights', desc: 'Lolita Express flight logs' },
        { id: 'photos', icon: '📷', label: 'Photos', desc: '18,308 photos' },
        { id: 'documents', icon: '📄', label: 'Documents', desc: '1,351 documents' },
        { id: 'timeline', icon: '📅', label: 'Timeline', desc: 'Key events' },
        { id: 'network', icon: '🌐', label: 'Network', desc: 'Email connections graph' },
        { id: 'stats', icon: '📊', label: 'Stats', desc: 'Email analytics' },
        { id: 'bookmarks', icon: '🔖', label: 'Saved Items', desc: 'Your bookmarks' },
        { id: 'profiles', icon: '👥', label: 'Profiles', desc: 'Passenger & contact profiles' },
        { id: 'board', icon: '🔍', label: 'Evidence Board', desc: 'Investigation board with connections' },
    ];
    const actions = [
        { action: 'toggle-dark', icon: '🌙', label: 'Toggle Dark Mode' },
        { action: 'toggle-reading-pane', icon: '📖', label: 'Toggle Reading Pane' },
        { action: 'export-csv', icon: '📥', label: 'Export Emails as CSV' },
        { action: 'shortcuts', icon: '⌨️', label: 'Keyboard Shortcuts' },
        { action: 'replay-intro', icon: '🎬', label: 'Replay Intro' },
    ];
    let html = '<div class="cmd-palette-group-label">Navigate</div>';
    html += views.map((v, i) => `<div class="cmd-result${i === 0 ? ' active' : ''}" data-type="view" data-id="${v.id}">
        <span class="cmd-result-icon">${v.icon}</span>
        <div class="cmd-result-text"><h4>${v.label}</h4><p>${v.desc}</p></div>
        <span class="cmd-result-badge">View</span>
    </div>`).join('');
    html += '<div class="cmd-palette-group-label">Actions</div>';
    html += actions.map(a => `<div class="cmd-result" data-type="action" data-id="${a.action}">
        <span class="cmd-result-icon">${a.icon}</span>
        <div class="cmd-result-text"><h4>${a.label}</h4></div>
        <span class="cmd-result-badge">Action</span>
    </div>`).join('');
    cmdPaletteResults.innerHTML = html;
    cmdSelectedIdx = 0;
    bindCmdResults();
}

function searchCmdPalette(query) {
    if (!query) { renderCmdDefault(); return; }
    const q = query.toLowerCase();
    let results = [];

    // Search views
    const viewNames = { inbox: 'Inbox — Emails', contacts: 'Contacts', flights: 'Flights', photos: 'Photos', documents: 'Documents', timeline: 'Timeline', network: 'Network Graph', stats: 'Statistics', bookmarks: 'Saved Items', profiles: 'Profiles', board: 'Evidence Board' };
    const viewIcons = { inbox: '📧', contacts: '👤', flights: '✈️', photos: '📷', documents: '📄', timeline: '📅', network: '🌐', stats: '📊', bookmarks: '🔖', profiles: '👥', board: '🔍' };
    for (const [id, name] of Object.entries(viewNames)) {
        if (name.toLowerCase().includes(q)) results.push({ type: 'view', id, icon: viewIcons[id], label: name, badge: 'View' });
    }

    // Search contacts
    const contactMatches = state.contacts.filter(c => (c.n || '').toLowerCase().includes(q) || (c.e || '').toLowerCase().includes(q)).slice(0, 5);
    contactMatches.forEach(c => results.push({ type: 'contact', id: c.e, icon: '👤', label: c.n || c.e, desc: c.e, badge: 'Contact' }));

    // Search emails by subject
    const emailMatches = state.allLoaded.filter(e => (e.s || '').toLowerCase().includes(q) || (e.f || '').toLowerCase().includes(q)).slice(0, 8);
    emailMatches.forEach(e => results.push({ type: 'email', id: e.id, did: e.did, icon: '📧', label: e.s || '(no subject)', desc: `From: ${e.f || 'Unknown'}`, badge: 'Email' }));

    if (!results.length) {
        cmdPaletteResults.innerHTML = '<div class="cmd-result"><span class="cmd-result-icon">🔍</span><div class="cmd-result-text"><h4>No results</h4><p>Try a different search term</p></div></div>';
        return;
    }

    cmdPaletteResults.innerHTML = results.map((r, i) => `<div class="cmd-result${i === 0 ? ' active' : ''}" data-type="${r.type}" data-id="${esc(r.id)}" ${r.did ? `data-did="${esc(r.did)}"` : ''}>
        <span class="cmd-result-icon">${r.icon}</span>
        <div class="cmd-result-text"><h4>${esc(r.label)}</h4>${r.desc ? `<p>${esc(r.desc)}</p>` : ''}</div>
        <span class="cmd-result-badge">${r.badge}</span>
    </div>`).join('');
    cmdSelectedIdx = 0;
    bindCmdResults();
}

function executeCmdResult(el) {
    const type = el.dataset.type;
    const id = el.dataset.id;
    closeCmdPalette();
    if (type === 'view') navigateTo(id);
    else if (type === 'contact') { navigateTo('contacts'); document.getElementById('contacts-search').value = id; renderContacts(id); }
    else if (type === 'email') openEmail(id, el.dataset.did);
    else if (type === 'action') {
        if (id === 'toggle-dark') toggleTheme();
        else if (id === 'toggle-reading-pane') document.getElementById('toggle-reading-pane').click();
        else if (id === 'export-csv') document.getElementById('export-csv-btn').click();
        else if (id === 'shortcuts') document.getElementById('shortcuts-modal').classList.add('active');
        else if (id === 'replay-intro') { sessionStorage.setItem('replay_intro', '1'); localStorage.removeItem('unsealed_intro_seen'); location.reload(); }
    }
}

function bindCmdResults() {
    cmdPaletteResults.querySelectorAll('.cmd-result').forEach((el, i) => {
        el.addEventListener('click', () => executeCmdResult(el));
        el.addEventListener('mouseenter', () => {
            cmdPaletteResults.querySelectorAll('.cmd-result').forEach(r => r.classList.remove('active'));
            el.classList.add('active');
            cmdSelectedIdx = i;
        });
    });
}

cmdPaletteInput.addEventListener('input', () => searchCmdPalette(cmdPaletteInput.value.trim()));
cmdPaletteInput.addEventListener('keydown', (e) => {
    const items = cmdPaletteResults.querySelectorAll('.cmd-result');
    if (e.key === 'ArrowDown') { e.preventDefault(); cmdSelectedIdx = Math.min(items.length - 1, cmdSelectedIdx + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); cmdSelectedIdx = Math.max(0, cmdSelectedIdx - 1); }
    else if (e.key === 'Enter' && items[cmdSelectedIdx]) { e.preventDefault(); executeCmdResult(items[cmdSelectedIdx]); return; }
    else if (e.key === 'Escape') { closeCmdPalette(); return; }
    else return;
    items.forEach(r => r.classList.remove('active'));
    if (items[cmdSelectedIdx]) { items[cmdSelectedIdx].classList.add('active'); items[cmdSelectedIdx].scrollIntoView({ block: 'nearest' }); }
});
cmdPaletteOverlay.addEventListener('click', (e) => { if (e.target === cmdPaletteOverlay) closeCmdPalette(); });

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (cmdPaletteOverlay.classList.contains('active')) closeCmdPalette();
        else openCmdPalette();
    }
});

// === WORD CLOUD ===
function renderWordCloud() {
    const canvas = document.getElementById('word-cloud-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth - 32;
    const h = 350;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // Count words from subjects and snippets
    const stopwords = new Set(['the','and','for','that','this','with','from','you','are','was','not','but','have','has','will','can','all','been','they','them','their','its','into','more','than','some','any','also','other','would','about','there','just','get','had','when','what','your','were','out','one','our','which','could','new','very','who','how','said','each','she','her','his','him','does','did','may','being','after','over','such','only','most','then','now','come','made','see','know','take','like','back','much','before','between','because','same','here','many','well','where']);
    const wordCount = {};
    for (const e of state.allLoaded) {
        const text = ((e.s || '') + ' ' + (e.sn || '')).toLowerCase();
        const words = text.split(/[^a-z]+/).filter(w => w.length > 3 && !stopwords.has(w));
        for (const w of words) wordCount[w] = (wordCount[w] || 0) + 1;
    }

    const sorted = Object.entries(wordCount).sort((a, b) => b[1] - a[1]).slice(0, 80);
    if (!sorted.length) return;
    const maxCount = sorted[0][1];
    const minCount = sorted[sorted.length - 1][1];

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = isDark
        ? ['#8ab4f8', '#81c995', '#fdd663', '#f28b82', '#c58af9', '#78d9ec', '#fcad70']
        : ['#1a73e8', '#34a853', '#ea4335', '#fbbc04', '#a142f4', '#24c1e0', '#ff6d01'];

    // Simple spiral placement
    const placed = [];
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    for (const [word, count] of sorted) {
        const ratio = (count - minCount) / (maxCount - minCount + 1);
        const fontSize = Math.round(12 + ratio * 42);
        ctx.font = `${Math.random() > 0.5 ? 'bold' : '500'} ${fontSize}px 'Google Sans', Roboto, sans-serif`;
        const metrics = ctx.measureText(word);
        const wordW = metrics.width + 6;
        const wordH = fontSize + 4;

        // Spiral out from center to find free spot
        let px, py, found = false;
        for (let r = 0; r < 600; r += 2) {
            const angle = r * 0.15;
            px = w / 2 + r * 0.4 * Math.cos(angle);
            py = h / 2 + r * 0.4 * Math.sin(angle);
            if (px - wordW / 2 < 5 || px + wordW / 2 > w - 5 || py - wordH / 2 < 5 || py + wordH / 2 > h - 5) continue;
            const overlap = placed.some(p => Math.abs(px - p.x) < (wordW + p.w) / 2 && Math.abs(py - p.y) < (wordH + p.h) / 2);
            if (!overlap) { found = true; break; }
        }
        if (!found) continue;
        placed.push({ x: px, y: py, w: wordW, h: wordH });
        ctx.fillStyle = colors[Math.abs(word.charCodeAt(0)) % colors.length];
        ctx.font = `${Math.random() > 0.5 ? 'bold' : '500'} ${fontSize}px 'Google Sans', Roboto, sans-serif`;
        ctx.fillText(word, px, py);
    }
}

// === PERSON TOOLTIP ===
const personTooltip = document.getElementById('person-tooltip');
let tooltipTimeout = null;

function getContactStats(name) {
    const q = (name || '').toLowerCase().trim();
    const contact = state.contacts.find(c =>
        (c.n || '').toLowerCase() === q || (c.e || '').toLowerCase() === q
    );
    if (!contact) return null;
    const sent = contact.s || 0;
    const recv = contact.r || 0;
    return { name: contact.n, email: contact.e, sent, recv, total: sent + recv };
}

function showPersonTooltip(e, name) {
    const stats = getContactStats(name);
    if (!stats) return;
    const maxTotal = Math.max(...state.contacts.map(c => (c.s || 0) + (c.r || 0)));
    const pct = Math.round((stats.total / maxTotal) * 100);
    personTooltip.innerHTML = `
        <h4>${esc(stats.name)}</h4>
        <p>📧 ${esc(stats.email)}</p>
        <p>📤 Sent: ${stats.sent.toLocaleString()} · 📥 Received: ${stats.recv.toLocaleString()}</p>
        <p>Total: ${stats.total.toLocaleString()} emails</p>
        <div class="pt-bar"><div class="pt-bar-fill" style="width:${pct}%"></div></div>
    `;
    const rect = e.target.getBoundingClientRect();
    personTooltip.style.left = Math.min(rect.left, window.innerWidth - 320) + 'px';
    personTooltip.style.top = (rect.bottom + 8) + 'px';
    personTooltip.classList.add('visible');
}

function hidePersonTooltip() {
    personTooltip.classList.remove('visible');
}

// Attach tooltip to sender names in email list (delegated)
document.addEventListener('mouseover', (e) => {
    const sender = e.target.closest('.email-sender, .detail-sender');
    if (sender) {
        clearTimeout(tooltipTimeout);
        const name = sender.textContent.replace(/<.*>/, '').trim();
        tooltipTimeout = setTimeout(() => showPersonTooltip(e, name), 300);
    }
});
document.addEventListener('mouseout', (e) => {
    const sender = e.target.closest('.email-sender, .detail-sender');
    if (sender) { clearTimeout(tooltipTimeout); hidePersonTooltip(); }
});

// === TEXT-TO-SPEECH ===
let ttsUtterance = null;
let ttsPlaying = false;

function toggleTTS() {
    if (ttsPlaying) {
        speechSynthesis.cancel();
        ttsPlaying = false;
        document.getElementById('tts-btn').classList.remove('tts-active');
        return;
    }
    const bodyEl = document.querySelector('#email-detail .email-detail-body');
    if (!bodyEl) return;
    const text = bodyEl.textContent.trim().slice(0, 5000);
    if (!text) return;

    ttsUtterance = new SpeechSynthesisUtterance(text);
    ttsUtterance.rate = 1;
    ttsUtterance.pitch = 1;
    ttsUtterance.onend = () => { ttsPlaying = false; document.getElementById('tts-btn').classList.remove('tts-active'); };
    ttsUtterance.onerror = () => { ttsPlaying = false; document.getElementById('tts-btn').classList.remove('tts-active'); };
    speechSynthesis.speak(ttsUtterance);
    ttsPlaying = true;
    document.getElementById('tts-btn').classList.add('tts-active');
}

document.getElementById('tts-btn').addEventListener('click', toggleTTS);

// Stop TTS when navigating away
const _origSVForTTS = switchView;
switchView = function(viewId) {
    if (ttsPlaying) { speechSynthesis.cancel(); ttsPlaying = false; document.getElementById('tts-btn').classList.remove('tts-active'); }
    _origSVForTTS(viewId);
};

// === ANNOTATION / NOTES ===
const emailNotes = JSON.parse(localStorage.getItem('unsealed_notes') || '{}');

function saveNote(emailId, text) {
    if (text.trim()) {
        emailNotes[emailId] = text.trim();
    } else {
        delete emailNotes[emailId];
    }
    localStorage.setItem('unsealed_notes', JSON.stringify(emailNotes));
}

function getNote(emailId) { return emailNotes[emailId] || ''; }

function toggleNotesPanel() {
    let panel = document.querySelector('.email-notes-panel');
    if (panel) { panel.remove(); return; }

    const detail = document.getElementById('email-detail');
    const toolbar = detail.closest('.view')?.querySelector('.email-detail-toolbar');
    if (!detail) return;

    // Get current email ID from URL hash
    const hash = location.hash;
    const m = hash.match(/#email\/([^/]+)/);
    const emailId = m ? m[1] : '';
    if (!emailId) { showToast('Open an email first'); return; }

    const existing = getNote(emailId);
    panel = document.createElement('div');
    panel.className = 'email-notes-panel';
    panel.innerHTML = `
        <strong>📝 Personal Notes</strong>
        <textarea placeholder="Add your notes about this email...">${esc(existing)}</textarea>
        <div class="notes-actions">
            <button class="notes-save">Save Note</button>
            <button class="notes-delete">Delete Note</button>
        </div>
    `;
    detail.prepend(panel);

    panel.querySelector('.notes-save').addEventListener('click', () => {
        saveNote(emailId, panel.querySelector('textarea').value);
        showToast('Note saved');
        panel.remove();
    });
    panel.querySelector('.notes-delete').addEventListener('click', () => {
        saveNote(emailId, '');
        showToast('Note deleted');
        panel.remove();
    });
}

document.getElementById('notes-btn').addEventListener('click', toggleNotesPanel);

// Add note indicator to email rows
const _origRenderEmailRow = renderEmailRow;
renderEmailRow = function(e) {
    let html = _origRenderEmailRow(e);
    if (emailNotes[e.id]) {
        html = html.replace('class="email-date">', 'class="email-date"><span class="email-note-indicator" title="Has notes">📝</span> ');
    }
    return html;
};

// === EVIDENCE BOARD ===
const boardState = {
    items: JSON.parse(localStorage.getItem('unsealed_board_items') || '[]'),
    connections: JSON.parse(localStorage.getItem('unsealed_board_conns') || '[]'),
    labels: JSON.parse(localStorage.getItem('unsealed_board_labels') || '[]'),
    connectMode: false,
    connectFrom: null,
    panX: 0, panY: 0,
    dragging: null, dragOffX: 0, dragOffY: 0,
    panning: false, panStartX: 0, panStartY: 0,
    initialized: false,
};

function saveBoard() {
    localStorage.setItem('unsealed_board_items', JSON.stringify(boardState.items));
    localStorage.setItem('unsealed_board_conns', JSON.stringify(boardState.connections));
    localStorage.setItem('unsealed_board_labels', JSON.stringify(boardState.labels));
}

function initBoard() {
    if (boardState.initialized) return;
    boardState.initialized = true;

    // Center view on the middle of the 4000x4000 canvas on first load
    if (boardState.panX === 0 && boardState.panY === 0) {
        const wrap = document.getElementById('board-canvas-wrap');
        const w = wrap.clientWidth || 800;
        const h = wrap.clientHeight || 500;
        boardState.panX = -2000 + w / 2;
        boardState.panY = -2000 + h / 2;
        const canvas = document.getElementById('board-canvas');
        const svg = document.getElementById('board-lines');
        canvas.style.transform = `translate(${boardState.panX}px, ${boardState.panY}px)`;
        svg.style.transform = `translate(${boardState.panX}px, ${boardState.panY}px)`;
    }

    renderBoardItems();
    setupBoardInteraction();
}

function renderBoardItems() {
    const canvas = document.getElementById('board-canvas');
    const emptyEl = document.getElementById('board-empty');
    // Clear existing items (not empty)
    canvas.querySelectorAll('.board-item, .board-label').forEach(el => el.remove());

    if (boardState.items.length === 0 && boardState.labels.length === 0) {
        emptyEl.style.display = 'block';
    } else {
        emptyEl.style.display = 'none';
    }

    boardState.items.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'board-item';
        el.dataset.idx = i;
        el.style.left = item.x + 'px';
        el.style.top = item.y + 'px';

        const icons = { email: '📧', contact: '👤', document: '📄', photo: '📷' };
        let bodyHtml = `<h4>${esc(item.title)}</h4>`;
        if (item.sub) bodyHtml += `<p>${esc(item.sub)}</p>`;
        if (item.type === 'photo' && item.thumb) bodyHtml += `<img src="${esc(item.thumb)}" alt="" loading="lazy">`;

        el.innerHTML = `
            <div class="board-item-pin">📌</div>
            <button class="board-item-remove" data-idx="${i}">×</button>
            <div class="board-item-header"><span class="bi-type-icon">${icons[item.type] || '📋'}</span> ${item.type}</div>
            <div class="board-item-body">${bodyHtml}</div>
        `;
        canvas.appendChild(el);

        // Drag
        el.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('board-item-remove')) return;
            if (boardState.connectMode) {
                handleConnectClick(i);
                return;
            }
            boardState.dragging = { idx: i, el };
            boardState.dragOffX = e.clientX - item.x - boardState.panX;
            boardState.dragOffY = e.clientY - item.y - boardState.panY;
            el.style.zIndex = 10;
            e.preventDefault();
        });

        // Remove
        el.querySelector('.board-item-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            boardState.items.splice(i, 1);
            boardState.connections = boardState.connections.filter(c => c[0] !== i && c[1] !== i)
                .map(c => [c[0] > i ? c[0]-1 : c[0], c[1] > i ? c[1]-1 : c[1]]);
            saveBoard();
            boardState.initialized = false;
            initBoard();
        });
    });

    // Labels
    boardState.labels.forEach((lbl, i) => {
        const el = document.createElement('div');
        el.className = 'board-label';
        el.contentEditable = true;
        el.textContent = lbl.text;
        el.style.left = lbl.x + 'px';
        el.style.top = lbl.y + 'px';
        el.dataset.lblIdx = i;
        canvas.appendChild(el);
        el.addEventListener('blur', () => {
            boardState.labels[i].text = el.textContent;
            saveBoard();
        });
    });

    renderBoardLines();
}

function renderBoardLines() {
    const svg = document.getElementById('board-lines');
    svg.innerHTML = boardState.connections.map(([a, b]) => {
        const ia = boardState.items[a], ib = boardState.items[b];
        if (!ia || !ib) return '';
        const ax = ia.x + 110, ay = ia.y + 40;
        const bx = ib.x + 110, by = ib.y + 40;
        return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}"/>`;
    }).join('');
}

function handleConnectClick(idx) {
    if (boardState.connectFrom === null) {
        boardState.connectFrom = idx;
        document.querySelectorAll('.board-item')[idx]?.classList.add('selected');
        showToast('Click another item to connect');
    } else {
        if (boardState.connectFrom !== idx) {
            const exists = boardState.connections.some(c =>
                (c[0] === boardState.connectFrom && c[1] === idx) || (c[0] === idx && c[1] === boardState.connectFrom)
            );
            if (!exists) {
                boardState.connections.push([boardState.connectFrom, idx]);
                saveBoard();
                renderBoardLines();
            }
        }
        document.querySelectorAll('.board-item.selected').forEach(el => el.classList.remove('selected'));
        boardState.connectFrom = null;
    }
}

function setupBoardInteraction() {
    const wrap = document.getElementById('board-canvas-wrap');
    const canvas = document.getElementById('board-canvas');
    const svg = document.getElementById('board-lines');

    // Pan
    wrap.addEventListener('mousedown', (e) => {
        if (e.target === wrap || e.target === canvas || e.target === svg) {
            boardState.panning = true;
            boardState.panStartX = e.clientX - boardState.panX;
            boardState.panStartY = e.clientY - boardState.panY;
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (boardState.panning) {
            boardState.panX = e.clientX - boardState.panStartX;
            boardState.panY = e.clientY - boardState.panStartY;
            canvas.style.transform = `translate(${boardState.panX}px, ${boardState.panY}px)`;
            svg.style.transform = `translate(${boardState.panX}px, ${boardState.panY}px)`;
        }
        if (boardState.dragging) {
            const item = boardState.items[boardState.dragging.idx];
            item.x = e.clientX - boardState.dragOffX - boardState.panX;
            item.y = e.clientY - boardState.dragOffY - boardState.panY;
            boardState.dragging.el.style.left = item.x + 'px';
            boardState.dragging.el.style.top = item.y + 'px';
            renderBoardLines();
        }
    });

    window.addEventListener('mouseup', () => {
        if (boardState.dragging) {
            boardState.dragging.el.style.zIndex = 5;
            saveBoard();
        }
        boardState.panning = false;
        boardState.dragging = null;
    });

    // Connect mode button
    document.getElementById('board-connect-btn').addEventListener('click', () => {
        boardState.connectMode = !boardState.connectMode;
        document.getElementById('board-connect-btn').classList.toggle('active', boardState.connectMode);
        boardState.connectFrom = null;
        document.querySelectorAll('.board-item.selected').forEach(el => el.classList.remove('selected'));
        wrap.style.cursor = boardState.connectMode ? 'crosshair' : 'grab';
    });

    // Add item
    document.getElementById('board-add-btn').addEventListener('click', () => {
        const modal = document.getElementById('board-search-modal');
        modal.style.display = 'block';
        document.getElementById('board-search-input').value = '';
        document.getElementById('board-search-results').innerHTML = '';
        setTimeout(() => document.getElementById('board-search-input').focus(), 50);
    });

    document.getElementById('board-search-close').addEventListener('click', () => {
        document.getElementById('board-search-modal').style.display = 'none';
    });

    document.getElementById('board-search-input').addEventListener('input', (e) => {
        const q = e.target.value.trim().toLowerCase();
        if (q.length < 2) { document.getElementById('board-search-results').innerHTML = ''; return; }
        let results = [];

        // Emails
        state.allLoaded.filter(em => (em.s||'').toLowerCase().includes(q) || (em.f||'').toLowerCase().includes(q))
            .slice(0, 5).forEach(em => results.push({ type: 'email', title: em.s || '(no subject)', sub: `From: ${em.f}`, id: em.id, did: em.did }));

        // Contacts
        state.contacts.filter(c => (c.n||'').toLowerCase().includes(q) || (c.e||'').toLowerCase().includes(q))
            .slice(0, 5).forEach(c => results.push({ type: 'contact', title: c.n || c.e, sub: c.e, id: c.e }));

        // Documents
        if (typeof docState !== 'undefined') {
            docState.all.filter(d => (d.n||'').toLowerCase().includes(q)).slice(0, 3)
                .forEach(d => results.push({ type: 'document', title: d.n, sub: d.s, id: d.n }));
        }

        // Photos
        if (typeof photoState !== 'undefined') {
            photoState.all.filter(p => (photoState.descMap[p.id]||'').toLowerCase().includes(q))
                .slice(0, 3).forEach(p => results.push({ type: 'photo', title: photoState.descMap[p.id] || p.id, sub: p.s, id: p.id, thumb: 'https://assets.getkino.com/photos/' + p.id }));
        }

        const icons = { email: '📧', contact: '👤', document: '📄', photo: '📷' };
        const resultsEl = document.getElementById('board-search-results');
        resultsEl.innerHTML = results.map((r, i) => `<div class="board-search-item" data-ri="${i}">
            <span class="bsi-icon">${icons[r.type]}</span>
            <div class="bsi-text"><h4>${esc(r.title)}</h4><p>${esc(r.sub || r.type)}</p></div>
        </div>`).join('') || '<div style="padding:12px;color:#888">No results</div>';

        resultsEl.querySelectorAll('.board-search-item').forEach((el, i) => {
            el.addEventListener('click', () => {
                const r = results[i];
                // Place in center of current viewport
                const wrap = document.getElementById('board-canvas-wrap');
                const vw = wrap.clientWidth || 800;
                const vh = wrap.clientHeight || 500;
                const cx = (-boardState.panX + vw / 2) + (Math.random() - 0.5) * 300;
                const cy = (-boardState.panY + vh / 2) + (Math.random() - 0.5) * 200;
                boardState.items.push({ type: r.type, title: r.title, sub: r.sub, id: r.id, did: r.did, thumb: r.thumb, x: cx, y: cy });
                saveBoard();
                document.getElementById('board-search-modal').style.display = 'none';
                boardState.initialized = false;
                initBoard();
                showToast(`Added "${r.title}" to board`);
            });
        });
    });

    // Add label
    document.getElementById('board-label-btn').addEventListener('click', () => {
        const wrap = document.getElementById('board-canvas-wrap');
        const vw = wrap.clientWidth || 800;
        const vh = wrap.clientHeight || 500;
        const cx = (-boardState.panX + vw / 2) + (Math.random() - 0.5) * 200;
        const cy = (-boardState.panY + vh / 2) + (Math.random() - 0.5) * 200;
        boardState.labels.push({ text: 'Note...', x: cx, y: cy });
        saveBoard();
        boardState.initialized = false;
        initBoard();
    });

    // Clear board
    document.getElementById('board-clear-btn').addEventListener('click', () => {
        if (!confirm('Clear the entire evidence board?')) return;
        boardState.items = [];
        boardState.connections = [];
        boardState.labels = [];
        saveBoard();
        boardState.initialized = false;
        initBoard();
        showToast('Board cleared');
    });
}

// === NETWORK ANIMATED TIMELINE ===
let netTimelineInterval = null;
let netPlaying = false;

function getEmailYear(e) {
    const d = e.d || e.fd || '';
    const m = d.match(/(\d{4})/);
    return m ? parseInt(m[1]) : null;
}

document.getElementById('net-year-slider').addEventListener('input', (e) => {
    const year = parseInt(e.target.value);
    document.getElementById('net-year-label').textContent = year >= 2025 ? 'All years' : `≤ ${year}`;
    rebuildNetworkForYear(year);
});

document.getElementById('net-play-btn').addEventListener('click', () => {
    const slider = document.getElementById('net-year-slider');
    const btn = document.getElementById('net-play-btn');
    if (netPlaying) {
        clearInterval(netTimelineInterval);
        netPlaying = false;
        btn.classList.remove('playing');
        btn.textContent = '▶';
        return;
    }
    netPlaying = true;
    btn.classList.add('playing');
    btn.textContent = '⏸';
    let year = 1995;
    slider.value = year;
    document.getElementById('net-year-label').textContent = `≤ ${year}`;
    rebuildNetworkForYear(year);

    netTimelineInterval = setInterval(() => {
        year++;
        if (year > 2025) {
            clearInterval(netTimelineInterval);
            netPlaying = false;
            btn.classList.remove('playing');
            btn.textContent = '▶';
            slider.value = 2025;
            document.getElementById('net-year-label').textContent = 'All years';
            rebuildNetworkForYear(2025);
            return;
        }
        slider.value = year;
        document.getElementById('net-year-label').textContent = `≤ ${year}`;
        rebuildNetworkForYear(year);
    }, 800);
});

function rebuildNetworkForYear(maxYear) {
    if (maxYear >= 2025) {
        netState.rendered = false;
        renderNetwork();
        return;
    }
    const filteredEmails = state.allLoaded.filter(e => {
        const y = getEmailYear(e);
        return y && y <= maxYear;
    });
    const minEmails = parseInt(document.getElementById('network-min-emails').value) || 25;
    const contactMap = {};
    for (const c of state.contacts) {
        contactMap[c.e] = { id: c.e, name: c.n, sent: 0, recv: 0, total: 0 };
    }
    const contactByName = {};
    for (const c of state.contacts) contactByName[(c.n||'').toLowerCase()] = c.e;

    const linkMap = {};
    for (const e of filteredEmails) {
        const from = (e.fe || '').toLowerCase();
        const toRaw = (e.t || '').toLowerCase().trim();
        if (contactMap[from]) { contactMap[from].sent++; contactMap[from].total++; }
        let toKey = contactMap[toRaw] ? toRaw : contactByName[toRaw] || null;
        if (toKey && contactMap[toKey]) { contactMap[toKey].recv++; contactMap[toKey].total++; }
        if (from && toKey && contactMap[from] && contactMap[toKey] && from !== toKey) {
            const key = from < toKey ? `${from}|${toKey}` : `${toKey}|${from}`;
            linkMap[key] = (linkMap[key] || 0) + 1;
        }
    }
    const newNodes = Object.values(contactMap).filter(n => n.total >= minEmails);
    const nodeIds = new Set(newNodes.map(n => n.id));
    const newLinks = Object.entries(linkMap).map(([key, count]) => {
        const [a, b] = key.split('|');
        return { source: a, target: b, count };
    }).filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    document.getElementById('network-info').textContent = `${newNodes.length} people, ${newLinks.length} connections (up to ${maxYear})`;

    // Preserve positions from existing nodes, init new ones in center
    const w = netState.w || 600, h = netState.h || 400;
    for (const n of newNodes) {
        const old = netState.nodeMap?.[n.id];
        if (old) { n.x = old.x; n.y = old.y; n.vx = 0; n.vy = 0; }
        else {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 100 + 50;
            n.x = w / 2 + dist * Math.cos(angle);
            n.y = h / 2 + dist * Math.sin(angle);
            n.vx = 0; n.vy = 0;
        }
        n.radius = Math.max(4, Math.min(20, Math.sqrt(n.total) * 1.2));
    }

    // Update netState arrays (draw/tick read from these)
    netState.nodes = newNodes;
    netState.links = newLinks;
    netState.nodeMap = {};
    newNodes.forEach(n => netState.nodeMap[n.id] = n);

    // Restart simulation
    netState.alpha = 0.3;
    if (netState.tick) netState.tick();
    else if (netState.draw) netState.draw();
}

// === EASTER EGG: KONAMI CODE ===
const konamiCode = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIdx]) {
        konamiIdx++;
        if (konamiIdx === konamiCode.length) {
            konamiIdx = 0;
            triggerMatrixEasterEgg();
        }
    } else {
        konamiIdx = 0;
    }
});

function triggerMatrixEasterEgg() {
    const overlay = document.createElement('div');
    overlay.className = 'matrix-overlay';
    const c = document.createElement('canvas');
    overlay.appendChild(c);
    const textDiv = document.createElement('div');
    textDiv.className = 'matrix-text';
    overlay.appendChild(textDiv);
    document.body.appendChild(overlay);

    const ctx = c.getContext('2d');
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    // Get email text for the rain
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンUNSEALED01'.split('');
    const columns = Math.floor(c.width / 16);
    const drops = Array(columns).fill(1);

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#0f0';
        ctx.font = '14px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * 16, drops[i] * 16);
            if (drops[i] * 16 > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    const matrixInterval = setInterval(drawMatrix, 40);

    // Reveal secret messages
    const messages = [
        'You found the secret...',
        'The truth is in the data.',
        '15,120 emails. Every one tells a story.',
        '🔓 UNSEALED 🔓',
    ];
    messages.forEach((msg, i) => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.textContent = msg;
            p.style.animationDelay = '0s';
            textDiv.appendChild(p);
        }, 1500 + i * 1500);
    });

    // Click or Escape to close
    function closeMatrix() {
        clearInterval(matrixInterval);
        overlay.style.transition = 'opacity 0.5s';
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }
    overlay.addEventListener('click', closeMatrix);
    document.addEventListener('keydown', function matrixEsc(e) {
        if (e.key === 'Escape') { closeMatrix(); document.removeEventListener('keydown', matrixEsc); }
    });
}

// Start
init().then(() => {
    // Apply route from URL hash after data is loaded
    if (location.hash) applyRoute();
});
