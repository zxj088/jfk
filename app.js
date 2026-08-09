const t = window.VEGAS_I18N.t;
const STORAGE_KEY = 'jfk.vegasGolfState.v1';
const HISTORY_KEY = 'jfk.vegasGolfHistory.v1';
const COURSE_KEY = 'jfk.vegasGolfCourses.v1';
const CLIENT_KEY = 'jfk.vegasGolfClientId.v1';
const SCORING_PLAYER_KEY = 'jfk.vegasGolfScoringPlayer.v1';
const LEGACY_DELETE_KEY = 'jfk.vegasGolfDeletedRounds.v1';
const LEGACY_COURSE_DELETE_KEY = 'jfk.vegasGolfDeletedCourses.v1';
const PENDING_COURSES_KEY = 'jfk.vegasGolfPendingCourses.v1';
const PENDING_SYNC_KEY = 'jfk.vegasGolfPendingRound.v1';
const EDIT_CREDENTIALS_KEY = 'jfk.vegasGolfEditCredentials.v1';
const GAME_LIMIT = 200;
const CLOUD_ROUND_LIMIT = 1000;
const STARTUP_HISTORY_DAYS = 7;
const EDIT_LOCK_TTL_MS = 120000;
const CLOUD_REQUEST_TIMEOUT_MS = 8000;
const REFRESH_TIMER_TICK_MS = 5000;
const EDIT_LOCK_REFRESH_MS = 30000;
const LIVE_ROUND_POLL_MS = 30000;
const ROUND_INDEX_POLL_MS = 300000;
const WELCOME_MIN_DURATION_MS = 1000;
const WELCOME_SEEN_KEY = 'jfk.simpleGolfWelcomeSeen.v1';
const SCORE_DETAIL_KEY = 'jfk.simpleGolfScoreDetail.v1';
const ROLE_ICON_PATHS = {
  landlord: './assets/roles/landlord-golfer.png',
  peasant: './assets/roles/farmer-golfer.png'
};
const welcomeStartedAt = performance.now();
let welcomeReadyToEnter = false;
let pendingWelcomeAction = '';
let activeOverlay = null;
let overlayReturnFocus = null;
let scoreDetailMode = localStorage.getItem(SCORE_DETAIL_KEY) === 'full' ? 'full' : 'compact';
let cloudRefreshPromise = null;
let lastRoundIndexSyncAt = 0;
let lastEditLockSyncAt = 0;
let lastLiveRoundSyncAt = 0;
let cloudRefreshEnabled = false;

function roleIconHtml(isLandlord, className = '') {
  const role = isLandlord ? 'landlord' : 'peasant';
  return `<img class="role-character-icon ${className}" src="${ROLE_ICON_PATHS[role]}" alt="" aria-hidden="true">`;
}
const DEFAULT_COURSE_COUNTRY = 'Sweden';
const DEFAULT_COURSE_REGION = 'Stockholm County';
const OVERPASS_API_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter'
];
const OVERPASS_TIMEOUT_MS = 7000;
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const LAS_VEGAS_RULES_TEXT = [
  'The core of the Las Vegas golf rule is: combine the strokes into a two digit number, then compare the two numbers.',
  'Teams: 4 players split into 2 teams.',
  'Scoring: put the lower stroke count first as the tens digit. For example, Team A scores 4 and 5 = 45; Team B scores 5 and 7 = 57. Team B loses 12 points (57 - 45).',
  'Under Par Flip: if any player makes birdie or eagle, the losing team must reverse its number from high to low, such as 57 becoming 75. The lost points jump quickly. If both teams have a player under par, no flip is used.'
].join('\n\n');
const LANDLORD_RULES_SECTIONS = [
  'Players: 3 or 4 players. Each hole has one landlord 👲; the other players are peasants 👨‍🌾.',
  'Gross mode uses actual strokes. Net mode allocates handicap strokes by hole. Choose how many of the lowest Pack scores to add together; compare that sum with the Wolf score multiplied by the same number.',
  'Recorded strokes have no maximum limit.',
  'Wolf selection: Result-Based Rotation follows the result of each hole. Fixed Wolf stays the same for all 18 holes and cannot be changed during the round.',
  'If the landlord wins, the landlord continues on the next hole. If the peasants win, the peasant with the lowest Gross or Net score becomes the next landlord. If multiple winning peasants tie, choose the player with fewer previous turns as landlord; if still tied, rotate forward from the current landlord through the player order. The landlord can still be changed manually on the next hole.',
  'Bomb rule: Only a special score by the winning side earns a multiplier. A winning-side birdie is x2; a winning-side eagle or hole-in-one is x4. Special scores cancel only when both sides have the same level. If their levels differ, the winning side uses its own special-score multiplier. A special score by only the losing side is x1.',
  'Special-score multipliers use gross strokes and multiply together with the manually selected x1, x2, or x4.',
  'In Rotating Wolf mode, tap a player to change the landlord. Manual x2 and x4 can be selected; tap the selected multiplier again to return to x1. Bomb x2 or x4 is determined automatically from the winning side’s gross scores.',
  'Tied hole: Choose whether nobody wins, an eligible higher-handicap landlord wins, the peasants win, or the landlord wins.'
];
const COURSE_SEARCH_AREAS = [
    {
        "country":  "Australia",
        "regions":  [
                        "Australian Capital Territory",
                        "New South Wales",
                        "Northern Territory",
                        "Queensland",
                        "South Australia",
                        "Tasmania",
                        "Victoria",
                        "Western Australia"
                    ]
    },
    {
        "country":  "Austria",
        "regions":  [
                        "Burgenland",
                        "Carinthia",
                        "Lower Austria",
                        "Salzburg",
                        "Styria",
                        "Tyrol",
                        "Upper Austria",
                        "Vienna",
                        "Vorarlberg"
                    ]
    },
    {
        "country":  "Belgium",
        "regions":  [
                        "Antwerp",
                        "Brussels",
                        "East Flanders",
                        "Flemish Brabant",
                        "Hainaut",
                        "Liege",
                        "Limburg",
                        "Luxembourg",
                        "Namur",
                        "Walloon Brabant",
                        "West Flanders"
                    ]
    },
    {
        "country":  "Canada",
        "regions":  [
                        "Alberta",
                        "British Columbia",
                        "Manitoba",
                        "New Brunswick",
                        "Newfoundland and Labrador",
                        "Nova Scotia",
                        "Ontario",
                        "Prince Edward Island",
                        "Quebec",
                        "Saskatchewan"
                    ]
    },
    {
        "country":  "China",
        "regions":  [
                        "Beijing",
                        "Chongqing",
                        "Fujian",
                        "Guangdong",
                        "Hainan",
                        "Jiangsu",
                        "Shanghai",
                        "Sichuan",
                        "Yunnan",
                        "Zhejiang"
                    ]
    },
    {
        "country":  "Czech Republic",
        "regions":  [
                        "Central Bohemian Region",
                        "Karlovy Vary Region",
                        "Moravian-Silesian Region",
                        "Prague",
                        "South Bohemian Region",
                        "South Moravian Region",
                        "Usti nad Labem Region",
                        "Vysocina Region"
                    ]
    },
    {
        "country":  "Denmark",
        "regions":  [
                        "Capital Region",
                        "Central Denmark Region",
                        "North Denmark Region",
                        "Region Zealand",
                        "Southern Denmark"
                    ]
    },
    {
        "country":  "Finland",
        "regions":  [
                        "Central Finland",
                        "Lapland",
                        "North Ostrobothnia",
                        "Pirkanmaa",
                        "Southwest Finland",
                        "Uusimaa"
                    ]
    },
    {
        "country":  "France",
        "regions":  [
                        "Auvergne-Rhone-Alpes",
                        "Brittany",
                        "Grand Est",
                        "Hauts-de-France",
                        "Ile-de-France",
                        "New Aquitaine",
                        "Normandy",
                        "Occitanie",
                        "Pays de la Loire",
                        "Provence-Alpes-Cote d\u0027Azur"
                    ]
    },
    {
        "country":  "Germany",
        "regions":  [
                        "Baden-Wurttemberg",
                        "Bavaria",
                        "Berlin",
                        "Brandenburg",
                        "Hamburg",
                        "Hesse",
                        "Lower Saxony",
                        "North Rhine-Westphalia",
                        "Rhineland-Palatinate",
                        "Saxony",
                        "Schleswig-Holstein"
                    ]
    },
    {
        "country":  "Greece",
        "regions":  [
                        "Attica",
                        "Central Macedonia",
                        "Crete",
                        "Ionian Islands",
                        "Peloponnese",
                        "South Aegean"
                    ]
    },
    {
        "country":  "Ireland",
        "regions":  [
                        "Connacht",
                        "Dublin",
                        "Leinster",
                        "Munster",
                        "Ulster"
                    ]
    },
    {
        "country":  "Italy",
        "regions":  [
                        "Emilia-Romagna",
                        "Lazio",
                        "Liguria",
                        "Lombardy",
                        "Piedmont",
                        "Sardinia",
                        "Sicily",
                        "Tuscany",
                        "Veneto"
                    ]
    },
    {
        "country":  "Japan",
        "regions":  [
                        "Chiba",
                        "Hokkaido",
                        "Kanagawa",
                        "Kyoto",
                        "Okinawa",
                        "Osaka",
                        "Saitama",
                        "Tokyo"
                    ]
    },
    {
        "country":  "Netherlands",
        "regions":  [
                        "Drenthe",
                        "Flevoland",
                        "Friesland",
                        "Gelderland",
                        "Groningen",
                        "Limburg",
                        "North Brabant",
                        "North Holland",
                        "Overijssel",
                        "South Holland",
                        "Utrecht",
                        "Zeeland"
                    ]
    },
    {
        "country":  "Norway",
        "regions":  [
                        "Agder",
                        "Innlandet",
                        "More og Romsdal",
                        "Nordland",
                        "Oslo",
                        "Rogaland",
                        "Troms og Finnmark",
                        "Trondelag",
                        "Vestfold og Telemark",
                        "Vestland",
                        "Viken"
                    ]
    },
    {
        "country":  "Poland",
        "regions":  [
                        "Greater Poland",
                        "Kuyavian-Pomeranian",
                        "Lesser Poland",
                        "Lower Silesian",
                        "Masovian",
                        "Pomeranian",
                        "Silesian",
                        "Warmian-Masurian",
                        "West Pomeranian"
                    ]
    },
    {
        "country":  "Portugal",
        "regions":  [
                        "Alentejo",
                        "Algarve",
                        "Azores",
                        "Central Portugal",
                        "Lisbon",
                        "Madeira",
                        "North Portugal"
                    ]
    },
    {
        "country":  "Spain",
        "regions":  [
                        "Alicante",
                        "Andalusia",
                        "Aragon",
                        "Asturias",
                        "Balearic Islands",
                        "Basque Country",
                        "Canary Islands",
                        "Cantabria",
                        "Castile and Leon",
                        "Castile-La Mancha",
                        "Catalonia",
                        "Extremadura",
                        "Galicia",
                        "La Rioja",
                        "Madrid",
                        "Malaga",
                        "Mallorca",
                        "Murcia",
                        "Navarre",
                        "Valencian Community"
                    ]
    },
    {
        "country":  "Sweden",
        "regions":  [
                        "Dalarna County",
                        "Gavleborg County",
                        "Gotland County",
                        "Halland County",
                        "Jonkoping County",
                        "Kalmar County",
                        "Norrbotten County",
                        "Orebro County",
                        "Ostergotland County",
                        "Skane County",
                        "Sodermanland County",
                        "Stockholm County",
                        "Uppsala County",
                        "Varmland County",
                        "Vasterbotten County",
                        "Vasternorrland County",
                        "Vastmanland County",
                        "Vastra Gotaland County"
                    ]
    },
    {
        "country":  "Switzerland",
        "regions":  [
                        "Aargau",
                        "Basel",
                        "Bern",
                        "Geneva",
                        "Graubunden",
                        "Lucerne",
                        "Ticino",
                        "Valais",
                        "Vaud",
                        "Zurich"
                    ]
    },
    {
        "country":  "Thailand",
        "regions":  [
                        "Bangkok",
                        "Chiang Mai",
                        "Chon Buri",
                        "Hua Hin",
                        "Phuket"
                    ]
    },
    {
        "country":  "United Kingdom",
        "regions":  [
                        "East Midlands",
                        "East of England",
                        "England",
                        "London",
                        "North East England",
                        "North West England",
                        "Northern Ireland",
                        "Scotland",
                        "South East England",
                        "South West England",
                        "Wales",
                        "West Midlands",
                        "Yorkshire and the Humber"
                    ]
    },
    {
        "country":  "United States",
        "regions":  [
                        "Arizona",
                        "California",
                        "Florida",
                        "Georgia",
                        "Hawaii",
                        "Nevada",
                        "New York",
                        "North Carolina",
                        "South Carolina",
                        "Texas"
                    ]
    }
];

const defaultCourses = [
  { id: 'bro-hof-stadium', name: 'Bro Hof Stadium', pars: [5,4,4,3,4,4,3,4,5,4,3,5,5,4,5,3,3,4], indexes: [8,4,18,16,2,14,12,10,6,9,15,13,7,3,1,11,5,17] },
  { id: 'bro-hof-castle', name: 'Bro Hof Castle', pars: [5,3,4,3,5,4,3,4,5,5,3,3,5,4,5,4,3,4], indexes: [5,13,11,9,7,1,17,15,3,4,16,18,6,14,2,12,10,8] },
  { id: 'kungsangen-kings', name: 'Kungsangen Kings', pars: [4,4,3,4,4,4,3,5,4,4,3,4,3,5,3,4,4,5], indexes: [5,7,15,1,3,13,17,9,11,10,16,4,6,12,18,8,14,2] },
  { id: 'kungsangen-queens', name: 'Kungsangen Queens', pars: [4,4,3,4,3,4,4,5,4,5,3,4,5,3,4,4,4,3], indexes: [4,2,18,10,16,14,6,8,12,9,13,1,5,17,15,3,7,11] },
  { id: 'waxholm', name: 'Waxholm', pars: [4,5,3,4,4,4,4,5,4,4,3,4,4,4,5,4,5,3], indexes: [18,4,8,10,6,14,16,12,2,11,13,3,17,9,1,7,15,5] },
  { id: 'lindo-dal', name: 'Lindo Dal', pars: [4,3,4,3,4,5,4,4,5,4,3,4,4,3,4,4,3,5], indexes: [11,13,3,7,1,5,15,17,9,10,6,4,16,8,14,2,18,12] },
  { id: 'kyssinge', name: 'Kyssinge', pars: [4,5,5,4,3,4,4,3,5,4,5,4,4,5,3,4,3,5], indexes: [11,17,5,9,13,15,1,7,3,4,2,12,14,6,8,16,18,10] },
  { id: 'bodaholm', name: 'Bodaholm', pars: [4,4,3,5,4,3,4,3,5,5,4,4,4,3,4,3,4,5], indexes: [9,15,3,13,1,17,11,7,5,8,12,14,10,18,4,16,2,6] },
  { id: 'brollsta', name: 'Brollsta', pars: [4,4,4,5,4,3,4,3,5,5,3,4,3,4,4,5,4,4], indexes: [16,4,6,12,18,8,2,14,10,11,15,9,7,3,1,17,13,5] },
  { id: 'international', name: 'International', pars: [4,5,3,4,5,3,4,4,4,4,4,3,4,5,5,4,3,4], indexes: [11,7,9,1,13,3,5,17,15,2,6,18,12,16,8,4,10,14] },
  { id: 'lovsattrra', name: 'Lovsattrra', pars: [4,4,4,5,3,4,3,4,3,4,3,4,4,4,3,5,3,4], indexes: [17,5,11,9,15,7,1,13,3,4,10,16,2,8,18,12,6,14] },
  { id: 'riksten', name: 'Riksten', pars: [5,4,3,4,5,4,4,3,4,4,4,5,3,4,5,3,4,4], indexes: [7,9,17,3,1,13,5,15,11,12,2,6,18,14,4,16,8,10] }
];

const defaultCourseMetadata = {
  'bro-hof-stadium': { country: 'Sweden', region: 'Stockholm County', club: 'Bro Hof Slott GC', course: 'Stadium Course', source: 'preset' },
  'bro-hof-castle': { country: 'Sweden', region: 'Stockholm County', club: 'Bro Hof Slott GC', course: 'Castle Course', source: 'preset' },
  'kungsangen-kings': { country: 'Sweden', region: 'Stockholm County', club: 'Kungsangen GC', course: 'Kings Course', source: 'preset' },
  'kungsangen-queens': { country: 'Sweden', region: 'Stockholm County', club: 'Kungsangen GC', course: 'Queens Course', source: 'preset' },
  'waxholm': { country: 'Sweden', region: 'Stockholm County', club: 'Waxholm Golf Club', course: 'Main Course', source: 'preset' },
  'lindo-dal': { country: 'Sweden', region: 'Stockholm County', club: 'Lindo Golf Club', course: 'Dal Course', source: 'preset' },
  'kyssinge': { country: 'Sweden', region: 'Stockholm County', club: 'Kyssinge Golf Club', course: 'Main Course', source: 'preset' },
  'bodaholm': { country: 'Sweden', region: 'Stockholm County', club: 'Bodaholm Golf Club', course: 'Main Course', source: 'preset' },
  'brollsta': { country: 'Sweden', region: 'Stockholm County', club: 'Brollsta Golf Club', course: 'Main Course', source: 'preset' },
  'international': { country: 'Sweden', region: 'Stockholm County', club: 'International Golf Club', course: 'Main Course', source: 'preset' },
  'lovsattrra': { country: 'Sweden', region: 'Stockholm County', club: 'Lovsattrra Golf Club', course: 'Main Course', source: 'preset' },
  'riksten': { country: 'Sweden', region: 'Stockholm County', club: 'Riksten Golf Club', course: 'Main Course', source: 'preset' }
};

let activeGameId = '';
let isEditing = false;
let editingGameInfoId = '';
let editingCourseId = '';
let autoSyncTimer = null;
let pendingSyncRound = null;
let pendingSyncPromise = null;
let editLockRefreshPromise = null;
let dialogResolver = null;
let activeScoreTarget = null;
let activePlayHoleIndex = 0;
let currentView = 'start';
let playHoleTouchStartX = null;
let installPromptEvent = null;
let courseSearchMode = 'shared';
let previousHistoryTimeFilter = 'last-7-days';
let historyRange = { from: '', to: '' };
let historyExpanded = false;
const clientId = getClientId();
let state = {
  gameType: 'vegas',
  courseId: defaultCourses[0].id,
  players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
  playerMeta: Array.from({ length: 4 }, () => ({ group: '', teeColor: '' })),
  handicaps: [0, 0, 0, 0],
  scoreMode: 'gross',
  underParFlip: true,
  landlord: defaultLandlordState(),
  scores: emptyScores()
};

let customCourses = [];
let savedRounds = [];
let pendingCourses = [];
let editCredentials = {};
let syncState = {
  ready: false,
  busy: false,
  ok: false,
  label: t('Cloud sync Not ok'),
  title: t('Supabase is not connected.'),
  lastSyncedAt: 0
};
let cloudVersionSupported = null;
let shareCardAsset = null;
let gameWizardStep = 1;

const els = {
  scoreStrip: document.querySelector('#scoreStrip'),
  scoreStripCourse: document.querySelector('#scoreStripCourse'),
  scoreStripMode: document.querySelector('#scoreStripMode'),
  scoreStripDate: document.querySelector('#scoreStripDate'),
  syncBar: document.querySelector('#syncBar'),
  appTitle: document.querySelector('#appTitle'),
  headerStatus: document.querySelector('#headerStatus'),
  headerStatusText: document.querySelector('#headerStatusText'),
  topMenuButton: document.querySelector('#topMenuButton'),
  topActions: document.querySelector('#topActions'),
  rulesLabel: document.querySelector('#rulesLabel'),
  playEntryMode: document.querySelector('#playEntryMode'),
  playEntryTitle: document.querySelector('#playEntryTitle'),
  playEntryCourse: document.querySelector('#playEntryCourse'),
  playHolePrev: document.querySelector('#playHolePrev'),
  playHoleNext: document.querySelector('#playHoleNext'),
  playHoleSwipe: document.querySelector('#playHoleSwipe'),
  playHolePar: document.querySelector('#playHolePar'),
  playHoleNumber: document.querySelector('#playHoleNumber'),
  playHoleIndex: document.querySelector('#playHoleIndex'),
  playPlayerRows: document.querySelector('#playPlayerRows'),
  landlordActions: document.querySelector('#landlordActions'),
  landlordChoices: document.querySelector('#landlordChoices'),
  landlordMultipliers: document.querySelector('#landlordMultipliers'),
  landlordAutomaticBomb: document.querySelector('#landlordAutomaticBomb'),
  landlordHoleResult: document.querySelector('#landlordHoleResult'),
  landlordLeaderboard: document.querySelector('#landlordLeaderboard'),
  rulesButton: document.querySelector('#rulesButton'),
  languageButton: document.querySelector('#languageButton'),
  welcomeLanguageButton: document.querySelector('#welcomeLanguageButton'),
  shareButton: document.querySelector('#shareButton'),
  aboutButton: document.querySelector('#aboutButton'),
  shareCurrentScorecard: document.querySelector('#shareCurrentScorecard'),
  courseSelect: document.querySelector('#courseSelect'),
  birdieFlip: document.querySelector('#birdieFlip'),
  scoreMode: document.querySelector('#scoreMode'),
  scoreDetailToggle: document.querySelector('#scoreDetailToggle'),
  players: [
    document.querySelector('#playerA1'),
    document.querySelector('#playerA2'),
    document.querySelector('#playerB1'),
    document.querySelector('#playerB2')
  ],
  scoreRows: document.querySelector('#scoreRows'),
  teamAPlayers: document.querySelector('#teamAPlayers'),
  teamBPlayers: document.querySelector('#teamBPlayers'),
  teamATotal: document.querySelector('#teamATotal'),
  teamBTotal: document.querySelector('#teamBTotal'),
  holesComplete: document.querySelector('#holesComplete'),
  coursePar: document.querySelector('#coursePar'),
  totalPar: document.querySelector('#totalPar'),
  playerTotals: [
    document.querySelector('#totalPlayerA1'),
    document.querySelector('#totalPlayerA2'),
    document.querySelector('#totalPlayerB1'),
    document.querySelector('#totalPlayerB2')
  ],
  tableTeamATotal: document.querySelector('#tableTeamATotal'),
  tableTeamBTotal: document.querySelector('#tableTeamBTotal'),
  courseListCountry: document.querySelector('#courseListCountry'),
  courseListRegion: document.querySelector('#courseListRegion'),
  courseList: document.querySelector('#courseList'),
  addCourse: document.querySelector('#addCourse'),
  courseModal: document.querySelector('#courseModal'),
  courseForm: document.querySelector('#courseForm'),
  courseSearchModal: document.querySelector('#courseSearchModal'),
  courseSearchForm: document.querySelector('#courseSearchForm'),
  courseSearchModes: Array.from(document.querySelectorAll('[data-course-search-mode]')),
  courseSearchCountry: document.querySelector('#courseSearchCountry'),
  courseSearchRegion: document.querySelector('#courseSearchRegion'),
  courseSearchInput: document.querySelector('#courseSearchInput'),
  courseSearchSubmit: document.querySelector('#courseSearchSubmit'),
  courseSearchStatus: document.querySelector('#courseSearchStatus'),
  courseSearchResults: document.querySelector('#courseSearchResults'),
  cancelCourseSearch: document.querySelector('#cancelCourseSearch'),
  cancelCourseSearchBottom: document.querySelector('#cancelCourseSearchBottom'),
  newCourseName: document.querySelector('#newCourseName'),
  newCourseCountry: document.querySelector('#newCourseCountry'),
  newCourseRegion: document.querySelector('#newCourseRegion'),
  newCourseCode: document.querySelector('#newCourseCode'),
  courseModalEyebrow: document.querySelector('#courseModalEyebrow'),
  courseIndexWarning: document.querySelector('#courseIndexWarning'),
  saveCourseButton: document.querySelector('#saveCourseButton'),
  cancelCourse: document.querySelector('#cancelCourse'),
  cancelCourseBottom: document.querySelector('#cancelCourseBottom'),
  frontNineList: document.querySelector('#frontNineList'),
  backNineList: document.querySelector('#backNineList'),
  frontNineTotal: document.querySelector('#frontNineTotal'),
  backNineTotal: document.querySelector('#backNineTotal'),
  courseParTotal: document.querySelector('#courseParTotal'),
  newGame: document.querySelector('#newGame'),
  watchGames: document.querySelector('#watchGames'),
  viewScorecards: document.querySelector('#viewScorecards'),
  playingSection: document.querySelector('#playingSection'),
  historySection: document.querySelector('#historySection'),
  gameModal: document.querySelector('#gameModal'),
  gameForm: document.querySelector('#gameForm'),
  cancelGame: document.querySelector('#cancelGame'),
  cancelGameBottom: document.querySelector('#cancelGameBottom'),
  newPlayerA1: document.querySelector('#newPlayerA1'),
  newPlayerA2: document.querySelector('#newPlayerA2'),
  newPlayerB1: document.querySelector('#newPlayerB1'),
  newPlayerB2: document.querySelector('#newPlayerB2'),
  newHandicapA1: document.querySelector('#newHandicapA1'),
  newHandicapA2: document.querySelector('#newHandicapA2'),
  newHandicapB1: document.querySelector('#newHandicapB1'),
  newHandicapB2: document.querySelector('#newHandicapB2'),
  historyPlayerA1: document.querySelector('#historyPlayerA1'),
  historyPlayerA2: document.querySelector('#historyPlayerA2'),
  historyPlayerB1: document.querySelector('#historyPlayerB1'),
  historyPlayerB2: document.querySelector('#historyPlayerB2'),
  newGameCountry: document.querySelector('#newGameCountry'),
  newGameRegion: document.querySelector('#newGameRegion'),
  newGameCourse: document.querySelector('#newGameCourse'),
  recentCourseBlock: document.querySelector('#recentCourseBlock'),
  recentCourseChoices: document.querySelector('#recentCourseChoices'),
  newGameCode: document.querySelector('#newGameCode'),
  newGameTeeTime: document.querySelector('#newGameTeeTime'),
  newGameBirdieFlip: document.querySelector('#newGameBirdieFlip'),
  newGameScoreMode: document.querySelector('#newGameScoreMode'),
  newGameType: document.querySelector('#newGameType'),
  newLandlordPlayerCount: document.querySelector('#newLandlordPlayerCount'),
  newLandlordBestPeasantCount: document.querySelector('#newLandlordBestPeasantCount'),
  newLandlordTieOutcome: document.querySelector('#newLandlordTieOutcome'),
  newLandlordMode: document.querySelector('#newLandlordMode'),
  newFixedLandlordPlayer: document.querySelector('#newFixedLandlordPlayer'),
  gameWizardProgress: document.querySelector('#gameWizardProgress'),
  gameWizardBack: document.querySelector('#gameWizardBack'),
  gameWizardNext: document.querySelector('#gameWizardNext'),
  gameWizardSave: document.querySelector('#gameWizardSave'),
  gameReview: document.querySelector('#gameReview'),
  searchCourse: document.querySelector('#searchCourse'),
  playingList: document.querySelector('#playingList'),
  historyList: document.querySelector('#historyList'),
  historyTimeFilter: document.querySelector('#historyTimeFilter'),
  historyCourseFilter: document.querySelector('#historyCourseFilter'),
  historyGameTypeFilter: document.querySelector('#historyGameTypeFilter'),
  historyFilterToggle: document.querySelector('#historyFilterToggle'),
  historyFilters: document.querySelector('#historyFilters'),
  historyShowMore: document.querySelector('#historyShowMore'),
  historyRangeModal: document.querySelector('#historyRangeModal'),
  historyRangeForm: document.querySelector('#historyRangeForm'),
  historyRangeFrom: document.querySelector('#historyRangeFrom'),
  historyRangeTo: document.querySelector('#historyRangeTo'),
  historyRangeCancel: document.querySelector('#historyRangeCancel'),
  syncStatus: document.querySelector('#syncStatus'),
  scoringDeviceBar: document.querySelector('#scoringDeviceBar'),
  scoringDeviceStatus: document.querySelector('#scoringDeviceStatus'),
  lastSyncStatus: document.querySelector('#lastSyncStatus'),
  previousHistoryGame: document.querySelector('#previousHistoryGame'),
  nextHistoryGame: document.querySelector('#nextHistoryGame'),
  takeOverScoring: document.querySelector('#takeOverScoring'),
  welcomeScreen: document.querySelector('#welcomeScreen'),
  welcomeActions: Array.from(document.querySelectorAll('[data-welcome-action]')),
  appDialog: document.querySelector('#appDialog'),
  dialogForm: document.querySelector('#dialogForm'),
  dialogEyebrow: document.querySelector('#dialogEyebrow'),
  dialogTitle: document.querySelector('#dialogTitle'),
  dialogMessage: document.querySelector('#dialogMessage'),
  dialogInputWrap: document.querySelector('#dialogInputWrap'),
  dialogInputLabel: document.querySelector('#dialogInputLabel'),
  dialogInput: document.querySelector('#dialogInput'),
  dialogSelectWrap: document.querySelector('#dialogSelectWrap'),
  dialogSelectLabel: document.querySelector('#dialogSelectLabel'),
  dialogSelect: document.querySelector('#dialogSelect'),
  dialogCheckboxWrap: document.querySelector('#dialogCheckboxWrap'),
  dialogCheckboxLabel: document.querySelector('#dialogCheckboxLabel'),
  dialogCheckbox: document.querySelector('#dialogCheckbox'),
  dialogOk: document.querySelector('#dialogOk'),
  dialogCancel: document.querySelector('#dialogCancel'),
  shareCardModal: document.querySelector('#shareCardModal'),
  shareCardPreview: document.querySelector('#shareCardPreview'),
  shareCardStatus: document.querySelector('#shareCardStatus'),
  shareScorecardButton: document.querySelector('#shareScorecardButton'),
  closeShareCard: document.querySelector('#closeShareCard'),
  scorePad: document.querySelector('#scorePad'),
  scorePadHole: document.querySelector('#scorePadHole'),
  scorePadPlayer: document.querySelector('#scorePadPlayer'),
  scorePadClose: document.querySelector('#scorePadClose'),
  scorePadMinus: document.querySelector('#scorePadMinus'),
  scorePadPlus: document.querySelector('#scorePadPlus'),
  scorePadInput: document.querySelector('#scorePadInput')
};

function defaultLandlordState(playerCount = 3) {
  const count = playerCount === 4 ? 4 : 3;
  return {
    playerCount: count,
    handicapEnabled: true,
    bestPeasantCount: count - 1,
    tieOutcome: 'draw',
    selectionMode: 'rotating',
    fixedLandlordIndex: 0,
    landlords: Array.from({ length: 18 }, () => 0),
    multipliers: Array.from({ length: 18 }, () => 1),
    manualMultipliers: Array.from({ length: 18 }, () => 1),
    specialMultipliers: Array.from({ length: 18 }, () => 1)
  };
}

function normalizeLandlordState(value, playerCount = 3) {
  const source = value && typeof value === 'object' ? value : {};
  const count = Number(source.playerCount || playerCount) === 4 ? 4 : 3;
  const hasChainedMultipliers = Array.isArray(source.manualMultipliers);
  const selectionMode = source.selectionMode === 'fixed' ? 'fixed' : 'rotating';
  const requestedFixedIndex = Math.round(Number(source.fixedLandlordIndex) || 0);
  const fixedLandlordIndex = requestedFixedIndex >= 0 && requestedFixedIndex < count ? requestedFixedIndex : 0;
  const validTieOutcomes = ['draw', 'higher-handicap-landlord', 'peasants', 'landlord'];
  const legacyTieOutcome = source.tieHigherHandicapLandlordWins ? 'higher-handicap-landlord' : 'draw';
  const tieOutcome = validTieOutcomes.includes(source.tieOutcome) ? source.tieOutcome : legacyTieOutcome;
  return {
    playerCount: count,
    handicapEnabled: source.handicapEnabled !== false,
    bestPeasantCount: Math.max(1, Math.min(count - 1, Math.round(Number(source.bestPeasantCount) || count - 1))),
    tieOutcome,
    selectionMode,
    fixedLandlordIndex,
    landlords: Array.from({ length: 18 }, (_, index) => {
      if (selectionMode === 'fixed') return fixedLandlordIndex;
      const landlord = Math.round(Number(source.landlords?.[index]) || 0);
      return landlord >= 0 && landlord < count ? landlord : 0;
    }),
    manualMultipliers: Array.from({ length: 18 }, (_, index) => {
      const multiplier = Number(hasChainedMultipliers ? source.manualMultipliers?.[index] : 1) || 1;
      return [1, 2, 4].includes(multiplier) ? multiplier : 1;
    }),
    specialMultipliers: Array.from({ length: 18 }, (_, index) => {
      const multiplier = Number(source.specialMultipliers?.[index] ?? (hasChainedMultipliers ? 1 : source.multipliers?.[index])) || 1;
      return [1, 2, 4].includes(multiplier) ? multiplier : 1;
    }),
    multipliers: Array.from({ length: 18 }, (_, index) => {
      const manual = Number(hasChainedMultipliers ? source.manualMultipliers?.[index] : 1) || 1;
      const special = Number(source.specialMultipliers?.[index] ?? (hasChainedMultipliers ? 1 : source.multipliers?.[index])) || 1;
      return Math.max(1, Math.min(16, manual * special));
    })
  };
}

function emptyScores() {
  return Array.from({ length: 18 }, () => ['', '', '', '']);
}

function getClientId() {
  const existing = localStorage.getItem(CLIENT_KEY);
  if (existing) return existing;
  const value = `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(CLIENT_KEY, value);
  return value;
}

function scoringPlayerName() {
  return String(localStorage.getItem(SCORING_PLAYER_KEY) || '').trim();
}

function playerDisplayIndexes(playerCount = state.players.length) {
  const indexes = Array.from({ length: playerCount }, (_, index) => index);
  const myIndex = state.players.slice(0, playerCount).findIndex(player => player === scoringPlayerName());
  if (myIndex < 0) return indexes;
  if (state.gameType === 'vegas' && playerCount === 4) {
    const teammateIndex = myIndex < 2 ? 1 - myIndex : 5 - myIndex;
    return [myIndex, teammateIndex, ...indexes.filter(index => index !== myIndex && index !== teammateIndex)];
  }
  return myIndex > 0 ? [myIndex, ...indexes.filter(index => index !== myIndex)] : indexes;
}

async function confirmScoringPlayer(round) {
  const sourcePlayers = round?.players || state.players;
  const count = round?.gameType === 'landlord'
    ? normalizeLandlordState(round?.landlord, sourcePlayers.length).playerCount
    : Math.min(4, sourcePlayers.length);
  const players = sourcePlayers.slice(0, count).filter(Boolean);
  if (!players.length) return '';
  const saved = scoringPlayerName();
  const selected = await openAppDialog({
    eyebrow: t('Scoring identity'),
    title: t('Who am I?'),
    message: t('Choose the player using this phone. This player will be shown first on this phone.'),
    select: true,
    selectLabel: t('Player'),
    selectOptions: players,
    selectValue: players.includes(saved) ? saved : players[0],
    okText: t('Confirm'),
    cancelText: t('Cancel')
  });
  if (!selected) return '';
  localStorage.setItem(SCORING_PLAYER_KEY, selected);
  return selected;
}

function normalizeScores(scores) {
  const rows = Array.isArray(scores) ? scores : [];
  return Array.from({ length: 18 }, (_, rowIndex) => {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [];
    return Array.from({ length: 4 }, (_, scoreIndex) => row[scoreIndex] ?? '');
  });
}

function normalizeHandicaps(values) {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: 4 }, (_, index) => {
    const value = Number(source[index] ?? 0);
    return Number.isFinite(value) ? Math.max(0, Math.min(54, Math.round(value))) : 0;
  });
}

function normalizePlayerMeta(values, playerCount = 4) {
  const source = Array.isArray(values) ? values : [];
  return Array.from({ length: playerCount }, (_, index) => ({
    group: String(source[index]?.group || ''),
    teeColor: String(source[index]?.teeColor || '')
  }));
}

function normalizeCourseIndexes(indexes) {
  const source = Array.isArray(indexes) ? indexes : [];
  const values = Array.from({ length: 18 }, (_, index) => {
    const value = Number(source[index] ?? index + 1);
    return Number.isInteger(value) && value >= 1 && value <= 18 ? value : index + 1;
  });
  const seen = new Set();
  if (values.every(value => !seen.has(value) && seen.add(value))) return values;
  return Array.from({ length: 18 }, (_, index) => index + 1);
}

function normalizeCourse(course) {
  const metadata = defaultCourseMetadata[course?.id] || {};
  const pars = Array.isArray(course?.pars) && course.pars.length === 18
    ? course.pars.map(par => Number(par) || 4)
    : Array.from({ length: 18 }, () => 4);
  return {
    ...course,
    pars,
    indexes: normalizeCourseIndexes(course?.indexes),
    editCode: String(course?.editCode || ''),
    country: String(course?.country || metadata.country || ''),
    region: String(course?.region || metadata.region || ''),
    club: String(course?.club || metadata.club || ''),
    course: String(course?.course || metadata.course || ''),
    source: String(course?.source || metadata.source || '')
  };
}

function allCourses() {
  const courses = new Map();
  [...defaultCourses, ...customCourses].map(normalizeCourse).forEach(course => {
    courses.set(course.id, { ...(courses.get(course.id) || {}), ...course });
  });
  return Array.from(courses.values());
}

function currentCourse() {
  return allCourses().find(course => course.id === state.courseId) || allCourses()[0];
}

function currentGame() {
  return savedRounds.find(round => round.id === activeGameId) || null;
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function editCredentialKey(type, id) {
  return `${type}:${id}`;
}

function editCodeFor(type, id, fallback = '') {
  return String(editCredentials[editCredentialKey(type, id)] || fallback || '').trim();
}

function rememberEditCode(type, id, code) {
  const normalized = String(code || '').trim();
  if (!id || !/^\d{2}$/.test(normalized)) return;
  editCredentials[editCredentialKey(type, id)] = normalized;
  localStorage.setItem(EDIT_CREDENTIALS_KEY, JSON.stringify(editCredentials));
}

function forgetEditCode(type, id) {
  delete editCredentials[editCredentialKey(type, id)];
  localStorage.setItem(EDIT_CREDENTIALS_KEY, JSON.stringify(editCredentials));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, activeGameId, isEditing, currentView, activePlayHoleIndex }));
}

function saveCoursesLocal() {
  localStorage.setItem(COURSE_KEY, JSON.stringify(customCourses));
}

function saveHistoryLocal() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(savedRounds.slice(0, GAME_LIMIT)));
}

function loadPendingRoundLocal() {
  const pending = loadJson(PENDING_SYNC_KEY, null);
  return pending?.id ? normalizeRound(pending) : null;
}

function savePendingRoundLocal(round) {
  if (!round?.id) {
    localStorage.removeItem(PENDING_SYNC_KEY);
    return;
  }
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(normalizeRound(round)));
}

function savePendingCoursesLocal() {
  localStorage.setItem(PENDING_COURSES_KEY, JSON.stringify(pendingCourses.slice(-GAME_LIMIT)));
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `course-${Date.now()}`;
}

function safeFilePart(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>:"/\\|?*]+/g, '')
    .replace(/\.+$/g, '')
    .slice(0, 160);
}

function roundDisplayName(course = currentCourse(), players = state.players) {
  if (state.gameType === 'landlord') {
    return `${course.name}_Wolf & Pack Scoring(${players.join('+')})`;
  }
  return `${course.name}_Team A(${players[0]}+ ${players[1]}) vs. Team B(${players[2]}+${players[3]})`;
}

function roundFileName(course = currentCourse(), players = state.players) {
  return `${safeFilePart(roundDisplayName(course, players))}.json`;
}

function applySignedClass(element, value) {
  element.classList.toggle('point-positive', Number(value) > 0);
  element.classList.toggle('point-negative', Number(value) < 0);
}

function gameStatus(round) {
  return round?.totals?.status === 'playing' ? 'playing' : 'history';
}

function gameCode(round) {
  return editCodeFor('round', round?.id, round?.totals?.editCode);
}

function queuePendingCourse(course) {
  pendingCourses = [...pendingCourses.filter(item => item.id !== course.id), normalizeCourse(course)].slice(-GAME_LIMIT);
  savePendingCoursesLocal();
}

function clearPendingCourse(courseId) {
  pendingCourses = pendingCourses.filter(course => course.id !== courseId);
  savePendingCoursesLocal();
}

function editLock(round) {
  const lock = round?.totals?.editLock;
  return lock && typeof lock === 'object' ? lock : null;
}

function editLockOwner(round) {
  return String(editLock(round)?.owner || '');
}

function deviceLabel(id = clientId) {
  if (id === clientId && scoringPlayerName()) return scoringPlayerName();
  const suffix = String(id || '').split('-').pop().slice(-4).toUpperCase();
  return suffix ? `${t('Scoring phone')} ${suffix}` : t('Scoring phone');
}

function editLockDevice(round) {
  const lock = editLock(round);
  return String(lock?.deviceName || deviceLabel(lock?.owner));
}

function hasCurrentEditLock(round = currentGame()) {
  return window.SIMPLE_GOLF_ROUND_ACCESS.hasEditRight(round, clientId);
}

function withCurrentEditLock(round) {
  const normalized = normalizeRound(round);
  const now = Date.now();
  normalized.totals.editLock = {
    owner: clientId,
    deviceName: deviceLabel(),
    updatedAt: now,
    expiresAt: now + EDIT_LOCK_TTL_MS
  };
  return normalized;
}

function normalizeRound(round) {
  const savedAt = Number(round.savedAt || Date.now());
  const baseTotals = round.totals && typeof round.totals === 'object' ? round.totals : {};
  const gameType = round.gameType === 'landlord' || baseTotals.gameType === 'landlord' ? 'landlord' : 'vegas';
  const sourcePlayers = Array.isArray(round.players) ? round.players : [];
  const requestedPlayerCount = gameType === 'landlord' && sourcePlayers.length === 3 ? 3 : 4;
  const players = Array.from({ length: requestedPlayerCount }, (_, index) => sourcePlayers[index] || `Player ${index + 1}`);
  const playerMeta = normalizePlayerMeta(round.playerMeta || baseTotals.playerMeta, requestedPlayerCount);
  const landlord = normalizeLandlordState(round.landlord || baseTotals.landlord, requestedPlayerCount);
  const handicaps = normalizeHandicaps(round.handicaps || baseTotals.handicaps);
  const courseId = round.courseId || defaultCourses[0].id;
  const course = allCourses().find(item => item.id === courseId) || defaultCourses[0];
  const courseName = round.courseName || course.name || 'Unknown Course';
  const name = round.name || roundDisplayName({ name: courseName }, players);
  const scoreMode = round.scoreMode === 'net' || baseTotals.scoreMode === 'net' ? 'net' : 'gross';
  const underParFlip = 'underParFlip' in round ? Boolean(round.underParFlip) : Boolean(round.birdieFlip);
  return {
    id: round.id || `round-${savedAt}`,
    savedAt,
    name,
    gameType,
    fileName: round.fileName || `${safeFilePart(name)}.json`,
    courseId,
    courseName,
    pars: Array.isArray(round.pars) && round.pars.length === 18 ? round.pars : course.pars,
    indexes: normalizeCourseIndexes(round.indexes || course.indexes),
    players,
    playerMeta,
    handicaps,
    scoreMode,
    underParFlip,
    birdieFlip: underParFlip,
    landlord,
    scores: normalizeScores(round.scores),
    summaryOnly: Boolean(round.summaryOnly),
    totals: {
      a: Number(baseTotals.a || 0),
      b: Number(baseTotals.b || 0),
      complete: Number(baseTotals.complete || 0),
      players: Array.isArray(baseTotals.players) ? baseTotals.players : [0, 0, 0, 0],
      playersGross: Array.isArray(baseTotals.playersGross) ? baseTotals.playersGross : null,
      playersNet: Array.isArray(baseTotals.playersNet) ? baseTotals.playersNet : null,
      landlordPoints: Array.isArray(baseTotals.landlordPoints) ? baseTotals.landlordPoints : null,
      playerMeta,
      status: baseTotals.status === 'playing' ? 'playing' : 'history',
      editCode: String(baseTotals.editCode || ''),
      teeTime: String(baseTotals.teeTime || ''),
      handicaps,
      scoreMode,
      gameType,
      landlord,
      editLock: baseTotals.editLock && typeof baseTotals.editLock === 'object' ? baseTotals.editLock : null,
      cloudVersion: Math.max(0, Number(baseTotals.cloudVersion || 0))
    }
  };
}

function supabaseConfig() {
  const raw = window.VEGAS_SUPABASE || {};
  return {
    url: String(raw.url || '').trim().replace(/\/+$/, ''),
    anonKey: String(raw.anonKey || '').trim(),
    syncKey: String(raw.syncKey || 'default').trim() || 'default',
    writeUrl: String(raw.writeUrl || '').trim()
  };
}

function hasSupabaseConfig() {
  const config = supabaseConfig();
  return Boolean(
    config.url &&
    config.anonKey &&
    config.url.includes('.supabase.co') &&
    !config.anonKey.includes('PASTE')
  );
}

function cloudId(type, id) {
  return `${supabaseConfig().syncKey}:${type}:${id}`;
}

function cloudRowLocalId(row, type = 'round') {
  return String(row.id || '').split(`:${type}:`).pop();
}

async function supabaseRequest(table, query = '', options = {}) {
  const config = supabaseConfig();
  const url = `${config.url}/rest/v1/${table}${query ? `?${query}` : ''}`;
  const headers = {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.anonKey}`,
    'Content-Type': 'application/json',
    Prefer: options.prefer || 'return=representation'
  };
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CLOUD_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(t('Cloud request timed out. Check the connection and try again.'));
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function secureWriteRequest(action, resourceType, localId, code, options = {}) {
  const config = supabaseConfig();
  const url = config.writeUrl || `${config.url}/functions/v1/scorecard-write`;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), CLOUD_REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action,
        resourceType,
        resourceId: cloudId(resourceType, localId),
        syncKey: config.syncKey,
        code,
        ...options
      }),
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(t('Cloud request timed out. Check the connection and try again.'));
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result.error === 'TOO_MANY_ATTEMPTS'
      ? t('Too many incorrect attempts. Try again later.')
      : (result.error || response.statusText);
    const error = new Error(message);
    if (result.error === 'VERSION_CONFLICT') error.code = 'VERSION_CONFLICT';
    if (result.error === 'EDIT_CODE_INVALID') error.code = 'EDIT_CODE_INVALID';
    if (result.error === 'TOO_MANY_ATTEMPTS') error.code = 'TOO_MANY_ATTEMPTS';
    throw error;
  }
  return result;
}

function courseToCloudRow(course) {
  return {
    id: cloudId('course', course.id),
    sync_key: supabaseConfig().syncKey,
    course_id: course.id,
    name: course.name,
    pars: {
      values: course.pars,
      indexes: normalizeCourseIndexes(course.indexes),
      country: String(course.country || ''),
      region: String(course.region || ''),
      club: String(course.club || ''),
      course: String(course.course || ''),
      source: String(course.source || '')
    }
  };
}

function golfCourseApiConfig() {
  const raw = window.VEGAS_SUPABASE?.golfCourseApi || {};
  return {
    proxyUrl: String(raw.proxyUrl || '').trim().replace(/\/+$/, ''),
    baseUrl: String(raw.baseUrl || 'https://api.golfcourseapi.com/v1').trim().replace(/\/+$/, ''),
    searchPath: String(raw.searchPath || '/search').trim() || '/search',
    coursePathTemplate: String(raw.coursePathTemplate || '/courses/{id}').trim() || '/courses/{id}',
    apiKey: String(raw.apiKey || '').trim()
  };
}

function hasGolfCourseApiConfig() {
  const config = golfCourseApiConfig();
  return Boolean(config.proxyUrl || (config.baseUrl && config.apiKey && !config.apiKey.includes('PASTE')));
}

async function golfCourseApiRequest(path, params = {}) {
  const config = golfCourseApiConfig();
  const query = new URLSearchParams(params);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const queryText = query.toString();
  const proxyQuery = new URLSearchParams({ path: cleanPath });
  Object.entries(params).forEach(([key, value]) => proxyQuery.set(key, value));
  const url = config.proxyUrl
    ? `${config.proxyUrl}?${proxyQuery.toString()}`
    : `${config.baseUrl}${cleanPath}${queryText ? `?${queryText}` : ''}`;
  const supabase = supabaseConfig();
  const headers = config.proxyUrl
    ? {
      apikey: supabase.anonKey,
      Authorization: `Bearer ${supabase.anonKey}`
    }
    : { Authorization: `Key ${config.apiKey}` };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }
  return response.json();
}

function cloudRowToCourse(row) {
  const storedPars = row.pars;
  return {
    id: row.course_id,
    name: row.name,
    pars: Array.isArray(storedPars) ? storedPars : (Array.isArray(storedPars?.values) ? storedPars.values : []),
    indexes: Array.isArray(storedPars?.indexes) ? storedPars.indexes : undefined,
    editCode: editCodeFor('course', row.course_id, Array.isArray(storedPars) ? '' : storedPars?.editCode),
    country: Array.isArray(storedPars) ? '' : String(storedPars?.country || ''),
    region: Array.isArray(storedPars) ? '' : String(storedPars?.region || ''),
    club: Array.isArray(storedPars) ? '' : String(storedPars?.club || ''),
    course: Array.isArray(storedPars) ? '' : String(storedPars?.course || ''),
    source: Array.isArray(storedPars) ? '' : String(storedPars?.source || '')
  };
}

function isCourseDeleteMarkerRow(row) {
  return Boolean(row?.pars?.deleted);
}

function roundToCloudRow(round) {
  const normalized = normalizeRound(round);
  const publicTotals = { ...normalized.totals };
  delete publicTotals.editCode;
  const row = {
    id: cloudId('round', normalized.id),
    sync_key: supabaseConfig().syncKey,
    saved_at: normalized.savedAt,
    name: normalized.name,
    file_name: normalized.fileName,
    course_id: normalized.courseId,
    course_name: normalized.courseName,
    pars: {
      values: normalized.pars,
      indexes: normalized.indexes
    },
    players: normalized.players,
    birdie_flip: normalized.birdieFlip,
    scores: normalized.scores,
    totals: publicTotals
  };
  if (cloudVersionSupported) row.version = Math.max(1, Number(normalized.totals.cloudVersion || 1));
  return row;
}

function isDeleteMarkerRow(row) {
  return Boolean(row?.totals?.deleted);
}

function cloudRowToRound(row) {
  if (Object.prototype.hasOwnProperty.call(row || {}, 'version')) cloudVersionSupported = true;
  return normalizeRound({
    id: cloudRowLocalId(row),
    savedAt: Number(row.saved_at),
    name: row.name,
    fileName: row.file_name,
    courseId: row.course_id,
    courseName: row.course_name,
    pars: Array.isArray(row.pars) ? row.pars : row.pars?.values,
    indexes: Array.isArray(row.pars?.indexes) ? row.pars.indexes : undefined,
    players: row.players,
    birdieFlip: row.birdie_flip,
    scores: row.scores,
    totals: {
      ...(row.totals || {}),
      editCode: editCodeFor('round', cloudRowLocalId(row), row.totals?.editCode),
      cloudVersion: Math.max(0, Number(row.version || row.totals?.cloudVersion || 0))
    }
  });
}

function mergeById(localItems, remoteItems) {
  const merged = new Map();
  localItems.forEach(item => merged.set(item.id, item));
  remoteItems.forEach(item => merged.set(item.id, item));
  return Array.from(merged.values());
}

function mergeRounds(localRounds, remoteRounds) {
  return window.SIMPLE_GOLF_SYNC.mergeRoundSnapshots(localRounds, remoteRounds, {
    normalize: normalizeRound,
    limit: GAME_LIMIT
  });
}

function setSyncState(next) {
  syncState = { ...syncState, ...next };
  renderSyncStatus();
}

function renderSyncStatus() {
  if (!els.syncStatus) return;
  els.syncStatus.textContent = syncState.busy ? t('sync...') : (syncState.ok ? t('sync') : syncState.label);
  els.syncStatus.title = syncState.title;
  els.syncStatus.classList.toggle('sync-ok', Boolean(syncState.ok) && !syncState.busy);
  els.syncStatus.classList.toggle('sync-bad', !syncState.ok && !syncState.busy);
  if (els.shareCurrentScorecard) {
    els.shareCurrentScorecard.hidden = !window.SIMPLE_GOLF_ROUND_ACCESS.canShareScorecard(currentGame(), gameStatus(currentGame()));
  }
  renderScoringDeviceBar();
}

function renderScoringDeviceBar() {
  if (!els.scoringDeviceBar) return;
  const round = currentGame();
  const relevantView = currentView === 'play' || currentView === 'leaderboard';
  els.scoringDeviceBar.hidden = !round || !relevantView;
  if (!round || !relevantView) return;

  const finished = gameStatus(round) !== 'playing';
  const lock = editLock(round);
  const lockLive = Boolean(lock && Number(lock.expiresAt || 0) > Date.now());
  if (finished) {
    els.scoringDeviceStatus.textContent = t('Completed game · locked');
  } else if (isEditing && hasCurrentEditLock(round)) {
    els.scoringDeviceStatus.textContent = t('Scored by {device}', { device: editLockDevice(round) });
  } else if (lockLive) {
    els.scoringDeviceStatus.textContent = t('Scored by {device}', { device: editLockDevice(round) });
  } else {
    els.scoringDeviceStatus.textContent = t('No scoring phone');
  }

  const saveStatus = syncState.busy
    ? t('Saving')
    : (syncState.ok ? t('Saved') : t('Waiting for network'));
  const lastSynced = syncState.lastSyncedAt && syncState.ok
    ? ` · ${t('Last synced {time}', { time: new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}`
    : '';
  els.lastSyncStatus.textContent = `${saveStatus}${lastSynced}`;
  els.lastSyncStatus.title = syncState.title;
  const completedRounds = savedRounds.filter(item => gameStatus(item) !== 'playing');
  const showHistoryNavigation = finished && currentView === 'leaderboard' && completedRounds.length >= 2;
  els.previousHistoryGame.hidden = !showHistoryNavigation;
  els.nextHistoryGame.hidden = !showHistoryNavigation;
  const historyIndex = completedRounds.findIndex(item => item.id === round.id);
  els.previousHistoryGame.disabled = historyIndex <= 0;
  els.nextHistoryGame.disabled = historyIndex < 0 || historyIndex >= completedRounds.length - 1;
  els.takeOverScoring.textContent = isEditing ? t('Finish game') : t('Take over scoring');
  els.takeOverScoring.hidden = finished;
}

async function showAdjacentHistoryGame(direction = 1) {
  const completedRounds = savedRounds.filter(round => gameStatus(round) !== 'playing');
  if (completedRounds.length < 2) return;
  const currentIndex = completedRounds.findIndex(round => round.id === activeGameId);
  const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= completedRounds.length) return;
  if (await loadGameOnDemand(completedRounds[nextIndex].id, false, false)) switchView('leaderboard');
}

async function fetchCloudCourses() {
  const query = `select=*&sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}&order=name.asc`;
  const rows = await supabaseRequest('vegas_courses', query);
  return rows
    .filter(row => !isCourseDeleteMarkerRow(row))
    .map(cloudRowToCourse)
    .filter(course => course.pars.length === 18);
}

function cloudSummaryRowToRound(row) {
  if (Object.prototype.hasOwnProperty.call(row || {}, 'version')) cloudVersionSupported = true;
  return normalizeRound({
    id: cloudRowLocalId(row),
    savedAt: Number(row.saved_at),
    name: row.name,
    courseId: row.course_id,
    courseName: row.course_name,
    players: row.players,
    totals: {
      ...(row.totals || {}),
      cloudVersion: Math.max(0, Number(row.version || row.totals?.cloudVersion || 0))
    },
    summaryOnly: true
  });
}

async function fetchCloudRoundSummaries({ fromMs = 0, toMs = 0, includePlaying = false } = {}) {
  const select = 'select=id,saved_at,name,course_id,course_name,players,totals,version';
  const filters = [
    `sync_key=eq.${encodeURIComponent(supabaseConfig().syncKey)}`,
    'order=saved_at.desc',
    `limit=${CLOUD_ROUND_LIMIT}`
  ];
  if (fromMs && includePlaying) {
    filters.push(`or=(saved_at.gte.${Math.floor(fromMs)},totals->>status.eq.playing)`);
  } else {
    if (fromMs) filters.push(`saved_at=gte.${Math.floor(fromMs)}`);
    if (toMs) filters.push(`saved_at=lte.${Math.floor(toMs)}`);
  }
  let rows;
  try {
    rows = await supabaseRequest('vegas_rounds', [select, ...filters].join('&'));
  } catch (error) {
    if (!/version|column/i.test(String(error?.message || ''))) throw error;
    cloudVersionSupported = false;
    rows = await supabaseRequest('vegas_rounds', [select.replace(',version', ''), ...filters].join('&'));
  }
  if (rows.length && cloudVersionSupported === null) {
    cloudVersionSupported = Object.prototype.hasOwnProperty.call(rows[0], 'version');
  }
  const summaries = rows
    .filter(row => !isDeleteMarkerRow(row))
    .map(cloudSummaryRowToRound);
  return { summaries, complete: rows.length < CLOUD_ROUND_LIMIT };
}

async function fetchCloudRoundById(roundId) {
  if (!hasSupabaseConfig() || !roundId) return null;
  const query = `select=*&id=eq.${encodeURIComponent(cloudId('round', roundId))}&limit=1`;
  const rows = await supabaseRequest('vegas_rounds', query);
  return rows.length ? cloudRowToRound(rows[0]) : null;
}

async function ensureRoundFullyLoaded(roundId) {
  const current = savedRounds.find(round => round.id === roundId);
  if (!current?.summaryOnly) return current || null;
  const fullRound = await fetchCloudRoundById(roundId);
  if (!fullRound) return null;
  return replaceRound(fullRound);
}

async function loadGameOnDemand(gameId, editable = false, goToPlay = true, preferredHoleIndex = null) {
  const existing = savedRounds.find(round => round.id === gameId);
  if (!existing) return false;
  if (existing.summaryOnly) {
    setSyncState({ ready: true, busy: true, title: t('Sending and loading scorecard data.') });
    try {
      const fullRound = await ensureRoundFullyLoaded(gameId);
      if (!fullRound) throw new Error(t('Cloud sync Not ok'));
      setSyncState({
        ready: true,
        busy: false,
        ok: true,
        label: t('Cloud sync ok'),
        title: `Supabase room: ${supabaseConfig().syncKey}`,
        lastSyncedAt: Date.now()
      });
    } catch (error) {
      setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
      await showMessage(t('Cloud sync Not ok'), error.message);
      return false;
    }
  }
  loadGame(gameId, editable, goToPlay, preferredHoleIndex);
  return true;
}

async function upsertCloudCourse(course) {
  if (!hasSupabaseConfig()) return;
  const code = editCodeFor('course', course.id, course.editCode);
  if (!/^\d{2}$/.test(code)) throw new Error(t('Enter the 2 digit edit code for this game.'));
  rememberEditCode('course', course.id, code);
  await secureWriteRequest('upsert', 'course', course.id, code, { row: courseToCloudRow(course) });
}

async function flushPendingCourses() {
  if (!hasSupabaseConfig() || !pendingCourses.length) return;
  for (const course of [...pendingCourses]) {
    await upsertCloudCourse(course);
    const stillPending = pendingCourses.find(item => item.id === course.id);
    if (stillPending && JSON.stringify(stillPending) === JSON.stringify(course)) {
      clearPendingCourse(course.id);
    }
  }
}

async function upsertCloudRound(round) {
  if (!hasSupabaseConfig()) return;
  const normalized = normalizeRound(round);
  const expectedVersion = Number(normalized.totals.cloudVersion || 0);
  const code = gameCode(normalized);
  if (!/^\d{2}$/.test(code)) throw new Error(t('Enter the 2 digit edit code for this game.'));
  rememberEditCode('round', normalized.id, code);
  let result;
  try {
    result = await secureWriteRequest('upsert', 'round', normalized.id, code, {
      expectedVersion,
      row: roundToCloudRow(normalized)
    });
  } catch (error) {
    if (error?.code === 'VERSION_CONFLICT') {
      error.message = t('This game changed on another phone. Latest scores were loaded.');
    }
    throw error;
  }
  round.totals.cloudVersion = Number(result.row?.version || expectedVersion + 1 || 1);
  replaceRound(round);
}

async function deleteCloudCourse(courseId) {
  if (!hasSupabaseConfig()) return;
  await secureWriteRequest('delete', 'course', courseId, editCodeFor('course', courseId));
}

async function deleteCloudRound(roundOrId) {
  if (!hasSupabaseConfig()) return;
  const round = typeof roundOrId === 'string' ? { id: roundOrId } : normalizeRound(roundOrId);
  const result = await secureWriteRequest('delete', 'round', round.id, gameCode(round));
  return Number(result.deleted || 0);
}

function chooseInitialGame() {
  if (activeGameId && savedRounds.some(round => round.id === activeGameId)) return;
  const playing = savedRounds.find(round => gameStatus(round) === 'playing');
  activeGameId = (playing || savedRounds[0] || {}).id || '';
  if (activeGameId) loadGame(activeGameId, false, false);
}

async function restoreActiveGameAfterCloudSync() {
  if (!activeGameId) {
    chooseInitialGame();
    return;
  }

  const activeRound = savedRounds.find(round => round.id === activeGameId);
  if (!activeRound) {
    isEditing = false;
    chooseInitialGame();
    saveState();
    return;
  }

  if (activeRound.summaryOnly) return;

  if (!isEditing) {
    applyGameToState(activeRound);
    saveState();
    return;
  }

  const owner = editLockOwner(activeRound);
  if (owner && owner !== clientId) {
    isEditing = false;
    applyGameToState(activeRound);
    saveState();
    return;
  }

  const refreshed = replaceRound(withCurrentEditLock(activeRound));
  applyGameToState(refreshed);
  saveState();
  await upsertCloudRound(refreshed);
}

async function syncFromCloud(pushLocal = true, quiet = false) {
  if (!hasSupabaseConfig()) {
    setSyncState({
      ready: false,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: t('Add your Supabase URL and anon key to supabase-config.js.')
    });
    return;
  }

  if (!quiet) {
    setSyncState({
      ready: true,
      busy: true,
      title: t('Sending and loading scorecard data.')
    });
  }

  try {
    await flushPendingCourses();

    const startupCutoff = Date.now() - STARTUP_HISTORY_DAYS * 24 * 60 * 60 * 1000;
    const [cloudCourses, cloudRoundResult] = await Promise.all([
      fetchCloudCourses(),
      fetchCloudRoundSummaries({ fromMs: startupCutoff, includePlaying: true })
    ]);

    customCourses = mergeById(cloudCourses, pendingCourses);
    savedRounds = cloudRoundResult.complete
      ? reconcileRoundSummaries(savedRounds, cloudRoundResult.summaries, round => (
        Number(round.savedAt || 0) >= startupCutoff || gameStatus(round) === 'playing'
      ))
      : mergeRoundSummaries(savedRounds, cloudRoundResult.summaries);
    lastRoundIndexSyncAt = Date.now();
    if (!activeGameId || !savedRounds.some(round => round.id === activeGameId)) chooseInitialGame();
    if (activeGameId && (isEditing || currentView === 'play' || currentView === 'leaderboard')) {
      await ensureRoundFullyLoaded(activeGameId);
    }
    await restoreActiveGameAfterCloudSync();
    saveCoursesLocal();
    saveHistoryLocal();
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: `Supabase room: ${supabaseConfig().syncKey}`,
      lastSyncedAt: Date.now()
    });
    render();
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: error.message
    });
  }
}

async function upsertRoundWithRetry(round) {
  try {
    await upsertCloudRound(round);
    return round;
  } catch (error) {
    if (error?.code !== 'VERSION_CONFLICT') throw error;
    const latest = await fetchCloudRoundById(round.id);
    const owner = editLockOwner(latest);
    if (owner && owner !== clientId) {
      error.code = 'EDIT_OWNER_CHANGED';
      error.latest = latest;
      throw error;
    }
    let rebased = normalizeRound({
      ...round,
      totals: {
        ...round.totals,
        cloudVersion: Math.max(0, Number(latest.totals?.cloudVersion || 0))
      }
    });
    if (gameStatus(round) !== 'playing') rebased.totals.editLock = null;
    else if (isEditing) rebased = withCurrentEditLock(rebased);
    await upsertCloudRound(rebased);
    return rebased;
  }
}

async function flushPendingRoundSync() {
  window.clearTimeout(autoSyncTimer);
  if (editLockRefreshPromise) await editLockRefreshPromise.catch(() => {});
  if (pendingSyncPromise) return pendingSyncPromise;
  if (!pendingSyncRound) return null;
  if (!hasSupabaseConfig()) {
    setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: t('Supabase is not configured.') });
    return null;
  }
  pendingSyncPromise = (async () => {
    while (pendingSyncRound) {
      let round = pendingSyncRound;
      pendingSyncRound = null;
      try {
        if (isEditing && round.id === activeGameId) {
          round = replaceRound(withCurrentEditLock(roundFromState(currentGame())));
        }
        const saved = await upsertRoundWithRetry(round);
        replaceRound(saved);
        if (!pendingSyncRound) savePendingRoundLocal(null);
        else savePendingRoundLocal(pendingSyncRound);
        saveHistoryLocal();
        setSyncState({
          ready: true,
          busy: Boolean(pendingSyncRound),
          ok: true,
          label: t('Cloud sync ok'),
          title: `Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          lastSyncedAt: Date.now()
        });
      } catch (error) {
        if (error?.code === 'EDIT_OWNER_CHANGED' && error.latest) {
          replaceRound(error.latest);
          applyGameToState(error.latest);
          isEditing = false;
          saveState();
          render();
        } else if (!pendingSyncRound) {
          pendingSyncRound = round;
        }
        savePendingRoundLocal(pendingSyncRound || round);
        setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
        break;
      }
    }
  })().finally(() => { pendingSyncPromise = null; });
  return pendingSyncPromise;
}

function scheduleAutoSync(round) {
  if (!round) return;
  pendingSyncRound = round;
  savePendingRoundLocal(round);
  window.clearTimeout(autoSyncTimer);
  if (!hasSupabaseConfig()) {
    setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: t('Supabase is not configured.') });
    return;
  }
  setSyncState({ ready: true, busy: true, title: t('Saving scorecard changes.') });
  autoSyncTimer = window.setTimeout(flushPendingRoundSync, 650);
}

function courseParInputs() {
  return Array.from(document.querySelectorAll('.course-par-input'));
}

function courseIndexInputs() {
  return Array.from(document.querySelectorAll('.course-index-input'));
}

function updateCourseFormTotals() {
  const values = courseParInputs().map(input => Number(input.value) || 0);
  const front = values.slice(0, 9).reduce((sum, par) => sum + par, 0);
  const back = values.slice(9, 18).reduce((sum, par) => sum + par, 0);
  els.frontNineTotal.textContent = front;
  els.backNineTotal.textContent = back;
  els.courseParTotal.textContent = front + back;
}

function renderCourseParInputs(pars = currentCourse().pars, indexes = currentCourse().indexes) {
  els.frontNineList.innerHTML = '';
  els.backNineList.innerHTML = '';
  const indexOptions = Array.from({ length: 18 }, (_, optionIndex) => {
    const value = optionIndex + 1;
    return `<option value="${value}">${value}</option>`;
  }).join('');

  Array.from({ length: 18 }, (_, index) => {
    const row = document.createElement('label');
    row.className = 'par-row';
    const parOptions = Array.from({ length: 10 }, (_, optionIndex) => {
      const value = optionIndex + 1;
      return `<option value="${value}">${value}</option>`;
    }).join('');
    row.innerHTML = `
      <span class="hole-label">${t('Hole {hole}', { hole: index + 1 })}</span>
      <span class="field-label">PAR</span>
      <span class="field-label">${t('Difficulty')}</span>
      <select class="course-par-input" required aria-label="${t('Hole {hole}', { hole: index + 1 })} ${t('Par')}">${parOptions}</select>
      <select class="course-index-input" required aria-label="${t('Hole {hole}', { hole: index + 1 })} ${t('Index')}">${indexOptions}</select>
    `;
    const [parInput, indexInput] = row.querySelectorAll('select');
    parInput.value = pars[index] || 4;
    indexInput.value = String(indexes[index] || 9);
    parInput.addEventListener('input', updateCourseFormTotals);
    parInput.addEventListener('change', updateCourseFormTotals);
    indexInput.addEventListener('change', updateCourseIndexValidation);
    if (index < 9) {
      els.frontNineList.append(row);
    } else {
      els.backNineList.append(row);
    }
  });

  updateCourseFormTotals();
  updateCourseIndexValidation();
}

function updateCourseIndexValidation() {
  const inputs = courseIndexInputs();
  const counts = inputs.reduce((map, input) => {
    const value = Number(input.value);
    if (Number.isInteger(value)) map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map());
  const hasDuplicate = inputs.some(input => counts.get(Number(input.value)) > 1);
  inputs.forEach(input => {
    input.classList.toggle('duplicate-index', counts.get(Number(input.value)) > 1);
  });
  if (els.courseIndexWarning) {
    els.courseIndexWarning.hidden = !hasDuplicate;
    els.courseIndexWarning.textContent = t('Difficulty values cannot repeat.');
  }
  if (els.saveCourseButton) {
    els.saveCourseButton.disabled = hasDuplicate;
  }
  return !hasDuplicate;
}

function courseCountry(course) {
  return String(course.country || '').trim();
}

function courseRegion(course) {
  return String(course.region || '').trim();
}

function courseMatchesAreaFilters(course, country, region) {
  return (!country || courseCountry(course) === country) && (!region || courseRegion(course) === region);
}

function areaForCourse(course) {
  const normalized = normalizeCourse(course);
  return {
    country: courseCountry(normalized) || DEFAULT_COURSE_COUNTRY,
    region: courseRegion(normalized) || DEFAULT_COURSE_REGION
  };
}

function renderAreaCountries(countrySelect, selected = DEFAULT_COURSE_COUNTRY, includeAll = false) {
  countrySelect.innerHTML = (includeAll ? [`<option value="">${t('All countries')}</option>`] : []).concat(COURSE_SEARCH_AREAS
    .map(area => `<option value="${area.country}">${area.country}</option>`)
  ).join('');
  countrySelect.value = COURSE_SEARCH_AREAS.some(area => area.country === selected)
    ? selected
    : (includeAll ? '' : DEFAULT_COURSE_COUNTRY);
}

function renderAreaRegions(countrySelect, regionSelect, selected = DEFAULT_COURSE_REGION, includeAll = false) {
  const area = COURSE_SEARCH_AREAS.find(item => item.country === countrySelect.value) || COURSE_SEARCH_AREAS[0];
  const regions = countrySelect.value ? (area?.regions || []) : [];
  regionSelect.innerHTML = (includeAll ? [`<option value="">${t('All regions')}</option>`] : []).concat(regions
    .map(region => `<option value="${region}">${region}</option>`)
  ).join('');
  regionSelect.value = regions.includes(selected)
    ? selected
    : (regions.includes(DEFAULT_COURSE_REGION) ? DEFAULT_COURSE_REGION : (includeAll ? '' : regions[0] || ''));
}

function renderNewGameCountries(selected = DEFAULT_COURSE_COUNTRY) {
  renderAreaCountries(els.newGameCountry, selected, true);
}

function renderNewGameRegions(selected = DEFAULT_COURSE_REGION) {
  renderAreaRegions(els.newGameCountry, els.newGameRegion, selected, true);
}

function setNewGameArea(country = DEFAULT_COURSE_COUNTRY, region = DEFAULT_COURSE_REGION) {
  renderNewGameCountries(country);
  renderNewGameRegions(region);
}

function renderCourseListCountries(selected = '') {
  renderAreaCountries(els.courseListCountry, selected, true);
}

function renderCourseListRegions(selected = '') {
  renderAreaRegions(els.courseListCountry, els.courseListRegion, selected, true);
}

function ensureCourseListFilters() {
  if (!els.courseListCountry.options.length) {
    renderCourseListCountries('');
    renderCourseListRegions('');
  }
}

function setCourseFormArea(country = DEFAULT_COURSE_COUNTRY, region = DEFAULT_COURSE_REGION) {
  renderAreaCountries(els.newCourseCountry, country, false);
  renderAreaRegions(els.newCourseCountry, els.newCourseRegion, region, false);
}

function renderNewGameCourses(preferredCourseId = state.courseId) {
  const country = els.newGameCountry.value;
  const region = els.newGameRegion.value;
  const courses = allCourses().filter(course => courseMatchesAreaFilters(course, country, region));
  els.newGameCourse.innerHTML = '';
  if (!courses.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = t('No courses for selected filters');
    els.newGameCourse.append(option);
    els.newGameCourse.disabled = true;
    return;
  }
  els.newGameCourse.disabled = false;
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.name;
    els.newGameCourse.append(option);
  });
  els.newGameCourse.value = courses.some(course => course.id === preferredCourseId)
    ? preferredCourseId
    : courses[0].id;
}

async function refreshCurrentCloudRound() {
  if (!activeGameId) return false;
  const remoteRound = await fetchCloudRoundById(activeGameId);
  if (!remoteRound) {
    if (isEditing || pendingSyncRound?.id === activeGameId) return false;
    savedRounds = savedRounds.filter(round => round.id !== activeGameId);
    activeGameId = '';
    chooseInitialGame();
    saveHistoryLocal();
    saveState();
    return true;
  }
  const localRound = savedRounds.find(round => round.id === remoteRound.id);
  const changed = !localRound || JSON.stringify(remoteRound) !== JSON.stringify(localRound);
  if (!changed) return false;
  savedRounds = mergeRounds(savedRounds, [remoteRound]);
  if (!isEditing) {
    applyGameToState(remoteRound);
    saveState();
  }
  saveHistoryLocal();
  return true;
}

async function refreshChangedCloudRounds() {
  const cutoff = Date.now() - STARTUP_HISTORY_DAYS * 24 * 60 * 60 * 1000;
  const { summaries, complete } = await fetchCloudRoundSummaries({ fromMs: cutoff, includePlaying: true });
  const previous = JSON.stringify(savedRounds.map(round => [round.id, round.summaryOnly, round.totals?.cloudVersion, round.totals]));
  savedRounds = complete
    ? reconcileRoundSummaries(savedRounds, summaries, round => (
      Number(round.savedAt || 0) >= cutoff || gameStatus(round) === 'playing'
    ))
    : mergeRoundSummaries(savedRounds, summaries);
  if (!isEditing && activeGameId) {
    const activeRound = savedRounds.find(round => round.id === activeGameId);
    if (activeRound && !activeRound.summaryOnly) {
      applyGameToState(activeRound);
      saveState();
    }
  }
  saveHistoryLocal();
  const next = JSON.stringify(savedRounds.map(round => [round.id, round.summaryOnly, round.totals?.cloudVersion, round.totals]));
  return previous !== next;
}

async function refreshCloudCoursesForSetup(preferredCourseId = state.courseId) {
  if (!hasSupabaseConfig() || document.hidden) return false;
  try {
    const previous = JSON.stringify(customCourses);
    const cloudCourses = await fetchCloudCourses();
    customCourses = mergeById(cloudCourses, pendingCourses);
    saveCoursesLocal();
    if (!els.gameModal.hidden && els.gameForm.dataset.dirty !== 'true') {
      renderNewGameCourses(preferredCourseId);
      renderRecentCourseChoices();
    }
    return previous !== JSON.stringify(customCourses);
  } catch (error) {
    setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
    return false;
  }
}

async function refreshCloudForCurrentView(force = false) {
  if (!cloudRefreshEnabled || !hasSupabaseConfig() || document.hidden || syncState.busy) return;
  if (cloudRefreshPromise) return cloudRefreshPromise;
  cloudRefreshPromise = (async () => {
    let changed = false;
    if (isEditing) {
      if (force || Date.now() - lastEditLockSyncAt >= EDIT_LOCK_REFRESH_MS) {
        lastEditLockSyncAt = Date.now();
        await ensureEditLockStillMine();
      }
      return;
    }
    const activeRound = currentGame();
    const watchingLiveRound = (currentView === 'play' || currentView === 'leaderboard')
      && activeRound
      && gameStatus(activeRound) === 'playing';
    if (watchingLiveRound) {
      if (force || Date.now() - lastLiveRoundSyncAt >= LIVE_ROUND_POLL_MS) {
        lastLiveRoundSyncAt = Date.now();
        changed = await refreshCurrentCloudRound();
      }
    } else if (currentView === 'start' && (force || Date.now() - lastRoundIndexSyncAt >= ROUND_INDEX_POLL_MS)) {
      lastRoundIndexSyncAt = Date.now();
      changed = await refreshChangedCloudRounds();
    } else if (currentView === 'courses' && force) {
      changed = await refreshCloudCoursesForSetup();
    }
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: `Supabase room: ${supabaseConfig().syncKey}`,
      lastSyncedAt: Date.now()
    });
    if (changed) render();
  })().catch(error => {
    setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
  }).finally(() => { cloudRefreshPromise = null; });
  return cloudRefreshPromise;
}

function flipBombIconHtml() {
  return `<span class="flip-bomb-icon" role="img" aria-label="${escapeHtml(t('Bomb'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="14" r="6"/><path d="M14 9l3-3m-1-2 1 2 2-1m-1 3 2 1"/></svg></span>`;
}

function recentGameCourses() {
  const ids = [state.courseId, ...savedRounds.map(round => round.courseId)].filter(Boolean);
  const seen = new Set();
  return ids.map(id => allCourses().find(course => course.id === id))
    .filter(course => course && !seen.has(course.id) && seen.add(course.id))
    .slice(0, 3);
}

function renderRecentCourseChoices() {
  const courses = recentGameCourses();
  if (!els.recentCourseBlock || !els.recentCourseChoices) return;
  els.recentCourseBlock.hidden = !courses.length;
  els.recentCourseChoices.innerHTML = courses.map(course => `<button type="button" data-recent-course="${escapeHtml(course.id)}">${escapeHtml(course.name)}</button>`).join('');
}

function renderCourseSearchCountries() {
  const countryOptions = [`<option value="">${t('All countries')}</option>`]
    .concat(COURSE_SEARCH_AREAS.map(area => `<option value="${area.country}">${area.country}</option>`));
  els.courseSearchCountry.innerHTML = countryOptions.join('');
  els.courseSearchCountry.value = COURSE_SEARCH_AREAS.some(area => area.country === DEFAULT_COURSE_COUNTRY)
    ? DEFAULT_COURSE_COUNTRY
    : '';
  renderCourseSearchRegions();
  if (els.courseSearchCountry.value === DEFAULT_COURSE_COUNTRY) {
    els.courseSearchRegion.value = DEFAULT_COURSE_REGION;
  }
}

function renderCourseSearchRegions() {
  const area = COURSE_SEARCH_AREAS.find(item => item.country === els.courseSearchCountry.value);
  const options = [`<option value="">${t('All regions')}</option>`]
    .concat(area ? area.regions.map(region => `<option value="${region}">${region}</option>`) : []);
  els.courseSearchRegion.innerHTML = options.join('');
}

function setCourseSearchMode(mode) {
  courseSearchMode = mode;
  els.courseSearchModes.forEach(button => {
    button.classList.toggle('active', button.dataset.courseSearchMode === mode);
  });
  const isManual = mode === 'manual';
  els.courseSearchSubmit.textContent = t(isManual ? 'Add manually' : 'Search');
  els.courseSearchStatus.textContent = t(mode === 'api'
    ? 'Search courses in North America, then add one to your courses.'
    : (isManual ? 'Enter a course name to add it manually.' : 'Search OpenStreetMap / Overpass, then use a result to add a course.'));
  els.courseSearchResults.innerHTML = '';
}

function openCourseModal(prefill = '') {
  const options = typeof prefill === 'object' && prefill !== null ? prefill : { name: String(prefill || '') };
  const prefillName = String(options.name || '');
  els.courseForm.reset();
  editingCourseId = '';
  setCourseFormArea(options.country || DEFAULT_COURSE_COUNTRY, options.region || DEFAULT_COURSE_REGION);
  renderCourseParInputs(
    Array.isArray(options.pars) && options.pars.length === 18 ? options.pars : Array.from({ length: 18 }, () => 4),
    Array.isArray(options.indexes) && options.indexes.length === 18 ? options.indexes : Array.from({ length: 18 }, (_, index) => index + 1)
  );
  els.courseModalEyebrow.textContent = t('New Course');
  document.querySelector('#courseModal h2').textContent = t('Add Course');
  els.courseForm.querySelector('button[type="submit"]').textContent = t('Save Course');
  els.newCourseCode.disabled = false;
  if (prefillName) els.newCourseName.value = prefillName;
  els.courseModal.hidden = false;
  (prefillName ? els.newCourseCode : els.newCourseName).focus();
}

function openCourseSearchModal() {
  els.courseSearchForm.reset();
  renderCourseSearchCountries();
  setCourseSearchMode('shared');
  els.courseSearchResults.innerHTML = '';
  els.courseSearchSubmit.disabled = false;
  els.courseSearchModal.hidden = false;
  els.courseSearchInput.focus();
}

function closeCourseSearchModal() {
  els.courseSearchModal.hidden = true;
  els.courseSearchForm.reset();
  els.courseSearchResults.innerHTML = '';
}

function courseSearchName(result) {
  if (result?.pars && result?.name) return result.name;
  const club = String(result?.club_name || result?.clubName || '').trim();
  const course = String(result?.course_name || result?.courseName || result?.name || '').trim();
  if (club && course && club !== course) return `${club} - ${course}`;
  return course || club || String(result?.display_name || '').split(',')[0] || t('Course');
}

function courseSearchClubName(result) {
  return String(result?.club_name || result?.clubName || result?.club || courseSearchName(result)).trim();
}

function courseSearchCourseName(result) {
  return String(result?.course_name || result?.courseName || result?.course || result?.name || courseSearchName(result)).trim();
}

function courseSearchAddress(result) {
  const address = result?.location || result?.address || {};
  return [
    address.city || address.town || address.village || address.municipality || address.county,
    address.state || address.region || address.province,
    address.country || result?.country
  ].filter(Boolean).join(', ') || String(result?.display_name || '');
}

function courseSearchId(result) {
  return result?.id || result?.course_id || result?.courseId;
}

function isAppCourseResult(result) {
  return Array.isArray(result?.pars) && Array.isArray(result?.indexes);
}

function textMatches(value, query) {
  return String(value || '').toLowerCase().includes(String(query || '').trim().toLowerCase());
}

function overpassString(value) {
  return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function overpassRegex(value) {
  return overpassString(String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
}

function courseMatchesArea(result, country, region) {
  const address = result?.location || result?.address || {};
  const countryText = String(address.country || result?.country || '').toLowerCase();
  const regionText = String(address.state || address.region || address.province || address.city || address.county || result?.region || '').toLowerCase();
  const expectedCountry = String(country || '').trim().toLowerCase();
  const expectedRegion = String(region || '').trim().toLowerCase();
  return (!expectedCountry || countryText.includes(expectedCountry)) && (!expectedRegion || regionText.includes(expectedRegion));
}

function sharedCourseSearchText(course) {
  return [course.name, course.country, course.region, course.club, course.course].filter(Boolean).join(' ');
}

function osmElementName(element) {
  const tags = element?.tags || {};
  return tags.name || tags['name:en'] || tags.operator || tags.brand || t('Course');
}

function osmElementAddress(element, fallbackCountry, fallbackRegion) {
  const tags = element?.tags || {};
  return [
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:municipality'],
    tags['addr:state'] || tags['addr:province'] || fallbackRegion,
    tags['addr:country'] || fallbackCountry
  ].filter(Boolean).join(', ');
}

function osmCourseResult(element, country, region) {
  const tags = element?.tags || {};
  const name = osmElementName(element);
  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    club: tags.operator || tags.club || name,
    course: name,
    country: country || tags['addr:country'] || '',
    region: region || tags['addr:state'] || tags['addr:province'] || '',
    display_name: osmElementAddress(element, country, region),
    location: {
      city: tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || '',
      state: tags['addr:state'] || tags['addr:province'] || region || '',
      country: tags['addr:country'] || country || '',
      latitude: element.lat || element.center?.lat || '',
      longitude: element.lon || element.center?.lon || ''
    }
  };
}

function nominatimCourseResult(row, country, region) {
  const address = row?.address || {};
  const name = row?.namedetails?.name || row?.name || String(row?.display_name || '').split(',')[0] || t('Course');
  return {
    id: `nominatim-${row?.osm_type || 'place'}-${row?.osm_id || name}`,
    name,
    club: name,
    course: name,
    country: country || address.country || '',
    region: region || address.state || address.region || address.county || '',
    display_name: row?.display_name || [address.city || address.town || address.village, address.state || region, address.country || country].filter(Boolean).join(', '),
    location: {
      city: address.city || address.town || address.village || address.municipality || '',
      state: address.state || address.region || address.county || region || '',
      country: address.country || country || '',
      latitude: row?.lat || '',
      longitude: row?.lon || ''
    }
  };
}

function isNominatimGolfCourse(row) {
  const category = String(row?.category || row?.class || '').toLowerCase();
  const type = String(row?.type || '').toLowerCase();
  return category === 'leisure' && type === 'golf_course';
}

async function searchNominatimCourses({ courseName, country, region }) {
  const name = String(courseName || '').trim();
  const baseTerms = name
    ? [[name, 'Golf Club'], [name, 'golf course'], [name]]
    : [['golf course'], ['golf club']];
  const queries = baseTerms
    .map(parts => parts.concat([region, country]))
    .map(parts => parts.filter(Boolean).join(' '))
    .filter((query, index, list) => query && list.indexOf(query) === index);
  const unique = new Map();
  for (const query of queries) {
    const params = new URLSearchParams({
      format: 'jsonv2',
      addressdetails: '1',
      namedetails: '1',
      limit: '10',
      q: query
    });
    const response = await fetch(`${NOMINATIM_API_URL}?${params.toString()}`);
    if (!response.ok) continue;
    const rows = await response.json();
    rows
      .filter(isNominatimGolfCourse)
      .map(row => nominatimCourseResult(row, country, region))
      .forEach(result => {
        if (!unique.has(result.id)) unique.set(result.id, result);
      });
    if (unique.size) break;
  }
  return Array.from(unique.values());
}

function overpassAreaQuery(country, region) {
  const countryText = overpassString(country);
  const regionText = overpassString(region);
  if (!countryText) return '';
  const countryArea = `(
  area["boundary"="administrative"]["admin_level"="2"]["name"="${countryText}"];
  area["boundary"="administrative"]["admin_level"="2"]["name:en"="${countryText}"];
)->.countryArea;`;
  if (!regionText) return `${countryArea}
.countryArea->.searchArea;`;
  return `${countryArea}
(
  area(area.countryArea)["boundary"="administrative"]["name"="${regionText}"];
  area(area.countryArea)["boundary"="administrative"]["name:en"="${regionText}"];
)->.searchArea;`;
}

function overpassGolfSelectors(scope, courseName) {
  const areaScope = scope ? '(area.searchArea)' : '';
  const searchRegex = courseName ? overpassRegex(courseName) : '';
  const courseFilters = courseName
    ? [
        `["name"~"${searchRegex}",i]`,
        `["name:en"~"${searchRegex}",i]`,
        `["alt_name"~"${searchRegex}",i]`,
        `["addr:city"~"${searchRegex}",i]`,
        `["addr:town"~"${searchRegex}",i]`,
        `["addr:village"~"${searchRegex}",i]`
      ]
    : [''];
  const lines = [];
  courseFilters.forEach(filter => {
    lines.push(`  nwr["leisure"="golf_course"]${filter}${areaScope};`);
    lines.push(`  nwr["golf"="course"]${filter}${areaScope};`);
  });
  if (courseName) {
    lines.push(`  nwr["sport"="golf"]["name"~"${searchRegex}",i]${areaScope};`);
    lines.push(`  nwr["sport"="golf"]["name:en"~"${searchRegex}",i]${areaScope};`);
  } else {
    lines.push(`  nwr["sport"="golf"]["name"]${areaScope};`);
  }
  return `
${lines.join('\n')}`;
}

function buildOverpassQuery({ courseName, country, region }) {
  const hasArea = Boolean(country);
  return `[out:json][timeout:25];
${overpassAreaQuery(country, region)}
(
${overpassGolfSelectors(hasArea, courseName)}
);
out tags center 50;`;
}

async function fetchOverpassEndpoint(url, query) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: new URLSearchParams({ data: query }),
      signal: controller.signal
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || response.statusText);
    }
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function overpassRequest(query) {
  let lastError = null;
  for (const url of OVERPASS_API_URLS) {
    try {
      return await fetchOverpassEndpoint(url, query);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('OpenStreetMap search failed');
}

async function searchOnlineCourses({ courseName, country, region }) {
  const name = String(courseName || '').trim();
  if (!name && !country) {
    return { results: [], needsFilter: true };
  }
  if (name || country) {
    const nominatimResults = await searchNominatimCourses({ courseName: name, country, region });
    if (nominatimResults.length) {
      return {
        results: nominatimResults
          .sort((a, b) => courseSearchName(a).localeCompare(courseSearchName(b)))
          .slice(0, 40),
        needsFilter: false
      };
    }
  }
  let data = await overpassRequest(buildOverpassQuery({ courseName: name, country, region }));
  let rows = Array.isArray(data?.elements) ? data.elements : [];
  if (!rows.length && country && region) {
    data = await overpassRequest(buildOverpassQuery({ courseName: name, country, region: '' }));
    rows = Array.isArray(data?.elements) ? data.elements : [];
  }
  if (!rows.length && name && country) {
    data = await overpassRequest(buildOverpassQuery({ courseName: name, country: '', region: '' }));
    rows = Array.isArray(data?.elements) ? data.elements : [];
  }
  const unique = new Map();
  rows.forEach(row => {
    const result = osmCourseResult(row, country, region);
    if (!unique.has(result.id)) unique.set(result.id, result);
  });
  const results = Array.from(unique.values())
    .sort((a, b) => courseSearchName(a).localeCompare(courseSearchName(b)))
    .slice(0, 40);
  return { results, needsFilter: false };
}

async function searchGolfCourses({ courseName, country, region }) {
  if (!hasGolfCourseApiConfig()) throw new Error('GolfCourseAPI key is missing');
  const config = golfCourseApiConfig();
  const name = String(courseName || '').trim();
  const resultLimit = country || region ? 20 : 30;
  const searches = name
    ? [name, `${name} golf`, `${name} golf course`]
    : ['golf'];
  const queries = [...new Set(searches.length ? searches : ['golf'])];
  const unique = new Map();
  for (const searchQuery of queries) {
    const data = await golfCourseApiRequest(config.searchPath, { search_query: searchQuery });
    const rows = Array.isArray(data) ? data : (Array.isArray(data?.courses) ? data.courses : []);
    rows.forEach(row => {
      const key = String(courseSearchId(row) || courseSearchName(row));
      if (!unique.has(key)) unique.set(key, row);
    });
    if (unique.size >= resultLimit || (unique.size && name)) break;
  }
  const results = Array.from(unique.values());
  const filtered = (country || region) ? results.filter(row => courseMatchesArea(row, country, region)) : results;
  return {
    results: filtered.slice(0, resultLimit),
    filterFallback: false
  };
}

async function fetchGolfCourseDetail(result) {
  const id = courseSearchId(result);
  if (!id) return result;
  const config = golfCourseApiConfig();
  const path = config.coursePathTemplate.replace('{id}', encodeURIComponent(id));
  try {
    return await golfCourseApiRequest(path);
  } catch {
    return result;
  }
}

function numberFrom(value) {
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function readHolePar(hole) {
  return numberFrom(hole?.par ?? hole?.Par ?? hole?.hole_par);
}

function readHoleIndex(hole) {
  return numberFrom(hole?.handicap ?? hole?.hcp ?? hole?.index ?? hole?.stroke_index ?? hole?.strokeIndex ?? hole?.handicap_index ?? hole?.handicapIndex ?? hole?.hole_handicap);
}

function holeNumber(hole, fallback) {
  return numberFrom(hole?.hole ?? hole?.hole_number ?? hole?.number ?? hole?.Hole) || fallback;
}

function findScorecardHoles(value, depth = 0) {
  if (!value || depth > 6) return null;
  if (Array.isArray(value)) {
    const holeRows = value.filter(item => item && typeof item === 'object' && readHolePar(item));
    if (holeRows.length >= 18) return holeRows.slice(0, 18);
    for (const item of value) {
      const found = findScorecardHoles(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === 'object') {
    const preferredKeys = ['holes', 'scorecard', 'tee_boxes', 'teeBoxes', 'tees', 'male', 'female'];
    for (const key of preferredKeys) {
      const found = findScorecardHoles(value[key], depth + 1);
      if (found) return found;
    }
    for (const item of Object.values(value)) {
      const found = findScorecardHoles(item, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function findPreferredTee(course) {
  const root = course?.course || course;
  const tees = root?.tees || {};
  const candidates = []
    .concat(Array.isArray(tees.male) ? tees.male : [])
    .concat(Array.isArray(tees.female) ? tees.female : [])
    .concat(Array.isArray(root?.tee_boxes) ? root.tee_boxes : [])
    .concat(Array.isArray(root?.teeBoxes) ? root.teeBoxes : []);
  return candidates.find(tee => Array.isArray(tee?.holes) && tee.holes.length >= 18);
}

function scorecardFromApiCourse(course) {
  const preferredTee = findPreferredTee(course);
  const holes = preferredTee?.holes || findScorecardHoles(course);
  if (!holes) return null;
  const ordered = holes
    .map((hole, index) => ({ hole, number: holeNumber(hole, index + 1) }))
    .sort((a, b) => a.number - b.number)
    .slice(0, 18)
    .map(item => item.hole);
  const pars = ordered.map(readHolePar);
  const indexes = ordered.map(readHoleIndex);
  if (pars.length !== 18 || pars.some(par => !Number.isInteger(par) || par < 1 || par > 10)) return null;
  if (indexes.length !== 18 || indexes.some(index => !Number.isInteger(index) || index < 1 || index > 18)) {
    return { pars, indexes: Array.from({ length: 18 }, (_, index) => index + 1) };
  }
  return { pars, indexes };
}

function useSharedCourse(course) {
  const normalized = normalizeCourse(course);
  closeCourseSearchModal();
  openCourseModal({
    name: normalized.name,
    country: normalized.country || DEFAULT_COURSE_COUNTRY,
    region: normalized.region || DEFAULT_COURSE_REGION,
    pars: normalized.pars,
    indexes: normalized.indexes
  });
}

function renderCourseSearchResults(results, mode = courseSearchMode) {
  els.courseSearchResults.innerHTML = '';
  if (!results.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <p></p>
      <button type="button"></button>
    `;
    empty.querySelector('p').textContent = t(mode === 'shared'
      ? 'No courses found in online database.'
      : 'No courses found in GolfCourseAPI. You can add it manually.');
    const addManual = empty.querySelector('button');
    addManual.textContent = t('Add manually');
    addManual.addEventListener('click', () => {
      const name = els.courseSearchInput.value.trim();
      closeCourseSearchModal();
      openCourseModal(name);
    });
    els.courseSearchResults.append(empty);
    return;
  }
  let currentClub = '';
  results.forEach(result => {
    const clubName = courseSearchClubName(result);
    if (clubName !== currentClub) {
      currentClub = clubName;
      const heading = document.createElement('div');
      heading.className = 'search-group-title';
      heading.textContent = clubName;
      els.courseSearchResults.append(heading);
    }
    const row = document.createElement('div');
    row.className = 'search-result';
    row.innerHTML = `
      <div>
        <strong></strong>
        <span></span>
      </div>
      <button type="button"></button>
    `;
    const name = courseSearchName(result);
    const courseName = courseSearchCourseName(result);
    const address = courseSearchAddress(result);
    row.querySelector('strong').textContent = courseName;
    row.querySelector('span').textContent = address ? `${clubName} | ${address}` : clubName;
    const button = row.querySelector('button');
    button.textContent = t(mode === 'shared' || isAppCourseResult(result) ? 'Use' : 'Add');
    button.addEventListener('click', async () => {
      if (mode === 'shared' || isAppCourseResult(result)) {
        useSharedCourse(normalizeCourse(result));
        return;
      }
      button.disabled = true;
      els.courseSearchStatus.textContent = t('Loading course scorecard...');
      const detail = await fetchGolfCourseDetail(result);
      const scorecard = scorecardFromApiCourse(detail);
      if (!scorecard) {
        button.disabled = false;
        els.courseSearchStatus.textContent = t('Could not read PAR and INDEX from this course.');
        return;
      }
      closeCourseSearchModal();
      openCourseModalFromApi(name, scorecard.pars, scorecard.indexes, detail || result);
    });
    els.courseSearchResults.append(row);
  });
}

function openCourseModalFromApi(name, pars, indexes, result = {}) {
  const address = result?.location || result?.address || {};
  openCourseModal({
    name,
    country: address.country || result?.country || DEFAULT_COURSE_COUNTRY,
    region: address.state || address.region || address.province || result?.region || DEFAULT_COURSE_REGION,
    pars,
    indexes
  });
}

function openEditCourseModal(course) {
  const normalized = normalizeCourse(course);
  editingCourseId = normalized.id;
  els.courseForm.reset();
  els.newCourseName.value = normalized.name;
  const area = areaForCourse(normalized);
  setCourseFormArea(area.country, area.region);
  els.newCourseCode.value = normalized.editCode || '';
  els.newCourseCode.disabled = true;
  renderCourseParInputs(normalized.pars, normalized.indexes);
  els.courseModalEyebrow.textContent = t('Edit Course');
  document.querySelector('#courseModal h2').textContent = t('Edit Course');
  els.courseForm.querySelector('button[type="submit"]').textContent = t('Save Changes');
  els.courseModal.hidden = false;
  els.newCourseName.focus();
}

function closeCourseModal() {
  els.courseModal.hidden = true;
  els.courseForm.reset();
  editingCourseId = '';
  els.newCourseCode.disabled = false;
  els.newCourseCountry.disabled = false;
  els.newCourseRegion.disabled = false;
  if (els.courseIndexWarning) els.courseIndexWarning.hidden = true;
  if (els.saveCourseButton) els.saveCourseButton.disabled = false;
}

function updateGameTypeFields() {
  const isLandlord = els.newGameType.value === 'landlord';
  if (isLandlord) {
    els.newLandlordPlayerCount.value = els.newLandlordPlayerCount.dataset.landlordValue || els.newLandlordPlayerCount.value || '3';
  } else {
    els.newLandlordPlayerCount.dataset.landlordValue = els.newLandlordPlayerCount.value || '3';
    els.newLandlordPlayerCount.value = '4';
  }
  document.querySelector('.teams-grid')?.classList.toggle('landlord-mode', isLandlord);
  document.querySelectorAll('.teams-grid .team-card > h3').forEach(heading => { heading.hidden = isLandlord; });
  document.querySelectorAll('.landlord-setup').forEach(element => { element.hidden = !isLandlord; });
  const playerCount = isLandlord ? Number(els.newLandlordPlayerCount.value || 3) : 4;
  document.querySelectorAll('.player-four-setup').forEach(element => {
    element.hidden = playerCount !== 4 || (element.classList.contains('landlord-setup') && !isLandlord);
  });
  els.newPlayerB2.required = playerCount === 4;
  els.newHandicapB2.required = playerCount === 4;
  renderBestPeasantCountOptions(playerCount);
  els.newGameBirdieFlip.closest('.option-with-hint').hidden = isLandlord;
  const fixedMode = isLandlord && els.newLandlordMode?.value === 'fixed';
  document.querySelector('.fixed-landlord-player')?.toggleAttribute('hidden', !fixedMode);
  renderFixedLandlordPlayers();
  document.querySelector('.vegas-player-note')?.toggleAttribute('hidden', isLandlord);
  document.querySelectorAll('[data-select-target="newLandlordPlayerCount"] button').forEach(button => {
    button.disabled = !isLandlord;
    button.hidden = !isLandlord && button.dataset.value !== '4';
  });
  syncSegmentedControls();
}

function syncSegmentedControls(root = document) {
  const groups = [
    ...(root.matches?.('[data-select-target]') ? [root] : []),
    ...root.querySelectorAll('[data-select-target]')
  ];
  groups.forEach(group => {
    const select = document.getElementById(group.dataset.selectTarget);
    if (!select) return;
    group.querySelectorAll('button[data-value]').forEach(button => {
      const selected = button.dataset.value === select.value;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  });
}

function renderBestPeasantCountOptions(playerCount) {
  if (!els.newLandlordBestPeasantCount) return;
  const maxCount = Math.max(1, Number(playerCount) - 1);
  const previousMax = Math.max(0, Number(els.newLandlordBestPeasantCount.dataset.maxCount) || 0);
  const current = Number(els.newLandlordBestPeasantCount.value) || maxCount;
  const selected = previousMax && current === previousMax
    ? maxCount
    : Math.max(1, Math.min(maxCount, current));
  els.newLandlordBestPeasantCount.innerHTML = Array.from({ length: maxCount }, (_, index) => {
    const value = index + 1;
    return `<option value="${value}">${value}</option>`;
  }).join('');
  els.newLandlordBestPeasantCount.value = String(selected);
  els.newLandlordBestPeasantCount.dataset.maxCount = String(maxCount);
  const countSegments = document.querySelector('#bestPackCountSegments');
  if (countSegments) countSegments.innerHTML = Array.from({ length: maxCount }, (_, index) => {
    const value = index + 1;
    return `<button type="button" data-value="${value}">${t('{count} Pack player scores', { count: value })}</button>`;
  }).join('');
  const example = document.querySelector('#landlordComparisonExample');
  if (example) example.innerHTML = `
    <span>${escapeHtml(t('Wolf: 5 strokes × {count} players = {total}', { count: selected, total: 5 * selected }))}</span>
    <span>${escapeHtml(t('Pack: add the best {count} player scores', { count: selected }))}</span>
    <strong>${escapeHtml(t('The side with fewer strokes wins'))}</strong>
  `;
  syncSegmentedControls(countSegments || document);
}

function gameFormPlayers() {
  return [els.newPlayerA1, els.newPlayerA2, els.newPlayerB1, els.newPlayerB2]
    .map((input, index) => input.value.trim() || `Player ${index + 1}`);
}

function renderFixedLandlordPlayers() {
  if (!els.newFixedLandlordPlayer) return;
  const selected = els.newFixedLandlordPlayer.value;
  const playerCount = Number(els.newLandlordPlayerCount?.value || 3) === 4 ? 4 : 3;
  els.newFixedLandlordPlayer.innerHTML = gameFormPlayers().slice(0, playerCount)
    .map((player, index) => `<option value="${index}">${escapeHtml(player)}</option>`)
    .join('');
  els.newFixedLandlordPlayer.value = String(Math.min(playerCount - 1, Math.max(0, Number(selected) || 0)));
}

function renderGameReview() {
  if (!els.gameReview) return;
  const isLandlord = els.newGameType.value === 'landlord';
  const playerCount = isLandlord && Number(els.newLandlordPlayerCount.value) === 3 ? 3 : 4;
  const players = gameFormPlayers().slice(0, playerCount);
  const handicaps = [els.newHandicapA1, els.newHandicapA2, els.newHandicapB1, els.newHandicapB2]
    .slice(0, playerCount).map(input => Number(input.value) || 0);
  const course = allCourses().find(item => item.id === els.newGameCourse.value);
  const fixedIndex = Math.min(playerCount - 1, Math.max(0, Number(els.newFixedLandlordPlayer?.value) || 0));
  const rows = [
    [t('Course'), course?.name || '--'],
    [t('Tee time'), els.newGameTeeTime.value.replace('T', ' ') || '--'],
    [t('Game type'), t(isLandlord ? 'Fight the Landlord' : 'Las Vegas')],
    [t('Scoring Mode'), t(els.newGameScoreMode.value === 'net' ? 'Net' : 'Gross')],
    [t('Players'), players.map((player, index) => `${player} (HCP ${handicaps[index]})`).join(' · ')]
  ];
  if (isLandlord) {
    rows.push([t('Wolf selection'), t(els.newLandlordMode.value === 'fixed' ? 'Fixed Wolf' : 'Rotating Wolf')]);
    if (els.newLandlordMode.value === 'fixed') rows.push([t('Fixed Wolf'), players[fixedIndex]]);
    rows.push([t('Best Pack scores'), els.newLandlordBestPeasantCount.value]);
    rows.push([t('When tied'), t(tieOutcomeLabel(els.newLandlordTieOutcome.value))]);
  }
  els.gameReview.innerHTML = rows.map(([label, value]) => `<div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`).join('');
}

function showGameWizardStep(step) {
  gameWizardStep = Math.max(1, Math.min(4, Number(step) || 1));
  document.querySelectorAll('[data-game-step]').forEach(section => {
    section.hidden = Number(section.dataset.gameStep) !== gameWizardStep;
  });
  const labels = [t('Course'), t('Game rules'), t('Players and handicaps'), t('Review')];
  if (els.gameWizardProgress) els.gameWizardProgress.innerHTML = labels.map((label, index) => `<span class="${index + 1 === gameWizardStep ? 'active' : (index + 1 < gameWizardStep ? 'done' : '')}">${index + 1}<small>${escapeHtml(label)}</small></span>`).join('');
  els.gameWizardBack.hidden = gameWizardStep === 1;
  els.gameWizardNext.hidden = gameWizardStep === 4;
  els.gameWizardSave.hidden = gameWizardStep !== 4;
  if (gameWizardStep === 4) renderGameReview();
}

function validateGameWizardStep() {
  if (gameWizardStep === 3 && !validateUniqueNewGamePlayers()) return false;
  const section = document.querySelector(`[data-game-step="${gameWizardStep}"]`);
  const required = Array.from(section?.querySelectorAll('input[required], select[required]') || [])
    .filter(input => !input.closest('[hidden]'));
  const invalid = required.find(input => !input.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    return false;
  }
  return true;
}

function activeNewGamePlayerInputs() {
  const inputs = [els.newPlayerA1, els.newPlayerA2, els.newPlayerB1, els.newPlayerB2];
  const count = els.newGameType.value === 'landlord' && Number(els.newLandlordPlayerCount.value) === 3 ? 3 : 4;
  return inputs.slice(0, count);
}

function validateUniqueNewGamePlayers() {
  const seen = new Set();
  for (const input of activeNewGamePlayerInputs()) {
    input.setCustomValidity('');
    const key = input.value.trim().toLocaleLowerCase();
    if (key && seen.has(key)) {
      input.setCustomValidity(t('Each player can only be selected once.'));
      input.reportValidity();
      return false;
    }
    if (key) seen.add(key);
  }
  return true;
}

function renderPlayerHistoryOptions() {
  const profiles = historicalPlayerProfiles();
  const options = Array.from(profiles.values())
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(profile => `<option value="${escapeHtml(profile.name)}">${escapeHtml(profile.name)} · HCP ${profile.handicap}</option>`)
    .join('');
  [
    els.historyPlayerA1,
    els.historyPlayerA2,
    els.historyPlayerB1,
    els.historyPlayerB2
  ].forEach(select => {
    if (!select) return;
    select.innerHTML = options;
    const menu = select.closest('.player-name-picker')?.querySelector('.history-player-menu');
    if (menu) {
      const currentInput = select.closest('.player-name-picker')?.querySelector('input');
      const currentKey = String(currentInput?.value || '').trim().toLocaleLowerCase();
      const selectedElsewhere = new Set(activeNewGamePlayerInputs()
        .filter(input => input !== currentInput)
        .map(input => input.value.trim().toLocaleLowerCase())
        .filter(Boolean));
      menu.innerHTML = Array.from(profiles.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(profile => {
          const key = profile.name.trim().toLocaleLowerCase();
          const disabled = key !== currentKey && selectedElsewhere.has(key);
          return `<button type="button" data-player-name="${escapeHtml(profile.name)}"${disabled ? ' disabled aria-disabled="true"' : ''}><strong>${escapeHtml(profile.name)}</strong><small>HCP ${profile.handicap}</small></button>`;
        })
        .join('');
    }
  });
}

function closeHistoricalPlayerMenus(except = null) {
  document.querySelectorAll('.history-player-menu').forEach(menu => {
    if (menu !== except) menu.hidden = true;
  });
}

function historicalPlayerProfiles() {
  const profiles = new Map();
  savedRounds.forEach(round => {
    const handicaps = normalizeHandicaps(round.handicaps || round.totals?.handicaps);
    const timestamp = Date.parse(round.totals?.teeTime || round.savedAt || 0) || 0;
    round.players?.forEach((name, index) => {
      const value = String(name || '').trim();
      if (!value) return;
      const key = value.toLocaleLowerCase();
      const existing = profiles.get(key);
      if (existing && existing.timestamp > timestamp) return;
      profiles.set(key, {
        name: value,
        handicap: handicaps[index] || 0,
        timestamp
      });
    });
  });
  return profiles;
}

function fillHistoricalPlayerHandicap(playerInput, handicapInput) {
  const key = String(playerInput.value || '').trim().toLocaleLowerCase();
  if (!key) return;
  const profile = historicalPlayerProfiles().get(key);
  if (!profile) return;
  playerInput.value = profile.name;
  handicapInput.value = String(profile.handicap);
}

function openGameModal() {
  overlayReturnFocus = document.activeElement;
  els.gameForm.reset();
  editingGameInfoId = '';
  const preferredCourse = allCourses().find(course => course.id === state.courseId);
  const preferredArea = preferredCourse ? areaForCourse(preferredCourse) : { country: DEFAULT_COURSE_COUNTRY, region: DEFAULT_COURSE_REGION };
  setNewGameArea(preferredArea.country, preferredArea.region);
  renderNewGameCourses(state.courseId);
  renderRecentCourseChoices();
  els.newGameBirdieFlip.checked = true;
  els.newGameScoreMode.value = 'net';
  els.newGameType.value = 'vegas';
  els.newGameType.disabled = false;
  els.newLandlordPlayerCount.value = '3';
  els.newLandlordPlayerCount.dataset.landlordValue = '3';
  els.newLandlordBestPeasantCount.value = '2';
  els.newLandlordTieOutcome.value = 'draw';
  els.newLandlordMode.value = 'rotating';
  els.newFixedLandlordPlayer.value = '0';
  els.newGameTeeTime.value = dateTimeInputValue(new Date());
  els.newPlayerA1.value = 'Player 1';
  els.newPlayerA2.value = 'Player 2';
  els.newPlayerB1.value = 'Player 3';
  els.newPlayerB2.value = 'Player 4';
  [els.newHandicapA1, els.newHandicapA2, els.newHandicapB1, els.newHandicapB2].forEach(input => {
    input.value = '0';
  });
  els.newGameCode.disabled = false;
  document.querySelector('#gameModal h2').textContent = t('New Game');
  els.gameForm.querySelector('button[type="submit"]').textContent = t('Start Game');
  renderPlayerHistoryOptions();
  updateGameTypeFields();
  showGameWizardStep(1);
  els.gameModal.hidden = false;
  els.gameForm.dataset.dirty = 'false';
  refreshCloudCoursesForSetup(state.courseId);
  els.newGameCountry.focus();
}

function openEditGameInfoModal(round) {
  const normalized = normalizeRound(round);
  editingGameInfoId = normalized.id;
  els.gameForm.reset();
  const course = allCourses().find(item => item.id === normalized.courseId) || currentCourse();
  const area = areaForCourse(course);
  setNewGameArea(area.country, area.region);
  renderNewGameCourses(normalized.courseId);
  renderRecentCourseChoices();
  els.newGameBirdieFlip.checked = normalized.underParFlip;
  els.newGameScoreMode.value = normalized.scoreMode;
  els.newGameType.value = normalized.gameType;
  els.newGameType.disabled = true;
  els.newLandlordPlayerCount.value = String(normalized.landlord.playerCount);
  els.newLandlordPlayerCount.dataset.landlordValue = String(normalized.landlord.playerCount);
  els.newLandlordBestPeasantCount.value = String(normalized.landlord.bestPeasantCount);
  els.newLandlordTieOutcome.value = normalized.landlord.tieOutcome;
  els.newLandlordMode.value = normalized.landlord.selectionMode;
  els.newGameTeeTime.value = normalized.totals.teeTime || dateTimeInputValue(new Date(normalized.savedAt));
  els.newPlayerA1.value = normalized.players[0];
  els.newPlayerA2.value = normalized.players[1];
  els.newPlayerB1.value = normalized.players[2];
  els.newPlayerB2.value = normalized.players[3] || '';
  [els.newHandicapA1, els.newHandicapA2, els.newHandicapB1, els.newHandicapB2].forEach((input, index) => {
    input.value = normalized.handicaps[index] || 0;
  });
  els.newGameCode.value = normalized.totals.editCode || '';
  els.newGameCode.disabled = true;
  document.querySelector('#gameModal h2').textContent = t('Edit Info');
  els.gameForm.querySelector('button[type="submit"]').textContent = t('Save Changes');
  renderPlayerHistoryOptions();
  updateGameTypeFields();
  els.newFixedLandlordPlayer.value = String(normalized.landlord.fixedLandlordIndex);
  showGameWizardStep(1);
  els.gameModal.hidden = false;
  els.gameForm.dataset.dirty = 'false';
  els.newGameCountry.focus();
}

function closeGameModal() {
  els.gameModal.hidden = true;
  els.gameForm.reset();
  editingGameInfoId = '';
  els.newGameCode.disabled = false;
  els.newGameType.disabled = false;
}

function readCourseFormPars() {
  return courseParInputs().map(input => Number(input.value));
}

function readCourseFormIndexes() {
  return courseIndexInputs().map(input => Number(input.value));
}

function indexesAreValid(indexes) {
  const seen = new Set();
  return indexes.length === 18 && indexes.every(value => {
    const valid = Number.isInteger(value) && value >= 1 && value <= 18 && !seen.has(value);
    seen.add(value);
    return valid;
  });
}

function parseScore(value) {
  const score = Number(value);
  return Number.isInteger(score) && score > 0 ? score : null;
}

function grossScoreTone(score, par) {
  const gross = parseScore(score);
  const parValue = Number(par);
  if (gross === null || !Number.isFinite(parValue)) return '';
  if (gross < parValue) return 'gross-under-par';
  if (gross === parValue + 1) return 'gross-one-over';
  if (gross >= parValue + 2) return 'gross-two-over';
  return '';
}

function grossScoreCanvasColor(score, par) {
  const tone = grossScoreTone(score, par);
  if (tone === 'gross-under-par') return '#ffffff';
  if (tone === 'gross-one-over') return '#ffffff';
  if (tone === 'gross-two-over') return '#ffffff';
  return '#17221f';
}

function drawGrossScoreMarker(ctx, score, par, centerX, centerY, size = 34) {
  const tone = grossScoreTone(score, par);
  if (!tone) return;
  ctx.save();
  ctx.lineWidth = Math.max(2, size * 0.07);
  if (tone === 'gross-under-par') {
    ctx.fillStyle = '#c43b3b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, size * 0.46, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const half = size * 0.48;
    ctx.fillStyle = tone === 'gross-one-over' ? '#438fba' : '#185783';
    ctx.strokeStyle = tone === 'gross-one-over' ? '#2d739c' : '#103e60';
    ctx.fillRect(centerX - half, centerY - half, half * 2, half * 2);
    ctx.strokeRect(centerX - half, centerY - half, half * 2, half * 2);
    if (tone === 'gross-two-over') {
      const inset = size * 0.13;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(1.5, size * 0.045);
      ctx.strokeRect(centerX - half + inset, centerY - half + inset, (half - inset) * 2, (half - inset) * 2);
    }
  }
  ctx.restore();
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return '';
  return String(Math.max(1, Math.round(score)));
}

function scoreTargetLabel(target) {
  if (!target) return '';
  return `${state.players[target.scoreIndex] || `Player ${target.scoreIndex + 1}`}`;
}

function updateScorePad() {
  if (!activeScoreTarget || !els.scorePad) return;
  const { holeIndex, scoreIndex } = activeScoreTarget;
  const par = currentCourse().pars[holeIndex] || 4;
  const value = state.scores[holeIndex][scoreIndex] || '';
  els.scorePadHole.textContent = t('Hole {hole} - Par {par}', { hole: holeIndex + 1, par });
  els.scorePadPlayer.textContent = scoreTargetLabel(activeScoreTarget);
  els.scorePadInput.textContent = value || String(par);
  const tone = grossScoreTone(value, par);
  els.scorePadInput.classList.toggle('gross-under-par', tone === 'gross-under-par');
  els.scorePadInput.classList.toggle('gross-one-over', tone === 'gross-one-over');
  els.scorePadInput.classList.toggle('gross-two-over', tone === 'gross-two-over');
  document.querySelectorAll('.score-quick button').forEach(button => {
    if (button.hasAttribute('data-score-clear')) {
      button.classList.toggle('active', !value);
      return;
    }
    const quickScore = String(par + Number(button.dataset.scoreOffset || 0));
    button.classList.toggle('active', Boolean(value) && value === quickScore);
  });
}

function mergeRoundSummaries(localRounds, remoteSummaries) {
  return window.SIMPLE_GOLF_SYNC.mergeRoundSummaries(localRounds, remoteSummaries, {
    normalize: normalizeRound,
    limit: GAME_LIMIT,
    getVersion: round => Number(round?.totals?.cloudVersion || 0)
  });
}

function reconcileRoundSummaries(localRounds, remoteSummaries, inScope) {
  return window.SIMPLE_GOLF_SYNC.reconcileRoundSummaries(localRounds, remoteSummaries, {
    normalize: normalizeRound,
    limit: GAME_LIMIT,
    getVersion: round => Number(round?.totals?.cloudVersion || 0),
    inScope,
    preserve: round => round?.id && (
      round.id === pendingSyncRound?.id || (isEditing && round.id === activeGameId)
    )
  });
}

function drawFlipBombIcon(ctx, centerX, centerY, size = 18) {
  ctx.save();
  ctx.fillStyle = '#b57b12';
  ctx.strokeStyle = '#b57b12';
  ctx.lineWidth = Math.max(1.5, size * 0.1);
  ctx.beginPath();
  ctx.arc(centerX - size * 0.08, centerY + size * 0.08, size * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(centerX + size * 0.12, centerY - size * 0.2);
  ctx.lineTo(centerX + size * 0.34, centerY - size * 0.42);
  ctx.moveTo(centerX + size * 0.33, centerY - size * 0.54);
  ctx.lineTo(centerX + size * 0.4, centerY - size * 0.39);
  ctx.lineTo(centerX + size * 0.55, centerY - size * 0.47);
  ctx.stroke();
  ctx.restore();
}

function scrollNextScoreTargetUp(previousScoreIndex, nextScoreIndex) {
  if (!Number.isInteger(previousScoreIndex) || !Number.isInteger(nextScoreIndex)) return;
  window.setTimeout(() => {
    const previousRow = els.playPlayerRows?.querySelector(`[data-score-index="${previousScoreIndex}"]`);
    const nextRow = els.playPlayerRows?.querySelector(`[data-score-index="${nextScoreIndex}"]`);
    if (!previousRow || !nextRow) return;
    const rowStep = nextRow.getBoundingClientRect().top - previousRow.getBoundingClientRect().top;
    const scroller = document.scrollingElement || document.documentElement;
    if (rowStep > 0) scroller.scrollTop = Math.min(
      scroller.scrollHeight - scroller.clientHeight,
      scroller.scrollTop + rowStep
    );
  }, 80);
}

function autoLandlordMultiplierForHole(holeIndex) {
  if (state.gameType !== 'landlord') return;
  state.landlord = normalizeLandlordState(state.landlord, state.players.length);
  const config = state.landlord;
  const result = landlordHoleResult(state, holeIndex);
  if (!result) {
    state.landlord.specialMultipliers[holeIndex] = 1;
    state.landlord.multipliers[holeIndex] = config.manualMultipliers[holeIndex];
    return;
  }
  state.landlord.specialMultipliers[holeIndex] = result.specialMultiplier;
  state.landlord.multipliers[holeIndex] = result.multiplier;
}

function autoAssignNextLandlord(holeIndex) {
  if (state.gameType !== 'landlord' || holeIndex >= 17) return;
  const config = normalizeLandlordState(state.landlord, state.players.length);
  if (config.selectionMode === 'fixed') {
    state.landlord.landlords[holeIndex + 1] = config.fixedLandlordIndex;
    return;
  }
  const result = landlordHoleResult(state, holeIndex);
  if (!result) return;
  const currentLandlord = result.landlordIndex;
  if (result.tied || result.landlordWon) {
    state.landlord.landlords[holeIndex + 1] = currentLandlord;
    return;
  }

  const bestScore = Math.min(...result.peasantIndexes.map(playerIndex => result.scoringValues[playerIndex]));
  const bestPeasants = result.peasantIndexes.filter(playerIndex => result.scoringValues[playerIndex] === bestScore);
  const landlordCounts = Array.from({ length: result.scoringValues.length }, (_, playerIndex) =>
    state.landlord.landlords
      .slice(0, holeIndex + 1)
      .filter(landlordIndex => landlordIndex === playerIndex)
      .length
  );
  const fewestTurns = Math.min(...bestPeasants.map(playerIndex => landlordCounts[playerIndex]));
  const eligiblePeasants = new Set(bestPeasants.filter(playerIndex => landlordCounts[playerIndex] === fewestTurns));
  for (let offset = 1; offset <= result.scoringValues.length; offset += 1) {
    const playerIndex = (currentLandlord + offset) % result.scoringValues.length;
    if (!eligiblePeasants.has(playerIndex)) continue;
    state.landlord.landlords[holeIndex + 1] = playerIndex;
    return;
  }
}

function commitScorePadValue(value) {
  if (!activeScoreTarget) return;
  const { holeIndex, scoreIndex } = activeScoreTarget;
  const score = clampScore(value);
  state.scores[holeIndex][scoreIndex] = score;
  if (state.gameType === 'landlord') {
    autoLandlordMultiplierForHole(holeIndex);
    autoAssignNextLandlord(holeIndex);
  }
  persistActiveGame(true);
  renderScoreStrip();
  renderStart();
  renderHoles();
  renderPlayEntry();
  renderLandlordLeaderboard();
  updateScorePad();
}

function clearScorePadValue() {
  if (!activeScoreTarget) return;
  const { holeIndex, scoreIndex } = activeScoreTarget;
  state.scores[holeIndex][scoreIndex] = '';
  if (state.gameType === 'landlord') autoLandlordMultiplierForHole(holeIndex);
  persistActiveGame(true);
  renderScoreStrip();
  renderStart();
  renderHoles();
  renderPlayEntry();
  renderLandlordLeaderboard();
  updateScorePad();
}

function advanceScoreTargetOrClose({ allowNextHole = false } = {}) {
  if (!activeScoreTarget) return;
  const playerCount = state.gameType === 'landlord'
    ? normalizeLandlordState(state.landlord, state.players.length).playerCount
    : 4;
  const displayOrder = playerDisplayIndexes(playerCount);
  const currentPosition = displayOrder.indexOf(activeScoreTarget.scoreIndex);
  if (currentPosition < 0 || currentPosition >= displayOrder.length - 1) {
    if (allowNextHole && activeScoreTarget.holeIndex < 17) {
      activePlayHoleIndex = activeScoreTarget.holeIndex + 1;
      saveState();
      renderPlayEntry();
      closeScorePad();
      return;
    }
    closeScorePad();
    return;
  }
  const previousScoreIndex = activeScoreTarget.scoreIndex;
  const nextScoreIndex = displayOrder[currentPosition + 1];
  activeScoreTarget = {
    ...activeScoreTarget,
    scoreIndex: nextScoreIndex
  };
  updateScorePad();
  scrollNextScoreTargetUp(previousScoreIndex, nextScoreIndex);
}

async function commitScorePadValueAndAdvance(value) {
  if (!activeScoreTarget) return;
  const completedHoleIndex = activeScoreTarget.holeIndex;
  const playerCount = state.gameType === 'landlord'
    ? normalizeLandlordState(state.landlord, state.players.length).playerCount
    : 4;
  const displayOrder = playerDisplayIndexes(playerCount);
  const isLastPlayer = activeScoreTarget.scoreIndex === displayOrder[displayOrder.length - 1];
  commitScorePadValue(value);
  if (!isLastPlayer) {
    advanceScoreTargetOrClose();
    return;
  }
  closeScorePad();
  const isComplete = state.scores[completedHoleIndex]
    .slice(0, playerCount)
    .every(score => parseScore(score) !== null);
  if (!isComplete) return;
  if (completedHoleIndex >= 17) {
    const shouldFinish = await confirmDialog(
      t('Round complete'),
      t('All player scores are entered. Finish this game?')
    );
    if (shouldFinish) await finishCurrentGame();
    return;
  }
  const goNext = await confirmDialog(
    t('Hole complete'),
    t('All player scores are entered. Go to the next hole?')
  );
  if (!goNext) return;
  activePlayHoleIndex = completedHoleIndex + 1;
  saveState();
  renderPlayEntry();
}

async function commitDisplayedScorePadValueAndAdvance() {
  const value = parseScore(els.scorePadInput.textContent);
  if (value === null) return;
  await commitScorePadValueAndAdvance(value);
}

function positionScorePadBelowFirstPlayer() {
  if (!els.scorePad) return;
  const firstPlayerRow = els.playPlayerRows?.querySelector('[data-score-index]');
  const firstPlayerBottom = firstPlayerRow?.getBoundingClientRect().bottom;
  if (!Number.isFinite(firstPlayerBottom)) return;
  els.scorePad.style.setProperty('--score-pad-top', `${Math.round(firstPlayerBottom + 8)}px`);
}

function openScorePad(holeIndex, scoreIndex) {
  if (!isEditing || !els.scorePad) return;
  activeScoreTarget = { holeIndex, scoreIndex };
  document.body.classList.add('score-pad-open');
  positionScorePadBelowFirstPlayer();
  els.scorePad.hidden = false;
  updateScorePad();
}

function closeScorePad() {
  if (!els.scorePad) return;
  els.scorePad.hidden = true;
  els.scorePad.style.removeProperty('--score-pad-top');
  document.body.classList.remove('score-pad-open');
  activeScoreTarget = null;
}

function firstIncompleteHole() {
  const playerCount = state.gameType === 'landlord'
    ? normalizeLandlordState(state.landlord, state.players.length).playerCount
    : 4;
  const index = state.scores.findIndex(row => row.slice(0, playerCount).some(value => !parseScore(value)));
  return index >= 0 ? index : 17;
}

function setActivePlayHole(index) {
  activePlayHoleIndex = Math.max(0, Math.min(17, Number(index) || 0));
  saveState();
  renderPlayEntry();
}

function scoreRelativeText(score, par) {
  const parsed = parseScore(score);
  if (parsed === null) return '--';
  const value = parsed - par;
  return value > 0 ? `+${value}` : String(value);
}

function previousHoleScoreText(scoreIndex) {
  if (activePlayHoleIndex <= 0) return '--';
  const previousScores = state.scores[activePlayHoleIndex - 1] || [];
  const previousScore = parseScore(previousScores[scoreIndex]);
  return previousScore === null ? '--' : String(previousScore);
}

function previousHoleScoreHtml(scoreIndex) {
  if (activePlayHoleIndex <= 0) return '<span>--</span>';
  return `<small>${escapeHtml(t('Previous'))}</small><strong>${escapeHtml(previousHoleScoreText(scoreIndex))}</strong>`;
}

function landlordRunningPoints(scoreIndex, throughHoleIndex = activePlayHoleIndex) {
  let total = 0;
  for (let holeIndex = 0; holeIndex <= throughHoleIndex; holeIndex += 1) {
    const result = landlordHoleResult(state, holeIndex);
    if (result) total += Number(result.points[scoreIndex] || 0);
  }
  return total;
}

function signedPoints(value) {
  const number = Number(value) || 0;
  return number > 0 ? `+${number}` : String(number);
}

function landlordSettingsSummary(source = state) {
  return landlordSettingsParts(source).join(' · ');
}

function landlordSettingsParts(source = state) {
  const config = normalizeLandlordState(source.landlord, source.players?.length || 3);
  const parts = [
    t('{count} players', { count: config.playerCount }),
    t('Best {count} Pack scores', { count: config.bestPeasantCount }),
    t('Tie: {result}', { result: t(tieOutcomeLabel(config.tieOutcome)) })
  ];
  if (config.selectionMode === 'fixed') {
    const fixedPlayer = source.players?.[config.fixedLandlordIndex] || t('Fixed Wolf');
    parts.push(t('Fixed Wolf: {player}', { player: fixedPlayer }));
  } else {
    parts.push(t('Rotating Wolf'));
  }
  return parts;
}

function tieOutcomeLabel(value) {
  if (value === 'higher-handicap-landlord') return 'Higher-handicap landlord wins';
  if (value === 'peasants') return 'Peasants win';
  if (value === 'landlord') return 'Landlord wins';
  return 'No win or loss';
}

function setLandlordForHole(playerIndex) {
  if (!isEditing || state.gameType !== 'landlord') return;
  const config = normalizeLandlordState(state.landlord, state.players.length);
  if (config.selectionMode === 'fixed') return;
  state.landlord.landlords[activePlayHoleIndex] = playerIndex;
  autoAssignNextLandlord(activePlayHoleIndex);
  persistActiveGame(true);
  render();
}

function setLandlordMultiplier(multiplier) {
  if (!isEditing || state.gameType !== 'landlord') return;
  state.landlord = normalizeLandlordState(state.landlord, state.players.length);
  const config = state.landlord;
  const selectedMultiplier = [2, 4].includes(Number(multiplier)) ? Number(multiplier) : 1;
  const manualMultiplier = config.manualMultipliers[activePlayHoleIndex] === selectedMultiplier
    ? 1
    : selectedMultiplier;
  state.landlord.manualMultipliers[activePlayHoleIndex] = manualMultiplier;
  state.landlord.multipliers[activePlayHoleIndex] = manualMultiplier * config.specialMultipliers[activePlayHoleIndex];
  persistActiveGame(true);
  render();
}

function renderLandlordActions() {
  const active = state.gameType === 'landlord' && Boolean(currentGame());
  els.landlordActions.hidden = !active;
  if (!active) return;
  autoLandlordMultiplierForHole(activePlayHoleIndex);
  const config = normalizeLandlordState(state.landlord, state.players.length);
  els.landlordChoices.style.setProperty('--landlord-choice-columns', config.playerCount);
  els.landlordHoleResult.style.setProperty('--landlord-result-columns', config.playerCount);
  const landlordIndex = config.landlords[activePlayHoleIndex];
  const holeStarted = (state.scores[activePlayHoleIndex] || [])
    .slice(0, config.playerCount)
    .some(score => parseScore(score) !== null);
  const displayedLandlordIndex = holeStarted || config.selectionMode === 'fixed' ? landlordIndex : -1;
  els.landlordChoices.innerHTML = '';
  playerDisplayIndexes(config.playerCount).forEach(index => {
    const player = state.players[index];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = index === displayedLandlordIndex ? 'active' : '';
    button.innerHTML = `${roleIconHtml(index === displayedLandlordIndex, 'landlord-person-icon')}<span>${escapeHtml(player)}</span>`;
    button.disabled = !isEditing;
    if (config.selectionMode === 'fixed') button.disabled = true;
    button.addEventListener('click', () => setLandlordForHole(index));
    els.landlordChoices.append(button);
  });
  els.landlordMultipliers.querySelectorAll('[data-multiplier]').forEach(button => {
    button.classList.toggle('active', Number(button.dataset.multiplier) === config.manualMultipliers[activePlayHoleIndex]);
    button.disabled = !isEditing;
  });
  const result = landlordHoleResult(state, activePlayHoleIndex);
  const displayedSpecialMultiplier = result ? result.specialMultiplier : null;
  els.landlordAutomaticBomb.textContent = displayedSpecialMultiplier
    ? t('Bomb x{value}', { value: displayedSpecialMultiplier })
    : t('Bomb --');
  els.landlordAutomaticBomb.classList.toggle('active', displayedSpecialMultiplier > 1);
  if (!result) {
    const missingCount = (state.scores[activePlayHoleIndex] || [])
      .slice(0, config.playerCount)
      .filter(score => parseScore(score) === null)
      .length;
    els.landlordHoleResult.innerHTML = `<strong class="landlord-auto-status">${escapeHtml(t('Scores still needed for {count} players.', { count: missingCount }))}</strong>`;
    return;
  }
  const playerResults = playerDisplayIndexes(config.playerCount).map(index => {
    const player = state.players[index];
    const role = index === landlordIndex ? t('Landlord') : t('Peasant');
    const points = signedPoints(result.points[index]);
    return `<span class="${result.points[index] > 0 ? 'point-positive' : (result.points[index] < 0 ? 'point-negative' : '')}" aria-label="${escapeHtml(`${player} · ${role} ${points}`)}">${roleIconHtml(index === landlordIndex)} ${escapeHtml(player)} <strong>${points}</strong></span>`;
  }).join('');
  const multiplierSummary = t('Hole result: Manual multiplier {manual} x Bomb multiplier {bomb}', {
    manual: result.manualMultiplier,
    bomb: result.specialMultiplier
  });
  els.landlordHoleResult.innerHTML = `<strong class="landlord-auto-status">${escapeHtml(multiplierSummary)}</strong>${playerResults}`;
}

function renderPlayEntry() {
  if (!els.playPlayerRows) return;
  const course = currentCourse();
  const game = currentGame();
  activePlayHoleIndex = Math.max(0, Math.min(17, activePlayHoleIndex));
  const par = course.pars[activePlayHoleIndex] || 4;
  const indexValue = course.indexes[activePlayHoleIndex] || activePlayHoleIndex + 1;
  const scores = state.scores[activePlayHoleIndex] || ['', '', '', ''];
  const holeValues = holeGrossAndNet(scores, activePlayHoleIndex);

  els.playEntryMode.textContent = state.gameType === 'landlord'
    ? `${t('Fight the Landlord')} · ${state.scoreMode === 'net' ? t('Net') : t('Gross')} · ${landlordSettingsSummary(state)}`
    : t('Score Entry');
  els.playEntryTitle.textContent = game ? roundListDate(game) : t('No games currently playing');
  els.playEntryCourse.textContent = course.name || t('Course');
  els.playHolePar.textContent = t('Par {value}', { value: par });
  els.playHoleNumber.textContent = t('Hole {hole}', { hole: activePlayHoleIndex + 1 });
  els.playHoleIndex.textContent = t('Index {value}', { value: indexValue });
  els.playHolePrev.disabled = activePlayHoleIndex <= 0;
  els.playHoleNext.disabled = activePlayHoleIndex >= 17;
  els.playPlayerRows.innerHTML = '';

  renderLandlordActions();
  if (!game) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('No games currently playing');
    els.playPlayerRows.append(empty);
    return;
  }

  const landlordConfig = normalizeLandlordState(state.landlord, state.players.length);
  const landlordHoleStarted = scores
    .slice(0, landlordConfig.playerCount)
    .some(score => parseScore(score) !== null);
  const displayedLandlordIndex = landlordHoleStarted || landlordConfig.selectionMode === 'fixed'
    ? landlordConfig.landlords[activePlayHoleIndex]
    : -1;
  playerDisplayIndexes(state.gameType === 'landlord' ? landlordConfig.playerCount : 4).forEach(scoreIndex => {
    const player = state.players[scoreIndex];
    const grossValue = scores[scoreIndex] || '';
    const netValue = holeValues.net[scoreIndex];
    const row = document.createElement('div');
    row.dataset.scoreIndex = String(scoreIndex);
    row.className = state.gameType === 'landlord'
      ? `play-player-row landlord-player ${scoreIndex === displayedLandlordIndex ? 'is-landlord' : 'is-peasant'}`
      : `play-player-row ${scoreIndex < 2 ? 'team-a' : 'team-b'}`;
    row.classList.toggle('has-previous-score', activePlayHoleIndex > 0);
      row.innerHTML = `
        <div class="play-player-copy">
          ${state.gameType === 'landlord' ? '<small class="landlord-running-total"></small>' : ''}
          <strong></strong>
          <span></span>
      </div>
      ${activePlayHoleIndex > 0 ? '<div class="play-score-meta previous-hole-score"></div>' : ''}
      <button class="play-score-button" type="button"></button>
    `;
      const role = state.gameType === 'landlord' && displayedLandlordIndex >= 0
        ? (scoreIndex === displayedLandlordIndex ? t('Landlord') : t('Peasant'))
        : '';
      row.querySelector('.play-player-copy strong').innerHTML = `${escapeHtml(player || t('Player'))}${role ? ` ${roleIconHtml(scoreIndex === displayedLandlordIndex, 'player-name-role-icon')}` : ''}`;
      const runningTotal = row.querySelector('.landlord-running-total');
      if (runningTotal) {
        const points = landlordRunningPoints(scoreIndex);
        runningTotal.textContent = `${t('Cumulative')} ${signedPoints(points)}`;
        runningTotal.classList.toggle('point-positive', points > 0);
        runningTotal.classList.toggle('point-negative', points < 0);
      }
    const showStrokeAllowance = state.gameType !== 'landlord' || state.scoreMode === 'net';
    const strokesReceived = showStrokeAllowance
      ? handicapStrokes(state.handicaps?.[scoreIndex], indexValue)
      : 0;
    const netStrokeHint = showStrokeAllowance
      ? ` · ${t('Strokes received this hole: {value}', { value: strokesReceived })}`
      : '';
    row.querySelector('.play-player-copy span').textContent = `${t('HCP {value}', { value: state.handicaps?.[scoreIndex] || 0 })}${netStrokeHint}`;
    const meta = row.querySelector('.play-score-meta');
    if (meta) meta.innerHTML = previousHoleScoreHtml(scoreIndex);
    const button = row.querySelector('.play-score-button');
    button.classList.toggle('under-par', grossScoreTone(grossValue, par) === 'gross-under-par');
    button.classList.toggle('one-over', grossScoreTone(grossValue, par) === 'gross-one-over');
    button.classList.toggle('two-over', grossScoreTone(grossValue, par) === 'gross-two-over');
    button.innerHTML = grossValue
      ? `<span>${grossValue}</span>${state.scoreMode === 'net' && netValue ? `<small>${t('Net')} ${netValue}</small>` : ''}`
      : '<span>--</span>';
    button.disabled = !isEditing;
    button.addEventListener('click', () => openScorePad(activePlayHoleIndex, scoreIndex));
    els.playPlayerRows.append(row);
  });
}

function teamNumber(scores, par, shouldFlip) {
  const low = Math.min(...scores);
  const high = Math.max(...scores);
  const flipped = Boolean(shouldFlip);
  return {
    value: flipped ? high * 10 + low : low * 10 + high,
    flipped
  };
}

function handicapStrokes(handicap, holeIndexValue) {
  const value = Math.max(0, Math.round(Number(handicap) || 0));
  const index = Math.max(1, Math.min(18, Math.round(Number(holeIndexValue) || 18)));
  const base = Math.floor(value / 18);
  const extra = value % 18;
  return base + (index <= extra ? 1 : 0);
}

function scoreLandlordHole({
  grossScores,
  handicaps,
  strokeIndex,
  landlordIndex,
  multiplier = 1,
  bestPeasantCount,
  handicapEnabled = true,
  tieOutcome = 'draw'
}) {
  const gross = grossScores.map(parseScore);
  if (gross.some(value => value === null) || landlordIndex < 0 || landlordIndex >= gross.length) return null;
  const received = handicaps.map(handicap => handicapStrokes(handicap, strokeIndex));
  const net = gross.map((score, index) => Math.max(1, score - received[index]));
  const scoringValues = handicapEnabled ? net : gross;
  const tieWinner = window.SIMPLE_GOLF_LANDLORD_SCORING.resolveTieWinner({
    tieOutcome,
    handicaps,
    landlordIndex
  });
  const comparison = window.SIMPLE_GOLF_LANDLORD_SCORING.compareLandlordWithBestPeasants({
    scoringValues,
    landlordIndex,
    bestPeasantCount,
    multiplier,
    tieWinner
  });
  return comparison ? { gross, net, scoringValues, received, landlordIndex, ...comparison } : null;
}

function landlordHoleResult(roundOrState, holeIndex) {
  const source = roundOrState || state;
  const config = normalizeLandlordState(source.landlord, source.players?.length || 3);
  const playerCount = config.playerCount;
  const course = source.pars ? source : currentCourse();
  const pars = source.pars || course.pars;
  const indexes = source.indexes || course.indexes;
  const grossScores = (source.scores?.[holeIndex] || []).slice(0, playerCount);
  const par = Number(pars?.[holeIndex] || 4);
    const recordedGross = grossScores.map(value => {
      const parsed = parseScore(value);
      return parsed;
    });
  const commonOptions = {
      grossScores: recordedGross,
    handicaps: normalizeHandicaps(source.handicaps).slice(0, playerCount),
    strokeIndex: Number(indexes?.[holeIndex] || holeIndex + 1),
    landlordIndex: config.landlords[holeIndex],
    bestPeasantCount: config.bestPeasantCount,
    handicapEnabled: source.scoreMode === 'net',
    tieOutcome: config.tieOutcome
  };
  const baseResult = scoreLandlordHole({ ...commonOptions, multiplier: 1 });
  if (!baseResult) return null;

  // Birdie/eagle detection always uses gross strokes. A special score only
  // becomes a bomb when it belongs exclusively to the side that wins the hole.
  const specialLevel = score => score === 1 || score <= par - 2 ? 4 : (score === par - 1 ? 2 : 1);
  const landlordLevel = specialLevel(baseResult.gross[baseResult.landlordIndex]);
  const packLevel = Math.max(...baseResult.peasantIndexes.map(playerIndex => specialLevel(baseResult.gross[playerIndex])));
  const equalSpecialsCancel = landlordLevel > 1 && landlordLevel === packLevel;
  const winningLevel = baseResult.landlordWon ? landlordLevel : packLevel;
  const specialMultiplier = !baseResult.tied && !equalSpecialsCancel && winningLevel > 1
    ? winningLevel
    : 1;
  const manualMultiplier = config.manualMultipliers[holeIndex];
  const multiplier = manualMultiplier * specialMultiplier;
  const result = scoreLandlordHole({ ...commonOptions, multiplier });
  return { ...result, manualMultiplier, specialMultiplier, multiplier };
}

function landlordTotals(roundOrState = state) {
  const source = roundOrState || state;
  const playerCount = normalizeLandlordState(source.landlord, source.players?.length || 3).playerCount;
  const result = {
    points: Array.from({ length: playerCount }, () => 0),
    gross: Array.from({ length: playerCount }, () => 0),
    net: Array.from({ length: playerCount }, () => 0),
    complete: 0
  };
  for (let holeIndex = 0; holeIndex < 18; holeIndex += 1) {
    const hole = landlordHoleResult(source, holeIndex);
    const row = source.scores?.[holeIndex] || [];
    row.slice(0, playerCount).forEach((score, playerIndex) => {
      result.gross[playerIndex] += parseScore(score) || 0;
    });
    if (!hole) continue;
    hole.points.forEach((points, playerIndex) => { result.points[playerIndex] += points; });
    hole.net.forEach((score, playerIndex) => { result.net[playerIndex] += score; });
    result.complete += 1;
  }
  return result;
}

function holeGrossAndNet(scores, holeIndex) {
  const course = currentCourse();
  const indexValue = course.indexes[holeIndex] || holeIndex + 1;
  const gross = scores.map(parseScore);
  const net = gross.map((score, scoreIndex) => {
    if (score === null) return null;
    return Math.max(1, score - handicapStrokes(state.handicaps?.[scoreIndex], indexValue));
  });
  return { gross, net, indexValue };
}

function scoreHole(scores, par, holeIndex) {
  const { gross, net } = holeGrossAndNet(scores, holeIndex);
  if (gross.some(value => value === null)) return null;

  const activeValues = state.scoreMode === 'net' ? net : gross;
  const teamA = [activeValues[0], activeValues[1]];
  const teamB = [activeValues[2], activeValues[3]];
  const grossTeamA = [gross[0], gross[1]];
  const grossTeamB = [gross[2], gross[3]];
  const aUnderPar = Math.min(...grossTeamA) < par;
  const bUnderPar = Math.min(...grossTeamB) < par;
  const flipA = state.underParFlip && bUnderPar && !aUnderPar;
  const flipB = state.underParFlip && aUnderPar && !bUnderPar;
  const aNumber = teamNumber(teamA, par, flipA);
  const bNumber = teamNumber(teamB, par, flipB);
  const delta = bNumber.value - aNumber.value;

  return {
    aNumber,
    bNumber,
    delta,
    gross,
    net,
    aUnderPar,
    bUnderPar
  };
}

function totals() {
  if (state.gameType === 'landlord') {
    const landlordTotal = landlordTotals(state);
    return {
      a: landlordTotal.points[0] || 0,
      b: landlordTotal.points.slice(1).reduce((sum, value) => sum + value, 0),
      complete: landlordTotal.complete,
      players: landlordTotal.gross,
      playersGross: landlordTotal.gross,
      playersNet: landlordTotal.net,
      landlordPoints: landlordTotal.points
    };
  }
  const course = currentCourse();
  return state.scores.reduce((sum, scores, index) => {
    const { gross, net } = holeGrossAndNet(scores, index);
    scores.forEach((score, scoreIndex) => {
      sum.playersGross[scoreIndex] += gross[scoreIndex] || 0;
      sum.playersNet[scoreIndex] += net[scoreIndex] || 0;
    });
    sum.players = state.scoreMode === 'net' ? sum.playersNet : sum.playersGross;
    const result = scoreHole(scores, course.pars[index], index);
    if (!result) return sum;
    sum.a += result.delta;
    sum.b -= result.delta;
    sum.complete += 1;
    return sum;
  }, { a: 0, b: 0, complete: 0, players: [0, 0, 0, 0], playersGross: [0, 0, 0, 0], playersNet: [0, 0, 0, 0] });
}

function roundFromState(existing = {}, statusOverride = null) {
  const course = currentCourse();
  const previousTotals = existing.totals || {};
  const scoreTotals = totals();
  const status = statusOverride || previousTotals.status || 'playing';
  const editCode = previousTotals.editCode || '';
  const teeTime = previousTotals.teeTime || '';
  const lock = previousTotals.editLock || null;
  const name = roundDisplayName(course);
  return normalizeRound({
    ...existing,
    id: existing.id || `round-${Date.now()}`,
    savedAt: existing.savedAt || Date.now(),
    name,
    gameType: state.gameType === 'landlord' ? 'landlord' : 'vegas',
    fileName: roundFileName(course),
    courseId: course.id,
    courseName: course.name,
    pars: course.pars,
    indexes: course.indexes,
    players: [...state.players],
    playerMeta: normalizePlayerMeta(state.playerMeta, state.players.length),
    handicaps: normalizeHandicaps(state.handicaps),
    scoreMode: state.scoreMode === 'net' ? 'net' : 'gross',
    underParFlip: state.underParFlip,
    birdieFlip: state.underParFlip,
    landlord: normalizeLandlordState(state.landlord, state.players.length),
    scores: state.scores.map(row => [...row]),
    totals: {
      ...scoreTotals,
      status,
      editCode,
      teeTime,
      handicaps: normalizeHandicaps(state.handicaps),
      playerMeta: normalizePlayerMeta(state.playerMeta, state.players.length),
      scoreMode: state.scoreMode === 'net' ? 'net' : 'gross',
      gameType: state.gameType === 'landlord' ? 'landlord' : 'vegas',
      landlord: normalizeLandlordState(state.landlord, state.players.length),
      editLock: lock,
      cloudVersion: Math.max(0, Number(previousTotals.cloudVersion || 0))
    }
  });
}

function replaceRound(round) {
  const normalized = normalizeRound(round);
  const index = savedRounds.findIndex(item => item.id === normalized.id);
  if (index >= 0) {
    savedRounds[index] = normalized;
  } else {
    savedRounds.unshift(normalized);
  }
  savedRounds = mergeRounds(savedRounds, []);
  saveHistoryLocal();
  return normalized;
}

async function acquireEditLock(round) {
  if (!round || gameStatus(round) !== 'playing') return null;
  if (!(await confirmScoringPlayer(round))) return null;
  const latest = await fetchCloudRoundById(round.id).catch(() => null);
  const base = latest || round;
  const locked = replaceRound(withCurrentEditLock(base));
  activeGameId = locked.id;
  applyGameToState(locked);
  saveState();
  await upsertCloudRound(locked);
  setSyncState({
    ready: true,
    busy: false,
    ok: true,
    label: t('Cloud sync ok'),
    title: t('Edit lock acquired.')
  });
  return locked;
}

async function ensureEditLockStillMine() {
  if (!isEditing || !activeGameId) return true;
  if (pendingSyncPromise || pendingSyncRound) return true;
  if (editLockRefreshPromise) return editLockRefreshPromise;
  editLockRefreshPromise = (async () => {
    const latest = await fetchCloudRoundById(activeGameId).catch(() => null);
    if (!latest) return true;
    const owner = editLockOwner(latest);
    if (owner && owner !== clientId) {
      replaceRound(latest);
      applyGameToState(latest);
      isEditing = false;
      saveState();
      render();
      setSyncState({
        ready: true,
        busy: false,
        ok: true,
        label: t('Cloud sync ok'),
        title: t('Another phone is now editing this game.')
      });
      return false;
    }
    const refreshed = replaceRound(withCurrentEditLock(roundFromState(latest)));
    await upsertRoundWithRetry(refreshed);
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: t('Edit lock refreshed.')
    });
    return true;
  })().catch(error => {
    setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
    return true;
  }).finally(() => { editLockRefreshPromise = null; });
  return editLockRefreshPromise;
}

function ensureCourseFromRound(round) {
  if (allCourses().some(course => course.id === round.courseId)) return;
  if (!Array.isArray(round.pars) || round.pars.length !== 18) return;
  customCourses.push({
    id: round.courseId,
    name: round.courseName,
    pars: round.pars,
    indexes: round.indexes
  });
  saveCoursesLocal();
}

function applyGameToState(round) {
  ensureCourseFromRound(round);
  state = {
    gameType: round.gameType === 'landlord' ? 'landlord' : 'vegas',
    courseId: round.courseId,
    players: [...round.players],
    playerMeta: normalizePlayerMeta(round.playerMeta, round.players.length),
    handicaps: normalizeHandicaps(round.handicaps),
    scoreMode: round.scoreMode === 'net' ? 'net' : 'gross',
    underParFlip: round.underParFlip,
    birdieFlip: round.underParFlip,
    landlord: normalizeLandlordState(round.landlord, round.players.length),
    scores: normalizeScores(round.scores)
  };
}

async function takeOverScoring() {
  const round = currentGame();
  if (!round || gameStatus(round) !== 'playing') return;
  if (!(await verifyCodeForRound(round))) return;
  const lock = editLock(round);
  const lockLive = Boolean(lock && Number(lock.expiresAt || 0) > Date.now() && lock.owner !== clientId);
  if (lockLive) {
    const confirmed = await confirmDialog(
      t('Take over scoring'),
      t('{device} is currently scoring. Take over and make that phone read-only?', { device: editLockDevice(round) })
    );
    if (!confirmed) return;
  }
  try {
    const locked = await acquireEditLock(round);
    if (!locked) return;
    isEditing = true;
    activePlayHoleIndex = firstIncompleteHole();
    saveState();
    render();
    switchView('play');
  } catch (error) {
    await showMessage(t('Could not take over scoring'), error.message);
  }
}

function loadGame(gameId, editable = false, goToPlay = true, preferredHoleIndex = null) {
  const round = savedRounds.find(item => item.id === gameId);
  if (!round) return;
  activeGameId = round.id;
  isEditing = editable;
  applyGameToState(round);
  activePlayHoleIndex = preferredHoleIndex === null
    ? firstIncompleteHole()
    : Math.max(0, Math.min(17, Number(preferredHoleIndex) || 0));
  saveState();
  render();
  if (goToPlay) switchView('play');
}

function persistActiveGame(shouldSync = true) {
  const existing = currentGame();
  if (!existing) return null;
  const round = replaceRound(roundFromState(existing));
  saveState();
  if (shouldSync) scheduleAutoSync(round);
  return round;
}

function openAppDialog({
  eyebrow = t('Action'),
  title = t('Confirm'),
  message = '',
  input = false,
  inputLabel = t('Code'),
  inputMode = 'text',
  maxLength = '',
  pattern = '',
  select = false,
  selectLabel = t('Player'),
  selectOptions = [],
  selectValue = '',
  checkbox = false,
  checkboxLabel = '',
  checkboxChecked = false,
  okText = 'OK',
  cancelText = t('Cancel'),
  showOk = true,
  showCancel = true
}) {
  return new Promise(resolve => {
    dialogResolver = resolve;
    els.dialogEyebrow.textContent = eyebrow;
    els.dialogTitle.textContent = title;
    els.dialogMessage.textContent = message;
    els.dialogOk.textContent = okText;
    els.dialogCancel.textContent = cancelText;
    els.dialogOk.hidden = !showOk;
    els.dialogCancel.hidden = !showCancel;
    els.dialogInputWrap.hidden = !input;
    els.dialogInputLabel.textContent = inputLabel;
    els.dialogInput.value = '';
    els.dialogInput.inputMode = inputMode;
    els.dialogInput.maxLength = maxLength;
    els.dialogInput.pattern = pattern;
    els.dialogSelectWrap.hidden = !select;
    els.dialogSelectLabel.textContent = selectLabel;
    els.dialogSelect.replaceChildren(...selectOptions.map(option => {
      const element = document.createElement('option');
      element.value = option;
      element.textContent = option;
      element.selected = option === selectValue;
      return element;
    }));
    els.dialogCheckboxWrap.hidden = !checkbox;
    els.dialogCheckboxLabel.textContent = checkboxLabel;
    els.dialogCheckbox.checked = Boolean(checkboxChecked);
    els.appDialog.hidden = false;
    if (input) els.dialogInput.focus();
    else if (select) els.dialogSelect.focus();
    else if (showOk) els.dialogOk.focus();
    else if (showCancel) els.dialogCancel.focus();
  });
}

function closeAppDialog(value) {
  els.appDialog.hidden = true;
  els.dialogInput.setCustomValidity('');
  const resolver = dialogResolver;
  dialogResolver = null;
  if (resolver) resolver(value);
}

async function showMessage(title, message) {
  await openAppDialog({
    eyebrow: t('Notice'),
    title,
    message,
    okText: t('OK'),
    cancelText: t('Close')
  });
}

async function confirmDialog(title, message) {
  return openAppDialog({
    eyebrow: t('Confirm'),
    title,
    message,
    okText: t('Yes'),
    cancelText: t('No')
  });
}

async function confirmCodeDialog(title, message, errorMessage = '') {
  return openAppDialog({
    eyebrow: t('Edit Code'),
    title,
    message: errorMessage || message,
    input: true,
    inputLabel: t('Code'),
    inputMode: 'numeric',
    maxLength: '2',
    pattern: '[0-9]{2}',
    okText: t('Yes'),
    cancelText: t('No')
  });
}

async function askCodeDialog(errorMessage = '') {
  return openAppDialog({
    eyebrow: t('Edit Code'),
    title: t("what's the code?"),
    message: errorMessage || t('Enter the 2 digit edit code for this game.'),
    input: true,
    inputLabel: t('Code'),
    inputMode: 'numeric',
    maxLength: '2',
    pattern: '[0-9]{2}',
    okText: t('OK'),
    cancelText: t('Cancel')
  });
}

async function verifyCodeForRound(round) {
  if (!round) return false;
  let errorMessage = '';
  while (true) {
    const answer = await askCodeDialog(errorMessage);
    if (answer === false) return false;
    try {
      await secureWriteRequest('verify', 'round', round.id, answer);
      rememberEditCode('round', round.id, answer);
      return true;
    } catch (error) {
      if (error?.code !== 'EDIT_CODE_INVALID') throw error;
    }
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

function codeMatchesRound(round, value) {
  const code = gameCode(round);
  return value === '59' || (/^\d{2}$/.test(code) && value === code);
}

async function confirmActionWithCode(round, title, message) {
  let errorMessage = '';
  while (true) {
    const answer = await confirmCodeDialog(title, message, errorMessage);
    if (answer === false) return false;
    try {
      await secureWriteRequest('verify', 'round', round.id, answer);
      rememberEditCode('round', round.id, answer);
      return true;
    } catch (error) {
      if (error?.code !== 'EDIT_CODE_INVALID') throw error;
    }
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

async function confirmFinishWithCode(round) {
  let errorMessage = '';
  while (true) {
    const answer = await openAppDialog({
      eyebrow: t('Edit Code'),
      title: t('Finish game'),
      message: errorMessage || t('Enter code, then choose Yes to finish this game.'),
      input: true,
      inputLabel: t('Code'),
      inputMode: 'numeric',
      maxLength: '2',
      pattern: '[0-9]{2}',
      checkbox: true,
      checkboxLabel: t('Share game scoring card'),
      okText: t('Yes'),
      cancelText: t('No')
    });
    if (answer === false) return false;
    try {
      await secureWriteRequest('verify', 'round', round.id, answer.value);
      rememberEditCode('round', round.id, answer.value);
      return { share: answer.checked };
    } catch (error) {
      if (error?.code !== 'EDIT_CODE_INVALID') throw error;
    }
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

async function finishCurrentGame() {
  const round = currentGame();
  if (!round || !isEditing) return false;
  const finishAnswer = await confirmFinishWithCode(round);
  if (!finishAnswer) return false;
  window.clearTimeout(autoSyncTimer);
  if (pendingSyncPromise) await pendingSyncPromise;
  pendingSyncRound = null;
  setSyncState({ ready: true, busy: true, title: t('Finishing game...') });
  try {
    let latest = await fetchCloudRoundById(round.id).catch(() => null) || round;
    let finished;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      finished = roundFromState(latest, 'history');
      finished.totals.editLock = null;
      finished.totals.cloudVersion = Math.max(0, Number(latest.totals?.cloudVersion || 0));
      try {
        await upsertCloudRound(finished);
        break;
      } catch (error) {
        if (error?.code !== 'VERSION_CONFLICT' || attempt > 0) throw error;
        latest = await fetchCloudRoundById(round.id);
        const owner = editLockOwner(latest);
        if (owner && owner !== clientId) throw error;
      }
    }
    replaceRound(finished);
    saveHistoryLocal();
    isEditing = false;
    saveState();
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: t('Game finished and locked.'),
      lastSyncedAt: Date.now()
    });
    render();
    switchView('start');
    if (finishAnswer.share) await openShareCard(finished);
    return true;
  } catch (error) {
    setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
    await showMessage(t('Could not finish game'), t('The game was not finished. Check the connection and try again.'));
    return false;
  }
}

async function confirmDeleteWithCode(round) {
  return confirmActionWithCode(round, t('Delete game'), t('Enter code, then choose Yes to delete this finished game.'));
}

async function confirmSaveGameInfoWithCode(round, courseChanged = false) {
  const message = courseChanged
    ? t('Changing course will recalculate Par, Index and scores. Enter code, then choose Yes to save these changes.')
    : t('Enter code, then choose Yes to save these changes.');
  return confirmActionWithCode(round, t('Save game changes'), message);
}

async function confirmCourseActionWithCode(course, title, message) {
  let errorMessage = '';
  while (true) {
    const answer = await confirmCodeDialog(
      title,
      message,
      errorMessage
    );
    if (answer === false) return false;
    try {
      await secureWriteRequest('verify', 'course', course.id, answer);
      rememberEditCode('course', course.id, answer);
      return true;
    } catch (error) {
      if (error?.code !== 'EDIT_CODE_INVALID') throw error;
    }
    errorMessage = t('The edit code is not correct. Try again.');
  }
}

function confirmDeleteCourseWithCode(course) {
  return confirmCourseActionWithCode(course, t('Delete course'), t('Enter the course edit code, then choose Yes to delete this course.'));
}

function confirmEditCourseWithCode(course) {
  return confirmCourseActionWithCode(course, t('Edit Course'), t('Enter the course edit code, then choose Yes to edit this course.'));
}

async function verifyActiveCode() {
  return verifyCodeForRound(currentGame());
}

async function deleteHistoryGame(round) {
  if (!(await confirmDeleteWithCode(round))) return;
  setSyncState({
    ready: true,
    busy: true,
    title: t('Deleting game from cloud.')
  });
  try {
    await deleteCloudRound(round);
  } catch (error) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: error.message
    });
    await showMessage(t('Delete failed'), t('Could not delete this game from the cloud. Try again.'));
    return;
  }
  savedRounds = savedRounds.filter(item => item.id !== round.id);
  forgetEditCode('round', round.id);
  if (activeGameId === round.id) {
    activeGameId = '';
    chooseInitialGame();
  }
  saveHistoryLocal();
  saveState();
  render();
  setSyncState({
    ready: true,
    busy: false,
    ok: true,
    label: t('Cloud sync ok'),
    title: t('Deleted from cloud.')
  });
}

function renderCourseSelect() {
  const selected = state.courseId;
  els.courseSelect.innerHTML = '';
  allCourses().forEach(course => {
    const option = document.createElement('option');
    option.value = course.id;
    option.textContent = course.name;
    els.courseSelect.append(option);
  });
  els.courseSelect.value = allCourses().some(course => course.id === selected) ? selected : defaultCourses[0].id;
  state.courseId = els.courseSelect.value;
}

function renderInputs() {
  els.courseSelect.value = state.courseId;
  els.courseSelect.disabled = true;
  els.birdieFlip.checked = state.underParFlip;
  els.birdieFlip.disabled = true;
  els.scoreMode.value = state.scoreMode === 'net' ? 'net' : 'gross';
  els.players.forEach((input, index) => {
    input.value = state.players[index] || '';
    input.readOnly = true;
  });
}

function renderRulesEntry() {
  const activeGame = currentGame();
  const gameType = activeGame?.gameType;
  const label = gameType === 'landlord'
    ? t('Fight the Landlord Rules')
    : (gameType === 'vegas' ? t('Las Vegas Rule') : t('Golf Game Rules'));
  const accessibleLabel = gameType === 'landlord'
    ? t('Show Fight the Landlord rules')
    : (gameType === 'vegas' ? t('Show Las Vegas rules') : t('Show golf game rules'));
  els.rulesLabel.textContent = label;
  els.rulesButton.setAttribute('aria-label', accessibleLabel);
  els.rulesButton.title = accessibleLabel;
}

function renderHeaderStatus() {
  const game = currentGame();
  let label = t('No sign-in · Ready to play');
  let status = 'ready';
  if (currentView === 'start') {
    label = t('No sign-in · Ready to play');
  } else if (game && gameStatus(game) !== 'playing') {
    label = t('Game complete · Locked');
    status = 'complete';
  } else if (game && isEditing) {
    label = t('Scoring in progress');
    status = 'scoring';
  } else if (game) {
    label = t('Watching live');
    status = 'watching';
  }
  if (els.headerStatusText) els.headerStatusText.textContent = label;
  if (els.headerStatus) els.headerStatus.dataset.status = status;
}

function stableGameColorIndex(id) {
  return Array.from(String(id || '')).reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 0) % 4;
}

function visibleFocusableElements(container) {
  return Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
    .filter(element => !element.disabled && !element.hidden && element.getClientRects().length);
}

function syncOverlayAccessibility() {
  const nextOverlay = Array.from(document.querySelectorAll('.course-modal, .score-pad'))
    .find(element => !element.hidden) || null;
  const appShell = document.querySelector('.app-shell');
  if (nextOverlay && !activeOverlay && !overlayReturnFocus) overlayReturnFocus = document.activeElement;
  if (appShell) {
    appShell.inert = Boolean(nextOverlay);
    if (nextOverlay) appShell.setAttribute('aria-hidden', 'true');
    else appShell.removeAttribute('aria-hidden');
  }
  if (nextOverlay) {
    nextOverlay.setAttribute('role', 'dialog');
    nextOverlay.setAttribute('aria-modal', 'true');
    if (nextOverlay !== activeOverlay) {
      window.setTimeout(() => visibleFocusableElements(nextOverlay)[0]?.focus(), 0);
    }
  } else if (activeOverlay) {
    const returnTarget = activeOverlay === els.gameModal ? els.newGame : overlayReturnFocus;
    window.setTimeout(() => returnTarget?.focus(), 0);
    overlayReturnFocus = null;
  }
  activeOverlay = nextOverlay;
}

function setupOverlayAccessibility() {
  const overlays = document.querySelectorAll('.course-modal, .score-pad');
  const observer = new MutationObserver(syncOverlayAccessibility);
  overlays.forEach(overlay => observer.observe(overlay, { attributes: true, attributeFilter: ['hidden'] }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeOverlay) {
      if (activeOverlay === els.gameModal && els.gameForm.dataset.dirty === 'true') return;
      event.preventDefault();
      if (activeOverlay === els.gameModal) closeGameModal();
      else if (activeOverlay === els.courseModal) closeCourseModal();
      else if (activeOverlay === els.courseSearchModal) closeCourseSearchModal();
      else if (activeOverlay === els.scorePad) closeScorePad();
      else if (activeOverlay === els.shareCardModal) closeShareCard();
      else if (activeOverlay === els.historyRangeModal) cancelHistoryRangeModal();
      else if (activeOverlay === els.appDialog) closeAppDialog(null);
      return;
    }
    if (event.key !== 'Tab' || !activeOverlay) return;
    const focusable = visibleFocusableElements(activeOverlay);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  syncOverlayAccessibility();
}

async function showRulesDialog() {
  const landlordRules = LANDLORD_RULES_SECTIONS.map(section => t(section)).join('\n\n');
  const gameType = currentGame()?.gameType || state.gameType;
  const isLandlord = gameType === 'landlord';
  await openAppDialog({
    eyebrow: t('Notice'),
    title: t(isLandlord ? 'Fight the Landlord Rules' : 'Las Vegas Rules'),
    message: isLandlord ? landlordRules : t(LAS_VEGAS_RULES_TEXT),
    input: false,
    showOk: false,
    cancelText: t('Close')
  });
}

async function promptInstallApp() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (isStandalone) {
    await showMessage(t('App installed'), t('This app is already installed on this phone.'));
    return;
  }
  if (installPromptEvent) {
    installPromptEvent.prompt();
    await installPromptEvent.userChoice.catch(() => null);
    installPromptEvent = null;
    return;
  }
  const userAgent = navigator.userAgent || '';
  const isAppleMobile = /iPad|iPhone|iPod/i.test(userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isAppleMobile) {
    const isSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);
    const message = isSafari
      ? t('On iPhone or iPad:\n1. Tap the Share button (a square with an upward arrow).\n2. Scroll and choose Add to Home Screen.\n3. Keep Open as Web App enabled, then tap Add.')
      : t('On iPhone or iPad, first open this page in Safari. Then tap Share, choose Add to Home Screen, and tap Add.');
    await showMessage(t('Install on iPhone or iPad'), message);
    return;
  }
  await showMessage(t('Add to phone desktop'), t('Use your browser menu and choose Add to Home Screen.'));
}

function renderScoreStrip() {
  const course = currentCourse();
  const game = currentGame();
  const total = totals();
  const parTotal = course.pars.reduce((a, b) => a + b, 0);
  if (els.scoreStripCourse) els.scoreStripCourse.textContent = course.name;
  if (els.scoreStripMode) els.scoreStripMode.textContent = `${state.gameType === 'landlord' ? t('Fight the Landlord') : t('Las Vegas')} · ${state.scoreMode === 'net' ? t('Net') : t('Gross')}`;
  if (els.scoreStripDate) els.scoreStripDate.textContent = formatTeeTime(game?.totals?.teeTime, game?.savedAt);
  els.scoreStrip.classList.toggle('landlord-mode', state.gameType === 'landlord');
  if (state.gameType === 'landlord') {
    const points = total.landlordPoints || [];
    const ranked = state.players.map((player, index) => ({ player, points: points[index] || 0 }))
      .sort((a, b) => b.points - a.points);
    els.teamAPlayers.textContent = ranked[0]?.player || t('Player');
    els.teamBPlayers.textContent = ranked.slice(1).map(item => item.player).join(' · ');
    els.teamATotal.textContent = signedPoints(ranked[0]?.points || 0);
    els.teamBTotal.textContent = '';
    els.teamATotal.closest('.team-total')?.querySelector('.label')?.replaceChildren(document.createTextNode(t('Leader')));
    els.teamBTotal.closest('.team-total')?.querySelector('.label')?.replaceChildren(document.createTextNode(t('Fight the Landlord')));
    applySignedClass(els.teamATotal, ranked[0]?.points || 0);
    applySignedClass(els.teamBTotal, 0);
    els.holesComplete.textContent = `${total.complete}/18`;
    els.coursePar.textContent = total.complete >= 18 ? t('Completed') : t('Playing');
    return;
  }
  els.teamATotal.closest('.team-total')?.querySelector('.label')?.replaceChildren(document.createTextNode(t('Team A')));
  els.teamBTotal.closest('.team-total')?.querySelector('.label')?.replaceChildren(document.createTextNode(t('Team B')));
  els.teamAPlayers.textContent = `${state.players[0]} + ${state.players[1]}`;
  els.teamBPlayers.textContent = `${state.players[2]} + ${state.players[3]}`;
  els.teamATotal.textContent = signedPoints(total.a);
  els.teamBTotal.textContent = signedPoints(total.b);
  applySignedClass(els.teamATotal, total.a);
  applySignedClass(els.teamBTotal, total.b);
  els.holesComplete.textContent = `${total.complete}/18`;
  els.coursePar.textContent = total.complete >= 18 ? t('Completed') : t('Playing');
  els.totalPar.textContent = parTotal;
  els.playerTotals.forEach((cell, index) => {
    cell.textContent = state.scoreMode === 'net'
      ? `${total.playersGross[index]}/${total.playersNet[index]}`
      : total.playersGross[index];
  });
  els.tableTeamATotal.textContent = signedPoints(total.a);
  els.tableTeamBTotal.textContent = signedPoints(total.b);
  applySignedClass(els.tableTeamATotal, total.a);
  applySignedClass(els.tableTeamBTotal, total.b);
}

function renderScoreDetailMode() {
  const isFull = scoreDetailMode === 'full';
  document.querySelector('#leaderboardView .scorecard')?.classList.toggle('full-score-detail', isFull);
  document.querySelector('#leaderboardView .scorecard')?.classList.toggle('compact-score-detail', !isFull);
  els.landlordLeaderboard?.classList.toggle('full-score-detail', isFull);
  els.landlordLeaderboard?.classList.toggle('compact-score-detail', !isFull);
  if (els.scoreDetailToggle) {
    els.scoreDetailToggle.textContent = t(isFull ? 'Show simple score' : 'Show full score');
    els.scoreDetailToggle.setAttribute('aria-pressed', String(isFull));
  }
}

function renderLandlordLeaderboard() {
  const active = state.gameType === 'landlord';
  const vegasScorecard = document.querySelector('#leaderboardView .scorecard');
  const commonActions = document.querySelector('#leaderboardView .leaderboard-common-actions');
  if (vegasScorecard) vegasScorecard.hidden = active;
  // The event card already contains course, format, date, progress and sync
  // context. Keep the results view focused by removing the duplicate controls.
  document.querySelector('.leaderboard-tools').hidden = true;
  els.landlordLeaderboard.hidden = !active;
  if (!active) {
    renderScoreDetailMode();
    return;
  }
  for (let holeIndex = 0; holeIndex < 18; holeIndex += 1) {
    if (landlordHoleResult(state, holeIndex)) autoLandlordMultiplierForHole(holeIndex);
  }
  const config = normalizeLandlordState(state.landlord, state.players.length);
  const displayIndexes = playerDisplayIndexes(config.playerCount);
  const totalsValue = landlordTotals(state);
  const course = currentCourse();
  const landlordCounts = Array.from({ length: config.playerCount }, () => 0);
  const frontGross = Array.from({ length: config.playerCount }, () => 0);
  const frontNet = Array.from({ length: config.playerCount }, () => 0);
  const frontPoints = Array.from({ length: config.playerCount }, () => 0);
  let frontComplete = 0;
  const rows = state.scores.map((scores, holeIndex) => {
    const result = landlordHoleResult(state, holeIndex);
    const isComplete = Boolean(result);
    const landlordIndex = config.landlords[holeIndex];
    if (isComplete && landlordIndex >= 0 && landlordIndex < config.playerCount) landlordCounts[landlordIndex] += 1;
    if (isComplete && holeIndex < 9) {
      frontComplete += 1;
      displayIndexes.forEach(playerIndex => {
        frontGross[playerIndex] += parseScore(scores[playerIndex]) || 0;
        frontNet[playerIndex] += result.net[playerIndex] || 0;
        frontPoints[playerIndex] += result.points[playerIndex] || 0;
      });
    }
    const scoreCells = displayIndexes.map(playerIndex => {
      const gross = parseScore(scores[playerIndex]);
      const net = result?.net?.[playerIndex];
      const points = result?.points?.[playerIndex] || 0;
      return `<td class="${playerIndex === landlordIndex ? 'landlord-cell' : ''}">
        ${playerIndex === landlordIndex && isComplete ? roleIconHtml(true, 'landlord-cell-marker') : ''}
        <strong class="${grossScoreTone(gross, course.pars[holeIndex])}">${gross ?? '--'}</strong>
        ${gross !== null && config.handicapEnabled ? `<small>${escapeHtml(t('Net'))} ${net ?? '--'}</small>` : ''}
        ${isComplete ? `<span class="${points > 0 ? 'point-positive' : (points < 0 ? 'point-negative' : '')}">${signedPoints(points)}</span>` : ''}
      </td>`;
    }).join('');
    const row = `<tr>
      <td>${holeIndex + 1}</td>
      <td>${course.pars[holeIndex]}</td>
      <td>${course.indexes[holeIndex]}</td>
      <td>${isComplete ? `${escapeHtml(state.players[landlordIndex] || '')}<small>x${result.multiplier}</small>` : '--'}</td>
      ${scoreCells}
    </tr>`;
    if (holeIndex !== 8) return row;
    const frontCells = displayIndexes.map(index => `<th><strong>${frontGross[index]}</strong>${config.handicapEnabled ? `<small>${escapeHtml(t('Net'))} ${frontNet[index]}</small>` : ''}<span class="${frontPoints[index] > 0 ? 'point-positive' : (frontPoints[index] < 0 ? 'point-negative' : '')}">${signedPoints(frontPoints[index])}</span></th>`).join('');
    return `${row}<tr class="nine-hole-subtotal"><th>${escapeHtml(document.documentElement.lang.startsWith('zh') ? '小计' : 'Subtotal')}</th><th>${course.pars.slice(0, 9).reduce((sum, par) => sum + par, 0)}</th><th>—</th><th>—</th>${frontCells}</tr>`;
  }).join('');
  const totalCells = displayIndexes.map(index => `
    <th>
      <strong>${totalsValue.gross[index]}</strong>
      ${config.handicapEnabled ? `<small>${escapeHtml(t('Net'))} ${totalsValue.net[index]}</small>` : ''}
      <small class="landlord-count-total">${roleIconHtml(true)} ${document.documentElement.lang.startsWith('zh') ? `${landlordCounts[index]}次` : `× ${landlordCounts[index]}`}</small>
      <span class="${totalsValue.points[index] > 0 ? 'point-positive' : (totalsValue.points[index] < 0 ? 'point-negative' : '')}">${signedPoints(totalsValue.points[index])}</span>
    </th>`).join('');
  els.landlordLeaderboard.innerHTML = `
    <div class="landlord-ranking">
      <div class="landlord-event-main">
        <span class="course-emblem" aria-hidden="true"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29"/><path d="M17 47V28h7V18h6v10h5V14h6v14h7v19M14 47h36M23 47V36h7v11M36 47V36h7v11M20 23h4M38 20h3"/></svg></span>
        <div class="landlord-event-copy">
          <h2>${escapeHtml(course.name)}</h2>
          <p class="eyebrow">${escapeHtml(`${t('Fight the Landlord')} · ${state.scoreMode === 'net' ? t('Net') : t('Gross')}`)}</p>
          <span>${escapeHtml(roundListDate(currentGame() || {}))}</span>
        </div>
        <div class="landlord-event-progress"><strong>${totalsValue.complete}/18</strong><span>${totalsValue.complete >= 18 ? escapeHtml(t('Completed')) : escapeHtml(t('Playing'))}</span></div>
      </div>
      <p class="landlord-settings-line">${escapeHtml(landlordSettingsSummary(state))}</p>
      <div class="rank-chips player-count-${displayIndexes.length}">${displayIndexes
        .map(index => `<span>${escapeHtml(state.players[index])} <strong class="${totalsValue.points[index] > 0 ? 'point-positive' : (totalsValue.points[index] < 0 ? 'point-negative' : '')}">${signedPoints(totalsValue.points[index])}</strong></span>`)
        .join('')}</div>
    </div>
    <div class="landlord-table-wrap">
      <table>
        <thead><tr><th>${escapeHtml(t('Hole'))}</th><th>${escapeHtml(t('Par'))}</th><th>${escapeHtml(t('Index'))}</th><th>${escapeHtml(t('Landlord'))}</th>${displayIndexes.map(index => `<th>${escapeHtml(state.players[index])}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><th>${escapeHtml(t('Total'))}</th><th>${course.pars.reduce((sum, par) => sum + par, 0)}</th><th>—</th><th>—</th>${totalCells}</tr></tfoot>
      </table>
    </div>`;
  renderScoreDetailMode();
}

function renderHoles() {
  const course = currentCourse();
  els.scoreRows.innerHTML = '';

  state.scores.forEach((scores, index) => {
    const row = document.createElement('tr');
    const result = scoreHole(scores, course.pars[index], index);
    const holeValues = holeGrossAndNet(scores, index);
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${course.pars[index]}</td>
      <td>${course.indexes[index] || index + 1}</td>
      <td class="team-a-score"><button class="score score-0" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[0] })}"></button></td>
      <td class="team-a-score"><button class="score score-1" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[1] })}"></button></td>
      <td class="team-a-score vegas-number"></td>
      <td class="team-a-score hole-points"></td>
      <td class="team-b-score"><button class="score score-2" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[2] })}"></button></td>
      <td class="team-b-score"><button class="score score-3" type="button" aria-label="${t('Hole {hole} {player} score', { hole: index + 1, player: state.players[3] })}"></button></td>
      <td class="team-b-score vegas-number"></td>
      <td class="team-b-score hole-points"></td>
    `;

    [0, 1, 2, 3].forEach(scoreIndex => {
      const input = row.querySelector(`.score-${scoreIndex}`);
      const grossValue = scores[scoreIndex] || '';
      const netValue = holeValues.net[scoreIndex];
      const grossTone = grossScoreTone(grossValue, course.pars[index]);
      if (grossTone) input.classList.add(grossTone);
      input.innerHTML = grossValue
        ? `<span>${grossValue}</span>${state.scoreMode === 'net' && netValue ? `<small>${t('Net')} ${netValue}</small>` : ''}`
        : '<span>--</span>';
      input.disabled = !isEditing;
      input.addEventListener('pointerdown', event => {
        if (!isEditing) return;
        event.preventDefault();
      });
      input.addEventListener('click', event => {
        if (!isEditing) return;
        event.preventDefault();
        openScorePad(index, scoreIndex);
      });
      input.closest('td').addEventListener('click', event => {
        if (!isEditing) return;
        event.preventDefault();
        openScorePad(index, scoreIndex);
      });
    });

    if (result) {
      const aPointCell = row.children[6];
      const bPointCell = row.children[10];
      row.children[5].innerHTML = `${result.aNumber.value}${result.aNumber.flipped ? flipBombIconHtml() : ''}`;
      row.children[9].innerHTML = `${result.bNumber.value}${result.bNumber.flipped ? flipBombIconHtml() : ''}`;
      aPointCell.textContent = signedPoints(result.delta);
      bPointCell.textContent = signedPoints(-result.delta);
      applySignedClass(aPointCell, result.delta);
      applySignedClass(bPointCell, -result.delta);
    } else {
      row.children[5].textContent = '--';
      row.children[6].textContent = '0';
      row.children[9].textContent = '--';
      row.children[10].textContent = '0';
    }

    els.scoreRows.append(row);
    if (index === 8) {
      const front = state.scores.slice(0, 9).reduce((sum, holeScores, holeIndex) => {
        const hole = scoreHole(holeScores, course.pars[holeIndex], holeIndex);
        const values = holeGrossAndNet(holeScores, holeIndex);
        values.gross.forEach((value, playerIndex) => { sum.players[playerIndex] += value || 0; });
        if (hole) { sum.a += hole.delta; sum.b -= hole.delta; }
        return sum;
      }, { players: [0, 0, 0, 0], a: 0, b: 0 });
      const subtotal = document.createElement('tr');
      subtotal.className = 'nine-hole-subtotal';
      subtotal.innerHTML = `<th>${document.documentElement.lang.startsWith('zh') ? '小计' : 'Subtotal'}</th><th>${course.pars.slice(0, 9).reduce((sum, par) => sum + par, 0)}</th><th>—</th><th>${front.players[0]}</th><th>${front.players[1]}</th><th></th><th class="${front.a > 0 ? 'point-positive' : (front.a < 0 ? 'point-negative' : '')}">${signedPoints(front.a)}</th><th>${front.players[2]}</th><th>${front.players[3]}</th><th></th><th class="${front.b > 0 ? 'point-positive' : (front.b < 0 ? 'point-negative' : '')}">${signedPoints(front.b)}</th>`;
      els.scoreRows.append(subtotal);
    }
  });
}

function renderCourses() {
  ensureCourseListFilters();
  const country = els.courseListCountry.value;
  const region = els.courseListRegion.value;
  els.courseList.innerHTML = '';
  allCourses()
    .filter(course => courseMatchesAreaFilters(course, country, region))
    .slice()
    .sort((a, b) => [courseCountry(a), courseRegion(a), a.name].join('|').localeCompare([courseCountry(b), courseRegion(b), b.name].join('|')))
    .forEach(course => {
    const row = document.createElement('div');
    row.className = 'course-row';
    const isShared = course.source === 'shared';
    const isCustom = customCourses.some(item => item.id === course.id && normalizeCourse(item).source !== 'shared');
    row.innerHTML = `
      <div class="course-copy">
        <strong></strong>
        <span class="course-meta"></span>
        <span class="course-badges">
          <span class="course-badge course-par-badge"></span>
          <span class="course-badge course-type-badge"></span>
        </span>
      </div>
      <div class="small-actions"></div>
    `;
    row.querySelector('strong').textContent = course.name;
    row.querySelector('.course-meta').textContent = [
      course.club && course.course ? `${course.club} - ${course.course}` : (course.club || course.course),
      [courseCountry(course), courseRegion(course)].filter(Boolean).join(', ')
    ].filter(Boolean).join(' | ');
    row.querySelector('.course-par-badge').textContent = t('Par {value}', { value: course.pars.reduce((a, b) => a + b, 0) });
    row.querySelector('.course-type-badge').textContent = t(isCustom ? 'Custom' : 'Preset Course');

    if (isCustom) {
      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = t('Edit');
      editButton.addEventListener('click', async () => {
        if (!(await confirmEditCourseWithCode(course))) return;
        openEditCourseModal(course);
      });
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = t('Delete');
      deleteButton.addEventListener('click', async () => {
        if (!(await confirmDeleteCourseWithCode(course))) return;
        try {
          await deleteCloudCourse(course.id);
          clearPendingCourse(course.id);
          forgetEditCode('course', course.id);
          customCourses = customCourses.filter(item => item.id !== course.id);
          saveCoursesLocal();
          if (state.courseId === course.id) state.courseId = defaultCourses[0].id;
          saveState();
          render();
          await syncFromCloud(false);
        } catch (error) {
          setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: error.message });
        }
      });
      row.querySelector('.small-actions').append(editButton, deleteButton);
    }

    els.courseList.append(row);
  });
  if (!els.courseList.children.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = t('No courses for selected filters');
    els.courseList.append(empty);
  }
}

function dateTimeInputValue(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTeeTime(value, fallback = Date.now()) {
  const raw = String(value || '');
  if (/^\d{2}-\d{2}-\d{2} \d{2}:\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (match) return `${match[1].slice(2)}-${match[2]}-${match[3]} ${match[4]}:${match[5]}`;
  const date = new Date(fallback);
  return dateTimeInputValue(date).slice(2).replace('T', ' ');
}

function roundListDate(round) {
  return formatTeeTime(round.totals?.teeTime, round.savedAt);
}

function roundPlayedDate(round) {
  const teeTime = round?.totals?.teeTime ? new Date(round.totals.teeTime) : null;
  if (teeTime && !Number.isNaN(teeTime.getTime())) return teeTime;
  const savedAt = Number(round?.savedAt || 0);
  return new Date(savedAt || Date.now());
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dateInputValue(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function historyTimeRange(value) {
  const now = new Date();
  const today = startOfDay(now);
  switch (value) {
    case 'last-7-days':
      return { start: addDays(today, -6), end: addDays(today, 1) };
    case 'last-30-days':
      return { start: addDays(today, -29), end: addDays(today, 1) };
    case 'time-between': {
      const from = historyRange.from ? new Date(`${historyRange.from}T00:00`) : null;
      const to = historyRange.to ? new Date(`${historyRange.to}T00:00`) : null;
      return {
        start: from && !Number.isNaN(from.getTime()) ? from : null,
        end: to && !Number.isNaN(to.getTime()) ? addDays(to, 1) : null
      };
    }
    default:
      return { start: null, end: null };
  }
}

async function refreshHistorySummaries(value) {
  if (!hasSupabaseConfig() || document.hidden) return;
  const { start, end } = historyTimeRange(value);
  setSyncState({ ready: true, busy: true, title: t('Sending and loading scorecard data.') });
  try {
    const { summaries, complete } = await fetchCloudRoundSummaries({
      fromMs: start?.getTime() || 0,
      toMs: end ? end.getTime() - 1 : 0
    });
    savedRounds = complete
      ? reconcileRoundSummaries(savedRounds, summaries, round => roundMatchesHistoryTime(round, value))
      : mergeRoundSummaries(savedRounds, summaries);
    saveHistoryLocal();
    setSyncState({
      ready: true,
      busy: false,
      ok: true,
      label: t('Cloud sync ok'),
      title: `Supabase room: ${supabaseConfig().syncKey}`,
      lastSyncedAt: Date.now()
    });
    renderStart();
  } catch (error) {
    setSyncState({ ready: true, busy: false, ok: false, label: t('Cloud sync Not ok'), title: error.message });
  }
}

function roundMatchesHistoryTime(round, value) {
  const { start, end } = historyTimeRange(value);
  if (!start && !end) return true;
  const playedAt = roundPlayedDate(round);
  return (!start || playedAt >= start) && (!end || playedAt < end);
}

function historyCourseKey(round) {
  return String(round?.courseId || round?.courseName || '');
}

function renderHistoryCourseFilter(historyRounds) {
  if (!els.historyCourseFilter) return;
  const selected = els.historyCourseFilter.value || 'all';
  const courses = new Map();
  historyRounds.forEach(round => {
    const key = historyCourseKey(round);
    if (!key || courses.has(key)) return;
    courses.set(key, round.courseName || t('Course'));
  });
  els.historyCourseFilter.innerHTML = '';
  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = t('All');
  els.historyCourseFilter.append(allOption);
  Array.from(courses.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .forEach(([key, name]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = name;
      els.historyCourseFilter.append(option);
    });
  els.historyCourseFilter.value = courses.has(selected) ? selected : 'all';
}

function filteredHistoryRounds(historyRounds) {
  renderHistoryCourseFilter(historyRounds);
  const timeValue = els.historyTimeFilter?.value || 'last-7-days';
  const courseValue = els.historyCourseFilter?.value || 'all';
  const gameTypeValue = els.historyGameTypeFilter?.value || 'all';
  return historyRounds.filter(round => {
    const courseMatches = courseValue === 'all' || historyCourseKey(round) === courseValue;
    const gameTypeMatches = gameTypeValue === 'all' || round.gameType === gameTypeValue;
    return courseMatches && gameTypeMatches && roundMatchesHistoryTime(round, timeValue);
  });
}

function defaultHistoryRange() {
  const today = startOfDay(new Date());
  return {
    from: historyRange.from || dateInputValue(addDays(today, -6)),
    to: historyRange.to || dateInputValue(today)
  };
}

function openHistoryRangeModal() {
  const range = defaultHistoryRange();
  els.historyRangeFrom.value = range.from;
  els.historyRangeTo.value = range.to;
  els.historyRangeModal.hidden = false;
  els.historyRangeFrom.focus();
}

function closeHistoryRangeModal() {
  els.historyRangeModal.hidden = true;
}

function cancelHistoryRangeModal() {
  closeHistoryRangeModal();
  els.historyTimeFilter.value = previousHistoryTimeFilter;
  renderStart();
}

function roundTeamsLine(round) {
  const players = Array.isArray(round.players) ? round.players : [];
  if (round.gameType === 'landlord') return `${t('Fight the Landlord')}: ${players.join(' · ')}`;
  const [a1 = 'Player 1', a2 = 'Player 2', b1 = 'Player 3', b2 = 'Player 4'] = players;
  return t('Team A ({a1}+{a2}) vs. Team B ({b1}+{b2})', { a1, a2, b1, b2 });
}

function roundModeLine(round) {
  const mode = round?.scoreMode || round?.totals?.scoreMode;
  return mode === 'net' ? t('Net scoring') : t('Gross scoring');
}

function scoreRoundTotalsForMode(round, scoreMode) {
  const normalized = normalizeRound(round);
  const mode = scoreMode === 'net' ? 'net' : 'gross';
  const handicaps = normalizeHandicaps(normalized.handicaps || normalized.totals?.handicaps);
  return normalized.scores.reduce((sum, scores, index) => {
    const par = Number(normalized.pars?.[index] || 4);
    const indexValue = Number(normalized.indexes?.[index] || index + 1);
    const gross = scores.map(parseScore);
    if (gross.some(value => value === null)) return sum;

    const net = gross.map((score, playerIndex) => {
      return Math.max(1, score - handicapStrokes(handicaps[playerIndex], indexValue));
    });
    const activeValues = mode === 'net' ? net : gross;
    const teamA = [activeValues[0], activeValues[1]];
    const teamB = [activeValues[2], activeValues[3]];
    const aUnderPar = Math.min(gross[0], gross[1]) < par;
    const bUnderPar = Math.min(gross[2], gross[3]) < par;
    const flipA = normalized.underParFlip && bUnderPar && !aUnderPar;
    const flipB = normalized.underParFlip && aUnderPar && !bUnderPar;
    const aNumber = teamNumber(teamA, par, flipA);
    const bNumber = teamNumber(teamB, par, flipB);
    const delta = bNumber.value - aNumber.value;

    sum.a += delta;
    sum.b -= delta;
    sum.complete += 1;
    return sum;
  }, { a: 0, b: 0, complete: 0 });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function teamScoreChip(teamLabel, player1, player2, score) {
  const outcomeClass = score === 0 ? '' : (score > 0 ? ' winner' : ' loser');
  const winnerIcon = score > 0 ? '<span class="winner-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4h8v4a4 4 0 0 1-8 0V4Zm0 2H5v1a4 4 0 0 0 4 4m7-5h3v1a4 4 0 0 1-4 4M12 12v5m-4 3h8"/></svg></span>' : '';
  return `<span class="history-result${outcomeClass}">${winnerIcon}<small class="history-team-label">${escapeHtml(teamLabel)}</small><span>${escapeHtml(player1)} + ${escapeHtml(player2)}</span><strong>${signedPoints(score)}</strong></span>`;
}

function roundScoreSummaryHtml(round) {
  const players = Array.isArray(round.players) ? round.players : [];
  if (round.gameType === 'landlord') {
    if (round.summaryOnly && !Array.isArray(round.totals?.landlordPoints)) {
      const complete = Math.max(0, Number(round.totals?.complete || 0));
      return `<span class="landlord-score-line"><span class="history-result"><span>${escapeHtml(t('View scorecard'))}</span><strong>${complete}/18</strong></span></span>`;
    }
    const total = round.summaryOnly && Array.isArray(round.totals?.landlordPoints)
      ? { points: round.totals.landlordPoints }
      : landlordTotals(normalizeRound(round));
    return `<span class="landlord-score-line player-count-${players.length}">
      <span class="landlord-player-row">
        ${players.map((player, index) => `<span class="history-result${total.points[index] > 0 ? ' winner' : (total.points[index] < 0 ? ' loser' : '')}"><span>${escapeHtml(player)}</span><strong>${signedPoints(total.points[index])}</strong></span>`).join('')}
      </span>
    </span>`;
  }
  const [a1 = 'Player 1', a2 = 'Player 2', b1 = 'Player 3', b2 = 'Player 4'] = players;
  const mode = round?.scoreMode === 'net' ? 'net' : 'gross';
  const score = round.summaryOnly
    ? { a: Number(round.totals?.a || 0), b: Number(round.totals?.b || 0) }
    : scoreRoundTotalsForMode(round, mode);
  return `<span class="score-mode-line">${teamScoreChip(t('Team A'), a1, a2, score.a)}${teamScoreChip(t('Team B'), b1, b2, score.b)}</span>`;
}

function scorecardPlayerTotals(round) {
  const normalized = normalizeRound(round);
  const handicaps = normalizeHandicaps(normalized.handicaps || normalized.totals?.handicaps);
  return normalized.scores.reduce((sum, scores, holeIndex) => {
    const indexValue = Number(normalized.indexes?.[holeIndex] || holeIndex + 1);
    scores.forEach((rawScore, playerIndex) => {
      const gross = parseScore(rawScore);
      if (gross === null) return;
      sum.gross[playerIndex] += gross;
      sum.net[playerIndex] += Math.max(1, gross - handicapStrokes(handicaps[playerIndex], indexValue));
    });
    return sum;
  }, { gross: [0, 0, 0, 0], net: [0, 0, 0, 0] });
}

function drawScorecardText(ctx, value, x, y, options = {}) {
  const { align = 'center', color = '#17221f', font = '26px Arial', maxWidth } = options;
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(String(value ?? ''), x, y, maxWidth);
}

function underParLabel(strokesUnderPar) {
  if (strokesUnderPar === 1) return t('Birdie');
  if (strokesUnderPar === 2) return t('Eagle');
  return t('{value} under par', { value: strokesUnderPar });
}

function underParFlipDetails(round) {
  const normalized = normalizeRound(round);
  const handicaps = normalizeHandicaps(normalized.handicaps || normalized.totals?.handicaps);
  return normalized.scores.flatMap((scores, holeIndex) => {
    const gross = scores.map(parseScore);
    if (gross.some(value => value === null)) return [];
    const par = Number(normalized.pars?.[holeIndex] || 4);
    const indexValue = Number(normalized.indexes?.[holeIndex] || holeIndex + 1);
    const underParPlayers = gross
      .map((score, playerIndex) => ({ score, playerIndex, under: par - score }))
      .filter(item => item.under > 0);
    if (!underParPlayers.length) return [];
    const aUnderPar = underParPlayers.some(item => item.playerIndex < 2);
    const bUnderPar = underParPlayers.some(item => item.playerIndex >= 2);
    const flipA = normalized.underParFlip && bUnderPar && !aUnderPar;
    const flipB = normalized.underParFlip && aUnderPar && !bUnderPar;
    const flippedTeam = flipA ? 'a' : (flipB ? 'b' : '');
    const worstA = Math.max(gross[0], gross[1]);
    const worstB = Math.max(gross[2], gross[3]);
    const teams = [
      [0, 1].map(playerIndex => ({
        name: normalized.players[playerIndex] || t(`Player ${playerIndex + 1}`),
        score: gross[playerIndex],
        under: par - gross[playerIndex],
        flippedWorst: flippedTeam === 'a' && gross[playerIndex] === worstA
      })),
      [2, 3].map(playerIndex => ({
        name: normalized.players[playerIndex] || t(`Player ${playerIndex + 1}`),
        score: gross[playerIndex],
        under: par - gross[playerIndex],
        flippedWorst: flippedTeam === 'b' && gross[playerIndex] === worstB
      }))
    ];
    const results = ['gross', 'net'].map(mode => {
      const values = mode === 'gross'
        ? gross
        : gross.map((score, playerIndex) => Math.max(1, score - handicapStrokes(handicaps[playerIndex], indexValue)));
      const aBefore = teamNumber([values[0], values[1]], par, false).value;
      const bBefore = teamNumber([values[2], values[3]], par, false).value;
      const aAfter = teamNumber([values[0], values[1]], par, flipA).value;
      const bAfter = teamNumber([values[2], values[3]], par, flipB).value;
      const beforeDelta = bBefore - aBefore;
      const afterDelta = bAfter - aAfter;
      const aNumberAfter = flipA ? `${aBefore}→${aAfter}` : String(aAfter);
      const bNumberAfter = flipB ? `${bBefore}→${bAfter}` : String(bAfter);
      const beforeText = `${t('Team A')} ${beforeDelta >= 0 ? '+' : ''}${beforeDelta} (${aBefore}) vs ${t('Team B')} ${-beforeDelta >= 0 ? '+' : ''}${-beforeDelta} (${bBefore})`;
      const afterText = `${t('Team A')} ${afterDelta >= 0 ? '+' : ''}${afterDelta} (${aNumberAfter}) vs ${t('Team B')} ${-afterDelta >= 0 ? '+' : ''}${-afterDelta} (${bNumberAfter})`;
      return {
        label: t(mode === 'gross' ? 'Gross win/loss' : 'Net win/loss'),
        triggered: Boolean(flippedTeam),
        beforeText,
        afterText,
        beforePoints: Math.abs(beforeDelta),
        afterPoints: Math.abs(afterDelta),
        extra: Math.abs(afterDelta) - Math.abs(beforeDelta)
      };
    });
    const note = normalized.underParFlip && !flippedTeam
      ? (aUnderPar && bUnderPar ? t('No flip: both teams were under par') : t('No score was flipped'))
      : '';
    return [{ hole: holeIndex + 1, par, teams, results, note }];
  });
}

function drawPlayerScoreSegments(ctx, players, x, y, width) {
  const segments = players.map(player => {
    const praise = player.under > 0 ? `👍${player.name} ${player.score} (${underParLabel(player.under)})` : '';
    const warning = player.flippedWorst ? `👎${player.name} ${player.score}` : '';
    return {
      text: praise || warning || `${player.name} ${player.score}`,
      color: praise ? '#118747' : (warning ? '#b3453f' : '#17221f'),
      font: praise || warning ? 'bold 23px Arial, Microsoft YaHei, sans-serif' : '23px Arial, Microsoft YaHei, sans-serif'
    };
  });
  const lineHeight = 30;
  segments.forEach((segment, index) => {
    drawScorecardText(ctx, segment.text, x, y + (index - 0.5) * lineHeight, {
      align: 'left', color: segment.color, font: segment.font, maxWidth: width
    });
  });
}

function drawFlipResultLine(ctx, result, x, y) {
  const normalFont = 'bold 21px Arial, Microsoft YaHei, sans-serif';
  const iconFont = 'bold 32px Arial, Microsoft YaHei, sans-serif';
  const parts = [
    { text: `${result.label}: ${result.beforePoints} `, color: '#17221f', font: normalFont },
    { text: '🔄', color: '#b3453f', font: iconFont },
    { text: ` ${result.afterPoints} `, color: '#b3453f', font: normalFont },
    { text: '💣', color: '#b3453f', font: iconFont },
    { text: ` ${result.extra >= 0 ? '+' : ''}${result.extra} `, color: '#c9892a', font: normalFont },
    { text: 'EXTRA', color: '#c9892a', font: 'italic bold 16px Arial, sans-serif' }
  ];
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  let cursorX = x;
  parts.forEach(part => {
    ctx.fillStyle = part.color;
    ctx.font = part.font;
    ctx.fillText(part.text, cursorX, y);
    cursorX += ctx.measureText(part.text).width;
  });
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawRoundResultChip(ctx, x, y, width, text, score) {
  const isWinner = score > 0;
  const isLoser = score < 0;
  ctx.fillStyle = isWinner ? '#ecf8f1' : (isLoser ? '#fff2f1' : '#f4f7f5');
  ctx.strokeStyle = isWinner ? '#86cba4' : (isLoser ? '#dfa19d' : '#d6d1c6');
  ctx.lineWidth = 2;
  ctx.beginPath();
  roundedRectPath(ctx, x, y, width, 58, 29);
  ctx.fill();
  ctx.stroke();
  drawScorecardText(ctx, `${isWinner ? '◆ ' : ''}${text} ${score}`, x + width / 2, y + 29, {
    color: isWinner ? '#118747' : (isLoser ? '#b3453f' : '#17221f'),
    font: 'bold 23px Arial, Microsoft YaHei, sans-serif',
    maxWidth: width - 24
  });
}

function scorecardFileName(round) {
  const safeCourse = String(round.courseName || 'golf-game')
    .normalize('NFKD').replace(/[^a-zA-Z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '');
  return `${safeCourse || 'golf-game'}-${roundListDate(round).replace(/[^0-9]+/g, '-')}.png`;
}

function loadRoleImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load role icon: ${src}`));
    image.src = src;
  });
}

async function createLandlordScorecardAsset(round) {
  const normalized = normalizeRound(round);
  const config = normalizeLandlordState(normalized.landlord, normalized.players.length);
  const playerCount = config.playerCount;
  const totalsValue = landlordTotals(normalized);
  const [landlordRoleImage, peasantRoleImage] = await Promise.all([
    loadRoleImage(ROLE_ICON_PATHS.landlord),
    loadRoleImage(ROLE_ICON_PATHS.peasant)
  ]);
  const roleStatistics = normalized.players.slice(0, playerCount).map((player, playerIndex) => {
    const landlord = [];
    const peasant = [];
    for (let holeIndex = 0; holeIndex < 18; holeIndex += 1) {
      const result = landlordHoleResult(normalized, holeIndex);
      if (!result) continue;
      const points = Number(result.points[playerIndex] || 0);
      const item = { text: t('H{hole} {score}', { hole: holeIndex + 1, score: signedPoints(points) }), points };
      (config.landlords[holeIndex] === playerIndex ? landlord : peasant).push(item);
    }
    return { player, landlord, peasant };
  });
  const exportScale = 2;
  const logicalWidth = 800;
  const margin = 20;
  const contentWidth = logicalWidth - margin * 2;
  const playerCardGap = 10;
  const roleLineCount = statistics => [statistics.landlord, statistics.peasant]
    .reduce((total, items) => total + Math.max(1, Math.ceil(items.length / 4)), 0);
  const playerCardHeights = roleStatistics.map(statistics => 94 + roleLineCount(statistics) * 38);
  const playerCardOffsets = playerCardHeights.map((_, index) => playerCardHeights
    .slice(0, index).reduce((sum, height) => sum + height + playerCardGap, 0));
  const statisticsTop = 330;
  const statisticsHeight = playerCardHeights.reduce((sum, height) => sum + height, 0) + playerCardGap * Math.max(0, playerCount - 1);
  const tableTop = statisticsTop + 48 + statisticsHeight + 18;
  const headerHeight = 62;
  const rowHeight = 74;
  const totalRowHeight = 92;
  const logicalHeight = tableTop + headerHeight + 18 * rowHeight + totalRowHeight + 30;
  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * exportScale;
  canvas.height = logicalHeight * exportScale;
  const ctx = canvas.getContext('2d');
  ctx.scale(exportScale, exportScale);
  ctx.fillStyle = '#f6f7f4';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  ctx.fillStyle = '#0b5d46';
  ctx.fillRect(0, 0, logicalWidth, 310);
  drawScorecardCourseIcon(ctx, 70, 91, 42);
  drawScorecardText(ctx, normalized.courseName, 128, 54, { align: 'left', color: '#fff', font: 'bold 36px Arial, Microsoft YaHei, sans-serif', maxWidth: 440 });
  drawScorecardText(ctx, t('Fight the Landlord'), 128, 101, { align: 'left', color: '#f2d37f', font: 'bold 25px Arial, Microsoft YaHei, sans-serif', maxWidth: 440 });
  drawScorecardText(ctx, '18/18', 750, 70, { align: 'right', color: '#fff', font: 'bold 42px Arial, Microsoft YaHei, sans-serif' });
  drawScorecardText(ctx, t('Completed'), 750, 116, { align: 'right', color: '#dceee8', font: 'bold 19px Arial, Microsoft YaHei, sans-serif' });
  drawScorecardText(ctx, `${roundListDate(normalized)} · ${roundModeLine(normalized)}`, 128, 143, { align: 'left', color: '#dceee8', font: '20px Arial, Microsoft YaHei, sans-serif', maxWidth: 500 });
  const settingParts = landlordSettingsParts(normalized);
  drawScorecardText(ctx, settingParts.slice(0, 3).join(' · '), margin, 178, {
    align: 'left', color: '#ffffff', font: 'bold 19px Arial, Microsoft YaHei, sans-serif', maxWidth: contentWidth
  });
  drawScorecardText(ctx, settingParts.slice(3).join(' · '), margin, 207, {
    align: 'left', color: '#dceee8', font: '18px Arial, Microsoft YaHei, sans-serif', maxWidth: contentWidth
  });
  const resultGap = 8;
  const resultWidth = (contentWidth - resultGap * (playerCount - 1)) / playerCount;
  normalized.players.slice(0, playerCount).forEach((player, index) => {
    drawScorecardResultBlock(
      ctx,
      margin + index * (resultWidth + resultGap),
      230,
      resultWidth,
      70,
      player,
      totalsValue.points[index],
      `HCP ${normalized.handicaps[index] || 0}`
    );
  });

  drawScorecardText(ctx, `${t('Leaderboard')} · ${roundModeLine(normalized)}`, margin, statisticsTop + 27, {
    align: 'left', color: '#0b5d46', font: 'bold 32px Arial, Microsoft YaHei, sans-serif'
  });
  roleStatistics.forEach((statistics, playerIndex) => {
    const cardY = statisticsTop + 48 + playerCardOffsets[playerIndex];
    const playerCardHeight = playerCardHeights[playerIndex];
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#d8e1dc';
    ctx.lineWidth = 1;
    ctx.fillRect(margin, cardY, contentWidth, playerCardHeight);
    ctx.strokeRect(margin, cardY, contentWidth, playerCardHeight);
    drawScorecardText(ctx, statistics.player, margin + 18, cardY + 31, {
      align: 'left', color: '#315e51', font: 'bold 42px Arial, Microsoft YaHei, sans-serif',
      maxWidth: contentWidth * 0.4
    });
    drawScorecardText(ctx, `${t('Gross')} ${totalsValue.gross[playerIndex]}   ${t('Net')} ${totalsValue.net[playerIndex]}`, margin + contentWidth * 0.55, cardY + 31, {
      font: 'bold 31px Arial, Microsoft YaHei, sans-serif', maxWidth: contentWidth * 0.35
    });
    drawScorecardText(ctx, signedPoints(totalsValue.points[playerIndex]), margin + contentWidth - 18, cardY + 31, {
      align: 'right',
      color: totalsValue.points[playerIndex] > 0 ? '#118747' : (totalsValue.points[playerIndex] < 0 ? '#b3453f' : '#17221f'),
      font: 'bold 44px Arial'
    });
    let roleY = cardY + 72;
    [
      { image: landlordRoleImage, label: t('Landlord {count} times', { count: statistics.landlord.length }), items: statistics.landlord, color: '#9b6715' },
      { image: peasantRoleImage, label: t('Peasant {count} times', { count: statistics.peasant.length }), items: statistics.peasant, color: '#315e51' }
    ].forEach(role => {
      const chunks = role.items.length
        ? Array.from({ length: Math.ceil(role.items.length / 4) }, (_, index) => role.items.slice(index * 4, index * 4 + 4))
        : [[]];
      chunks.forEach((chunk, chunkIndex) => {
        const prefix = chunkIndex === 0 ? `${role.label}: ` : '　';
        const font = 'bold 25px Arial, Microsoft YaHei, Segoe UI Emoji, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = font;
        ctx.fillStyle = role.color;
        const iconOffset = chunkIndex === 0 ? 34 : 0;
        if (chunkIndex === 0) ctx.drawImage(role.image, margin + 18, roleY - 14, 28, 28);
        ctx.fillText(prefix, margin + 18 + iconOffset, roleY);
        let detailX = margin + 18 + iconOffset + ctx.measureText(prefix).width;
        if (!chunk.length) {
          ctx.fillStyle = '#62706a';
          ctx.fillText('--', detailX, roleY);
        }
        chunk.forEach(item => {
          const detail = `${item.text}  `;
          ctx.fillStyle = item.points > 0 ? '#118747' : (item.points < 0 ? '#b3453f' : '#62706a');
          ctx.fillText(detail, detailX, roleY);
          detailX += ctx.measureText(detail).width;
        });
        roleY += 38;
      });
    });
  });

  const fixedColumns = [32, 34, 34, 70];
  const playerWidth = (contentWidth - fixedColumns.reduce((sum, value) => sum + value, 0)) / playerCount;
  const columns = [...fixedColumns, ...Array.from({ length: playerCount }, () => playerWidth)];
  const headers = [t('Hole'), t('Par'), t('Index'), t('Landlord'), ...normalized.players.slice(0, playerCount)];
  let x = margin;
  headers.forEach((header, index) => {
    ctx.fillStyle = '#315e51';
    ctx.fillRect(x, tableTop, columns[index], headerHeight);
    drawScorecardText(ctx, header, x + columns[index] / 2, tableTop + headerHeight / 2, {
      color: '#fff',
      font: 'bold 27px Arial, Microsoft YaHei, sans-serif',
      maxWidth: columns[index] - 12
    });
    x += columns[index];
  });
  for (let holeIndex = 0; holeIndex < 18; holeIndex += 1) {
    const y = tableTop + headerHeight + holeIndex * rowHeight;
    const result = landlordHoleResult(normalized, holeIndex);
    const landlordIndex = config.landlords[holeIndex];
    const values = [
      holeIndex + 1,
      normalized.pars[holeIndex],
      normalized.indexes[holeIndex],
      `${normalized.players[landlordIndex]} x${result?.multiplier || 1}`,
      ...normalized.players.slice(0, playerCount).map((_, index) => normalized.scores[holeIndex][index] || '--')
    ];
    x = margin;
    values.forEach((value, columnIndex) => {
      ctx.fillStyle = columnIndex < 3
        ? (holeIndex % 2 ? '#edf3f0' : '#e5eeea')
        : (columnIndex >= 4 && columnIndex - 4 === landlordIndex
          ? '#fff1d6'
          : (holeIndex % 2 ? '#fff' : '#f0eee8'));
      ctx.fillRect(x, y, columns[columnIndex], rowHeight);
      ctx.strokeStyle = '#d6d1c6';
      ctx.strokeRect(x, y, columns[columnIndex], rowHeight);
      if (columnIndex >= 4 && result) {
        const playerIndex = columnIndex - 4;
        if (playerIndex === landlordIndex) ctx.drawImage(landlordRoleImage, x + 4, y + 4, 24, 24);
        drawGrossScoreMarker(ctx, value, normalized.pars[holeIndex], x + columns[columnIndex] / 2, y + 24, 38);
        drawScorecardText(ctx, value, x + columns[columnIndex] / 2, y + 24, {
          color: grossScoreCanvasColor(value, normalized.pars[holeIndex]),
          font: 'bold 34px Arial'
        });
        drawScorecardText(ctx, `${t('Net')} ${result.net[playerIndex]} · ${signedPoints(result.points[playerIndex])}`, x + columns[columnIndex] / 2, y + 54, {
          color: result.points[playerIndex] > 0 ? '#118747' : (result.points[playerIndex] < 0 ? '#b3453f' : '#62706a'),
          font: 'bold 23px Arial, Microsoft YaHei, sans-serif',
          maxWidth: columns[columnIndex] - 8
        });
      } else {
        drawScorecardText(ctx, value, x + columns[columnIndex] / 2, y + rowHeight / 2, {
          font: columnIndex === 0
            ? 'bold 31px Arial Narrow, Arial, Microsoft YaHei, sans-serif'
            : (columnIndex === 3 ? 'bold 23px Arial, Microsoft YaHei, sans-serif' : '27px Arial, Microsoft YaHei, sans-serif'),
          maxWidth: columns[columnIndex] - 8
        });
      }
      x += columns[columnIndex];
    });
  }
  const totalY = tableTop + headerHeight + 18 * rowHeight;
  const totalValues = [
    t('Total'),
    normalized.pars.reduce((sum, par) => sum + Number(par || 0), 0),
    '--',
    '—',
    ...normalized.players.slice(0, playerCount).map((_, index) => totalsValue.gross[index])
  ];
  x = margin;
  totalValues.forEach((value, columnIndex) => {
    ctx.fillStyle = '#315e51';
    ctx.fillRect(x, totalY, columns[columnIndex], totalRowHeight);
    ctx.strokeStyle = '#b8cfc7';
    ctx.strokeRect(x, totalY, columns[columnIndex], totalRowHeight);
    if (columnIndex >= 4) {
      const playerIndex = columnIndex - 4;
      drawScorecardText(ctx, value, x + columns[columnIndex] / 2, totalY + 24, {
        color: '#fff', font: 'bold 33px Arial, Microsoft YaHei, sans-serif'
      });
      drawScorecardText(ctx, `${t('Net')} ${totalsValue.net[playerIndex]}`, x + columns[columnIndex] / 2 - 24, totalY + 51, {
        color: '#fff', font: 'bold 18px Arial, Microsoft YaHei, sans-serif',
        maxWidth: columns[columnIndex] - 55
      });
      drawScorecardText(ctx, signedPoints(totalsValue.points[playerIndex]), x + columns[columnIndex] / 2 + 45, totalY + 51, {
        color: totalsValue.points[playerIndex] > 0 ? '#9ff0c8' : (totalsValue.points[playerIndex] < 0 ? '#ffc1bd' : '#fff'),
        font: 'bold 20px Arial, Microsoft YaHei, sans-serif', maxWidth: 60
      });
      ctx.drawImage(landlordRoleImage, x + columns[columnIndex] / 2 - 38, totalY + 63, 22, 22);
      drawScorecardText(ctx, document.documentElement.lang.startsWith('zh') ? `${roleStatistics[playerIndex].landlord.length}次` : `× ${roleStatistics[playerIndex].landlord.length}`, x + columns[columnIndex] / 2 + 9, totalY + 75, {
        color: '#fff', font: 'bold 18px Arial, Microsoft YaHei, sans-serif', maxWidth: columns[columnIndex] - 34
      });
    } else {
      drawScorecardText(ctx, value, x + columns[columnIndex] / 2, totalY + totalRowHeight / 2, {
        color: '#fff', font: 'bold 26px Arial, Microsoft YaHei, sans-serif', maxWidth: columns[columnIndex] - 8
      });
    }
    x += columns[columnIndex];
  });
  const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('PNG export failed')), 'image/png'));
  const fileName = scorecardFileName(normalized);
  return { blob, fileName, file: new File([blob], fileName, { type: 'image/png' }), url: URL.createObjectURL(blob) };
}

async function createScorecardAsset(round) {
  const normalized = normalizeRound(round);
  if (normalized.gameType === 'landlord') return createLandlordScorecardAsset(normalized);
  const flipDetails = underParFlipDetails(normalized);
  const detailRowHeight = 165;
  const totalRowHeight = 74;
  const exportScale = 2;
  const logicalWidth = 980;
  // Give the gross score and its net-score caption enough vertical breathing
  // room in the exported PNG. The canvas grows with the taller 18-hole table
  // so the analysis section below is never clipped.
  const logicalHeight = Math.max(2450, 2445 + flipDetails.length * detailRowHeight);
  const canvas = document.createElement('canvas');
  canvas.width = logicalWidth * exportScale;
  canvas.height = logicalHeight * exportScale;
  const ctx = canvas.getContext('2d');
  ctx.scale(exportScale, exportScale);
  const players = normalized.players.map((name, index) => name || t(`Player ${index + 1}`));
  const handicaps = normalizeHandicaps(normalized.handicaps || normalized.totals?.handicaps);
  const grossTeam = scoreRoundTotalsForMode(normalized, 'gross');
  const netTeam = scoreRoundTotalsForMode(normalized, 'net');
  const playerTotals = scorecardPlayerTotals(normalized);
  const displayedTeamTotal = normalized.scoreMode === 'net' ? netTeam : grossTeam;
  const margin = 35;
  const tableTop = 320;
  const headerHeight = 78;
  const rowHeight = 78;
  const tableWidth = 910;
  const columns = [30, 32, 32, 121, 121, 80, 78, 121, 121, 88, 86];
  const labels = [t('Hole'), t('Par'), t('Index'), players[0], players[1], t('A Pair'), t('A Points'), players[2], players[3], t('B Pair'), t('B Points')];

  ctx.fillStyle = '#f6f7f4';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  ctx.fillStyle = '#0b5d46';
  ctx.fillRect(0, 0, logicalWidth, tableTop);
  drawScorecardCourseIcon(ctx, 82, 106, 50);
  drawScorecardText(ctx, normalized.courseName || t('Course'), 145, 64, {
    align: 'left', color: '#ffffff', font: 'bold 44px Arial, Microsoft YaHei, sans-serif', maxWidth: 500
  });
  drawScorecardText(ctx, `${t('Las Vegas')} · ${normalized.scoreMode === 'net' ? t('Net') : t('Gross')}`, 155, 119, {
    align: 'left', color: '#f2d37f', font: 'bold 28px Arial, Microsoft YaHei, sans-serif', maxWidth: 500
  });
  drawScorecardText(ctx, roundListDate(normalized), 145, 158, {
    align: 'left', color: '#dceee8', font: '22px Arial, Microsoft YaHei, sans-serif', maxWidth: 420
  });
  drawScorecardText(ctx, '18/18', 925, 77, {
    align: 'right', color: '#ffffff', font: 'bold 48px Arial, Microsoft YaHei, sans-serif'
  });
  drawScorecardText(ctx, t('Completed'), 925, 126, {
    align: 'right', color: '#dceee8', font: 'bold 20px Arial, Microsoft YaHei, sans-serif'
  });
  const teamBlockY = 218;
  const teamBlockGap = 16;
  const teamBlockWidth = (tableWidth - teamBlockGap) / 2;
  drawScorecardResultBlock(ctx, margin, teamBlockY, teamBlockWidth, 70,
    t('Team A'), displayedTeamTotal.a, `${players[0]} + ${players[1]}`);
  drawScorecardResultBlock(ctx, margin + teamBlockWidth + teamBlockGap, teamBlockY, teamBlockWidth, 70,
    t('Team B'), displayedTeamTotal.b, `${players[2]} + ${players[3]}`);

  let x = margin;
  labels.forEach((label, index) => {
    ctx.fillStyle = '#0b5d46';
    ctx.fillRect(x, tableTop, columns[index], headerHeight);
    drawScorecardText(ctx, label, x + columns[index] / 2, tableTop + headerHeight / 2, {
      color: '#ffffff',
      font: index < 3 ? 'bold 18px Arial Narrow, Arial, Microsoft YaHei, sans-serif' : 'bold 21px Arial, Microsoft YaHei, sans-serif',
      maxWidth: columns[index] - (index < 3 ? 4 : 8)
    });
    x += columns[index];
  });

  for (let holeIndex = 0; holeIndex < 18; holeIndex += 1) {
    const y = tableTop + headerHeight + holeIndex * rowHeight;
    const gross = normalized.scores[holeIndex].map(parseScore);
    const complete = gross.every(value => value !== null);
    let netValues = [];
    let aNumber = '';
    let bNumber = '';
    let aPoints = '';
    let bPoints = '';
    let flipA = false;
    let flipB = false;
    if (complete) {
      const par = Number(normalized.pars[holeIndex] || 4);
      const indexValue = Number(normalized.indexes[holeIndex] || holeIndex + 1);
      netValues = gross.map((score, playerIndex) => Math.max(1, score - handicapStrokes(handicaps[playerIndex], indexValue)));
      const activeValues = normalized.scoreMode === 'net' ? netValues : gross;
      const aUnderPar = Math.min(gross[0], gross[1]) < par;
      const bUnderPar = Math.min(gross[2], gross[3]) < par;
      flipA = normalized.underParFlip && bUnderPar && !aUnderPar;
      flipB = normalized.underParFlip && aUnderPar && !bUnderPar;
      aNumber = teamNumber([activeValues[0], activeValues[1]], par, flipA).value;
      bNumber = teamNumber([activeValues[2], activeValues[3]], par, flipB).value;
      aPoints = bNumber - aNumber;
      bPoints = -aPoints;
    }
    const values = [
      holeIndex + 1,
      normalized.pars[holeIndex],
      normalized.indexes[holeIndex],
      ...normalized.scores[holeIndex].map(value => value || '—').slice(0, 2),
      aNumber,
      aPoints,
      ...normalized.scores[holeIndex].map(value => value || '—').slice(2, 4),
      bNumber,
      bPoints
    ];
    x = margin;
    values.forEach((value, columnIndex) => {
      ctx.fillStyle = columnIndex < 3
        ? (holeIndex % 2 ? '#edf3f0' : '#e5eeea')
        : (holeIndex % 2 ? '#ffffff' : '#f0eee8');
      ctx.fillRect(x, y, columns[columnIndex], rowHeight);
      ctx.strokeStyle = '#d6d1c6';
      ctx.strokeRect(x, y, columns[columnIndex], rowHeight);
      const playerIndexByColumn = { 3: 0, 4: 1, 7: 2, 8: 3 };
      const playerIndex = playerIndexByColumn[columnIndex];
      if (playerIndex !== undefined && complete) {
        drawGrossScoreMarker(ctx, value, normalized.pars[holeIndex], x + columns[columnIndex] / 2, y + 26, 34);
        drawScorecardText(ctx, value, x + columns[columnIndex] / 2, y + 26, {
          color: grossScoreCanvasColor(value, normalized.pars[holeIndex]),
          font: 'bold 24px Arial'
        });
        drawScorecardText(ctx, `${t('Net')} ${netValues[playerIndex]}`, x + columns[columnIndex] / 2, y + 61, {
          color: '#62706a', font: 'bold 14px Arial, Microsoft YaHei, sans-serif'
        });
        x += columns[columnIndex];
        return;
      }
      const isPointsColumn = columnIndex === 6 || columnIndex === 10;
      const pointValue = Number(value);
      const displayValue = isPointsColumn ? signedPoints(value) : value;
      const isFlippedPair = (columnIndex === 5 && flipA) || (columnIndex === 9 && flipB);
      drawScorecardText(ctx, displayValue, x + columns[columnIndex] / 2 - (isFlippedPair ? 7 : 0), y + rowHeight / 2, {
        color: isPointsColumn && pointValue > 0 ? '#118747' : (isPointsColumn && pointValue < 0 ? '#b3453f' : '#17221f'),
        font: columnIndex === 0
          ? 'bold 22px Arial Narrow, Arial'
          : (columnIndex < 3 ? '18px Arial Narrow, Arial' : 'bold 24px Arial'),
        maxWidth: columns[columnIndex] - 4
      });
      if (isFlippedPair) drawFlipBombIcon(ctx, x + columns[columnIndex] / 2 + 20, y + rowHeight / 2, 18);
      x += columns[columnIndex];
    });
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#78958c';
  const nineHoleDividerY = tableTop + headerHeight + 9 * rowHeight;
  ctx.beginPath();
  ctx.moveTo(margin, nineHoleDividerY);
  ctx.lineTo(margin + tableWidth, nineHoleDividerY);
  ctx.stroke();

  const totalsY = tableTop + headerHeight + 18 * rowHeight;
  const parTotal = normalized.pars.reduce((sum, value) => sum + (Number(value) || 0), 0);
  const totalValues = [
    t('Total'),
    parTotal,
    '--',
    playerTotals.gross[0],
    playerTotals.gross[1],
    '—',
    displayedTeamTotal.a,
    playerTotals.gross[2],
    playerTotals.gross[3],
    '—',
    displayedTeamTotal.b
  ];
  x = margin;
  totalValues.forEach((value, columnIndex) => {
    ctx.fillStyle = '#315e51';
    ctx.fillRect(x, totalsY, columns[columnIndex], totalRowHeight);
    ctx.strokeStyle = '#78958c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, totalsY, columns[columnIndex], totalRowHeight);
    const playerIndexByColumn = { 3: 0, 4: 1, 7: 2, 8: 3 };
    const playerIndex = playerIndexByColumn[columnIndex];
    if (playerIndex !== undefined) {
      drawScorecardText(ctx, value, x + columns[columnIndex] / 2, totalsY + 27, {
        color: '#fff', font: 'bold 25px Arial, Microsoft YaHei, sans-serif'
      });
      drawScorecardText(ctx, `${t('Net')} ${playerTotals.net[playerIndex]}`, x + columns[columnIndex] / 2, totalsY + 55, {
        color: '#fff', font: 'bold 16px Arial, Microsoft YaHei, sans-serif'
      });
    } else {
      const isPointsColumn = columnIndex === 6 || columnIndex === 10;
      const pointValue = Number(value);
      drawScorecardText(ctx, isPointsColumn ? signedPoints(value) : value, x + columns[columnIndex] / 2, totalsY + totalRowHeight / 2, {
        color: isPointsColumn && pointValue > 0 ? '#9ff0c8' : (isPointsColumn && pointValue < 0 ? '#ffc1bd' : '#ffffff'),
        font: columnIndex === 0
          ? 'bold 17px Arial, Microsoft YaHei, sans-serif'
          : (columnIndex < 3 ? 'bold 20px Arial, Microsoft YaHei, sans-serif' : 'bold 25px Arial, Microsoft YaHei, sans-serif'),
        maxWidth: columns[columnIndex] - 4
      });
    }
    x += columns[columnIndex];
  });

  const resultY = totalsY + totalRowHeight + 38;
  const resultHeight = 330 + flipDetails.length * detailRowHeight;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#c9892a';
  ctx.lineWidth = 3;
  ctx.fillRect(margin, resultY, tableWidth, resultHeight);
  ctx.strokeRect(margin, resultY, tableWidth, resultHeight);
  drawScorecardText(ctx, t('Match totals'), margin + 26, resultY + 35, { align: 'left', color: '#1f6f5b', font: 'bold 29px Arial, Microsoft YaHei, sans-serif' });
  [
    { label: t('Gross'), score: grossTeam, y: resultY + 62 },
    { label: t('Net'), score: netTeam, y: resultY + 130 }
  ].forEach(mode => {
    ctx.fillStyle = '#f4f7f5';
    ctx.strokeStyle = '#d6d1c6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundedRectPath(ctx, margin + 20, mode.y, 90, 58, 29);
    ctx.fill();
    ctx.stroke();
    drawScorecardText(ctx, mode.label, margin + 65, mode.y + 29, { font: 'bold 23px Arial, Microsoft YaHei, sans-serif' });
    drawRoundResultChip(ctx, margin + 125, mode.y, 365, `${players[0]}+${players[1]}`, mode.score.a);
    drawRoundResultChip(ctx, margin + 505, mode.y, 365, `${players[2]}+${players[3]}`, mode.score.b);
  });
  drawScorecardText(ctx,
    t(normalized.underParFlip ? 'Under-par flip was enabled for this game.' : 'Under-par flip was disabled for this game.'),
    margin + 26,
    resultY + 220,
    { align: 'left', color: normalized.underParFlip ? '#1f6f5b' : '#62706a', font: 'bold 24px Arial, Microsoft YaHei, sans-serif' }
  );
  if (!flipDetails.length) {
    drawScorecardText(ctx, t('No under-par scores were recorded.'), margin + 26, resultY + 275, {
      align: 'left', color: '#62706a', font: '23px Arial, Microsoft YaHei, sans-serif'
    });
  } else {
    const detailX = margin;
    const detailTop = resultY + 252;
    const detailColumns = [58, 58, 210, 210, 374];
    const detailHeaderHeight = 56;
    const detailHeaders = [t('Hole'), t('Par'), t('Team A'), t('Team B'), t('Score result')];
    let headerX = detailX;
    detailHeaders.forEach((header, index) => {
      ctx.fillStyle = index < 2 ? '#315e51' : (index === 2 ? '#dceee8' : (index === 3 ? '#fff1d6' : '#f4f1ea'));
      ctx.fillRect(headerX, detailTop, detailColumns[index], detailHeaderHeight);
      drawScorecardText(ctx, header, headerX + detailColumns[index] / 2, detailTop + detailHeaderHeight / 2, {
        color: index < 2 ? '#ffffff' : '#17221f', font: 'bold 24px Arial, Microsoft YaHei, sans-serif'
      });
      headerX += detailColumns[index];
    });
    flipDetails.forEach((detail, index) => {
      const rowY = detailTop + detailHeaderHeight + index * detailRowHeight;
      let cellX = detailX;
      detailColumns.forEach(width => {
        ctx.fillStyle = index % 2 ? '#ffffff' : '#faf8f3';
        ctx.fillRect(cellX, rowY, width, detailRowHeight);
        ctx.strokeStyle = '#d6d1c6';
        ctx.lineWidth = 1;
        ctx.strokeRect(cellX, rowY, width, detailRowHeight);
        cellX += width;
      });
      const rowMiddle = rowY + detailRowHeight / 2;
      drawScorecardText(ctx, detail.hole, detailX + 29, rowMiddle, { font: 'bold 27px Arial' });
      drawScorecardText(ctx, detail.par, detailX + 87, rowMiddle, { font: 'bold 27px Arial' });
      drawPlayerScoreSegments(ctx, detail.teams[0], detailX + 131, rowMiddle, 180);
      drawPlayerScoreSegments(ctx, detail.teams[1], detailX + 341, rowMiddle, 180);
      let resultLineY = rowY + 28;
      detail.results.forEach(result => {
        if (result.triggered && normalized.underParFlip) {
          drawFlipResultLine(ctx, result, detailX + 551, resultLineY);
          resultLineY += 46;
        } else {
          drawScorecardText(ctx, `${result.label}: ${result.beforeText}`, detailX + 551, resultLineY, {
            align: 'left', font: 'bold 21px Arial, Microsoft YaHei, sans-serif', maxWidth: 344
          });
          resultLineY += 38;
        }
      });
      if (detail.note) {
        drawScorecardText(ctx, detail.note, detailX + 551, Math.min(rowY + detailRowHeight - 25, resultLineY + 6), {
          align: 'left', color: '#62706a', font: '21px Arial, Microsoft YaHei, sans-serif', maxWidth: 344
        });
      }
    });
  }

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not create scorecard image.')), 'image/png');
  });
  const fileName = scorecardFileName(normalized);
  return { blob, file: new File([blob], fileName, { type: 'image/png' }), fileName, url: URL.createObjectURL(blob) };
}

function downloadScorecard(asset) {
  const link = document.createElement('a');
  link.href = asset.url;
  link.download = asset.fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

async function shareScorecardAsset() {
  if (!shareCardAsset) return;
  els.shareCardStatus.textContent = '';
  const shareData = { title: t('Game scoring card'), text: t('Game scoring card'), files: [shareCardAsset.file] };
  try {
    if (!navigator.share || (navigator.canShare && !navigator.canShare(shareData))) throw new Error('File sharing unavailable');
    await navigator.share(shareData);
    els.shareCardStatus.textContent = t('Scorecard shared.');
  } catch {
    downloadScorecard(shareCardAsset);
    els.shareCardStatus.textContent = t('Sharing is unavailable. The scorecard was downloaded instead.');
  }
}

async function openShareCard(round) {
  els.shareCardModal.hidden = false;
  els.shareCardStatus.textContent = t('Generating scorecard...');
  els.shareScorecardButton.disabled = true;
  try {
    if (shareCardAsset?.url) URL.revokeObjectURL(shareCardAsset.url);
    shareCardAsset = await createScorecardAsset(round);
    els.shareCardPreview.src = shareCardAsset.url;
    els.shareCardStatus.textContent = '';
    els.shareScorecardButton.disabled = false;
  } catch {
    els.shareCardStatus.textContent = t('Could not generate the scorecard image.');
  }
}

function closeShareCard() {
  els.shareCardModal.hidden = true;
}

function renderGameList(container, rounds, emptyText, status) {
  container.innerHTML = '';
  if (!rounds.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    const message = document.createElement('p');
    message.textContent = emptyText;
    empty.append(message);
    const action = document.createElement('button');
    action.type = 'button';
    action.textContent = t(status === 'playing' ? 'Start a new game' : 'Clear filters');
    action.addEventListener('click', () => {
      if (status === 'playing') {
        openGameModal();
        return;
      }
      els.historyTimeFilter.value = 'last-7-days';
      els.historyCourseFilter.value = 'all';
      els.historyGameTypeFilter.value = 'all';
      previousHistoryTimeFilter = 'last-7-days';
      historyExpanded = false;
      renderStart();
    });
    empty.append(action);
    container.append(empty);
    return;
  }

  rounds.forEach(round => {
    const row = document.createElement('div');
    row.className = 'history-row game-row';
    row.classList.toggle('landlord-game-row', round.gameType === 'landlord');
    row.classList.toggle('playing-game-row', status === 'playing');
    row.classList.toggle('history-game-row', status === 'history');
    row.classList.toggle('active-game', round.id === activeGameId);
    if (status === 'playing') row.classList.add(`live-color-${stableGameColorIndex(round.id)}`);
    row.innerHTML = `
      <div class="game-open" role="button" tabindex="0">
        <span class="playing-icon" aria-hidden="true"></span>
        <span class="game-copy">
          <span class="game-top-line">
            <span class="game-line game-main"></span>
            <span class="small-actions"></span>
          </span>
          <span class="game-line game-meta"></span>
          <span class="game-line game-score"></span>
          <span class="game-destination"></span>
        </span>
      </div>
    `;
    row.querySelector('.playing-icon').hidden = false;
    row.querySelector('.playing-icon').classList.toggle('history-status-icon', status === 'history');
    row.querySelector('.game-main').textContent = round.courseName || t('Course');
    row.querySelector('.game-meta').textContent = `${roundListDate(round)} · ${round.gameType === 'landlord' ? t('Fight the Landlord') : t('Las Vegas')} · ${roundModeLine(round)}`;
    row.querySelector('.game-score').innerHTML = roundScoreSummaryHtml(round);
    const destination = window.SIMPLE_GOLF_ROUND_ACCESS.openDestination(round, status, clientId);
    const destinationText = status === 'history'
      ? t('View scorecard')
      : (destination.canEdit ? t('Continue scoring') : t('Watch live'));
    row.querySelector('.game-destination').textContent = destinationText;
    row.querySelector('.game-open').setAttribute('aria-label', `${round.courseName || t('Course')} · ${destinationText}`);
    const openRound = async () => {
      const target = window.SIMPLE_GOLF_ROUND_ACCESS.openDestination(round, status, clientId);
      if (await loadGameOnDemand(round.id, target.canEdit, false)) switchView(target.view);
    };
    row.querySelector('.game-open').addEventListener('click', () => {
      openRound();
    });
    row.querySelector('.game-open').addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openRound();
    });
    if (status === 'playing') {
      const editInfoButton = document.createElement('button');
      editInfoButton.type = 'button';
      editInfoButton.className = 'danger';
      editInfoButton.textContent = t('Modify');
      editInfoButton.addEventListener('click', async event => {
        event.stopPropagation();
        if (!(await verifyCodeForRound(round))) return;
        const fullRound = await ensureRoundFullyLoaded(round.id);
        if (fullRound) openEditGameInfoModal(fullRound);
      });
      row.querySelector('.small-actions').append(editInfoButton);
    }
    if (status === 'history') {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger history-delete-button';
      deleteButton.textContent = t('Delete');
      deleteButton.addEventListener('click', event => {
        event.stopPropagation();
        deleteHistoryGame(round);
      });
      row.querySelector('.small-actions').append(deleteButton);
    }
    container.append(row);
  });
}

function renderStart() {
  const playing = savedRounds.filter(round => gameStatus(round) === 'playing');
  const history = savedRounds.filter(round => gameStatus(round) !== 'playing');
  if (els.playingSection) els.playingSection.hidden = playing.length === 0;
  renderGameList(els.playingList, playing, t('No games currently playing'), 'playing');
  const filteredHistory = filteredHistoryRounds(history);
  const visibleHistory = historyExpanded ? filteredHistory : filteredHistory.slice(0, 3);
  renderGameList(els.historyList, visibleHistory, t('No finished games match these filters'), 'history');
  if (els.historyShowMore) {
    els.historyShowMore.hidden = filteredHistory.length <= 3;
    els.historyShowMore.textContent = t(historyExpanded ? 'Show less' : 'Show more');
    els.historyShowMore.setAttribute('aria-expanded', String(historyExpanded));
  }
}

function render() {
  if (!isEditing) closeScorePad();
  renderCourseSelect();
  renderInputs();
  renderScoreStrip();
  renderHoles();
  renderLandlordLeaderboard();
  renderPlayEntry();
  renderCourses();
  renderStart();
  renderRulesEntry();
  renderHeaderStatus();
  renderSyncStatus();
}

function drawScorecardCourseIcon(ctx, centerX, centerY, radius = 42) {
  ctx.save();
  ctx.strokeStyle = '#d6ae43';
  ctx.lineWidth = Math.max(3, radius * 0.09);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.stroke();
  const scale = radius / 42;
  const px = value => value * scale;
  // Match the warm-gold castle emblem used by the on-screen event card.
  ctx.beginPath();
  ctx.moveTo(centerX - px(22), centerY + px(20));
  ctx.lineTo(centerX + px(22), centerY + px(20));
  ctx.moveTo(centerX - px(18), centerY + px(20));
  ctx.lineTo(centerX - px(18), centerY - px(9));
  ctx.lineTo(centerX - px(8), centerY - px(9));
  ctx.lineTo(centerX - px(8), centerY - px(23));
  ctx.lineTo(centerX + px(1), centerY - px(23));
  ctx.lineTo(centerX + px(1), centerY - px(9));
  ctx.lineTo(centerX + px(9), centerY - px(9));
  ctx.lineTo(centerX + px(9), centerY - px(29));
  ctx.lineTo(centerX + px(18), centerY - px(29));
  ctx.lineTo(centerX + px(18), centerY + px(20));
  ctx.moveTo(centerX - px(11), centerY + px(20));
  ctx.lineTo(centerX - px(11), centerY + px(4));
  ctx.lineTo(centerX - px(2), centerY + px(4));
  ctx.lineTo(centerX - px(2), centerY + px(20));
  ctx.moveTo(centerX + px(6), centerY + px(20));
  ctx.lineTo(centerX + px(6), centerY + px(4));
  ctx.lineTo(centerX + px(14), centerY + px(4));
  ctx.lineTo(centerX + px(14), centerY + px(20));
  ctx.stroke();
  ctx.restore();
}

function drawScorecardResultBlock(ctx, x, y, width, height, label, score, secondaryLabel = '') {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  roundedRectPath(ctx, x, y, width, height, 12);
  ctx.fill();
  drawScorecardText(ctx, label, x + 16, y + (secondaryLabel ? 22 : height / 2), {
    align: 'left', color: '#17221f', font: 'bold 22px Arial, Microsoft YaHei, sans-serif', maxWidth: width * 0.65
  });
  drawScorecardText(ctx, signedPoints(score), x + width - 16, y + (secondaryLabel ? 23 : height / 2), {
    align: 'right', color: Number(score) > 0 ? '#118747' : (Number(score) < 0 ? '#b3453f' : '#17221f'),
    font: 'bold 35px Arial, Microsoft YaHei, sans-serif', maxWidth: width * 0.28
  });
  if (secondaryLabel) {
    drawScorecardText(ctx, secondaryLabel, x + 16, y + 52, {
      align: 'left', color: '#33423e', font: 'bold 20px Arial, Microsoft YaHei, sans-serif', maxWidth: width - 32
    });
  }
  ctx.restore();
}

function switchView(name) {
  currentView = ['start', 'play', 'leaderboard', 'courses'].includes(name) ? name : 'start';
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === currentView);
  });
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === `${currentView}View`);
  });
  if (els.scoreStrip) {
    els.scoreStrip.hidden = currentView !== 'leaderboard';
  }
  if (els.syncBar) {
    // Synchronisation remains automatic; its state is already shown in the
    // system status bar, so the legacy manual control is intentionally hidden.
    els.syncBar.hidden = true;
  }
  if (currentView === 'play') renderPlayEntry();
  renderHeaderStatus();
  renderScoringDeviceBar();
  saveState();
  refreshCloudForCurrentView(true);
}

async function performMainAction(action = 'home') {
  switchView('start');
  if (action === 'score') {
    openGameModal();
  } else if (action === 'watch') {
    const liveRounds = savedRounds.filter(round => gameStatus(round) === 'playing');
    if (liveRounds.length === 1) {
      const liveRound = liveRounds[0];
      if (await loadGameOnDemand(liveRound.id, hasEditRight(liveRound), false)) switchView('leaderboard');
      return;
    }
    if (!liveRounds.length && els.playingSection) els.playingSection.hidden = false;
    els.playingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (action === 'history') {
    const completedRounds = savedRounds.filter(round => gameStatus(round) !== 'playing');
    if (completedRounds.length === 1) {
      if (await loadGameOnDemand(completedRounds[0].id, false, false)) switchView('leaderboard');
      return;
    }
    els.historySection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function enterFromWelcome(action = 'home') {
  if (!welcomeReadyToEnter) {
    pendingWelcomeAction = action;
    els.welcomeActions.forEach(button => { button.disabled = true; });
    return;
  }
  if (!els.welcomeScreen || els.welcomeScreen.classList.contains('leaving')) return;
  localStorage.setItem(WELCOME_SEEN_KEY, '1');
  els.welcomeScreen.classList.add('leaving');
  window.setTimeout(() => {
    els.welcomeScreen.hidden = true;
    performMainAction(action);
  }, 300);
}

function addListeners() {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPromptEvent = event;
  });

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  });
  els.scoreDetailToggle?.addEventListener('click', () => {
    scoreDetailMode = scoreDetailMode === 'full' ? 'compact' : 'full';
    localStorage.setItem(SCORE_DETAIL_KEY, scoreDetailMode);
    renderScoreDetailMode();
  });
  els.recentCourseChoices?.addEventListener('click', event => {
    const button = event.target.closest('[data-recent-course]');
    if (!button) return;
    const course = allCourses().find(item => item.id === button.dataset.recentCourse);
    if (!course) return;
    const area = areaForCourse(course);
    setNewGameArea(area.country, area.region);
    renderNewGameCourses(course.id);
    els.gameForm.dataset.dirty = 'true';
  });
  els.gameForm.addEventListener('input', () => { els.gameForm.dataset.dirty = 'true'; });
  els.gameForm.addEventListener('change', () => { els.gameForm.dataset.dirty = 'true'; });
  els.takeOverScoring?.addEventListener('click', async () => {
    if (isEditing) await finishCurrentGame();
    else await takeOverScoring();
  });
  els.previousHistoryGame?.addEventListener('click', () => showAdjacentHistoryGame(-1));
  els.nextHistoryGame?.addEventListener('click', () => showAdjacentHistoryGame(1));
  els.welcomeActions.forEach(button => {
    button.addEventListener('click', () => enterFromWelcome(button.dataset.welcomeAction));
  });

  els.appTitle.addEventListener('click', promptInstallApp);
  els.historyTimeFilter.addEventListener('change', async () => {
    if (els.historyTimeFilter.value === 'time-between') {
      openHistoryRangeModal();
      return;
    }
    previousHistoryTimeFilter = els.historyTimeFilter.value;
    historyExpanded = false;
    renderStart();
    await refreshHistorySummaries(els.historyTimeFilter.value);
  });
  els.historyCourseFilter.addEventListener('change', () => { historyExpanded = false; renderStart(); });
  els.historyGameTypeFilter.addEventListener('change', () => { historyExpanded = false; renderStart(); });
  els.historyFilterToggle?.addEventListener('click', () => {
    const expanded = els.historyFilterToggle.getAttribute('aria-expanded') !== 'true';
    els.historyFilterToggle.setAttribute('aria-expanded', String(expanded));
    els.historyFilterToggle.textContent = t(expanded ? 'Hide filters' : 'Filter scorecards');
    els.historyFilters.hidden = !expanded;
  });
  els.historyShowMore?.addEventListener('click', () => {
    historyExpanded = !historyExpanded;
    renderStart();
  });
  els.historyRangeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const from = els.historyRangeFrom.value;
    const to = els.historyRangeTo.value;
    if (!from || !to || new Date(`${from}T00:00`) > new Date(`${to}T00:00`)) {
      els.historyRangeTo.setCustomValidity(t('Choose a valid date range.'));
      els.historyRangeTo.reportValidity();
      els.historyRangeTo.setCustomValidity('');
      return;
    }
    historyRange = { from, to };
    previousHistoryTimeFilter = 'time-between';
    closeHistoryRangeModal();
    renderStart();
    await refreshHistorySummaries('time-between');
  });
  els.historyRangeCancel.addEventListener('click', cancelHistoryRangeModal);
  els.historyRangeModal.addEventListener('click', event => {
    if (event.target === els.historyRangeModal) cancelHistoryRangeModal();
  });

  els.shareButton.addEventListener('click', async () => {
    const shareData = {
      title: t('Simple Golf Scorecard'),
      text: t('Simple Golf Scorecard'),
      url: window.location.href.split('?')[0]
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        await showMessage(t('Link copied'), t('The app link was copied to the clipboard.'));
      } else {
        await showMessage(t('Share app'), shareData.url);
      }
    } catch {}
    els.topActions?.classList.remove('open');
    els.topMenuButton?.setAttribute('aria-expanded', 'false');
  });
  els.shareCurrentScorecard?.addEventListener('click', () => {
    const round = currentGame();
    if (!window.SIMPLE_GOLF_ROUND_ACCESS.canShareScorecard(round, gameStatus(round))) return;
    els.topActions?.classList.remove('open');
    els.topMenuButton?.setAttribute('aria-expanded', 'false');
    openShareCard(round);
  });

  els.rulesButton.addEventListener('click', () => {
    els.topActions?.classList.remove('open');
    els.topMenuButton?.setAttribute('aria-expanded', 'false');
    showRulesDialog();
  });

  els.aboutButton?.addEventListener('click', async () => {
    els.topActions?.classList.remove('open');
    els.topMenuButton?.setAttribute('aria-expanded', 'false');
    await showMessage(
      t('About Simple Golf Scorecard'),
      t('No account or sign-in required. Simple Golf Scorecard supports Las Vegas and Wolf & Pack scoring, live match viewing, historical scorecards, and cloud synchronization across devices. Version 6.3.2.')
    );
  });

  els.topMenuButton?.addEventListener('click', event => {
    event.stopPropagation();
    const open = els.topActions?.classList.toggle('open');
    els.topMenuButton.setAttribute('aria-expanded', String(Boolean(open)));
  });
  document.addEventListener('click', event => {
    if (event.target.closest('.topbar')) return;
    els.topActions?.classList.remove('open');
    els.topMenuButton?.setAttribute('aria-expanded', 'false');
  });

  els.dialogForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!els.dialogSelectWrap.hidden) {
      closeAppDialog(els.dialogSelect.value);
      return;
    }
    if (!els.dialogInputWrap.hidden) {
      const value = els.dialogInput.value.trim();
      if (els.dialogInput.pattern && !new RegExp(`^${els.dialogInput.pattern}$`).test(value)) {
        els.dialogInput.setCustomValidity(t('Enter a valid value.'));
        els.dialogInput.reportValidity();
        els.dialogInput.setCustomValidity('');
        return;
      }
      closeAppDialog(els.dialogCheckboxWrap.hidden
        ? value
        : { value, checked: els.dialogCheckbox.checked });
      return;
    }
    closeAppDialog(true);
  });

  els.dialogCancel.addEventListener('click', () => closeAppDialog(false));

  els.appDialog.addEventListener('click', event => {
    if (event.target === els.appDialog) closeAppDialog(false);
  });

  els.shareScorecardButton.addEventListener('click', shareScorecardAsset);
  els.closeShareCard.addEventListener('click', closeShareCard);
  els.shareCardModal.addEventListener('click', event => {
    if (event.target === els.shareCardModal) closeShareCard();
  });

  els.scorePadClose.addEventListener('click', closeScorePad);
  els.scorePad.addEventListener('click', event => {
    if (event.target === els.scorePad) closeScorePad();
  });
  els.scorePadMinus.addEventListener('click', () => {
    const current = parseScore(els.scorePadInput.textContent) || currentCourse().pars[activeScoreTarget?.holeIndex || 0] || 4;
    commitScorePadValue(current - 1);
  });
  els.scorePadPlus.addEventListener('click', () => {
    const current = parseScore(els.scorePadInput.textContent) || currentCourse().pars[activeScoreTarget?.holeIndex || 0] || 4;
    commitScorePadValue(current + 1);
  });
  els.scorePadInput.addEventListener('click', commitDisplayedScorePadValueAndAdvance);
  els.scorePadInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    commitDisplayedScorePadValueAndAdvance();
  });
  els.playHolePrev.addEventListener('click', () => setActivePlayHole(activePlayHoleIndex - 1));
  els.playHoleNext.addEventListener('click', () => setActivePlayHole(activePlayHoleIndex + 1));
  els.playHoleSwipe.addEventListener('touchstart', event => {
    playHoleTouchStartX = event.touches?.[0]?.clientX ?? null;
  }, { passive: true });
  els.playHoleSwipe.addEventListener('touchend', event => {
    if (playHoleTouchStartX === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? playHoleTouchStartX;
    const delta = endX - playHoleTouchStartX;
    playHoleTouchStartX = null;
    if (Math.abs(delta) < 42) return;
    setActivePlayHole(activePlayHoleIndex + (delta > 0 ? 1 : -1));
  }, { passive: true });
  document.querySelectorAll('.score-quick button').forEach(button => {
    button.addEventListener('click', () => {
      if (!activeScoreTarget) return;
      if (button.dataset.scoreClear) {
        clearScorePadValue();
        advanceScoreTargetOrClose();
        return;
      }
      const par = currentCourse().pars[activeScoreTarget.holeIndex] || 4;
      commitScorePadValueAndAdvance(par + Number(button.dataset.scoreOffset || 0));
    });
  });

  els.courseSelect.addEventListener('change', () => {
    state.courseId = els.courseSelect.value;
    saveState();
    render();
  });

  els.birdieFlip.addEventListener('change', () => {
    state.underParFlip = els.birdieFlip.checked;
    state.birdieFlip = state.underParFlip;
    persistActiveGame(true);
    saveState();
    render();
  });

  els.scoreMode.addEventListener('change', () => {
    state.scoreMode = els.scoreMode.value === 'net' ? 'net' : 'gross';
    persistActiveGame(true);
    saveState();
    render();
  });

  els.players.forEach((input, index) => {
    input.addEventListener('change', () => {
      state.players[index] = input.value.trim() || `Player ${index + 1}`;
      saveState();
      render();
    });
  });

  els.courseListCountry.addEventListener('change', () => {
    renderCourseListRegions('');
    renderCourses();
  });
  els.courseListRegion.addEventListener('change', renderCourses);
  els.addCourse.addEventListener('click', () => openCourseModal());
  els.searchCourse.addEventListener('click', openCourseSearchModal);
  els.courseSearchModes.forEach(button => {
    button.addEventListener('click', () => setCourseSearchMode(button.dataset.courseSearchMode));
  });
  els.courseSearchCountry.addEventListener('change', renderCourseSearchRegions);
  els.cancelCourseSearch.addEventListener('click', closeCourseSearchModal);
  els.cancelCourseSearchBottom.addEventListener('click', closeCourseSearchModal);
  els.courseSearchModal.addEventListener('click', event => {
    if (event.target === els.courseSearchModal) closeCourseSearchModal();
  });
  els.courseSearchForm.addEventListener('submit', async event => {
    event.preventDefault();
    const courseName = els.courseSearchInput.value.trim();
    const country = els.courseSearchCountry.value;
    const region = els.courseSearchRegion.value;
    if (courseSearchMode === 'manual') {
      closeCourseSearchModal();
      openCourseModal(courseName);
      return;
    }
    if (courseSearchMode === 'shared') {
      els.courseSearchSubmit.disabled = true;
      els.courseSearchStatus.textContent = t('Searching OpenStreetMap...');
      els.courseSearchResults.innerHTML = '';
      try {
        const searchResult = await searchOnlineCourses({ courseName, country, region });
        if (searchResult.needsFilter) {
          els.courseSearchStatus.textContent = t('Enter a course name or select a country to search OpenStreetMap.');
          renderCourseSearchResults([], 'shared');
          return;
        }
        els.courseSearchStatus.textContent = searchResult.results.length ? t('Choose a course to add.') : t('No courses found in online database.');
        renderCourseSearchResults(searchResult.results, 'shared');
      } catch (error) {
        els.courseSearchStatus.textContent = t('OpenStreetMap search failed. Try again.');
      } finally {
        els.courseSearchSubmit.disabled = false;
      }
      return;
    }
    if (!courseName && (country || region)) {
      els.courseSearchStatus.textContent = t('Enter a course name or city to search within the selected country or region.');
      els.courseSearchResults.innerHTML = '';
      return;
    }
    els.courseSearchSubmit.disabled = true;
    els.courseSearchStatus.textContent = t('Searching courses...');
    els.courseSearchResults.innerHTML = '';
    try {
      const searchResult = await searchGolfCourses({ courseName, country, region });
      const results = searchResult.results;
      els.courseSearchStatus.textContent = results.length ? t('Choose a course to add.') : t('No courses found.');
      renderCourseSearchResults(results, 'api');
    } catch (error) {
      els.courseSearchStatus.textContent = hasGolfCourseApiConfig()
        ? t('Course search failed. Try again.')
        : t('Add your GolfCourseAPI key to supabase-config.js before searching.');
    } finally {
      els.courseSearchSubmit.disabled = false;
    }
  });
  els.cancelCourse.addEventListener('click', closeCourseModal);
  els.cancelCourseBottom.addEventListener('click', closeCourseModal);

  els.courseModal.addEventListener('click', event => {
    if (event.target === els.courseModal) closeCourseModal();
  });

  els.courseForm.addEventListener('submit', async event => {
    event.preventDefault();
    const name = els.newCourseName.value.trim();
    const existingCourse = editingCourseId ? customCourses.find(course => course.id === editingCourseId) : null;
    const editCode = editingCourseId ? String(existingCourse?.editCode || els.newCourseCode.value).trim() : els.newCourseCode.value.trim();
    const country = els.newCourseCountry.value || DEFAULT_COURSE_COUNTRY;
    const region = els.newCourseRegion.value || DEFAULT_COURSE_REGION;
    const pars = readCourseFormPars();
    const indexes = readCourseFormIndexes();
    const codeIsValid = editingCourseId || /^\d{2}$/.test(editCode);
    const valid = name && codeIsValid && pars.length === 18 && pars.every(par => Number.isInteger(par) && par > 0 && par <= 10) && indexesAreValid(indexes);
    if (!valid) {
      const invalidInput = courseParInputs().find(input => !Number.isInteger(Number(input.value)) || Number(input.value) <= 0 || Number(input.value) > 10);
      const invalidIndexInput = courseIndexInputs().find(input => !Number.isInteger(Number(input.value)) || Number(input.value) < 1 || Number(input.value) > 18);
      const duplicateIndexInput = courseIndexInputs().find(input => courseIndexInputs().filter(item => item.value === input.value).length > 1);
      const target = !name ? els.newCourseName : (!codeIsValid ? els.newCourseCode : (invalidInput || invalidIndexInput || duplicateIndexInput || courseIndexInputs()[0]));
      target.setCustomValidity(t(!name ? 'Enter a course name.' : (!codeIsValid ? 'Enter a 2 digit code.' : (invalidInput ? 'Enter a par from 1 to 10.' : 'Enter unique index values from 1 to 18.'))));
      target.reportValidity();
      target.setCustomValidity('');
      return;
    }
    if (editingCourseId) {
      const existing = existingCourse;
      if (!existing) return;
      const course = { ...existing, name, country, region, pars, indexes };
      customCourses = customCourses.map(item => item.id === editingCourseId ? course : item);
      queuePendingCourse(course);
      saveCoursesLocal();
      closeCourseModal();
      render();
      switchView('courses');
      try {
        await flushPendingCourses();
        await syncFromCloud(false);
      } catch (error) {
        setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: error.message });
      }
      return;
    }
    const baseId = slugify(name);
    let id = baseId;
    let count = 2;
    while (allCourses().some(course => course.id === id)) {
      id = `${baseId}-${count}`;
      count += 1;
    }
    const course = { id, name, country, region, pars, indexes, editCode };
    customCourses.push(course);
    queuePendingCourse(course);
    saveCoursesLocal();
    state.courseId = id;
    saveState();
    closeCourseModal();
    render();
    switchView('courses');
    try {
      await flushPendingCourses();
      await syncFromCloud(false);
    } catch (error) {
      setSyncState({ ok: false, busy: false, label: t('Cloud sync Not ok'), title: error.message });
    }
  });

  els.newCourseCountry.addEventListener('change', () => {
    renderAreaRegions(els.newCourseCountry, els.newCourseRegion, DEFAULT_COURSE_REGION, false);
  });

  els.newGame.addEventListener('click', openGameModal);
  els.watchGames.addEventListener('click', () => performMainAction('watch'));
  els.viewScorecards.addEventListener('click', () => performMainAction('history'));
  els.newGameCountry.addEventListener('change', () => {
    renderNewGameRegions('');
    renderNewGameCourses('');
  });
  els.newGameRegion.addEventListener('change', () => renderNewGameCourses(''));
  els.newGameType.addEventListener('change', updateGameTypeFields);
  els.newLandlordPlayerCount.addEventListener('change', () => {
    els.newLandlordPlayerCount.dataset.landlordValue = els.newLandlordPlayerCount.value;
    updateGameTypeFields();
  });
  els.newLandlordMode.addEventListener('change', updateGameTypeFields);
  els.newLandlordBestPeasantCount.addEventListener('change', () => {
    renderBestPeasantCountOptions(Number(els.newLandlordPlayerCount.value || 3));
  });
  els.gameForm.addEventListener('click', event => {
    const button = event.target.closest('[data-select-target] button[data-value]');
    if (!button || button.disabled) return;
    const group = button.closest('[data-select-target]');
    const select = document.getElementById(group.dataset.selectTarget);
    if (!select || select.value === button.dataset.value) return;
    select.value = button.dataset.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    syncSegmentedControls(group);
  });
  els.gameWizardBack.addEventListener('click', () => showGameWizardStep(gameWizardStep - 1));
  els.gameWizardNext.addEventListener('click', () => {
    if (validateGameWizardStep()) showGameWizardStep(gameWizardStep + 1);
  });
  [
    [els.newPlayerA1, els.newHandicapA1, els.historyPlayerA1],
    [els.newPlayerA2, els.newHandicapA2, els.historyPlayerA2],
    [els.newPlayerB1, els.newHandicapB1, els.historyPlayerB1],
    [els.newPlayerB2, els.newHandicapB2, els.historyPlayerB2]
  ].forEach(([playerInput, handicapInput]) => {
    const picker = playerInput.closest('.player-name-picker');
    const menu = picker?.querySelector('.history-player-menu');
    const pickerButton = picker?.querySelector('.history-picker-button');
    const openHistoryMenu = () => {
      if (!menu) return;
      renderPlayerHistoryOptions();
      closeHistoricalPlayerMenus(menu);
      menu.hidden = false;
    };
    playerInput.addEventListener('input', () => {
      playerInput.setCustomValidity('');
      fillHistoricalPlayerHandicap(playerInput, handicapInput);
      renderPlayerHistoryOptions();
    });
    playerInput.addEventListener('change', () => fillHistoricalPlayerHandicap(playerInput, handicapInput));
    playerInput.addEventListener('input', renderFixedLandlordPlayers);
    pickerButton?.addEventListener('pointerdown', event => {
      event.preventDefault();
    });
    pickerButton?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      playerInput.blur();
      openHistoryMenu();
    });
    menu?.addEventListener('click', event => {
      const choice = event.target.closest('[data-player-name]');
      if (!choice || choice.disabled) return;
      playerInput.value = choice.dataset.playerName;
      fillHistoricalPlayerHandicap(playerInput, handicapInput);
      renderFixedLandlordPlayers();
      menu.hidden = true;
      playerInput.blur();
    });
  });
  document.querySelectorAll('.number-stepper').forEach(stepper => {
    stepper.addEventListener('click', event => {
      const button = event.target.closest('[data-step]');
      const input = stepper.querySelector('input[type="number"]');
      if (!button || !input) return;
      const step = Number(button.dataset.step) || 0;
      const min = Number(input.min || 0);
      const max = Number(input.max || 54);
      input.value = String(Math.min(max, Math.max(min, (Number(input.value) || 0) + step)));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.player-name-picker')) closeHistoricalPlayerMenus();
  });
  els.landlordMultipliers.addEventListener('click', event => {
    const button = event.target.closest('[data-multiplier]');
    if (button) setLandlordMultiplier(button.dataset.multiplier);
  });
  els.cancelGame.addEventListener('click', closeGameModal);
  els.cancelGameBottom.addEventListener('click', closeGameModal);

  els.gameModal.addEventListener('click', event => {
    if (event.target === els.gameModal) closeGameModal();
  });

  els.gameForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateUniqueNewGamePlayers()) return;
    const allPlayers = [
      els.newPlayerA1.value.trim() || 'Player 1',
      els.newPlayerA2.value.trim() || 'Player 2',
      els.newPlayerB1.value.trim() || 'Player 3',
      els.newPlayerB2.value.trim() || 'Player 4'
    ];
    const gameType = els.newGameType.value === 'landlord' ? 'landlord' : 'vegas';
    const playerCount = gameType === 'landlord' && Number(els.newLandlordPlayerCount.value) === 3 ? 3 : 4;
    const players = allPlayers.slice(0, playerCount);
    const handicaps = normalizeHandicaps([
      els.newHandicapA1.value,
      els.newHandicapA2.value,
      els.newHandicapB1.value,
      els.newHandicapB2.value
    ]);
    const code = els.newGameCode.value.trim();
    if (!editingGameInfoId && !/^\d{2}$/.test(code)) {
      els.newGameCode.setCustomValidity(t('Enter a 2 digit code.'));
      els.newGameCode.reportValidity();
      els.newGameCode.setCustomValidity('');
      return;
    }
    const course = allCourses().find(item => item.id === els.newGameCourse.value);
    if (!course) {
      els.newGameCourse.setCustomValidity(t('Choose a course.'));
      els.newGameCourse.reportValidity();
      els.newGameCourse.setCustomValidity('');
      return;
    }
    const teeTime = els.newGameTeeTime.value;
    const nextState = {
      gameType,
      courseId: course.id,
      players,
      handicaps,
      scoreMode: els.newGameScoreMode.value === 'net' ? 'net' : 'gross',
      underParFlip: els.newGameBirdieFlip.checked,
      birdieFlip: els.newGameBirdieFlip.checked,
      landlord: normalizeLandlordState({
        ...(editingGameInfoId ? savedRounds.find(round => round.id === editingGameInfoId)?.landlord : null),
        playerCount,
        bestPeasantCount: els.newLandlordBestPeasantCount.value,
        tieOutcome: els.newLandlordTieOutcome.value,
        selectionMode: els.newLandlordMode.value === 'fixed' ? 'fixed' : 'rotating',
        fixedLandlordIndex: Number(els.newFixedLandlordPlayer.value) || 0
      }, playerCount)
    };

    if (editingGameInfoId) {
      const existing = savedRounds.find(round => round.id === editingGameInfoId);
      if (!existing) return;
      const courseChanged = existing.courseId !== course.id;
      if (!(await confirmSaveGameInfoWithCode(existing, courseChanged))) return;
      activeGameId = existing.id;
      state = {
        ...state,
        ...nextState,
        scores: normalizeScores(existing.scores)
      };
      const updated = replaceRound(roundFromState({
        ...existing,
        totals: {
          ...existing.totals,
          teeTime
        }
      }, gameStatus(existing)));
      scheduleAutoSync(updated);
      await flushPendingRoundSync();
      closeGameModal();
      render();
      return;
    }

    const scoringPlayer = await confirmScoringPlayer({ gameType, players, landlord: nextState.landlord });
    if (!scoringPlayer) return;

    state = {
      ...nextState,
      scores: emptyScores()
    };
    const game = replaceRound(roundFromState({
      totals: {
        status: 'playing',
        editCode: code,
        teeTime
      }
    }, 'playing'));
    activeGameId = game.id;
    isEditing = true;
    activePlayHoleIndex = 0;
    saveState();
    scheduleAutoSync(game);
    await flushPendingRoundSync();
    closeGameModal();
    render();
    switchView('play');
  });

  els.gameForm.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
      window.setTimeout(() => input.select(), 0);
    });
  });

  els.languageButton?.addEventListener('click', window.VEGAS_I18N.toggle);
  els.welcomeLanguageButton?.addEventListener('click', window.VEGAS_I18N.toggle);
}

async function init() {
  const cloudReady = hasSupabaseConfig();
  const hasSeenWelcome = localStorage.getItem(WELCOME_SEEN_KEY) === '1';
  if (hasSeenWelcome && els.welcomeScreen) {
    els.welcomeScreen.hidden = true;
    welcomeReadyToEnter = true;
  }
  localStorage.removeItem(LEGACY_DELETE_KEY);
  localStorage.removeItem(LEGACY_COURSE_DELETE_KEY);
  editCredentials = loadJson(EDIT_CREDENTIALS_KEY, {});
  customCourses = loadJson(COURSE_KEY, []);
  pendingCourses = loadJson(PENDING_COURSES_KEY, []).map(normalizeCourse);
  savedRounds = loadJson(HISTORY_KEY, []).map(normalizeRound);
  customCourses.forEach(course => rememberEditCode('course', course.id, course.editCode));
  savedRounds.forEach(round => rememberEditCode('round', round.id, round.totals?.editCode));
  pendingSyncRound = loadPendingRoundLocal();
  if (pendingSyncRound) savedRounds = mergeRounds(savedRounds, [pendingSyncRound]);
  const savedState = loadJson(STORAGE_KEY, {});
  activeGameId = savedState.activeGameId || '';
  currentView = ['start', 'play', 'leaderboard', 'courses'].includes(savedState.currentView) ? savedState.currentView : 'start';
  const savedPlayHoleIndex = Math.max(0, Math.min(17, Number(savedState.activePlayHoleIndex) || 0));
  activePlayHoleIndex = savedPlayHoleIndex;
  const shouldResumeEditing = Boolean(savedState.isEditing && activeGameId);
  state = { ...state, ...savedState, scores: normalizeScores(savedState.scores) };
  state.gameType = state.gameType === 'landlord' ? 'landlord' : 'vegas';
  if (!Array.isArray(state.players) || (state.gameType === 'vegas' && state.players.length !== 4) || (state.gameType === 'landlord' && ![3, 4].includes(state.players.length))) {
    state.players = ['Player 1', 'Player 2', 'Player 3', 'Player 4'];
  }
  state.landlord = normalizeLandlordState(state.landlord, state.players.length);
  state.playerMeta = normalizePlayerMeta(state.playerMeta, state.players.length);
  state.handicaps = normalizeHandicaps(state.handicaps);
  state.scoreMode = state.scoreMode === 'net' ? 'net' : 'gross';
  state.underParFlip = 'underParFlip' in state ? Boolean(state.underParFlip) : Boolean(state.birdieFlip);
  state.birdieFlip = state.underParFlip;
  chooseInitialGame();
  if (activeGameId && savedRounds.some(round => round.id === activeGameId)) {
    loadGame(activeGameId, shouldResumeEditing, false, savedPlayHoleIndex);
  }
  isEditing = shouldResumeEditing;
  if (cloudReady) {
    setSyncState({
      ready: true,
      busy: false,
      ok: false,
      label: t('Cloud sync Not ok'),
      title: `Supabase room: ${supabaseConfig().syncKey}`
    });
  }
  renderCourseParInputs();
  addListeners();
  setupOverlayAccessibility();
  render();
  switchView(currentView);
  try {
    await syncFromCloud(false);
    if (pendingSyncRound) await flushPendingRoundSync();
  } finally {
    cloudRefreshEnabled = true;
    refreshCloudForCurrentView(true);
    if (els.welcomeScreen && !hasSeenWelcome) {
      const remainingWelcomeTime = Math.max(0, WELCOME_MIN_DURATION_MS - (performance.now() - welcomeStartedAt));
      if (remainingWelcomeTime) {
        await new Promise(resolve => window.setTimeout(resolve, remainingWelcomeTime));
      }
      welcomeReadyToEnter = true;
      els.welcomeScreen.classList.add('ready');
      els.welcomeActions.forEach(button => { button.disabled = false; });
      if (pendingWelcomeAction) enterFromWelcome(pendingWelcomeAction);
    }
  }
  window.setInterval(() => {
    refreshCloudForCurrentView();
  }, REFRESH_TIMER_TICK_MS);
  window.addEventListener('focus', () => {
    refreshCloudForCurrentView(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && pendingSyncRound) {
      flushPendingRoundSync();
      return;
    }
    if (!document.hidden && hasSupabaseConfig()) {
      refreshCloudForCurrentView(true);
    }
  });
  window.addEventListener('online', () => {
    if (pendingSyncRound) {
      flushPendingRoundSync();
      return;
    }
    refreshCloudForCurrentView(true);
  });
  window.addEventListener('pagehide', () => {
    if (pendingSyncRound) flushPendingRoundSync();
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js?v=205', { updateViaCache: 'none' })
      .then(registration => registration.update())
      .catch(() => {});
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const reloadKey = 'jfk.simpleGolfSwReload.v205';
    if (sessionStorage.getItem(reloadKey)) return;
    sessionStorage.setItem(reloadKey, '1');
    window.location.reload();
  });
}

init();

