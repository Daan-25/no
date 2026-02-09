const EVENTS = [
  {
    id: 'ev-2005-palm-beach',
    title: 'Palm Beach police investigation begins',
    date: '2005-03-01',
    phase: 'investigation',
    summary:
      'Local authorities in Palm Beach receive reports involving underage girls, opening the first formal investigative pathway.',
    keywords: 'palm beach police florida early investigation reports',
    entities: ['ent-palm-beach-police', 'ent-victims', 'ent-epstein'],
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
    entities: ['ent-fbi', 'ent-epstein', 'ent-victims'],
    sources: ['src-fbi', 'src-doj-main'],
  },
  {
    id: 'ev-2008-plea-deal',
    title: 'Controversial 2008 plea agreement',
    date: '2008-06-30',
    phase: 'legal',
    summary:
      'Epstein pleads guilty to state-level charges in a deal that later becomes central to public and legal criticism.',
    keywords: '2008 plea deal state charges controversy prosecution',
    entities: ['ent-epstein', 'ent-courts', 'ent-public-interest'],
    sources: ['src-courtlistener', 'src-miami-herald-series'],
  },
  {
    id: 'ev-2015-civil-pressure',
    title: 'Civil litigation and survivor claims intensify',
    date: '2015-08-01',
    phase: 'aftermath',
    summary:
      'Civil claims and survivor-led legal actions push renewed attention to earlier institutional decisions.',
    keywords: 'civil litigation survivors claims institutional response',
    entities: ['ent-victims', 'ent-public-interest', 'ent-courts'],
    sources: ['src-courtlistener', 'src-justia'],
  },
  {
    id: 'ev-2018-media-series',
    title: 'Investigative reporting wave in 2018',
    date: '2018-11-01',
    phase: 'media',
    summary:
      'Long-form investigative reporting reframes how the earlier case handling is understood by the public.',
    keywords: 'investigative reporting media pressure 2018 journalism',
    entities: ['ent-miami-herald', 'ent-media', 'ent-public-interest'],
    sources: ['src-miami-herald-series', 'src-nyt-archive'],
  },
  {
    id: 'ev-2019-arrest',
    title: 'Federal arrest in New York',
    date: '2019-07-06',
    phase: 'legal',
    summary:
      'The U.S. Attorney\'s Office for the Southern District of New York announces federal charges in a new case.',
    keywords: '2019 arrest sdny federal indictment trafficking',
    entities: ['ent-sdny', 'ent-doj', 'ent-epstein'],
    sources: ['src-sdny-indictment', 'src-doj-main'],
  },
  {
    id: 'ev-2019-custody-death',
    title: 'Death in federal custody',
    date: '2019-08-10',
    phase: 'custody',
    summary:
      'Epstein dies while in detention. Official findings classify the death as suicide.',
    keywords: 'custody death detention official findings suicide ruling',
    entities: ['ent-mcc', 'ent-courts', 'ent-epstein'],
    sources: ['src-nyt-archive', 'src-wsj-archive'],
  },
  {
    id: 'ev-2020-maxwell-arrest',
    title: 'Ghislaine Maxwell arrested',
    date: '2020-07-02',
    phase: 'aftermath',
    summary:
      'A key related defendant is arrested, opening a new major prosecution track.',
    keywords: 'maxwell arrest related prosecution federal case',
    entities: ['ent-maxwell', 'ent-fbi', 'ent-sdny'],
    sources: ['src-doj-main', 'src-sdny-maxwell-sentencing'],
  },
  {
    id: 'ev-2021-maxwell-conviction',
    title: 'Maxwell convicted in federal court',
    date: '2021-12-29',
    phase: 'legal',
    summary:
      'The trial concludes with convictions, influencing subsequent legal and public accountability narratives.',
    keywords: 'maxwell conviction federal trial verdict accountability',
    entities: ['ent-maxwell', 'ent-courts', 'ent-sdny'],
    sources: ['src-sdny-maxwell-sentencing', 'src-courtlistener'],
  },
  {
    id: 'ev-2022-maxwell-sentencing',
    title: 'Maxwell sentencing',
    date: '2022-06-28',
    phase: 'legal',
    summary:
      'Federal sentencing marks a major procedural endpoint in the related prosecution.',
    keywords: 'sentencing 2022 federal prison term',
    entities: ['ent-maxwell', 'ent-sdny', 'ent-courts'],
    sources: ['src-sdny-maxwell-sentencing', 'src-doj-main'],
  },
  {
    id: 'ev-2024-records-wave',
    title: 'Further records and filing visibility',
    date: '2024-01-01',
    phase: 'aftermath',
    summary:
      'Continuing records activity keeps public attention on civil filings, legal context, and institutional process.',
    keywords: 'records filings unsealed documents transparency',
    entities: ['ent-courts', 'ent-public-interest', 'ent-media'],
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
    title: 'Department of Justice main portal',
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
    id: 'src-pacer',
    title: 'PACER case record system',
    publisher: 'U.S. Courts',
    type: 'court',
    date: '2024-01-01',
    url: 'https://pacer.uscourts.gov/',
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
    id: 'src-wikipedia-overview',
    title: 'Wikipedia overview entry',
    publisher: 'Wikipedia',
    type: 'analysis',
    date: '2024-01-01',
    url: 'https://en.wikipedia.org/wiki/Jeffrey_Epstein',
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

const ENTITIES = [
  {
    id: 'ent-epstein',
    label: 'Jeffrey Epstein',
    type: 'person',
    blurb: 'Central figure across criminal investigations, plea history, and later federal prosecution.',
  },
  {
    id: 'ent-maxwell',
    label: 'Ghislaine Maxwell',
    type: 'person',
    blurb: 'Related defendant convicted in federal court in 2021 and sentenced in 2022.',
  },
  {
    id: 'ent-victims',
    label: 'Survivors / complainants',
    type: 'group',
    blurb: 'Civil claims and testimonies have been central to accountability pathways.',
  },
  {
    id: 'ent-palm-beach-police',
    label: 'Palm Beach Police',
    type: 'institution',
    blurb: 'Initial local investigative track in Florida.',
  },
  {
    id: 'ent-fbi',
    label: 'FBI',
    type: 'institution',
    blurb: 'Federal investigative agency connected to later case development.',
  },
  {
    id: 'ent-doj',
    label: 'U.S. Department of Justice',
    type: 'institution',
    blurb: 'Federal justice framework and public announcements hub.',
  },
  {
    id: 'ent-sdny',
    label: 'U.S. Attorney\'s Office (SDNY)',
    type: 'institution',
    blurb: 'Lead office for key federal prosecution announcements in New York.',
  },
  {
    id: 'ent-courts',
    label: 'Federal / state courts',
    type: 'institution',
    blurb: 'Core venue for prosecution, sentencing, civil filings, and records.',
  },
  {
    id: 'ent-mcc',
    label: 'Federal detention context',
    type: 'institution',
    blurb: 'Custody setting tied to events in August 2019.',
  },
  {
    id: 'ent-miami-herald',
    label: 'Miami Herald',
    type: 'media',
    blurb: 'Investigative reporting outlet with major influence on public attention.',
  },
  {
    id: 'ent-media',
    label: 'National media ecosystem',
    type: 'media',
    blurb: 'Broader reporting environment shaping public interpretation of events.',
  },
  {
    id: 'ent-public-interest',
    label: 'Public-interest litigation',
    type: 'group',
    blurb: 'Civil legal activity and transparency pressure linked to long-tail accountability.',
  },
];

const EDGES = [
  ['ent-epstein', 'ent-palm-beach-police'],
  ['ent-epstein', 'ent-fbi'],
  ['ent-epstein', 'ent-sdny'],
  ['ent-epstein', 'ent-courts'],
  ['ent-epstein', 'ent-mcc'],
  ['ent-epstein', 'ent-victims'],
  ['ent-maxwell', 'ent-sdny'],
  ['ent-maxwell', 'ent-courts'],
  ['ent-maxwell', 'ent-victims'],
  ['ent-sdny', 'ent-doj'],
  ['ent-fbi', 'ent-doj'],
  ['ent-miami-herald', 'ent-media'],
  ['ent-media', 'ent-public-interest'],
  ['ent-public-interest', 'ent-courts'],
  ['ent-victims', 'ent-public-interest'],
  ['ent-palm-beach-police', 'ent-fbi'],
];

const PHASE_LABEL = {
  investigation: 'Investigation',
  legal: 'Legal',
  custody: 'Custody',
  aftermath: 'Aftermath',
  media: 'Media pressure',
};

const CLUSTER_LABEL = {
  official: 'Official',
  court: 'Court',
  media: 'Media',
  analysis: 'Analysis',
};

const FLOW_PHASES = [
  {
    id: 'foundation',
    title: 'Foundation',
    summary:
      'Initial investigative and early legal structure (Palm Beach reports through the 2008 plea agreement).',
    timelinePhase: 'all',
    yearStart: 2005,
    yearEnd: 2008,
    eventIds: ['ev-2005-palm-beach', 'ev-2006-federal-attention', 'ev-2008-plea-deal'],
    clusters: {
      official: ['src-fbi', 'src-doj-main'],
      court: ['src-pacer', 'src-courtlistener'],
      media: ['src-miami-herald-series'],
      analysis: ['src-govinfo'],
    },
  },
  {
    id: 'media-reopening',
    title: 'Media Reopening',
    summary:
      'Civil litigation momentum and long-form reporting apply renewed institutional pressure between 2015 and 2018.',
    timelinePhase: 'all',
    yearStart: 2015,
    yearEnd: 2018,
    eventIds: ['ev-2015-civil-pressure', 'ev-2018-media-series'],
    clusters: {
      official: ['src-doj-main'],
      court: ['src-courtlistener', 'src-justia'],
      media: ['src-miami-herald-series', 'src-nyt-archive'],
      analysis: ['src-wikipedia-overview'],
    },
  },
  {
    id: 'federal-2019',
    title: 'Federal 2019 Case',
    summary:
      'The new federal prosecution phase centers around SDNY actions, DOJ announcements, and nationwide reporting.',
    timelinePhase: 'legal',
    yearStart: 2019,
    yearEnd: 2019,
    eventIds: ['ev-2019-arrest'],
    clusters: {
      official: ['src-sdny-indictment', 'src-doj-main'],
      court: ['src-pacer', 'src-courtlistener'],
      media: ['src-nyt-archive', 'src-wsj-archive'],
      analysis: ['src-govinfo'],
    },
  },
  {
    id: 'custody-pivot',
    title: 'Custody Pivot',
    summary:
      'The August 2019 custody event becomes a major interpretive pivot across legal and media narratives.',
    timelinePhase: 'custody',
    yearStart: 2019,
    yearEnd: 2019,
    eventIds: ['ev-2019-custody-death'],
    clusters: {
      official: ['src-doj-main'],
      court: ['src-courtlistener'],
      media: ['src-nyt-archive', 'src-wsj-archive'],
      analysis: ['src-wikipedia-overview'],
    },
  },
  {
    id: 'related-prosecution',
    title: 'Related Prosecution',
    summary:
      'The Maxwell prosecution phase adds new legal outcomes and procedural endpoints from 2020 through 2022.',
    timelinePhase: 'legal',
    yearStart: 2020,
    yearEnd: 2022,
    eventIds: ['ev-2020-maxwell-arrest', 'ev-2021-maxwell-conviction', 'ev-2022-maxwell-sentencing'],
    clusters: {
      official: ['src-sdny-maxwell-sentencing', 'src-doj-main'],
      court: ['src-pacer', 'src-courtlistener'],
      media: ['src-nyt-archive', 'src-wsj-archive'],
      analysis: ['src-govinfo'],
    },
  },
  {
    id: 'records-aftershock',
    title: 'Records Aftershock',
    summary:
      'Ongoing visibility of filings and records keeps long-tail accountability active in the post-trial period.',
    timelinePhase: 'aftermath',
    yearStart: 2022,
    yearEnd: 2024,
    eventIds: ['ev-2022-maxwell-sentencing', 'ev-2024-records-wave'],
    clusters: {
      official: ['src-doj-main'],
      court: ['src-courtlistener', 'src-justia'],
      media: ['src-nyt-archive', 'src-miami-herald-series'],
      analysis: ['src-govinfo', 'src-wikipedia-overview'],
    },
  },
];

const STORAGE_KEYS = {
  pins: 'jef_pins_v2',
  brief: 'jef_brief_v2',
  sourceState: 'jef_source_state_v2',
  briefNotes: 'jef_brief_notes_v2',
  briefTone: 'jef_brief_tone_v2',
  theme: 'jef_theme_v2',
};

const safeStore = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
  },
};

const years = EVENTS.map((event) => new Date(event.date).getFullYear());
const minYear = Math.min(...years);
const maxYear = Math.max(...years);

const validEventIds = new Set(EVENTS.map((event) => event.id));
const validSourceIds = new Set(SOURCES.map((source) => source.id));
const validEntityIds = new Set(ENTITIES.map((entity) => entity.id));

const initialPins = (safeStore.get(STORAGE_KEYS.pins, []) || []).filter((id) => validEventIds.has(id));
const initialBrief = (safeStore.get(STORAGE_KEYS.brief, []) || []).filter((id) => validEventIds.has(id));

const state = {
  phase: 'all',
  yearStart: minYear,
  yearEnd: maxYear,
  search: '',
  sort: 'newest',
  sourceType: 'all',
  sourceSearch: '',
  sourceFocusIds: null,
  pins: new Set(initialPins),
  brief: new Set(initialBrief),
  sourceState: safeStore.get(STORAGE_KEYS.sourceState, {}) || {},
  briefTone: safeStore.get(STORAGE_KEYS.briefTone, 'neutral') || 'neutral',
  briefNotes: safeStore.get(STORAGE_KEYS.briefNotes, '') || '',
  theme: safeStore.get(STORAGE_KEYS.theme, 'light') || 'light',
  query: '',
  flowSelectedId: 'foundation',
  flowCluster: 'official',
};

const dom = {
  body: document.body,
  header: document.querySelector('.site-header'),
  navLinks: Array.from(document.querySelectorAll('.site-nav a')),
  scrollProgress: document.querySelector('#scroll-progress'),
  yearNode: document.querySelector('#year'),

  metricEvents: document.querySelector('#metric-events'),
  metricSources: document.querySelector('#metric-sources'),
  metricEntities: document.querySelector('#metric-entities'),

  themeToggle: document.querySelector('#theme-toggle'),
  commandOpen: document.querySelector('#command-open'),

  questionForm: document.querySelector('#question-form'),
  questionInput: document.querySelector('#question-input'),
  questionClear: document.querySelector('#question-clear'),
  questionResults: document.querySelector('#question-results'),

  sessionStatus: document.querySelector('#session-status'),
  exportSession: document.querySelector('#export-session'),
  clearSession: document.querySelector('#clear-session'),

  phaseFilters: document.querySelector('#phase-filters'),
  yearStart: document.querySelector('#year-start'),
  yearEnd: document.querySelector('#year-end'),
  timelineSearch: document.querySelector('#timeline-search'),
  timelineSort: document.querySelector('#timeline-sort'),
  timelineClear: document.querySelector('#timeline-clear'),
  timelineStatus: document.querySelector('#timeline-status'),
  timelineResults: document.querySelector('#timeline-results'),

  flowTrack: document.querySelector('#flow-track'),
  flowTitle: document.querySelector('#flow-title'),
  flowSummary: document.querySelector('#flow-summary'),
  flowApplyTimeline: document.querySelector('#flow-apply-timeline'),
  flowFocusSources: document.querySelector('#flow-focus-sources'),
  flowAddBrief: document.querySelector('#flow-add-brief'),
  clusterTabs: document.querySelector('#cluster-tabs'),
  clusterList: document.querySelector('#cluster-list'),
  clusterStatus: document.querySelector('#cluster-status'),

  pinSummary: document.querySelector('#pin-summary'),
  pinnedEvents: document.querySelector('#pinned-events'),
  pinsExport: document.querySelector('#pins-export'),
  pinsClear: document.querySelector('#pins-clear'),

  networkCanvas: document.querySelector('#network-canvas'),
  networkReset: document.querySelector('#network-reset'),
  entityPanel: document.querySelector('#entity-panel'),

  sourceTypeFilter: document.querySelector('#source-type-filter'),
  sourceSearch: document.querySelector('#source-search'),
  sourceReset: document.querySelector('#source-reset'),
  sourceSummary: document.querySelector('#source-summary'),
  sourceTableBody: document.querySelector('#source-table-body'),

  briefCount: document.querySelector('#brief-count'),
  briefEvents: document.querySelector('#brief-events'),
  briefTone: document.querySelector('#brief-tone'),
  briefNotes: document.querySelector('#brief-notes'),
  briefGenerate: document.querySelector('#brief-generate'),
  briefCopy: document.querySelector('#brief-copy'),
  briefDownload: document.querySelector('#brief-download'),
  briefClear: document.querySelector('#brief-clear'),
  briefStatus: document.querySelector('#brief-status'),
  briefOutput: document.querySelector('#brief-output'),

  commandShell: document.querySelector('#command-shell'),
  commandInput: document.querySelector('#command-input'),
  commandList: document.querySelector('#command-list'),
};

let commandState = {
  open: false,
  filtered: [],
  activeIndex: 0,
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

const copyText = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'absolute';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(area);
  return copied;
};

const getEvent = (id) => EVENTS.find((event) => event.id === id) || null;
const getEntity = (id) => ENTITIES.find((entity) => entity.id === id) || null;
const getSource = (id) => SOURCES.find((source) => source.id === id) || null;

const savePins = () => safeStore.set(STORAGE_KEYS.pins, [...state.pins]);
const saveBrief = () => safeStore.set(STORAGE_KEYS.brief, [...state.brief]);
const saveSourceState = () => safeStore.set(STORAGE_KEYS.sourceState, state.sourceState);
const saveBriefNotes = () => safeStore.set(STORAGE_KEYS.briefNotes, state.briefNotes);
const saveBriefTone = () => safeStore.set(STORAGE_KEYS.briefTone, state.briefTone);
const saveTheme = () => safeStore.set(STORAGE_KEYS.theme, state.theme);

const setStatus = (node, text) => {
  if (node) {
    node.textContent = text;
  }
};

const getPhaseText = (phase) => PHASE_LABEL[phase] || phase;

const eventSearchHaystack = (event) => {
  const entityNames = event.entities.map((id) => getEntity(id)?.label || '').join(' ');
  return `${event.title} ${event.summary} ${event.keywords} ${entityNames}`.toLowerCase();
};

const scoreByTokens = (text, tokens) => {
  if (tokens.length === 0) {
    return 0;
  }

  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) {
      score += token.length > 4 ? 2 : 1;
    }
  }
  return score;
};

const getFilteredEvents = () => {
  const queryTokens = tokenize(state.search);

  const rows = EVENTS.filter((event) => {
    const year = new Date(event.date).getFullYear();

    if (state.phase !== 'all' && event.phase !== state.phase) {
      return false;
    }
    if (year < state.yearStart || year > state.yearEnd) {
      return false;
    }

    if (queryTokens.length > 0) {
      const haystack = eventSearchHaystack(event);
      const matches = queryTokens.every((token) => haystack.includes(token));
      return matches;
    }

    return true;
  }).map((event) => {
    const relevance = scoreByTokens(eventSearchHaystack(event), queryTokens);
    return { event, relevance };
  });

  if (state.sort === 'oldest') {
    rows.sort((a, b) => a.event.date.localeCompare(b.event.date));
  } else if (state.sort === 'relevance') {
    rows.sort((a, b) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return b.event.date.localeCompare(a.event.date);
    });
  } else {
    rows.sort((a, b) => b.event.date.localeCompare(a.event.date));
  }

  return rows.map((row) => row.event);
};

const getFlowPhase = (flowId) => FLOW_PHASES.find((phase) => phase.id === flowId) || FLOW_PHASES[0];

const getCurrentFlowPhase = () => getFlowPhase(state.flowSelectedId);

const getFlowClusterKeys = (phase) =>
  Object.keys(phase.clusters).filter((key) => Array.isArray(phase.clusters[key]) && phase.clusters[key].length > 0);

const getFlowClusterSourceIds = (phase, cluster) => {
  if (cluster === 'all') {
    return [...new Set(getFlowClusterKeys(phase).flatMap((key) => phase.clusters[key]))];
  }
  return phase.clusters[cluster] || [];
};

const renderFlowMap = () => {
  const phase = getCurrentFlowPhase();
  const clusterKeys = getFlowClusterKeys(phase);

  if (!clusterKeys.includes(state.flowCluster)) {
    state.flowCluster = clusterKeys[0] || 'official';
  }

  if (dom.flowTrack) {
    dom.flowTrack.querySelectorAll('.flow-node').forEach((button) => {
      const id = button.getAttribute('data-flow-id');
      button.classList.toggle('active', id === phase.id);
    });
  }

  if (dom.flowTitle) {
    dom.flowTitle.textContent = phase.title;
  }

  if (dom.flowSummary) {
    dom.flowSummary.textContent = `${phase.summary} Timeline window: ${phase.yearStart}-${phase.yearEnd}.`;
  }

  if (dom.clusterTabs) {
    dom.clusterTabs.innerHTML = clusterKeys
      .map((clusterKey) => {
        const active = clusterKey === state.flowCluster ? 'active' : '';
        const count = phase.clusters[clusterKey].length;
        return `<button class=\"cluster-btn ${active}\" type=\"button\" data-cluster=\"${clusterKey}\">${CLUSTER_LABEL[clusterKey] || clusterKey} (${count})</button>`;
      })
      .join('');
  }

  const sourceIds = getFlowClusterSourceIds(phase, state.flowCluster);
  const sources = sourceIds.map((id) => getSource(id)).filter(Boolean);

  if (dom.clusterList) {
    if (sources.length === 0) {
      dom.clusterList.innerHTML = '<li class=\"placeholder\">No sources in this cluster for the selected phase.</li>';
    } else {
      dom.clusterList.innerHTML = sources
        .map(
          (source) => `
            <li data-source-id=\"${source.id}\">
              <div class=\"cluster-source-meta\">
                <p class=\"cluster-source-title\">${source.title}</p>
                <p class=\"cluster-source-pub\">${source.publisher}</p>
              </div>
              <div class=\"list-actions\">
                <a class=\"source-open\" href=\"${source.url}\" target=\"_blank\" rel=\"noreferrer\">Open</a>
                <button class=\"mini-btn\" type=\"button\" data-cluster-action=\"focus-one\">Focus</button>
              </div>
            </li>
          `
        )
        .join('');
    }
  }

  if (dom.clusterStatus) {
    const label = CLUSTER_LABEL[state.flowCluster] || state.flowCluster;
    dom.clusterStatus.textContent = `${label} cluster · ${sources.length} source${sources.length === 1 ? '' : 's'} in this phase.`;
  }
};

const applyFlowToTimeline = () => {
  const phase = getCurrentFlowPhase();
  state.phase = phase.timelinePhase;
  state.yearStart = Math.max(minYear, phase.yearStart);
  state.yearEnd = Math.min(maxYear, phase.yearEnd);
  state.search = '';
  state.sort = 'newest';
  applyTimelineControlState();
  renderTimeline();
};

const focusFlowSources = (cluster = 'all') => {
  const phase = getCurrentFlowPhase();
  const sourceIds = getFlowClusterSourceIds(phase, cluster);
  state.sourceType = 'all';
  state.sourceSearch = '';
  applySourceControlState();
  setSourceFocus(sourceIds);
};

const renderTimeline = () => {
  const events = getFilteredEvents();

  setStatus(dom.timelineStatus, `Showing ${events.length} events (${state.phase === 'all' ? 'all phases' : getPhaseText(state.phase)}).`);

  if (events.length === 0) {
    dom.timelineResults.innerHTML = `<article class="event-card"><p class="status">No events match your filters. Try a wider year range or fewer keywords.</p></article>`;
    return;
  }

  dom.timelineResults.innerHTML = events
    .map((event) => {
      const entities = event.entities
        .map((entityId) => {
          const entity = getEntity(entityId);
          if (!entity) {
            return '';
          }
          return `<li>${entity.label}</li>`;
        })
        .join('');

      const pinActive = state.pins.has(event.id) ? 'active' : '';
      const briefActive = state.brief.has(event.id) ? 'active' : '';
      const primaryEntity = event.entities[0] || '';

      return `
        <article class="event-card" data-event-id="${event.id}">
          <div class="event-head">
            <p class="event-date">${formatDate(event.date)}</p>
            <span class="phase-tag">${getPhaseText(event.phase)}</span>
          </div>
          <h3 class="event-title">${event.title}</h3>
          <p class="event-summary">${event.summary}</p>
          <ul class="entity-chips">${entities}</ul>
          <div class="event-actions">
            <button class="event-btn pin ${pinActive}" type="button" data-action="pin">Pin</button>
            <button class="event-btn brief ${briefActive}" type="button" data-action="brief">Add to brief</button>
            <button class="event-btn" type="button" data-action="focus" data-entity="${primaryEntity}">Focus network</button>
            <button class="event-btn" type="button" data-action="sources">Open sources</button>
          </div>
        </article>
      `;
    })
    .join('');
};

const renderPinned = () => {
  const pinEvents = [...state.pins].map((id) => getEvent(id)).filter(Boolean);

  setStatus(dom.pinSummary, `${pinEvents.length} events pinned.`);

  if (pinEvents.length === 0) {
    dom.pinnedEvents.innerHTML = '<li class="placeholder">No pinned events yet.</li>';
    return;
  }

  dom.pinnedEvents.innerHTML = pinEvents
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (event) => `
        <li data-event-id="${event.id}">
          <div>
            <p class="list-title">${event.title}</p>
            <p class="list-meta">${formatDate(event.date)}</p>
          </div>
          <div class="list-actions">
            <button class="mini-btn" type="button" data-pin-action="jump">Jump</button>
            <button class="mini-btn" type="button" data-pin-action="remove">Remove</button>
          </div>
        </li>
      `
    )
    .join('');
};

const renderBriefSelection = () => {
  const briefEvents = [...state.brief].map((id) => getEvent(id)).filter(Boolean);

  setStatus(dom.briefCount, `${briefEvents.length} events selected.`);

  if (briefEvents.length === 0) {
    dom.briefEvents.innerHTML = '<li class="placeholder">Add events from the timeline or question results.</li>';
    return;
  }

  dom.briefEvents.innerHTML = briefEvents
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (event) => `
        <li data-event-id="${event.id}">
          <div>
            <p class="list-title">${event.title}</p>
            <p class="list-meta">${formatDate(event.date)}</p>
          </div>
          <button class="mini-btn" type="button" data-brief-action="remove">Remove</button>
        </li>
      `
    )
    .join('');
};

const setSourceFocus = (sourceIds) => {
  const clean = (sourceIds || []).filter((id) => validSourceIds.has(id));
  state.sourceFocusIds = clean.length > 0 ? clean : null;
  renderSources();
};

const getFilteredSources = () => {
  const searchTokens = tokenize(state.sourceSearch);

  return SOURCES.filter((source) => {
    if (state.sourceType !== 'all' && source.type !== state.sourceType) {
      return false;
    }

    if (state.sourceFocusIds && !state.sourceFocusIds.includes(source.id)) {
      return false;
    }

    if (searchTokens.length > 0) {
      const haystack = `${source.title} ${source.publisher} ${source.type}`.toLowerCase();
      if (!searchTokens.every((token) => haystack.includes(token))) {
        return false;
      }
    }

    return true;
  });
};

const renderSources = () => {
  const rows = getFilteredSources();

  let readCount = 0;
  let verifiedCount = 0;

  if (rows.length === 0) {
    dom.sourceTableBody.innerHTML = `
      <tr>
        <td colspan="6"><p class="status">No sources match the current filters.</p></td>
      </tr>
    `;
  } else {
    dom.sourceTableBody.innerHTML = rows
      .map((source) => {
        const entry = state.sourceState[source.id] || { read: false, verified: false };
        if (entry.read) {
          readCount += 1;
        }
        if (entry.verified) {
          verifiedCount += 1;
        }

        const focusedClass = state.sourceFocusIds && state.sourceFocusIds.includes(source.id) ? 'focused' : '';

        return `
          <tr class="${focusedClass}" data-source-id="${source.id}">
            <td>${formatDate(source.date)}</td>
            <td>
              <p class="source-title">${source.title}</p>
              <p class="source-pub">${source.publisher}</p>
            </td>
            <td>${source.type}</td>
            <td><input type="checkbox" data-source-flag="read" ${entry.read ? 'checked' : ''} /></td>
            <td><input type="checkbox" data-source-flag="verified" ${entry.verified ? 'checked' : ''} /></td>
            <td><a class="source-open" href="${source.url}" target="_blank" rel="noreferrer">Open</a></td>
          </tr>
        `;
      })
      .join('');
  }

  const focusText = state.sourceFocusIds ? ' · focus mode active' : '';
  setStatus(dom.sourceSummary, `${rows.length} sources shown · ${readCount} read · ${verifiedCount} verified${focusText}.`);
};

const composeBrief = () => {
  const tone = state.briefTone;
  const selectedEvents = [...state.brief]
    .map((id) => getEvent(id))
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));

  const pinnedEvents = [...state.pins]
    .map((id) => getEvent(id))
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));

  const lines = [];
  lines.push('# Jeffrey Epstein Case Working Brief');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push(`Tone: ${tone}`);
  lines.push('');

  if (tone === 'chronological') {
    lines.push('## Chronology Focus');
  } else if (tone === 'legal') {
    lines.push('## Legal-Process Focus');
  } else {
    lines.push('## Neutral Situation Overview');
  }

  if (selectedEvents.length === 0) {
    lines.push('- No events selected yet. Add events from the timeline to build the brief.');
  } else {
    selectedEvents.forEach((event, index) => {
      lines.push(`${index + 1}. ${formatDate(event.date)} - ${event.title}`);
      lines.push(`   ${event.summary}`);
    });
  }

  lines.push('');
  lines.push('## Pinned Working Set');
  if (pinnedEvents.length === 0) {
    lines.push('- No pinned events.');
  } else {
    pinnedEvents.forEach((event) => {
      lines.push(`- ${formatDate(event.date)} - ${event.title}`);
    });
  }

  lines.push('');
  lines.push('## Research Notes');
  if (state.briefNotes.trim().length === 0) {
    lines.push('- No notes entered.');
  } else {
    lines.push(state.briefNotes.trim());
  }

  return lines.join('\n');
};

const renderBrief = () => {
  renderBriefSelection();
  dom.briefOutput.textContent = composeBrief();
};

const updateMetrics = () => {
  dom.metricEvents.textContent = String(EVENTS.length);
  dom.metricSources.textContent = String(SOURCES.length);
  dom.metricEntities.textContent = String(ENTITIES.length);
};

const jumpToEvent = (eventId) => {
  const event = getEvent(eventId);
  if (!event) {
    return;
  }

  const year = new Date(event.date).getFullYear();
  state.yearStart = Math.min(state.yearStart, year);
  state.yearEnd = Math.max(state.yearEnd, year);

  dom.yearStart.value = String(state.yearStart);
  dom.yearEnd.value = String(state.yearEnd);
  renderTimeline();

  requestAnimationFrame(() => {
    const node = dom.timelineResults.querySelector(`[data-event-id="${eventId}"]`);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node.animate(
        [
          { transform: 'scale(1)', boxShadow: 'none' },
          { transform: 'scale(1.01)', boxShadow: '0 0 0 2px rgba(18, 102, 125, 0.35)' },
          { transform: 'scale(1)', boxShadow: 'none' },
        ],
        { duration: 800 }
      );
    }
  });
};

const togglePin = (eventId) => {
  if (!validEventIds.has(eventId)) {
    return;
  }

  if (state.pins.has(eventId)) {
    state.pins.delete(eventId);
  } else {
    state.pins.add(eventId);
  }

  savePins();
  renderTimeline();
  renderPinned();
  renderBrief();
};

const toggleBriefEvent = (eventId) => {
  if (!validEventIds.has(eventId)) {
    return;
  }

  if (state.brief.has(eventId)) {
    state.brief.delete(eventId);
  } else {
    state.brief.add(eventId);
  }

  saveBrief();
  renderTimeline();
  renderBrief();
};

const runQuestionQuery = (question) => {
  const tokens = tokenize(question);
  state.query = question;

  if (tokens.length === 0) {
    dom.questionResults.textContent = 'Run a question to receive ranked matches.';
    return;
  }

  const rankedEvents = EVENTS.map((event) => {
    const score = scoreByTokens(eventSearchHaystack(event), tokens);
    return { event, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const rankedSources = SOURCES.map((source) => {
    const text = `${source.title} ${source.publisher} ${source.type}`.toLowerCase();
    const score = scoreByTokens(text, tokens);
    return { source, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const eventList =
    rankedEvents.length > 0
      ? rankedEvents
          .map(
            ({ event, score }) => `
              <li class="query-item" data-event-id="${event.id}">
                <p class="query-title">${event.title}</p>
                <p class="query-meta">${formatDate(event.date)} · score ${score}</p>
                <div class="inline-actions">
                  <button class="mini-btn" type="button" data-query-action="add-brief">Add to brief</button>
                  <button class="mini-btn" type="button" data-query-action="jump">Jump</button>
                </div>
              </li>
            `
          )
          .join('')
      : '<li class="query-item"><p class="query-meta">No event matches for this question.</p></li>';

  const sourceList =
    rankedSources.length > 0
      ? rankedSources
          .map(
            ({ source, score }) => `
              <li class="query-item">
                <p class="query-title">${source.title}</p>
                <p class="query-meta">${source.publisher} · score ${score}</p>
                <a class="source-open" href="${source.url}" target="_blank" rel="noreferrer">Open source</a>
              </li>
            `
          )
          .join('')
      : '<li class="query-item"><p class="query-meta">No source matches for this question.</p></li>';

  dom.questionResults.innerHTML = `
    <div class="query-block">
      <p class="query-title">Top event matches</p>
      <ul class="query-list">${eventList}</ul>
      <p class="query-title">Top source matches</p>
      <ul class="query-list">${sourceList}</ul>
    </div>
  `;
};

const exportPins = () => {
  const events = [...state.pins]
    .map((id) => getEvent(id))
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (events.length === 0) {
    setStatus(dom.pinSummary, 'Nothing to export. Pin events first.');
    return;
  }

  const lines = ['Pinned Events', `Generated: ${new Date().toLocaleString()}`, ''];
  events.forEach((event, index) => {
    lines.push(`${index + 1}. ${formatDate(event.date)} - ${event.title}`);
  });

  downloadText('pinned-events.txt', lines.join('\n'));
  setStatus(dom.pinSummary, `${events.length} events pinned. Export complete.`);
};

const exportSession = () => {
  const payload = {
    generatedAt: new Date().toISOString(),
    filters: {
      phase: state.phase,
      yearStart: state.yearStart,
      yearEnd: state.yearEnd,
      search: state.search,
      sort: state.sort,
      sourceType: state.sourceType,
      sourceSearch: state.sourceSearch,
    },
    pins: [...state.pins],
    brief: [...state.brief],
    sourceState: state.sourceState,
    briefTone: state.briefTone,
    briefNotes: state.briefNotes,
  };

  downloadText('research-session.json', JSON.stringify(payload, null, 2));
  setStatus(dom.sessionStatus, 'Session exported to research-session.json.');
};

const resetSession = () => {
  state.phase = 'all';
  state.yearStart = minYear;
  state.yearEnd = maxYear;
  state.search = '';
  state.sort = 'newest';
  state.sourceType = 'all';
  state.sourceSearch = '';
  state.sourceFocusIds = null;
  state.pins = new Set();
  state.brief = new Set();
  state.sourceState = {};
  state.briefTone = 'neutral';
  state.briefNotes = '';
  state.flowSelectedId = 'foundation';
  state.flowCluster = 'official';

  safeStore.remove(STORAGE_KEYS.pins);
  safeStore.remove(STORAGE_KEYS.brief);
  safeStore.remove(STORAGE_KEYS.sourceState);
  safeStore.remove(STORAGE_KEYS.briefNotes);
  safeStore.remove(STORAGE_KEYS.briefTone);

  dom.timelineSearch.value = '';
  dom.timelineSort.value = 'newest';
  dom.yearStart.value = String(minYear);
  dom.yearEnd.value = String(maxYear);
  dom.sourceTypeFilter.value = 'all';
  dom.sourceSearch.value = '';
  dom.briefTone.value = 'neutral';
  dom.briefNotes.value = '';

  dom.phaseFilters.querySelectorAll('.phase-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.phase === 'all');
  });

  renderTimeline();
  renderPinned();
  renderFlowMap();
  renderSources();
  renderBrief();
  setStatus(dom.sessionStatus, 'Session reset complete.');
};

const setTheme = (theme) => {
  state.theme = theme;
  dom.body.dataset.theme = theme;
  saveTheme();
};

const toggleTheme = () => {
  setTheme(state.theme === 'light' ? 'dark' : 'light');
};

const updateHeaderAndProgress = () => {
  const y = window.scrollY;
  dom.header.classList.toggle('scrolled', y > 8);

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const value = maxScroll > 0 ? Math.min((y / maxScroll) * 100, 100) : 0;
  dom.scrollProgress.style.width = `${value}%`;
};

const setupReveal = () => {
  const sections = Array.from(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window)) {
    sections.forEach((section) => section.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          instance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((section, index) => {
    section.style.transitionDelay = `${Math.min(index * 55, 240)}ms`;
    observer.observe(section);
  });
};

const setupActiveNav = () => {
  const targets = Array.from(document.querySelectorAll('main section[id]'));

  if (!('IntersectionObserver' in window)) {
    return;
  }

  const byHash = new Map(dom.navLinks.map((link) => [link.getAttribute('href'), link]));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const id = entry.target.getAttribute('id');
        if (!id) {
          return;
        }

        dom.navLinks.forEach((link) => link.classList.remove('active'));
        const active = byHash.get(`#${id}`);
        if (active) {
          active.classList.add('active');
        }
      });
    },
    {
      rootMargin: '-30% 0px -55% 0px',
      threshold: 0.05,
    }
  );

  targets.forEach((target) => observer.observe(target));
};

const applyTimelineControlState = () => {
  dom.yearStart.value = String(state.yearStart);
  dom.yearEnd.value = String(state.yearEnd);
  dom.timelineSearch.value = state.search;
  dom.timelineSort.value = state.sort;

  dom.phaseFilters.querySelectorAll('.phase-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.phase === state.phase);
  });
};

const applySourceControlState = () => {
  dom.sourceTypeFilter.value = state.sourceType;
  dom.sourceSearch.value = state.sourceSearch;
};

const initYearSelects = () => {
  const options = [];
  for (let year = minYear; year <= maxYear; year += 1) {
    options.push(`<option value="${year}">${year}</option>`);
  }
  dom.yearStart.innerHTML = options.join('');
  dom.yearEnd.innerHTML = options.join('');
  applyTimelineControlState();
};

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
};

const renderEntityPanel = (entityId) => {
  const entity = entityId ? getEntity(entityId) : null;

  if (!entity) {
    dom.entityPanel.innerHTML = `
      <h3>Entity Inspector</h3>
      <p class="status">Select a node in the graph to inspect connections.</p>
      <button class="tool-btn ghost" id="network-reset" type="button">Reset graph focus</button>
    `;
    dom.entityPanel.querySelector('#network-reset')?.addEventListener('click', () => {
      graphState.selectedNodeId = null;
      graphState.simulationActive = true;
      graphState.settleFrames = 0;
      renderEntityPanel(null);
    });
    return;
  }

  const relatedEvents = EVENTS.filter((event) => event.entities.includes(entity.id));

  const relatedMarkup = relatedEvents
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(
      (event) => `
        <li data-event-id="${event.id}">
          <div>
            <p class="list-title">${event.title}</p>
            <p class="list-meta">${formatDate(event.date)}</p>
          </div>
          <div class="list-actions">
            <button class="mini-btn" type="button" data-entity-action="brief">Add</button>
            <button class="mini-btn" type="button" data-entity-action="jump">Jump</button>
          </div>
        </li>
      `
    )
    .join('');

  dom.entityPanel.innerHTML = `
    <h3>${entity.label}</h3>
    <p class="status">${entity.type.toUpperCase()} · ${entity.blurb}</p>
    <ul class="entity-list">${relatedMarkup}</ul>
    <button class="tool-btn ghost" id="network-reset" type="button">Reset graph focus</button>
  `;

  dom.entityPanel.querySelector('#network-reset')?.addEventListener('click', () => {
    graphState.selectedNodeId = null;
    graphState.simulationActive = true;
    graphState.settleFrames = 0;
    renderEntityPanel(null);
  });

  dom.entityPanel.querySelectorAll('[data-entity-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const li = button.closest('li[data-event-id]');
      const eventId = li?.getAttribute('data-event-id');
      if (!eventId) {
        return;
      }
      const action = button.getAttribute('data-entity-action');
      if (action === 'brief') {
        state.brief.add(eventId);
        saveBrief();
        renderTimeline();
        renderBrief();
      } else if (action === 'jump') {
        jumpToEvent(eventId);
      }
    });
  });
};

const graphState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  hoverNodeId: null,
  raf: 0,
  width: 0,
  height: 0,
  ctx: null,
  simulationActive: true,
  settleFrames: 0,
};

const entityColor = (type) => {
  if (type === 'person') {
    return '#d06b49';
  }
  if (type === 'institution') {
    return '#3da0bd';
  }
  if (type === 'media') {
    return '#9b7bd9';
  }
  return '#58a37d';
};

const initGraph = () => {
  const canvas = dom.networkCanvas;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  graphState.ctx = ctx;

  const buildNodes = () => {
    graphState.nodes = ENTITIES.map((entity, index) => {
      const angle = (index / ENTITIES.length) * Math.PI * 2;
      const radius = Math.min(graphState.width, graphState.height) * 0.33;
      const jitter = 8;
      return {
        ...entity,
        x: graphState.width / 2 + Math.cos(angle) * radius + (Math.random() - 0.5) * jitter,
        y: graphState.height / 2 + Math.sin(angle) * radius + (Math.random() - 0.5) * jitter,
        baseX: graphState.width / 2 + Math.cos(angle) * radius,
        baseY: graphState.height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        r: 11,
      };
    });

    graphState.edges = EDGES.map(([a, b]) => ({ a, b }));
    graphState.simulationActive = true;
    graphState.settleFrames = 0;
  };

  const setCanvasSize = (rebuild = true) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    graphState.width = rect.width;
    graphState.height = rect.height;
    if (rebuild) {
      buildNodes();
    }
  };

  setCanvasSize(true);
  window.addEventListener('resize', () => setCanvasSize(true));

  const nodeById = () => new Map(graphState.nodes.map((node) => [node.id, node]));

  const step = () => {
    const nodes = graphState.nodes;
    const map = nodeById();

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const na = nodes[i];
        const nb = nodes[j];
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDistance = 92;
        if (dist < minDistance) {
          const push = Math.min((minDistance - dist) * 0.016, 1.0);
          const fx = (dx / dist) * push;
          const fy = (dy / dist) * push;
          na.vx -= fx;
          na.vy -= fy;
          nb.vx += fx;
          nb.vy += fy;
        }
      }
    }

    graphState.edges.forEach((edge) => {
      const a = map.get(edge.a);
      const b = map.get(edge.b);
      if (!a || !b) {
        return;
      }
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = 126;
      const stretch = dist - target;
      const spring = Math.max(Math.min(stretch * 0.006, 1.25), -1.25);
      const fx = (dx / dist) * spring;
      const fy = (dy / dist) * spring;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    });

    let totalSpeed = 0;
    nodes.forEach((node) => {
      node.vx += (node.baseX - node.x) * 0.02;
      node.vy += (node.baseY - node.y) * 0.02;

      node.vx *= 0.8;
      node.vy *= 0.8;

      const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      const maxSpeed = 2.6;
      if (speed > maxSpeed) {
        const ratio = maxSpeed / speed;
        node.vx *= ratio;
        node.vy *= ratio;
      }

      node.x += node.vx;
      node.y += node.vy;

      node.x = Math.max(22, Math.min(graphState.width - 22, node.x));
      node.y = Math.max(22, Math.min(graphState.height - 22, node.y));

      totalSpeed += Math.abs(node.vx) + Math.abs(node.vy);
    });

    if (totalSpeed < 0.18) {
      graphState.settleFrames += 1;
      if (graphState.settleFrames > 20) {
        graphState.simulationActive = false;
      }
    } else {
      graphState.settleFrames = 0;
    }
  };

  const draw = () => {
    const context = graphState.ctx;
    context.clearRect(0, 0, graphState.width, graphState.height);

    const map = new Map(graphState.nodes.map((node) => [node.id, node]));

    graphState.edges.forEach((edge) => {
      const a = map.get(edge.a);
      const b = map.get(edge.b);
      if (!a || !b) {
        return;
      }

      const highlighted =
        graphState.selectedNodeId && (edge.a === graphState.selectedNodeId || edge.b === graphState.selectedNodeId);

      context.beginPath();
      context.strokeStyle = highlighted ? 'rgba(18, 102, 125, 0.65)' : 'rgba(80, 95, 120, 0.25)';
      context.lineWidth = highlighted ? 2 : 1;
      context.moveTo(a.x, a.y);
      context.lineTo(b.x, b.y);
      context.stroke();
    });

    graphState.nodes.forEach((node) => {
      const hovered = graphState.hoverNodeId === node.id;
      const selected = graphState.selectedNodeId === node.id;
      context.beginPath();
      context.fillStyle = entityColor(node.type);
      context.globalAlpha = selected ? 1 : hovered ? 0.95 : 0.82;
      context.arc(node.x, node.y, selected ? node.r + 2 : node.r, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;

      context.beginPath();
      context.strokeStyle = selected ? '#ffffff' : 'rgba(255,255,255,0.45)';
      context.lineWidth = selected ? 2.2 : 1.2;
      context.arc(node.x, node.y, selected ? node.r + 2 : node.r, 0, Math.PI * 2);
      context.stroke();

      context.fillStyle =
        dom.body.dataset.theme === 'dark' ? 'rgba(233, 241, 255, 0.82)' : 'rgba(20, 26, 37, 0.85)';
      context.font = "11px 'Space Mono', monospace";
      context.textAlign = 'center';
      context.fillText(node.label, node.x, node.y - 16);
    });
  };

  const animate = () => {
    if (graphState.simulationActive) {
      step();
    }
    draw();
    graphState.raf = requestAnimationFrame(animate);
  };

  const getPointerNode = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let hit = null;
    let hitDist = Infinity;

    graphState.nodes.forEach((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.r + 8 && dist < hitDist) {
        hitDist = dist;
        hit = node;
      }
    });

    return hit;
  };

  canvas.addEventListener('mousemove', (event) => {
    const node = getPointerNode(event);
    graphState.hoverNodeId = node ? node.id : null;
    canvas.style.cursor = node ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', () => {
    graphState.hoverNodeId = null;
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('click', (event) => {
    const node = getPointerNode(event);
    graphState.selectedNodeId = node ? node.id : null;
    graphState.simulationActive = true;
    graphState.settleFrames = 0;
    renderEntityPanel(graphState.selectedNodeId);
  });

  animate();
};

const focusEntity = (entityId) => {
  if (!validEntityIds.has(entityId)) {
    return;
  }
  graphState.selectedNodeId = entityId;
  graphState.simulationActive = true;
  graphState.settleFrames = 0;
  renderEntityPanel(entityId);
  document.querySelector('#network')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const renderCommandPalette = () => {
  const commandInput = dom.commandInput.value.trim().toLowerCase();

  const actions = [
    {
      id: 'jump-overview',
      label: 'Jump to Overview',
      hint: 'Navigate to the hero dashboard',
      run: () => document.querySelector('#overview')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'jump-workbench',
      label: 'Jump to Workbench',
      hint: 'Open query and session controls',
      run: () => document.querySelector('#workbench')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'jump-timeline',
      label: 'Jump to Timeline',
      hint: 'Go to the event explorer',
      run: () => document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'jump-network',
      label: 'Jump to Network Graph',
      hint: 'Inspect entity relationships',
      run: () => document.querySelector('#network')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'jump-flow',
      label: 'Jump to Flow Map',
      hint: 'Open phase map and source-cluster drilldowns',
      run: () => document.querySelector('#flow')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'jump-sources',
      label: 'Jump to Sources',
      hint: 'Open source intelligence table',
      run: () => document.querySelector('#sources')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'jump-brief',
      label: 'Jump to Brief Builder',
      hint: 'Generate and export your brief',
      run: () => document.querySelector('#brief')?.scrollIntoView({ behavior: 'smooth' }),
    },
    {
      id: 'reset-filters',
      label: 'Reset timeline filters',
      hint: 'Set phase/year/search to defaults',
      run: () => {
        state.phase = 'all';
        state.yearStart = minYear;
        state.yearEnd = maxYear;
        state.search = '';
        state.sort = 'newest';
        applyTimelineControlState();
        renderTimeline();
      },
    },
    {
      id: 'apply-flow',
      label: 'Apply selected flow phase to timeline',
      hint: 'Sync timeline controls with active flow phase',
      run: () => applyFlowToTimeline(),
    },
    {
      id: 'generate-brief',
      label: 'Generate brief output',
      hint: 'Rebuild memo from current selection',
      run: () => {
        dom.briefOutput.textContent = composeBrief();
        setStatus(dom.briefStatus, 'Brief regenerated.');
      },
    },
    {
      id: 'export-pins',
      label: 'Export pinned events',
      hint: 'Download pin set as text file',
      run: () => exportPins(),
    },
    {
      id: 'toggle-theme',
      label: 'Toggle theme',
      hint: 'Switch between light and dark rendering',
      run: () => toggleTheme(),
    },
  ];

  commandState.filtered = actions.filter((action) => {
    if (!commandInput) {
      return true;
    }
    const haystack = `${action.label} ${action.hint}`.toLowerCase();
    return haystack.includes(commandInput);
  });

  if (commandState.activeIndex >= commandState.filtered.length) {
    commandState.activeIndex = 0;
  }

  dom.commandList.innerHTML =
    commandState.filtered.length === 0
      ? '<li class="command-item"><p class="command-hint">No commands match your input.</p></li>'
      : commandState.filtered
          .map(
            (action, index) => `
              <li class="command-item ${index === commandState.activeIndex ? 'active' : ''}" data-command-id="${action.id}">
                <p class="command-label">${action.label}</p>
                <p class="command-hint">${action.hint}</p>
              </li>
            `
          )
          .join('');
};

const openCommandPalette = () => {
  commandState.open = true;
  commandState.activeIndex = 0;
  dom.commandShell.hidden = false;
  dom.commandInput.value = '';
  renderCommandPalette();
  dom.commandInput.focus();
};

const closeCommandPalette = () => {
  commandState.open = false;
  dom.commandShell.hidden = true;
};

const runActiveCommand = () => {
  const command = commandState.filtered[commandState.activeIndex];
  if (!command) {
    return;
  }
  command.run();
  closeCommandPalette();
};

const bindEvents = () => {
  dom.themeToggle.addEventListener('click', toggleTheme);
  dom.commandOpen.addEventListener('click', openCommandPalette);

  dom.questionForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = dom.questionInput.value.trim();
    runQuestionQuery(value);
  });

  dom.questionClear.addEventListener('click', () => {
    dom.questionInput.value = '';
    dom.questionResults.textContent = 'Run a question to receive ranked matches.';
  });

  dom.questionResults.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute('data-query-action');
    if (!action) {
      return;
    }

    const item = target.closest('[data-event-id]');
    const eventId = item?.getAttribute('data-event-id');
    if (!eventId) {
      return;
    }

    if (action === 'add-brief') {
      state.brief.add(eventId);
      saveBrief();
      renderTimeline();
      renderBrief();
      setStatus(dom.briefStatus, 'Event added from query results.');
    } else if (action === 'jump') {
      jumpToEvent(eventId);
    }
  });

  dom.exportSession.addEventListener('click', exportSession);
  dom.clearSession.addEventListener('click', () => {
    if (!window.confirm('Reset local session data (pins, brief selection, notes, and source statuses)?')) {
      return;
    }
    resetSession();
  });

  dom.phaseFilters.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const button = target.closest('.phase-btn');
    if (!button) {
      return;
    }

    state.phase = button.getAttribute('data-phase') || 'all';
    applyTimelineControlState();
    renderTimeline();
  });

  dom.yearStart.addEventListener('change', () => {
    updateYearRange();
    renderTimeline();
  });

  dom.yearEnd.addEventListener('change', () => {
    updateYearRange();
    renderTimeline();
  });

  dom.timelineSearch.addEventListener('input', () => {
    state.search = dom.timelineSearch.value;
    renderTimeline();
  });

  dom.timelineSort.addEventListener('change', () => {
    state.sort = dom.timelineSort.value;
    renderTimeline();
  });

  dom.timelineClear.addEventListener('click', () => {
    state.phase = 'all';
    state.yearStart = minYear;
    state.yearEnd = maxYear;
    state.search = '';
    state.sort = 'newest';
    applyTimelineControlState();
    renderTimeline();
  });

  dom.flowTrack.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('.flow-node[data-flow-id]');
    if (!button) {
      return;
    }

    const flowId = button.getAttribute('data-flow-id');
    if (!flowId) {
      return;
    }

    state.flowSelectedId = flowId;
    state.flowCluster = 'official';
    renderFlowMap();
  });

  dom.clusterTabs.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('.cluster-btn[data-cluster]');
    if (!button) {
      return;
    }

    const cluster = button.getAttribute('data-cluster');
    if (!cluster) {
      return;
    }

    state.flowCluster = cluster;
    renderFlowMap();
  });

  dom.clusterList.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute('data-cluster-action');
    if (!action) {
      return;
    }

    const row = target.closest('[data-source-id]');
    const sourceId = row?.getAttribute('data-source-id');
    if (!sourceId) {
      return;
    }

    if (action === 'focus-one') {
      state.sourceType = 'all';
      state.sourceSearch = '';
      applySourceControlState();
      setSourceFocus([sourceId]);
      document.querySelector('#sources')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  dom.flowApplyTimeline.addEventListener('click', () => {
    applyFlowToTimeline();
    document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  dom.flowFocusSources.addEventListener('click', () => {
    focusFlowSources('all');
    document.querySelector('#sources')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  dom.flowAddBrief.addEventListener('click', () => {
    const phase = getCurrentFlowPhase();
    phase.eventIds.forEach((eventId) => {
      if (validEventIds.has(eventId)) {
        state.brief.add(eventId);
      }
    });
    saveBrief();
    renderTimeline();
    renderBrief();
    setStatus(dom.briefStatus, `Added ${phase.eventIds.length} phase event(s) to brief selection.`);
    document.querySelector('#brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  dom.timelineResults.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const card = target.closest('[data-event-id]');
    if (!card) {
      return;
    }

    const eventId = card.getAttribute('data-event-id');
    if (!eventId) {
      return;
    }

    const action = target.getAttribute('data-action');
    if (!action) {
      return;
    }

    const row = getEvent(eventId);

    if (action === 'pin') {
      togglePin(eventId);
    } else if (action === 'brief') {
      toggleBriefEvent(eventId);
    } else if (action === 'focus') {
      const entityId = target.getAttribute('data-entity') || row?.entities[0];
      if (entityId) {
        focusEntity(entityId);
      }
    } else if (action === 'sources' && row) {
      setSourceFocus(row.sources);
      document.querySelector('#sources')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  dom.pinnedEvents.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute('data-pin-action');
    if (!action) {
      return;
    }

    const item = target.closest('[data-event-id]');
    const eventId = item?.getAttribute('data-event-id');
    if (!eventId) {
      return;
    }

    if (action === 'remove') {
      state.pins.delete(eventId);
      savePins();
      renderTimeline();
      renderPinned();
      renderBrief();
    } else if (action === 'jump') {
      jumpToEvent(eventId);
    }
  });

  dom.pinsExport.addEventListener('click', exportPins);
  dom.pinsClear.addEventListener('click', () => {
    state.pins.clear();
    savePins();
    renderTimeline();
    renderPinned();
    renderBrief();
  });

  dom.sourceTypeFilter.addEventListener('change', () => {
    state.sourceType = dom.sourceTypeFilter.value;
    renderSources();
  });

  dom.sourceSearch.addEventListener('input', () => {
    state.sourceSearch = dom.sourceSearch.value;
    renderSources();
  });

  dom.sourceReset.addEventListener('click', () => {
    state.sourceType = 'all';
    state.sourceSearch = '';
    state.sourceFocusIds = null;
    applySourceControlState();
    renderSources();
  });

  dom.sourceTableBody.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const row = target.closest('tr[data-source-id]');
    const sourceId = row?.getAttribute('data-source-id');
    const flag = target.getAttribute('data-source-flag');
    if (!sourceId || !flag) {
      return;
    }

    if (!state.sourceState[sourceId]) {
      state.sourceState[sourceId] = { read: false, verified: false };
    }

    state.sourceState[sourceId][flag] = target.checked;
    saveSourceState();
    renderSources();
  });

  dom.briefTone.addEventListener('change', () => {
    state.briefTone = dom.briefTone.value;
    saveBriefTone();
    dom.briefOutput.textContent = composeBrief();
  });

  dom.briefNotes.addEventListener('input', () => {
    state.briefNotes = dom.briefNotes.value;
    saveBriefNotes();
    setStatus(dom.briefStatus, `Notes saved locally at ${new Date().toLocaleTimeString()}.`);
  });

  dom.briefGenerate.addEventListener('click', () => {
    dom.briefOutput.textContent = composeBrief();
    setStatus(dom.briefStatus, 'Brief generated from current state.');
  });

  dom.briefCopy.addEventListener('click', async () => {
    const copied = await copyText(dom.briefOutput.textContent).catch(() => false);
    setStatus(dom.briefStatus, copied ? 'Brief copied to clipboard.' : 'Could not copy brief.');
  });

  dom.briefDownload.addEventListener('click', () => {
    downloadText('case-brief.txt', dom.briefOutput.textContent);
    setStatus(dom.briefStatus, 'Brief downloaded as case-brief.txt.');
  });

  dom.briefClear.addEventListener('click', () => {
    state.brief.clear();
    saveBrief();
    renderTimeline();
    renderBrief();
    setStatus(dom.briefStatus, 'Brief selection cleared.');
  });

  dom.briefEvents.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.getAttribute('data-brief-action');
    if (!action) {
      return;
    }

    const row = target.closest('[data-event-id]');
    const eventId = row?.getAttribute('data-event-id');
    if (!eventId) {
      return;
    }

    if (action === 'remove') {
      state.brief.delete(eventId);
      saveBrief();
      renderTimeline();
      renderBrief();
    }
  });

  dom.commandShell.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.hasAttribute('data-close-command')) {
      closeCommandPalette();
      return;
    }

    const item = target.closest('.command-item[data-command-id]');
    if (!item) {
      return;
    }

    const commandId = item.getAttribute('data-command-id');
    const index = commandState.filtered.findIndex((command) => command.id === commandId);
    if (index !== -1) {
      commandState.activeIndex = index;
      runActiveCommand();
    }
  });

  dom.commandInput.addEventListener('input', () => {
    commandState.activeIndex = 0;
    renderCommandPalette();
  });

  dom.commandInput.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      commandState.activeIndex = Math.min(commandState.activeIndex + 1, commandState.filtered.length - 1);
      renderCommandPalette();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      commandState.activeIndex = Math.max(commandState.activeIndex - 1, 0);
      renderCommandPalette();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runActiveCommand();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeCommandPalette();
    }
  });

  window.addEventListener('keydown', (event) => {
    if ((event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) || event.key === 'F1') {
      event.preventDefault();
      if (commandState.open) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }

    if (event.key === 'Escape' && commandState.open) {
      closeCommandPalette();
    }
  });

  window.addEventListener('scroll', updateHeaderAndProgress, { passive: true });
  window.addEventListener('resize', updateHeaderAndProgress);
};

const init = () => {
  if (dom.yearNode) {
    dom.yearNode.textContent = String(new Date().getFullYear());
  }

  setTheme(state.theme === 'dark' ? 'dark' : 'light');
  updateMetrics();
  initYearSelects();
  applySourceControlState();

  dom.briefTone.value = state.briefTone;
  dom.briefNotes.value = state.briefNotes;

  bindEvents();
  renderTimeline();
  renderPinned();
  renderFlowMap();
  renderSources();
  renderBrief();
  setupReveal();
  setupActiveNav();
  updateHeaderAndProgress();
  initGraph();
  renderEntityPanel(null);
};

init();
