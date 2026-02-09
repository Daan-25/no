const header = document.querySelector('.site-header');
const nav = document.querySelector('.site-nav');
const toggle = document.querySelector('.menu-toggle');
const progressBar = document.querySelector('#progress-bar');
const yearNode = document.querySelector('#year');
const cursorGlow = document.querySelector('#cursor-glow');

const STORAGE_KEYS = {
  notes: 'jef_notes_v1',
  pins: 'jef_pins_v1',
};

const safeJsonParse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', '');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(temp);
  return ok;
};

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }
    if (!nav.contains(target) && target !== toggle) {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const updateScrollState = () => {
  const scrollY = window.scrollY;
  if (header) {
    header.classList.toggle('scrolled', scrollY > 12);
  }

  if (progressBar) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const value = maxScroll > 0 ? Math.min((scrollY / maxScroll) * 100, 100) : 0;
    progressBar.style.width = `${value}%`;
  }
};

window.addEventListener('scroll', updateScrollState, { passive: true });
window.addEventListener('resize', updateScrollState);
updateScrollState();

const revealItems = Array.from(document.querySelectorAll('.reveal'));
revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 60, 220)}ms`;
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

const sectionNodes = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
const linkByHash = new Map(navLinks.map((link) => [link.getAttribute('href'), link]));

if ('IntersectionObserver' in window && sectionNodes.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.getAttribute('id');
        if (!id || !entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => link.classList.remove('active'));
        const active = linkByHash.get(`#${id}`);
        if (active) {
          active.classList.add('active');
        }
      });
    },
    {
      rootMargin: '-35% 0px -50% 0px',
      threshold: 0.05,
    }
  );

  sectionNodes.forEach((section) => sectionObserver.observe(section));
}

const counterNodes = Array.from(document.querySelectorAll('[data-count]'));
const animateCounter = (node) => {
  const target = Number(node.getAttribute('data-count'));
  if (!Number.isFinite(target)) {
    return;
  }

  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    node.textContent = String(Math.floor(target * eased));

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      node.textContent = String(target);
    }
  };

  requestAnimationFrame(step);
};

if ('IntersectionObserver' in window && counterNodes.length > 0) {
  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.55 }
  );

  counterNodes.forEach((node) => counterObserver.observe(node));
} else {
  counterNodes.forEach((node) => {
    const target = Number(node.getAttribute('data-count'));
    node.textContent = Number.isFinite(target) ? String(target) : node.textContent;
  });
}

if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
  cursorGlow.classList.add('active');

  window.addEventListener('mousemove', (event) => {
    cursorGlow.style.top = `${event.clientY}px`;
    cursorGlow.style.left = `${event.clientX}px`;
  });
}

const timelineItems = Array.from(document.querySelectorAll('.timeline-item[data-phase]'));
const timelineById = new Map(
  timelineItems.map((item) => {
    const id = item.id;
    const title = item.querySelector('h3')?.textContent?.trim() ?? id;
    const date = item.querySelector('.timeline-date')?.textContent?.trim() ?? '';
    const phase = item.dataset.phase ?? '';
    return [id, { id, title, date, phase }];
  })
);

const filterTrack = document.querySelector('#filter-track');
const filterPeriod = document.querySelector('#filter-period');
const timelineSearch = document.querySelector('#timeline-search');
const timelineReset = document.querySelector('#timeline-reset');
const filterStatus = document.querySelector('#filter-status');
const timelineEmpty = document.querySelector('#timeline-empty');

const pinnedList = document.querySelector('#pinned-list');
const pinnedCount = document.querySelector('#pinned-count');
const pinnedStatus = document.querySelector('#pinned-status');
const exportPins = document.querySelector('#export-pins');

const notesArea = document.querySelector('#research-notes');
const notesStatus = document.querySelector('#notes-status');
const copyNotes = document.querySelector('#copy-notes');
const downloadNotes = document.querySelector('#download-notes');
const clearNotes = document.querySelector('#clear-notes');

const digestOutput = document.querySelector('#digest-output');
const generateDigest = document.querySelector('#generate-digest');
const copyDigest = document.querySelector('#copy-digest');
const digestStatus = document.querySelector('#digest-status');

let pinnedIds = safeJsonParse(localStorage.getItem(STORAGE_KEYS.pins), []);
if (!Array.isArray(pinnedIds)) {
  pinnedIds = [];
}
pinnedIds = pinnedIds.filter((id) => timelineById.has(id));

const savePins = () => {
  localStorage.setItem(STORAGE_KEYS.pins, JSON.stringify(pinnedIds));
};

const getVisibleTimelineItems = () => timelineItems.filter((item) => !item.classList.contains('hidden'));

const updateBookmarkButtons = () => {
  const bookmarkButtons = Array.from(document.querySelectorAll('.bookmark-btn'));
  bookmarkButtons.forEach((button) => {
    const id = button.getAttribute('data-bookmark-id') || '';
    const isPinned = pinnedIds.includes(id);
    button.classList.toggle('pinned', isPinned);
    button.setAttribute('aria-pressed', String(isPinned));
    button.textContent = isPinned ? 'Pinned' : 'Pin event';
  });
};

const renderPinnedList = () => {
  if (!pinnedList) {
    return;
  }

  pinnedList.innerHTML = '';

  if (pinnedIds.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'placeholder';
    empty.textContent = 'No pinned events yet.';
    pinnedList.appendChild(empty);
  } else {
    pinnedIds.forEach((id) => {
      const item = timelineById.get(id);
      if (!item) {
        return;
      }

      const li = document.createElement('li');

      const meta = document.createElement('div');
      meta.className = 'pin-meta';

      const title = document.createElement('p');
      title.className = 'pin-title';
      title.textContent = item.title;

      const date = document.createElement('p');
      date.className = 'pin-date';
      date.textContent = item.date;

      meta.appendChild(title);
      meta.appendChild(date);

      const remove = document.createElement('button');
      remove.className = 'remove-pin';
      remove.type = 'button';
      remove.dataset.removePin = id;
      remove.textContent = 'Remove';

      li.appendChild(meta);
      li.appendChild(remove);
      pinnedList.appendChild(li);
    });
  }

  if (pinnedCount) {
    pinnedCount.textContent = String(pinnedIds.length);
  }
};

const updatePinnedStatus = (message) => {
  if (pinnedStatus) {
    pinnedStatus.textContent = message;
  }
};

const applyTimelineFilters = () => {
  const trackValue = filterTrack?.value ?? 'all';
  const periodValue = filterPeriod?.value ?? 'all';
  const searchValue = (timelineSearch?.value ?? '').trim().toLowerCase();

  let visibleCount = 0;

  timelineItems.forEach((item) => {
    const trackMatch = trackValue === 'all' || item.dataset.phase === trackValue;
    const periodMatch = periodValue === 'all' || item.dataset.period === periodValue;
    const haystack = `${item.dataset.keywords ?? ''} ${item.textContent ?? ''}`.toLowerCase();
    const searchMatch = searchValue.length === 0 || haystack.includes(searchValue);
    const show = trackMatch && periodMatch && searchMatch;

    item.classList.toggle('hidden', !show);
    if (show) {
      visibleCount += 1;
    }
  });

  if (filterStatus) {
    filterStatus.textContent = `Showing ${visibleCount} of ${timelineItems.length} timeline events.`;
  }

  if (timelineEmpty) {
    timelineEmpty.hidden = visibleCount !== 0;
  }
};

if (filterTrack) {
  filterTrack.addEventListener('change', applyTimelineFilters);
}

if (filterPeriod) {
  filterPeriod.addEventListener('change', applyTimelineFilters);
}

if (timelineSearch) {
  timelineSearch.addEventListener('input', applyTimelineFilters);
}

if (timelineReset) {
  timelineReset.addEventListener('click', () => {
    if (filterTrack) {
      filterTrack.value = 'all';
    }
    if (filterPeriod) {
      filterPeriod.value = 'all';
    }
    if (timelineSearch) {
      timelineSearch.value = '';
    }
    applyTimelineFilters();
  });
}

const togglePinnedEvent = (id) => {
  if (!timelineById.has(id)) {
    return;
  }

  if (pinnedIds.includes(id)) {
    pinnedIds = pinnedIds.filter((pinId) => pinId !== id);
    updatePinnedStatus('Event removed from pinned list.');
  } else {
    pinnedIds = [...pinnedIds, id];
    updatePinnedStatus('Event pinned.');
  }

  savePins();
  renderPinnedList();
  updateBookmarkButtons();
};

document.querySelectorAll('.bookmark-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.getAttribute('data-bookmark-id') || '';
    togglePinnedEvent(id);
  });
});

if (pinnedList) {
  pinnedList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const id = target.dataset.removePin;
    if (!id) {
      return;
    }

    togglePinnedEvent(id);
  });
}

if (exportPins) {
  exportPins.addEventListener('click', () => {
    if (pinnedIds.length === 0) {
      updatePinnedStatus('Nothing to export yet. Pin events first.');
      return;
    }

    const lines = [
      'JeffreyEpsteins.org - Pinned Events',
      `Generated: ${new Date().toLocaleString()}`,
      '',
    ];

    pinnedIds.forEach((id, index) => {
      const item = timelineById.get(id);
      if (!item) {
        return;
      }
      lines.push(`${index + 1}. ${item.date} - ${item.title}`);
    });

    downloadText('pinned-events.txt', lines.join('\n'));
    updatePinnedStatus('Pinned list downloaded.');
  });
}

const updateNotesStatus = (message) => {
  if (notesStatus) {
    notesStatus.textContent = message;
  }
};

if (notesArea) {
  const savedNotes = localStorage.getItem(STORAGE_KEYS.notes) ?? '';
  notesArea.value = savedNotes;

  if (savedNotes.trim().length > 0) {
    updateNotesStatus('Notes restored from this browser.');
  }

  notesArea.addEventListener('input', () => {
    localStorage.setItem(STORAGE_KEYS.notes, notesArea.value);
    updateNotesStatus(`Saved locally at ${new Date().toLocaleTimeString()}.`);
  });
}

if (copyNotes && notesArea) {
  copyNotes.addEventListener('click', async () => {
    const text = notesArea.value.trim();
    if (!text) {
      updateNotesStatus('No notes to copy yet.');
      return;
    }

    const copied = await copyText(text).catch(() => false);
    updateNotesStatus(copied ? 'Notes copied to clipboard.' : 'Could not copy notes.');
  });
}

if (downloadNotes && notesArea) {
  downloadNotes.addEventListener('click', () => {
    const text = notesArea.value.trim();
    if (!text) {
      updateNotesStatus('No notes to download yet.');
      return;
    }

    downloadText('research-notes.txt', text);
    updateNotesStatus('Notes downloaded.');
  });
}

if (clearNotes && notesArea) {
  clearNotes.addEventListener('click', () => {
    notesArea.value = '';
    localStorage.removeItem(STORAGE_KEYS.notes);
    updateNotesStatus('Notes cleared.');
  });
}

const buildDigest = () => {
  const visible = getVisibleTimelineItems();

  const lines = [
    'JeffreyEpsteins.org - Quick Digest',
    `Generated: ${new Date().toLocaleString()}`,
    `Active filters: track=${filterTrack?.value ?? 'all'}, period=${filterPeriod?.value ?? 'all'}, keyword="${
      timelineSearch?.value?.trim() ?? ''
    }"`,
    '',
    `Visible timeline events (${visible.length}):`,
  ];

  if (visible.length === 0) {
    lines.push('- No timeline events matched the active filters.');
  } else {
    visible.forEach((item) => {
      const date = item.querySelector('.timeline-date')?.textContent?.trim() ?? '';
      const title = item.querySelector('h3')?.textContent?.trim() ?? '';
      lines.push(`- ${date}: ${title}`);
    });
  }

  lines.push('');
  lines.push(`Pinned events (${pinnedIds.length}):`);

  if (pinnedIds.length === 0) {
    lines.push('- None pinned.');
  } else {
    pinnedIds.forEach((id) => {
      const item = timelineById.get(id);
      if (!item) {
        return;
      }
      lines.push(`- ${item.date}: ${item.title}`);
    });
  }

  const noteText = notesArea?.value?.trim() ?? '';
  lines.push('');
  lines.push('Notebook excerpt:');
  if (noteText.length === 0) {
    lines.push('- No notes added.');
  } else {
    lines.push(noteText.slice(0, 900));
  }

  return lines.join('\n');
};

if (generateDigest && digestOutput) {
  generateDigest.addEventListener('click', () => {
    digestOutput.textContent = buildDigest();
    if (digestStatus) {
      digestStatus.textContent = 'Digest generated.';
    }
  });
}

if (copyDigest && digestOutput) {
  copyDigest.addEventListener('click', async () => {
    const copied = await copyText(digestOutput.textContent).catch(() => false);
    if (digestStatus) {
      digestStatus.textContent = copied ? 'Digest copied to clipboard.' : 'Could not copy digest.';
    }
  });
}

applyTimelineFilters();
renderPinnedList();
updateBookmarkButtons();
