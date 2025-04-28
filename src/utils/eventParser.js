import {
  SWIM_KEYWORDS,
  EVENT_TITLES,
  EVENT_COLORS,
  EVENT_TYPES,
  PARSE_KEYWORDS,
} from "/constants.js";

/**
 * Determine if an event is a swimming event
 * @param {Object} event The event to check
 * @returns {boolean} True if it's a swimming event
 */
export function isSwimmingEvent(event) {
  const title = event.title || "";
  const lower = title.toLowerCase();

  // Always include "Busy" events
  if (title === EVENT_TITLES.BUSY) {
    return true;
  }

  // Check backgroundColor first - blue (#0000FF) indicates pool events
  if (event.backgroundColor === EVENT_COLORS.POOL) {
    // Exclude non-pool events even if they have blue background
    if (
      lower.includes("skating club") ||
      lower.includes("hockey") ||
      lower.includes("ice")
    ) {
      return false;
    }

    // Filter out specific events
    if (
      title === EVENT_TITLES.POOL_PARTY ||
      title === EVENT_TITLES.PRIVATE_POOL_PARTY
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
 * Analyze an event to determine its properties (lanes, kids, etc.)
 * @param {Object} event The event to analyze
 * @returns {Object} Analysis of the event
 */
export function analyzeEvent(event) {
  const title = event.title || "";
  const lower = title.toLowerCase();
  const analysis = {
    lanes: false,
    kids: false,
    membersOnly: false,
    restrictedAccess: false,
    type: "",
    details: {},
  };

  // Check for Busy events
  if (title === EVENT_TITLES.BUSY) {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = EVENT_TYPES.BUSY_MAINTENANCE;
    return analysis;
  }

  // Check for members-only events
  if (title === EVENT_TITLES.MEMBERS_SWIM) {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.membersOnly = true;
    analysis.type = EVENT_TYPES.MEMBERS_ONLY;
    return analysis;
  }

  // Check for women's only events
  if (title === EVENT_TITLES.WOMENS_ONLY_SWIM) {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.restrictedAccess = true;
    analysis.type = EVENT_TYPES.WOMENS_ONLY_FULL;
    return analysis;
  }

  // Check for senior swim 60+ events
  if (title === EVENT_TITLES.SENIOR_SWIM_60) {
    analysis.lanes = true;
    analysis.kids = false; // Senior swim means no kids
    analysis.restrictedAccess = true;
    analysis.type = EVENT_TYPES.SENIOR_ONLY_60;
    return analysis;
  }

  // Check for specific event types based on patterns in the title
  if (lower.includes(PARSE_KEYWORDS.RECREATIONAL_SWIM)) {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.type = EVENT_TYPES.RECREATIONAL;

    // Parse lane information
    const laneMatch = title.match(/(\d+)\s*lanes?/i);
    if (laneMatch) {
      analysis.details.lanes = parseInt(laneMatch[1]);
    }
  } else if (
    PARSE_KEYWORDS.LESSONS_LANES.some((keyword) => lower.includes(keyword))
  ) {
    analysis.lanes = true;
    analysis.kids = false;
    analysis.type = EVENT_TYPES.LESSONS_LANES;

    // Parse lane information
    const laneMatch = title.match(/(\d+)\s*lanes?/i);
    if (laneMatch) {
      analysis.details.lanes = parseInt(laneMatch[1]);
    }
  } else if (
    PARSE_KEYWORDS.PUBLIC_SWIM.some((keyword) => lower.includes(keyword))
  ) {
    analysis.kids = true;
    if (lower.includes(PARSE_KEYWORDS.NO_LANES)) {
      analysis.lanes = false;
      analysis.type = EVENT_TYPES.PUBLIC_NO_LANES;
    } else {
      analysis.lanes = true;
      analysis.type = EVENT_TYPES.PUBLIC_SWIMMING;
    }
  } else if (
    lower.includes(PARSE_KEYWORDS.ELDERFIT) ||
    (lower.includes(PARSE_KEYWORDS.SENIOR_SWIM) && !title.includes("60+"))
  ) {
    analysis.lanes = false;
    analysis.kids = false;
    if (
      lower.includes(PARSE_KEYWORDS.PLAY) &&
      lower.includes(PARSE_KEYWORDS.THERAPY_POOL)
    ) {
      analysis.kids = true;
    }
    analysis.type = EVENT_TYPES.SENIOR_PROGRAM;
  } else if (lower.includes(PARSE_KEYWORDS.AQUAFIT)) {
    analysis.lanes = false;
    analysis.kids = false;
    if (
      lower.includes(PARSE_KEYWORDS.PLAY) &&
      lower.includes(PARSE_KEYWORDS.THERAPY_POOL)
    ) {
      analysis.kids = true;
    }
    analysis.type = EVENT_TYPES.AQUAFIT;
  } else if (
    PARSE_KEYWORDS.PARENT_TOT.some((keyword) => lower.includes(keyword))
  ) {
    analysis.lanes = false;
    analysis.kids = true;
    analysis.type = EVENT_TYPES.PARENT_TOT;
  } else if (lower.includes(PARSE_KEYWORDS.SENSORY_SWIM)) {
    analysis.lanes = false;
    analysis.kids = true;
    analysis.type = EVENT_TYPES.SENSORY_SWIM;
  } else if (
    PARSE_KEYWORDS.WOMENS_ONLY.some((keyword) => lower.includes(keyword)) &&
    !title.includes("MODL")
  ) {
    analysis.lanes = true;
    analysis.kids = false;
    analysis.type = EVENT_TYPES.WOMENS_ONLY;
  } else if (
    lower.includes(PARSE_KEYWORDS.PRIVATE_RENTAL) ||
    PARSE_KEYWORDS.CLOSED_TO_PUBLIC.some((keyword) => lower.includes(keyword))
  ) {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = EVENT_TYPES.PRIVATE_CLOSED;
  } else {
    // Default parsing for other events
    if (PARSE_KEYWORDS.LANE.some((keyword) => lower.includes(keyword))) {
      analysis.lanes = true;
    }

    if (
      lower.includes(PARSE_KEYWORDS.PLAY) ||
      lower.includes(PARSE_KEYWORDS.FAMILY) ||
      lower.includes(PARSE_KEYWORDS.RECREATIONAL)
    ) {
      analysis.kids = true;
    }
  }

  // Check if therapy pool is mentioned
  if (lower.includes(PARSE_KEYWORDS.THERAPY_POOL)) {
    analysis.details.therapyPool = true;
  }

  // Check if play pool is mentioned
  if (lower.includes(PARSE_KEYWORDS.PLAY_POOL)) {
    analysis.details.playPool = true;
  }

  // Final check that overrides other decisions - LAP POOL CLOSED
  if (title.includes("LAP POOL CLOSED")) {
    analysis.lanes = false; // Force lanes to be closed regardless of other keywords
  }

  return analysis;
}

/**
 * Find the next event of a specific type (lanes or kids)
 * @param {Array} events List of events
 * @param {Date} now Current time
 * @param {string} type Type of event ("lanes" or "kids")
 * @returns {Object|undefined} Next event or undefined if none found
 */
export function getNextEvent(events, now, type) {
  return events.find((event) => {
    const analysis = analyzeEvent(event);
    return (
      event.start > now && (type === "lanes" ? analysis.lanes : analysis.kids)
    );
  });
}
