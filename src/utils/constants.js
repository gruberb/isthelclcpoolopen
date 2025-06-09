export const CONSTANTS = {
  // Cache durations
  CACHE_DURATION: {
    SWIMMING: 30 * 60 * 1000, // 30 minutes
    SKATING: 30 * 60 * 1000, // 30 minutes
    LIBRARIES: 7 * 24 * 60 * 60 * 1000, // 7 days (library hours change less frequently)
  },

  // Event colors from the API
  EVENT_COLORS: {
    POOL: "#0000FF", // Blue for pool events
    BUSY: "#00FF00", // Green for busy events
  },

  // Keywords for identifying swimming events
  SWIM_KEYWORDS: [
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
    "member swim",
  ],

  // Keywords for excluding non-pool events
  NON_POOL_KEYWORDS: ["skating club", "hockey", "ice"],

  // Event types (used for UI categorization)
  EVENT_TYPES: {
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
    WOMENS_ONLY: "MODL Women's Only Swim",
    WOMENS_ONLY_FULL: "Women's Only (All Pools)",
    SENIOR_ONLY_60: "Seniors 60+ Only",
    PRIVATE_CLOSED: "Private/Closed",
    MIXED_USE: "Mixed Use",
    REGULAR: "Regular",
  },

  // Special events and keywords
  SPECIAL_EVENTS: {
    BUSY: "Busy",
    POOL_PARTY: "Pool Party",
    PRIVATE_POOL_PARTY: "Private Pool Party Rental",
  },

  // Keywords for event parsing
  KEYWORDS: {
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
  },

  // Pool availability lists
  // Events where lanes are ALWAYS open
  LANES_ALWAYS_OPEN: [
    "members swim",
    "member swim",
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
    "member swim",
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
    "play pool is closed"
  ],

  // Access type indicators
  ACCESS_MEMBERS: ["members swim", "member swim", "member only"],
  ACCESS_WOMENS: ["women's only swim", "modl women's only swim", "women only"],
  ACCESS_SENIORS: ["senior swim", "seniors 60+"],

  // Library display names (shorter)
  LIBRARY_DISPLAY_NAMES: {
    "Margaret Hennigar Library": "Bridgewater",
    "Lunenburg Library": "Lunenburg",
    "Liverpool Branch Library": "Liverpool",
    "Alean Freeman Library": "Greenfield",
  },

  // Common tab definitions
  TABS: {
    SWIMMING: [
      { id: "status", label: "Current Status" },
      { id: "schedule", label: "Full Schedule" },
    ],
    LIBRARIES: [
      { id: "status", label: "Current Status" },
      { id: "schedule", label: "Full Schedule" },
    ],
  },
};
