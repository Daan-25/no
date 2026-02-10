const EVENTS = [
  {
    id: 'ev-2005-palm-beach',
    title: 'Palm Beach police investigation begins',
    date: '2005-03-01',
    phase: 'investigation',
    summary:
      'Local authorities in Palm Beach receive reports involving underage girls, opening the first formal investigative track.',
    keywords: 'palm beach police florida investigation reports',
    sources: ['src-miami-herald-series', 'src-courtlistener'],
  },
  {
    id: 'ev-2006-federal-attention',
    title: 'Federal attention increases',
    date: '2006-07-01',
    phase: 'investigation',
    summary:
      'Federal investigators begin deeper review as scrutiny expands beyond local proceedings.',
    keywords: 'federal investigators fbi review escalation',
    sources: ['src-fbi', 'src-doj-main'],
  },
  {
    id: 'ev-2008-plea-deal',
    title: 'Controversial 2008 plea agreement',
    date: '2008-06-30',
    phase: 'legal',
    summary:
      'Epstein pleads guilty to state-level charges in a deal later criticized in legal and public reporting.',
    keywords: '2008 plea deal legal controversy prosecution',
    sources: ['src-courtlistener', 'src-miami-herald-series'],
  },
  {
    id: 'ev-2015-civil-pressure',
    title: 'Civil litigation pressure increases',
    date: '2015-08-01',
    phase: 'aftermath',
    summary:
      'Civil claims and survivor-led legal actions intensify focus on prior institutional decisions.',
    keywords: 'civil litigation survivors claims institutional response',
    sources: ['src-courtlistener', 'src-justia'],
  },
  {
    id: 'ev-2018-media-series',
    title: 'Investigative reporting wave in 2018',
    date: '2018-11-01',
    phase: 'media',
    summary:
      'Long-form investigative reporting reframes public understanding of earlier case handling.',
    keywords: 'investigative reporting media pressure 2018 journalism',
    sources: ['src-miami-herald-series', 'src-nyt-archive'],
  },
  {
    id: 'ev-2019-arrest',
    title: 'Federal arrest in New York',
    date: '2019-07-06',
    phase: 'legal',
    summary:
      'The U.S. Attorney\'s Office for the Southern District of New York announces federal charges.',
    keywords: '2019 arrest federal indictment trafficking',
    sources: ['src-sdny-indictment', 'src-doj-main'],
  },
  {
    id: 'ev-2019-custody-death',
    title: 'Death in federal custody',
    date: '2019-08-10',
    phase: 'custody',
    summary:
      'Epstein dies while in detention. Official findings classify the death as suicide.',
    keywords: 'custody death detention official findings',
    sources: ['src-nyt-archive', 'src-wsj-archive'],
  },
  {
    id: 'ev-2020-maxwell-arrest',
    title: 'Ghislaine Maxwell arrested',
    date: '2020-07-02',
    phase: 'legal',
    summary:
      'A key related defendant is arrested, opening a separate major prosecution track.',
    keywords: 'maxwell arrest related prosecution federal case',
    sources: ['src-doj-main', 'src-sdny-maxwell-sentencing'],
  },
  {
    id: 'ev-2021-maxwell-conviction',
    title: 'Maxwell convicted in federal court',
    date: '2021-12-29',
    phase: 'legal',
    summary:
      'The trial concludes with convictions, shaping later legal and accountability discussions.',
    keywords: 'maxwell conviction federal trial verdict accountability',
    sources: ['src-sdny-maxwell-sentencing', 'src-courtlistener'],
  },
  {
    id: 'ev-2022-maxwell-sentencing',
    title: 'Maxwell sentencing',
    date: '2022-06-28',
    phase: 'legal',
    summary:
      'Federal sentencing marks a major procedural endpoint in related prosecution proceedings.',
    keywords: 'sentencing federal prison term 2022',
    sources: ['src-sdny-maxwell-sentencing', 'src-doj-main'],
  },
  {
    id: 'ev-2024-records-wave',
    title: 'Further records and filing visibility',
    date: '2024-01-01',
    phase: 'aftermath',
    summary:
      'Continuing records activity keeps attention on filings, legal context, and institutional process.',
    keywords: 'records filings unsealed documents transparency',
    sources: ['src-courtlistener', 'src-justia'],
  },
];

const SOURCES = [
  {
    id: 'src-sdny-indictment',
    title: 'SDNY announcement of 2019 indictment',
    publisher: 'U.S. Attorney\'s Office, SDNY',
    type: 'official',
    date: '2019-07-08',
    url: 'https://www.justice.gov/usao-sdny/pr/manhattan-us-attorney-announces-unsealing-indictment-charging-jeffrey-epstein-sex',
  },
  {
    id: 'src-sdny-maxwell-sentencing',
    title: 'SDNY release on Maxwell sentencing',
    publisher: 'U.S. Attorney\'s Office, SDNY',
    type: 'official',
    date: '2022-06-28',
    url: 'https://www.justice.gov/usao-sdny/pr/ghislaine-maxwell-sentenced-20-years-prison-sex-trafficking-and-other-offenses',
  },
  {
    id: 'src-doj-main',
    title: 'Department of Justice portal',
    publisher: 'U.S. Department of Justice',
    type: 'official',
    date: '2024-01-01',
    url: 'https://www.justice.gov/',
  },
  {
    id: 'src-fbi',
    title: 'Federal Bureau of Investigation portal',
    publisher: 'FBI',
    type: 'official',
    date: '2024-01-01',
    url: 'https://www.fbi.gov/',
  },
  {
    id: 'src-courtlistener',
    title: 'CourtListener dockets and filings',
    publisher: 'Free Law Project',
    type: 'court',
    date: '2024-01-01',
    url: 'https://www.courtlistener.com/',
  },
  {
    id: 'src-justia',
    title: 'Justia legal information hub',
    publisher: 'Justia',
    type: 'court',
    date: '2024-01-01',
    url: 'https://www.justia.com/',
  },
  {
    id: 'src-miami-herald-series',
    title: 'Miami Herald investigative archive',
    publisher: 'Miami Herald',
    type: 'media',
    date: '2018-11-01',
    url: 'https://www.miamiherald.com/',
  },
  {
    id: 'src-nyt-archive',
    title: 'New York Times coverage archive',
    publisher: 'The New York Times',
    type: 'media',
    date: '2024-01-01',
    url: 'https://www.nytimes.com/',
  },
  {
    id: 'src-wsj-archive',
    title: 'Wall Street Journal coverage archive',
    publisher: 'The Wall Street Journal',
    type: 'media',
    date: '2024-01-01',
    url: 'https://www.wsj.com/',
  },
  {
    id: 'src-govinfo',
    title: 'GovInfo document access portal',
    publisher: 'U.S. Government Publishing Office',
    type: 'analysis',
    date: '2024-01-01',
    url: 'https://www.govinfo.gov/',
  },
];

const DOSSIERS = [
  {
    id: 'chronology',
    title: 'Chronology Dossier',
    period: '2005-2024',
    yearStart: 2005,
    yearEnd: 2024,
    summary:
      'Linear overview of key milestones from early investigation through post-trial records activity.',
    points: [
      'Tracks major procedural changes over time.',
      'Useful as baseline before deeper legal analysis.',
      'Connects each milestone to public source references.',
    ],
    questions: [
      'Which transitions changed institutional behavior most visibly?',
      'What remained unresolved after each legal milestone?',
      'Where did media pressure correlate with procedural movement?',
    ],
    eventIds: [
      'ev-2005-palm-beach',
      'ev-2006-federal-attention',
      'ev-2008-plea-deal',
      'ev-2015-civil-pressure',
      'ev-2018-media-series',
      'ev-2019-arrest',
      'ev-2019-custody-death',
      'ev-2020-maxwell-arrest',
      'ev-2021-maxwell-conviction',
      'ev-2022-maxwell-sentencing',
      'ev-2024-records-wave',
    ],
  },
  {
    id: 'legal',
    title: 'Legal Process Dossier',
    period: '2008-2022',
    yearStart: 2008,
    yearEnd: 2022,
    summary:
      'Focus on plea agreements, federal charging decisions, trial outcomes, and sentencing endpoints.',
    points: [
      'Separates procedural facts from commentary.',
      'Highlights where federal and state pathways diverged.',
      'Surfaces official releases and docket-oriented references.',
    ],
    questions: [
      'How did the 2008 plea structure influence later federal steps?',
      'Which filings best document procedural decision points?',
      'What accountability mechanisms emerged after sentencing?',
    ],
    eventIds: [
      'ev-2008-plea-deal',
      'ev-2019-arrest',
      'ev-2020-maxwell-arrest',
      'ev-2021-maxwell-conviction',
      'ev-2022-maxwell-sentencing',
    ],
  },
  {
    id: 'institutions',
    title: 'Institutional Response Dossier',
    period: '2005-2024',
    yearStart: 2005,
    yearEnd: 2024,
    summary:
      'Institution-level lens across local police, federal agencies, prosecutors, courts, and detention context.',
    points: [
      'Compares local and federal timelines.',
      'Maps events to institutional actors rather than personalities.',
      'Useful for governance and process analysis.',
    ],
    questions: [
      'Where did institutional coordination appear strongest or weakest?',
      'Which procedural events indicate policy or oversight shifts?',
      'What records remain essential for institutional accountability review?',
    ],
    eventIds: [
      'ev-2005-palm-beach',
      'ev-2006-federal-attention',
      'ev-2019-arrest',
      'ev-2019-custody-death',
      'ev-2024-records-wave',
    ],
  },
  {
    id: 'media-records',
    title: 'Media and Records Dossier',
    period: '2015-2024',
    yearStart: 2015,
    yearEnd: 2024,
    summary:
      'Coverage-focused dossier tracking reporting waves, civil filing visibility, and records transparency pressure.',
    points: [
      'Centers on publication and records visibility effects.',
      'Connects source types to shifts in public attention.',
      'Useful for research planning and source triage.',
    ],
    questions: [
      'Which reports drove renewed legal or public scrutiny?',
      'How did records visibility change over time?',
      'What source gaps remain for independent verification?',
    ],
    eventIds: [
      'ev-2015-civil-pressure',
      'ev-2018-media-series',
      'ev-2019-arrest',
      'ev-2024-records-wave',
    ],
  },
  {
    id: 'open-issues',
    title: 'Open Issues Dossier',
    period: '2005-2024',
    yearStart: 2005,
    yearEnd: 2024,
    summary:
      'Unresolved or contested areas where public documents and reporting still leave analytical gaps.',
    points: [
      'Designed for follow-up research planning.',
      'Flags uncertainty rather than asserting conclusions.',
      'Encourages source verification before interpretation.',
    ],
    questions: [
      'Which record sets remain unavailable or incomplete?',
      'What contradictions in public narratives need primary-document checking?',
      'Which institutions still require clearer public accounting?',
    ],
    eventIds: [
      'ev-2008-plea-deal',
      'ev-2019-custody-death',
      'ev-2021-maxwell-conviction',
      'ev-2024-records-wave',
    ],
  },
];

const PHASE_LABEL = {
  investigation: 'Investigation',
  legal: 'Legal',
  custody: 'Custody',
  aftermath: 'Aftermath',
  media: 'Media',
};

const years = EVENTS.map((event) => new Date(event.date).getFullYear());
const minYear = Math.min(...years);
const maxYear = Math.max(...years);

const dom = {
  yearNode: document.querySelector('#year'),
  dossierMenu: document.querySelector('#dossier-menu'),
  dossierTitle: document.querySelector('#dossier-title'),
  dossierSummary: document.querySelector('#dossier-summary'),
  dossierPoints: document.querySelector('#dossier-points'),
  dossierPeriod: document.querySelector('#dossier-period'),
  dossierCounts: document.querySelector('#dossier-counts'),
  dossierExport: document.querySelector('#dossier-export'),
  questionList: document.querySelector('#question-list'),

  timelineSearch: document.querySelector('#timeline-search'),
  yearStart: document.querySelector('#year-start'),
  yearEnd: document.querySelector('#year-end'),
  timelineReset: document.querySelector('#timeline-reset'),
  timelineStatus: document.querySelector('#timeline-status'),
  timelineList: document.querySelector('#timeline-list'),

  sourceStatus: document.querySelector('#source-status'),
  sourceBody: document.querySelector('#source-body'),
};

const state = {
  dossierId: DOSSIERS[0].id,
  search: '',
  yearStart: DOSSIERS[0].yearStart,
  yearEnd: DOSSIERS[0].yearEnd,
  sourceFocusIds: null,
};

const tokenize = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

const setStatus = (node, text) => {
  if (node) {
    node.textContent = text;
  }
};

const getEvent = (id) => EVENTS.find((event) => event.id === id) || null;
const getSource = (id) => SOURCES.find((source) => source.id === id) || null;
const getActiveDossier = () => DOSSIERS.find((dossier) => dossier.id === state.dossierId) || DOSSIERS[0];

const getDossierEvents = (dossierId = state.dossierId) => {
  const dossier = DOSSIERS.find((row) => row.id === dossierId);
  if (!dossier) {
    return [];
  }
  return dossier.eventIds
    .map((id) => getEvent(id))
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getDossierSourceIds = (dossierId = state.dossierId) => {
  const ids = new Set();
  getDossierEvents(dossierId).forEach((event) => {
    event.sources.forEach((sourceId) => ids.add(sourceId));
  });
  return [...ids];
};

const getVisibleEvents = () => {
  const tokens = tokenize(state.search);

  return getDossierEvents().filter((event) => {
    const year = new Date(event.date).getFullYear();
    if (year < state.yearStart || year > state.yearEnd) {
      return false;
    }

    if (tokens.length > 0) {
      const haystack = `${event.title} ${event.summary} ${event.keywords} ${event.phase}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    }

    return true;
  });
};

const getLinkedEventTitlesForSource = (sourceId) =>
  getDossierEvents()
    .filter((event) => event.sources.includes(sourceId))
    .map((event) => event.title);

const renderDossierMenu = () => {
  dom.dossierMenu.innerHTML = DOSSIERS.map((dossier) => {
    const active = dossier.id === state.dossierId ? 'active' : '';
    return `
      <button class="dossier-btn ${active}" type="button" data-dossier-id="${dossier.id}">
        <span class="dossier-btn-title">${dossier.title}</span>
        <span class="dossier-btn-meta">${dossier.period} · ${dossier.eventIds.length} events</span>
      </button>
    `;
  }).join('');
};

const renderDossierDetail = () => {
  const dossier = getActiveDossier();
  const sources = getDossierSourceIds(dossier.id);

  dom.dossierTitle.textContent = dossier.title;
  dom.dossierSummary.textContent = dossier.summary;
  dom.dossierPoints.innerHTML = dossier.points.map((point) => `<li>${point}</li>`).join('');
  dom.dossierPeriod.textContent = `Coverage period: ${dossier.period}`;
  dom.dossierCounts.textContent = `Events: ${dossier.eventIds.length} · Sources: ${sources.length}`;
  dom.questionList.innerHTML = dossier.questions.map((question) => `<li>${question}</li>`).join('');
};

const renderTimeline = () => {
  const events = getVisibleEvents();

  setStatus(dom.timelineStatus, `Showing ${events.length} event${events.length === 1 ? '' : 's'} in active dossier.`);

  if (events.length === 0) {
    dom.timelineList.innerHTML = `
      <article class="event-card">
        <p class="status">No events match current filters. Try wider years or fewer keywords.</p>
      </article>
    `;
    return;
  }

  dom.timelineList.innerHTML = events
    .map((event) => {
      const phaseLabel = PHASE_LABEL[event.phase] || event.phase;
      return `
        <article class="event-card" data-event-id="${event.id}">
          <div class="event-head">
            <p class="event-date">${formatDate(event.date)}</p>
            <span class="phase-tag">${phaseLabel}</span>
          </div>
          <h3 class="event-title">${event.title}</h3>
          <p class="event-summary">${event.summary}</p>
          <div class="inline-actions">
            <button class="mini-btn" type="button" data-event-action="sources" data-event-id="${event.id}">
              Focus ${event.sources.length} source${event.sources.length === 1 ? '' : 's'}
            </button>
          </div>
        </article>
      `;
    })
    .join('');
};

const renderSources = () => {
  const sourceIds = state.sourceFocusIds || getDossierSourceIds();
  const sources = sourceIds
    .map((id) => getSource(id))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (sources.length === 0) {
    dom.sourceBody.innerHTML = `
      <tr>
        <td colspan="6"><p class="status">No sources available in this view.</p></td>
      </tr>
    `;
    setStatus(dom.sourceStatus, '0 sources shown.');
    return;
  }

  dom.sourceBody.innerHTML = sources
    .map((source) => {
      const linked = getLinkedEventTitlesForSource(source.id);
      const linkedText = linked.length === 0 ? 'No linked events' : linked.slice(0, 3).join(' · ');
      const extra = linked.length > 3 ? ` +${linked.length - 3} more` : '';

      return `
        <tr>
          <td>${formatDate(source.date)}</td>
          <td><p class="source-title">${source.title}</p></td>
          <td>${source.publisher}</td>
          <td>${source.type}</td>
          <td>${linkedText}${extra}</td>
          <td><a class="source-open" href="${source.url}" target="_blank" rel="noreferrer">Open</a></td>
        </tr>
      `;
    })
    .join('');

  const focusText = state.sourceFocusIds ? ' · focused by event' : '';
  setStatus(dom.sourceStatus, `${sources.length} source${sources.length === 1 ? '' : 's'} shown${focusText}.`);
};

const applyTimelineControls = () => {
  dom.timelineSearch.value = state.search;
  dom.yearStart.value = String(state.yearStart);
  dom.yearEnd.value = String(state.yearEnd);
};

const setDossier = (dossierId) => {
  const dossier = DOSSIERS.find((row) => row.id === dossierId);
  if (!dossier) {
    return;
  }

  state.dossierId = dossier.id;
  state.search = '';
  state.sourceFocusIds = null;
  state.yearStart = dossier.yearStart;
  state.yearEnd = dossier.yearEnd;

  renderDossierMenu();
  renderDossierDetail();
  applyTimelineControls();
  renderTimeline();
  renderSources();
};

const resetTimelineFilters = () => {
  const dossier = getActiveDossier();
  state.search = '';
  state.yearStart = dossier.yearStart;
  state.yearEnd = dossier.yearEnd;
  state.sourceFocusIds = null;

  applyTimelineControls();
  renderTimeline();
  renderSources();
};

const exportCurrentDossier = () => {
  const dossier = getActiveDossier();
  const events = getVisibleEvents();
  const sources = getDossierSourceIds(dossier.id)
    .map((id) => getSource(id))
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date));

  const lines = [];
  lines.push(`# ${dossier.title}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Coverage period: ${dossier.period}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(dossier.summary);
  lines.push('');
  lines.push('## Key Points');
  dossier.points.forEach((point) => lines.push(`- ${point}`));
  lines.push('');
  lines.push('## Open Questions');
  dossier.questions.forEach((question) => lines.push(`- ${question}`));
  lines.push('');
  lines.push('## Timeline Events (current filters)');

  if (events.length === 0) {
    lines.push('- No events matched current filters.');
  } else {
    events.forEach((event, index) => {
      lines.push(`${index + 1}. ${formatDate(event.date)} - ${event.title}`);
      lines.push(`   ${event.summary}`);
    });
  }

  lines.push('');
  lines.push('## Source Index');
  sources.forEach((source) => {
    lines.push(`- ${formatDate(source.date)} | ${source.title} | ${source.publisher} | ${source.url}`);
  });

  downloadText(`dossier-${dossier.id}.md`, lines.join('\n'));
};

const initYearOptions = () => {
  const options = [];
  for (let year = minYear; year <= maxYear; year += 1) {
    options.push(`<option value="${year}">${year}</option>`);
  }
  dom.yearStart.innerHTML = options.join('');
  dom.yearEnd.innerHTML = options.join('');
};

const bindEvents = () => {
  dom.dossierMenu.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('[data-dossier-id]');
    const dossierId = button?.getAttribute('data-dossier-id');
    if (!dossierId) {
      return;
    }

    setDossier(dossierId);
  });

  dom.timelineSearch.addEventListener('input', () => {
    state.search = dom.timelineSearch.value;
    state.sourceFocusIds = null;
    renderTimeline();
    renderSources();
  });

  const updateYearRange = () => {
    const start = Number(dom.yearStart.value);
    const end = Number(dom.yearEnd.value);

    if (start <= end) {
      state.yearStart = start;
      state.yearEnd = end;
    } else {
      state.yearStart = Math.min(start, end);
      state.yearEnd = Math.max(start, end);
      dom.yearStart.value = String(state.yearStart);
      dom.yearEnd.value = String(state.yearEnd);
    }

    state.sourceFocusIds = null;
    renderTimeline();
    renderSources();
  };

  dom.yearStart.addEventListener('change', updateYearRange);
  dom.yearEnd.addEventListener('change', updateYearRange);

  dom.timelineReset.addEventListener('click', resetTimelineFilters);

  dom.timelineList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute('data-event-action');
    if (action !== 'sources') {
      return;
    }

    const eventId = target.getAttribute('data-event-id');
    const item = eventId ? getEvent(eventId) : null;
    if (!item) {
      return;
    }

    state.sourceFocusIds = item.sources;
    renderSources();
    document.querySelector('#sources')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  dom.dossierExport.addEventListener('click', exportCurrentDossier);
};

const init = () => {
  if (dom.yearNode) {
    dom.yearNode.textContent = String(new Date().getFullYear());
  }

  initYearOptions();
  setDossier(state.dossierId);
  bindEvents();
};

init();
