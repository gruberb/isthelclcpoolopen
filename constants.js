const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
const API_BASE_URL =
  "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
const CORS_PROXY = "https://corsproxy.io/?";

// Keywords for identifying swimming events
const SWIM_KEYWORDS = [
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

// Time intervals
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TIME_UPDATE_INTERVAL = 60 * 1000; // 1 minute

// Date range
const DATE_RANGE_DAYS = 8; // Today + 7 days

// Timezone settings
const FACILITY_TIMEZONE = "America/Halifax"; // Atlantic Time

// Event colors from the API
const EVENT_COLORS = {
  POOL: "#0000FF", // Blue for pool events
  BUSY: "#00FF00", // Green for busy events
};

// Event titles
const EVENT_TITLES = {
  MEMBERS_SWIM: "Members Swim",
  BUSY: "Busy",
  POOL_PARTY: "Pool Party",
  PRIVATE_POOL_PARTY: "Private Pool Party Rental",
  WOMENS_ONLY_SWIM: "MODL Women's Only Swim",
  SENIOR_SWIM_60: "Senior Swim - 60+",
};

// Event types
const EVENT_TYPES = {
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
};

// CSS Classes
const CSS_CLASSES = {
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
const DOM_IDS = {
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

// Keywords for parsing events
const PARSE_KEYWORDS = {
  RECREATIONAL_SWIM: "recreational swim",
  LESSONS_LANES: ["lessons & lanes", "lessons and lanes"],
  PUBLIC_SWIM: ["public swim", "public swimming"],
  NO_LANES: "no lanes",
  ELDERFIT: "elderfit",
  SENIOR_SWIM: "senior swim",
  AQUAFIT: "aquafit",
  PARENT_TOT: ["parent & tot", "parent and tot"],
  SENSORY_SWIM: "sensory swim",
  WOMENS_ONLY: ["women's only", "women only"],
  PRIVATE_RENTAL: "private rental",
  CLOSED_TO_PUBLIC: ["closed to the public", "closed to public"],
  LANE: ["lane", "lanes"],
  PLAY: "play",
  FAMILY: "family",
  RECREATIONAL: "recreational",
  THERAPY_POOL: "therapy pool",
  PLAY_POOL: "play pool",
};
