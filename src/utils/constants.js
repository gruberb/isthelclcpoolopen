export const ACCESS_TYPES = {
  PUBLIC: "public",
  MEMBERS: "members",
  SENIORS: "seniors",
  WOMENS: "womens",
  SENSORY: "sensory",
  CLOSED: "closed",
};

export const ACCESS_TYPE_LABELS = {
  [ACCESS_TYPES.PUBLIC]: "Regular",
  [ACCESS_TYPES.MEMBERS]: "Members Only",
  [ACCESS_TYPES.SENIORS]: "Seniors 60+ Only",
  [ACCESS_TYPES.WOMENS]: "Women's Only (All Pools)",
  [ACCESS_TYPES.SENSORY]: "Sensory Swim",
  [ACCESS_TYPES.CLOSED]: "Private/Closed",
};

export const EVENT_DEFINITIONS = {
  "members swim": { lanes: true, kids: true, access: ACCESS_TYPES.MEMBERS },
  "member swim": { lanes: true, kids: true, access: ACCESS_TYPES.MEMBERS },
  "senior swim": { lanes: true, kids: false, access: ACCESS_TYPES.SENIORS },
  "women's only swim": { lanes: true, kids: true, access: ACCESS_TYPES.WOMENS },
  "modl women's only swim": {
    lanes: true,
    kids: true,
    access: ACCESS_TYPES.WOMENS,
  },
  "lane swim": { lanes: true, kids: null, access: ACCESS_TYPES.PUBLIC },
  "lane swim only": { lanes: true, kids: false, access: ACCESS_TYPES.PUBLIC },
  "recreational swim": { lanes: true, kids: true, access: ACCESS_TYPES.PUBLIC },
  "sensory swim": { lanes: true, kids: true, access: ACCESS_TYPES.SENSORY },
  "hello holidays free swim": {
    lanes: true,
    kids: true,
    access: ACCESS_TYPES.PUBLIC,
  },
  "tob free swim": { lanes: false, kids: true, access: ACCESS_TYPES.PUBLIC },
  "public swim": { lanes: null, kids: true, access: ACCESS_TYPES.PUBLIC },
  "public swimming": { lanes: null, kids: true, access: ACCESS_TYPES.PUBLIC },
  "public swim - no lanes": {
    lanes: false,
    kids: true,
    access: ACCESS_TYPES.PUBLIC,
  },
  "public swimming - no lanes": {
    lanes: false,
    kids: true,
    access: ACCESS_TYPES.PUBLIC,
  },
  "family swim": { lanes: null, kids: true, access: ACCESS_TYPES.PUBLIC },
  "parent & tot swim": {
    lanes: null,
    kids: false,
    access: ACCESS_TYPES.PUBLIC,
  },
  "aquafit using lap pool": {
    lanes: false,
    kids: null,
    access: ACCESS_TYPES.PUBLIC,
  },
  "elderfit using lap pool": {
    lanes: false,
    kids: null,
    access: ACCESS_TYPES.PUBLIC,
  },
  "lap pool closed": { lanes: false, kids: null, access: ACCESS_TYPES.PUBLIC },
  "play pool is closed": {
    lanes: null,
    kids: false,
    access: ACCESS_TYPES.PUBLIC,
  },
  "no lanes": { lanes: false, kids: null, access: ACCESS_TYPES.PUBLIC },
  busy: { lanes: false, kids: false, access: ACCESS_TYPES.CLOSED },
  "pool party": { lanes: false, kids: false, access: ACCESS_TYPES.CLOSED },
  "private pool party rental": {
    lanes: false,
    kids: false,
    access: ACCESS_TYPES.CLOSED,
  },
};

function deriveList(predicate) {
  return Object.entries(EVENT_DEFINITIONS)
    .filter(([, def]) => predicate(def))
    .map(([name]) => name);
}

export const CONSTANTS = {
  EVENT_COLORS: {
    POOL: "#0000FF",
    BUSY: "#00FF00",
  },

  NON_POOL_KEYWORDS: ["skating club", "hockey", "ice"],

  FALLBACK_KEYWORDS: {
    SWIM: "swim",
    LANE: "lane",
    FAMILY: "family",
    RECREATIONAL: "recreational",
    PLAY_THERAPY: ["play & therapy", "play and therapy"],
  },

  LANES_ALWAYS_OPEN: deriveList((def) => def.lanes === true),
  LANES_ALWAYS_CLOSED: deriveList((def) => def.lanes === false),
  KIDS_ALWAYS_OPEN: deriveList((def) => def.kids === true),
  KIDS_ALWAYS_CLOSED: deriveList((def) => def.kids === false),

  ACCESS_MEMBERS: [
    ...deriveList((def) => def.access === ACCESS_TYPES.MEMBERS),
    "member only",
  ],
  ACCESS_WOMENS: [
    ...deriveList((def) => def.access === ACCESS_TYPES.WOMENS),
    "women only",
  ],
  ACCESS_SENIORS: [
    ...deriveList((def) => def.access === ACCESS_TYPES.SENIORS),
    "seniors 60+",
  ],
  ACCESS_SENSORY: [
    ...deriveList((def) => def.access === ACCESS_TYPES.SENSORY),
    "sensory",
  ],
  ACCESS_CLOSED: deriveList((def) => def.access === ACCESS_TYPES.CLOSED),

  LIBRARY_DISPLAY_NAMES: {
    "Margaret Hennigar Library": "Bridgewater",
    "Lunenburg Library": "Lunenburg",
    "Liverpool Branch Library": "Liverpool",
    "Alean Freeman Library": "Greenfield",
  },

  TABS: {
    SWIMMING: [
      { id: "status", label: "Status" },
      { id: "schedule", label: "Full Schedule" },
      { id: "family", label: "Family" },
      { id: "swimmers", label: "Lane Swimmers" },
      { id: "special", label: "Special Events" },
    ],
    LIBRARIES: [
      { id: "status", label: "Status" },
      { id: "schedule", label: "Full Schedule" },
    ],
  },
};
