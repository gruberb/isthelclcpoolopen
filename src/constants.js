// Facility information
export const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
export const API_BASE_URL =
  "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
export const CORS_PROXY = "https://corsproxy.io/?";

// Date range
export const DATE_RANGE_DAYS = 8; // Today + 7 days

// Time intervals
export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
export const TIME_UPDATE_INTERVAL = 60 * 1000; // 1 minute

// Timezone settings
export const FACILITY_TIMEZONE = "America/Halifax"; // Atlantic Time

// Event colors from the API
export const EVENT_COLORS = {
  POOL: "#0000FF", // Blue for pool events
  BUSY: "#00FF00", // Green for busy events
};

// Keywords for identifying swimming events
export const SWIM_KEYWORDS = [
  "swim",
  "aqua",
  "pool",
  "water",
  "lap",
  "public swim",
  "family swim",
  "lane swim",
  "recreational swim",
  "members swim",
];

// Keywords for excluding non-pool events
export const NON_POOL_KEYWORDS = ["skating club", "hockey", "ice"];

// Event types (used for UI categorization)
export const EVENT_TYPES = {
  MEMBERS_ONLY: "Members Only",
  BUSY_MAINTENANCE: "Busy/Maintenance",
  RECREATIONAL: "Recreational",
  LESSONS_LANES: "Lessons & Lanes",
  PUBLIC_NO_LANES: "Public Swimming (No Lanes)",
  PUBLIC_SWIMMING: "Public Swimming",
  SENIOR_PROGRAM: "Senior Program",
  AQUAFIT: "Aquafit",
  PARENT_TOT: "Parent & Tot",
  SENSORY_SWIM: "Sensory Swim",
  WOMENS_ONLY: "Women's Only",
  WOMENS_ONLY_FULL: "Women's Only (All Pools)",
  SENIOR_ONLY_60: "Seniors 60+ Only",
  PRIVATE_CLOSED: "Private/Closed",
  MIXED_USE: "Mixed Use",
  REGULAR: "Regular",
};

// CSS Classes
export const CSS_CLASSES = {
  STATUS_INDICATOR: "status-indicator",
  OPEN: "open",
  CLOSED: "closed",
  MEMBERS: "members",
  RESTRICTED: "restricted",
  MEMBERS_CHECKMARK: "members-checkmark",
  RESTRICTED_CHECKMARK: "restricted-checkmark",
  CHECKMARK: "checkmark",
  CROSS: "cross",
  CURRENT: "current",
  PAST: "past",
  BUSY: "busy",
  EVENT: "event",
  ERROR: "error",
  LOADING: "loading",
  ACTIVE: "active",
  TAB: "tab",
  TAB_CONTENT: "tab-content",
};

// DOM Element IDs
export const DOM_IDS = {
  LANES_STATUS: "lanes-status",
  KIDS_STATUS: "kids-status",
  LANES_TIME: "lanes-time",
  KIDS_TIME: "kids-time",
  SCHEDULE_CONTENT: "schedule-content",
  LAST_UPDATED: "last-updated",
  USER_TIMEZONE: "user-timezone",
  DATE_SELECT: "date-select",
  TODAY_BTN: "today-btn",
  TOMORROW_BTN: "tomorrow-btn",
  CURRENT_EVENT: "current-event",
  SCHEDULE_TITLE: "#schedule h3",
};

// Keywords for event parsing
export const KEYWORDS = {
  // General keywords
  LANE: "lane",
  PLAY_OPEN: "play open",
  PLAY_POOL: "play pool",
  PLAY_POOLS: "play pools",
  PLAY_THERAPY: ["play & therapy", "play and therapy"],
  FAMILY: "family",
  SENSORY: "sensory",
  THERAPY_POOL: "therapy pool",
  RECREATIONAL: "recreational",

  // Activities that use the lap pool (no lanes)
  LAP_POOL_ACTIVITIES: ["aquafit using lap pool", "elderfit using lap pool"],

  // Lessons & Lanes variations
  LESSONS_AND_LANES: ["lessons & lanes", "lessons and lanes"],
};

// Pool availability configuration
export const POOL_AVAILABILITY = {
  // Special event titles
  SPECIAL_EVENTS: {
    BUSY: "Busy",
    POOL_PARTY: "Pool Party",
    PRIVATE_POOL_PARTY: "Private Pool Party Rental",
  },

  // Events where lanes are ALWAYS open
  LANES_ALWAYS_OPEN: [
    "members swim",
    "senior swim",
    "women's only swim",
    "modl women's only swim",
    "lane swim",
    "recreational swim",
  ],

  // Events where lanes are ALWAYS closed
  LANES_ALWAYS_CLOSED: [
    "lap pool closed",
    "no lanes",
    "public swim - no lanes",
    "public swimming - no lanes",
    "busy",
    "aquafit using lap pool",
    "elderfit using lap pool",
  ],

  // Events where kids pool is ALWAYS open
  KIDS_ALWAYS_OPEN: [
    "members swim",
    "women's only swim",
    "modl women's only swim",
    "public swim - no lanes",
    "public swim",
    "public swimming",
    "recreational swim",
    "family swim",
  ],

  // Events where kids pool is ALWAYS closed
  KIDS_ALWAYS_CLOSED: [
    "senior swim",
    "lane swim only",
    "busy",
    "parent & tot swim",
  ],

  // Access type indicators
  ACCESS_MEMBERS: ["members swim", "member only"],
  ACCESS_WOMENS: ["women's only swim", "modl women's only swim", "women only"],
  ACCESS_SENIORS: ["senior swim", "seniors 60+"],
};
