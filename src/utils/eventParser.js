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
 * Analyze an event to determine its properties
 * @param {Object} event The event to analyze
 * @returns {Object} Analysis of the event
 */
export function analyzeEvent(event) {
  const title = event.title;

  // Check for specific conditions
  const membersOnly = title.includes("Members");
  const restrictedAccess =
    title.includes("Senior Swim") ||
    title.includes("Women") ||
    title.includes("Sensory");

  // For lanes, check for numeric lanes count and LAP POOL CLOSED
  const lanesCountMatch = title.match(/(\d+)\s+Lane/);
  const hasExplicitLaneCount = !!lanesCountMatch;
  const lanesCount = hasExplicitLaneCount ? parseInt(lanesCountMatch[1]) : 0;

  // CRITICAL: LAP POOL CLOSED overrides lane count completely
  const lapPoolClosed = title.includes("LAP POOL CLOSED");
  const explicitlyNoLanes = title.includes("No Lanes");

  // Check for kids pools
  const kidsPoolsOpen = title.includes("Play") || title.includes("Therapy");

  // Determine lane availability:
  // If LAP POOL CLOSED appears anywhere in the title, lanes are not available
  // regardless of whether there's a lane count mentioned
  const lanesAvailable =
    hasExplicitLaneCount && !lapPoolClosed && !explicitlyNoLanes;

  return {
    lanes: lanesAvailable,
    kids: kidsPoolsOpen,
    membersOnly,
    restrictedAccess,
    type: title.includes("Women")
      ? "Women's Only (All Pools)"
      : title.includes("Senior")
        ? "Seniors 60+"
        : title.includes("Sensory")
          ? "Sensory Swim"
          : "Regular",
    details: {
      lanes: lanesCount,
    },
  };
}
