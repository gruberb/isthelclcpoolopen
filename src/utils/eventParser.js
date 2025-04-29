import {
  SWIM_KEYWORDS,
  NON_POOL_KEYWORDS,
  EVENT_COLORS,
  EVENT_TYPES,
  POOL_AVAILABILITY,
  KEYWORDS,
} from "../constants.js";

/**
 * Determine if an event is a swimming event
 * @param {Object} event The event to check
 * @returns {boolean} True if it's a swimming event
 */
export function isSwimmingEvent(event) {
  const title = event.title || "";
  const lower = title.toLowerCase();

  // Always include "Busy" events
  if (title === POOL_AVAILABILITY.SPECIAL_EVENTS.BUSY) {
    return true;
  }

  // Check backgroundColor first - blue (#0000FF) indicates pool events
  if (event.backgroundColor === EVENT_COLORS.POOL) {
    // Exclude non-pool events even if they have blue background
    if (NON_POOL_KEYWORDS.some((keyword) => lower.includes(keyword))) {
      return false;
    }

    // Filter out specific events
    if (
      title === POOL_AVAILABILITY.SPECIAL_EVENTS.POOL_PARTY ||
      title === POOL_AVAILABILITY.SPECIAL_EVENTS.PRIVATE_POOL_PARTY
    ) {
      return false;
    }

    return true;
  }

  // For events without blue background, check keywords
  const hasSwimKeyword = SWIM_KEYWORDS.some((keyword) =>
    lower.includes(keyword),
  );

  return hasSwimKeyword;
}

/**
 * Check if the event title contains any of the keywords in the given array
 * @param {string} title The event title to check
 * @param {Array|string} keywords Array of keywords or a single keyword
 * @returns {boolean} True if any keyword is found in the title
 */
function matchesAny(title, keywords) {
  const lowerTitle = title.toLowerCase();

  if (Array.isArray(keywords)) {
    return keywords.some((keyword) => lowerTitle.includes(keyword));
  }

  return lowerTitle.includes(keywords);
}

/**
 * Check if the title mentions Play Pool being open
 * @param {string} title The event title
 * @returns {boolean} True if play pool is mentioned as open
 */
function isPlayPoolOpen(title) {
  const lowerTitle = title.toLowerCase();

  // Check for various ways of mentioning play pool is open
  return (
    matchesAny(title, KEYWORDS.PLAY_OPEN) ||
    matchesAny(title, KEYWORDS.PLAY_POOL) ||
    matchesAny(title, KEYWORDS.PLAY_POOLS) ||
    matchesAny(title, KEYWORDS.PLAY_THERAPY) ||
    (lowerTitle.includes("play") && lowerTitle.includes("open"))
  );
}

/**
 * Check if the title has a numeric lane count
 * @param {string} title The event title
 * @returns {Object} Object with boolean 'hasLanes' and 'count' properties
 */
function getLaneCount(title) {
  const lanesMatch = title.match(/(\d+)\s+lane/i);

  return {
    hasLanes: lanesMatch !== null,
    count: lanesMatch ? parseInt(lanesMatch[1]) : 0,
  };
}

/**
 * Analyze an event to determine its properties
 * @param {Object} event The event to analyze
 * @returns {Object} Analysis of the event
 */
export function analyzeEvent(event) {
  const title = event.title;
  const lowerTitle = title.toLowerCase();

  // Check for lane availability - priority order matters
  let lanes = false;
  if (
    matchesAny(title, POOL_AVAILABILITY.LANES_ALWAYS_CLOSED) ||
    matchesAny(title, KEYWORDS.LAP_POOL_ACTIVITIES)
  ) {
    lanes = false;
  } else if (matchesAny(title, POOL_AVAILABILITY.LANES_ALWAYS_OPEN)) {
    lanes = true;
  } else {
    // If not in either list, check for lane mentions
    const laneInfo = getLaneCount(title);
    lanes = laneInfo.hasLanes || matchesAny(title, KEYWORDS.LANE);
  }

  // Check for kids pool availability - priority order matters
  let kids = false;
  if (matchesAny(title, POOL_AVAILABILITY.KIDS_ALWAYS_CLOSED)) {
    kids = false;
  } else if (matchesAny(title, POOL_AVAILABILITY.KIDS_ALWAYS_OPEN)) {
    kids = true;
  } else if (isPlayPoolOpen(title)) {
    // Special handling for when play pool is explicitly mentioned as open
    kids = true;
  } else if (
    matchesAny(title, KEYWORDS.RECREATIONAL) &&
    !lowerTitle.includes("no play")
  ) {
    // Recreational swim typically includes play pool unless specified otherwise
    kids = true;
  } else {
    // For events not in either list, check for keywords
    kids = matchesAny(title, KEYWORDS.FAMILY);
  }

  // Access restrictions
  const membersOnly = matchesAny(title, POOL_AVAILABILITY.ACCESS_MEMBERS);
  const restrictedAccess = matchesAny(title, [
    ...POOL_AVAILABILITY.ACCESS_WOMENS,
    ...POOL_AVAILABILITY.ACCESS_SENIORS,
  ]);

  // Determine restriction type
  let restrictionType = EVENT_TYPES.REGULAR;
  if (matchesAny(title, POOL_AVAILABILITY.ACCESS_WOMENS)) {
    restrictionType = EVENT_TYPES.WOMENS_ONLY_FULL;
  } else if (matchesAny(title, POOL_AVAILABILITY.ACCESS_SENIORS)) {
    restrictionType = EVENT_TYPES.SENIOR_ONLY_60;
  } else if (matchesAny(title, KEYWORDS.SENSORY)) {
    restrictionType = EVENT_TYPES.SENSORY_SWIM;
  } else if (membersOnly) {
    restrictionType = EVENT_TYPES.MEMBERS_ONLY;
  } else if (matchesAny(title, POOL_AVAILABILITY.SPECIAL_EVENTS.BUSY)) {
    restrictionType = EVENT_TYPES.BUSY_MAINTENANCE;
  }

  // Get lane count
  const laneInfo = getLaneCount(title);

  return {
    lanes,
    kids,
    membersOnly,
    restrictedAccess,
    type: restrictionType,
    details: {
      lanes: laneInfo.count,
    },
  };
}
