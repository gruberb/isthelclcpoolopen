import { CONSTANTS } from "./constants";

/**
 * Check if an event is a swimming event based on title, color, etc.
 * @param {Object} event - Event object from API
 * @returns {boolean} - Whether it's a swimming event
 */
export function isSwimmingEvent(event) {
  const title = event.title || "";
  const lower = title.toLowerCase();

  // Always include "Busy" events
  if (title === CONSTANTS.SPECIAL_EVENTS.BUSY) {
    return true;
  }

  // Check backgroundColor first - blue (#0000FF) indicates pool events
  if (event.backgroundColor === CONSTANTS.EVENT_COLORS.POOL) {
    // Exclude non-pool events even if they have blue background
    if (
      CONSTANTS.NON_POOL_KEYWORDS.some((keyword) => lower.includes(keyword))
    ) {
      return false;
    }

    // Filter out specific events
    if (
      title === CONSTANTS.SPECIAL_EVENTS.POOL_PARTY ||
      title === CONSTANTS.SPECIAL_EVENTS.PRIVATE_POOL_PARTY
    ) {
      return false;
    }

    return true;
  }

  // For events without blue background, check keywords
  const hasSwimKeyword = CONSTANTS.SWIM_KEYWORDS.some((keyword) =>
    lower.includes(keyword),
  );

  return hasSwimKeyword;
}

/**
 * Check if title matches any of the keywords
 * @param {string} title - Event title
 * @param {Array|string} keywords - Keywords to check
 * @returns {boolean} - Whether there's a match
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
 * @param {string} title - Event title
 * @returns {boolean} - Whether play pool is open
 */
function isPlayPoolOpen(title) {
  const lowerTitle = title.toLowerCase();

  // Check for various ways of mentioning play pool is open
  return (
    matchesAny(title, CONSTANTS.KEYWORDS.PLAY_OPEN) ||
    matchesAny(title, CONSTANTS.KEYWORDS.PLAY_POOL) ||
    matchesAny(title, CONSTANTS.KEYWORDS.PLAY_POOLS) ||
    matchesAny(title, CONSTANTS.KEYWORDS.PLAY_THERAPY) ||
    (lowerTitle.includes("play") && lowerTitle.includes("open"))
  );
}

/**
 * Check if the title has a numeric lane count
 * @param {string} title - Event title
 * @returns {Object} - Object with boolean 'hasLanes' and 'count' properties
 */
function getLaneCount(title) {
  const lanesMatch = title.match(/(\d+)\s+lane/i);

  return {
    hasLanes: lanesMatch !== null,
    count: lanesMatch ? parseInt(lanesMatch[1]) : 0,
  };
}

/**
 * Analyze an event to determine its properties (lanes, kids, restrictions)
 * @param {Object} event - Event object
 * @returns {Object} - Analysis of the event
 */
export function analyzeEvent(event) {
  const title = event.title;
  const lowerTitle = title.toLowerCase();

  // Check if this is a "Busy" event first
  if (title === CONSTANTS.SPECIAL_EVENTS.BUSY) {
    return {
      lanes: false,
      kids: false,
      membersOnly: false,
      restrictedAccess: false,
      type: CONSTANTS.EVENT_TYPES.BUSY_MAINTENANCE,
      details: { lanes: 0 },
    };
  }

  // Check for lane availability - priority order matters
  let lanes = false;
  if (
    matchesAny(title, CONSTANTS.LANES_ALWAYS_CLOSED) ||
    matchesAny(title, CONSTANTS.KEYWORDS.LAP_POOL_ACTIVITIES)
  ) {
    lanes = false;
  } else if (matchesAny(title, CONSTANTS.LANES_ALWAYS_OPEN)) {
    lanes = true;
  } else {
    // If not in either list, check for lane mentions
    const laneInfo = getLaneCount(title);
    lanes = laneInfo.hasLanes || matchesAny(title, CONSTANTS.KEYWORDS.LANE);
  }

  // Check for kids pool availability - priority order matters
  let kids = false;
  if (matchesAny(title, CONSTANTS.KIDS_ALWAYS_CLOSED)) {
    kids = false;
  } else if (matchesAny(title, CONSTANTS.KIDS_ALWAYS_OPEN)) {
    kids = true;
  } else if (isPlayPoolOpen(title)) {
    // Special handling for when play pool is explicitly mentioned as open
    kids = true;
  } else if (
    matchesAny(title, CONSTANTS.KEYWORDS.RECREATIONAL) &&
    !lowerTitle.includes("no play")
  ) {
    // Recreational swim typically includes play pool unless specified otherwise
    kids = true;
  } else {
    // For events not in either list, check for keywords
    kids = matchesAny(title, CONSTANTS.KEYWORDS.FAMILY);
  }

  // Access restrictions
  const membersOnly = matchesAny(title, CONSTANTS.ACCESS_MEMBERS);
  const restrictedAccess = matchesAny(title, [
    ...CONSTANTS.ACCESS_WOMENS,
    ...CONSTANTS.ACCESS_SENIORS,
  ]);

  // Determine restriction type
  let restrictionType = CONSTANTS.EVENT_TYPES.REGULAR;
  if (matchesAny(title, CONSTANTS.ACCESS_WOMENS)) {
    restrictionType = CONSTANTS.EVENT_TYPES.WOMENS_ONLY_FULL;
  } else if (matchesAny(title, CONSTANTS.ACCESS_SENIORS)) {
    restrictionType = CONSTANTS.EVENT_TYPES.SENIOR_ONLY_60;
  } else if (matchesAny(title, CONSTANTS.KEYWORDS.SENSORY)) {
    restrictionType = CONSTANTS.EVENT_TYPES.SENSORY_SWIM;
  } else if (membersOnly) {
    restrictionType = CONSTANTS.EVENT_TYPES.MEMBERS_ONLY;
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

/**
 * Find the current status and next time change for a particular feature (lanes or kids)
 * @param {Array} events - List of events
 * @param {Date} now - Current date/time
 * @param {string} type - Type to look for ("lanes" or "kids")
 * @returns {Object} - Information about the current status and next time change
 */
export function findFeatureStatus(events, now, type) {
  // Get today's events
  const todayStr = now.toDateString();
  const todayEvents = events.filter(
    (event) => new Date(event.start).toDateString() === todayStr,
  );

  // Sort by start time
  todayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

  // Find currently active and next events
  let currentEvent = null;
  let featureEndTime = null;
  let nextFeatureStartTime = null;
  let restrictedAccess = false;
  let membersOnly = false;
  let restrictionType = null;

  // First, check if the feature is currently active
  for (const event of todayEvents) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check if this event is happening now
    if (eventStart <= now && eventEnd > now) {
      const analysis = analyzeEvent(event);

      // Check if this event has the feature we're looking for
      const hasFeature =
        (type === "lanes" && analysis.lanes) ||
        (type === "kids" && analysis.kids);

      if (hasFeature) {
        currentEvent = event;
        restrictedAccess = analysis.restrictedAccess;
        membersOnly = analysis.membersOnly;
        restrictionType = analysis.type;

        // For special events, just use the event's end time directly instead of looking for consecutive events
        if (restrictedAccess || membersOnly) {
          return {
            isActive: true,
            endTime: eventEnd,
            details: analysis.details || {},
            restrictedAccess,
            membersOnly,
            restrictionType,
            specialEvent: true,
            eventTitle: event.title,
          };
        }

        break; // Found a current event with the feature
      }
    }
  }

  // If feature is currently active (and not a special event which was returned above),
  // find when it will end (looking at consecutive events)
  if (currentEvent) {
    // Start from when the current event ends
    featureEndTime = new Date(currentEvent.end);

    // Look for consecutive events that have the feature
    let currentEndTime = featureEndTime;

    // Create a sorted copy of the events for scanning consecutive ones
    const sortedEvents = [...todayEvents].sort(
      (a, b) => new Date(a.start) - new Date(b.start),
    );

    // Look for events starting after our current event
    for (const event of sortedEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);

      // Skip events that aren't after our current event
      if (
        eventStart <= now ||
        new Date(event.start) <= new Date(currentEvent.start)
      ) {
        continue;
      }

      const analysis = analyzeEvent(event);

      // Check if this event has the feature we're looking for
      const hasFeature =
        (type === "lanes" && analysis.lanes) ||
        (type === "kids" && analysis.kids);

      // IMPROVED GAP HANDLING: Bridge reasonable gaps between events with the same feature
      const gapDuration = eventStart - currentEndTime;
      const maxGapDuration = 30 * 60 * 1000; // 45 minutes in milliseconds

      if (gapDuration >= 0 && gapDuration <= maxGapDuration && hasFeature) {
        // Stop extending if we encounter a special event (members only, restricted access)
        if (analysis.restrictedAccess || analysis.membersOnly) {
          break;
        }

        // Extend the continuous availability time through the gap
        featureEndTime = eventEnd;
        currentEndTime = eventEnd;
      } else if (eventStart > currentEndTime && !hasFeature) {
        // We've found an event without the feature - this is the end of continuous availability
        break;
      } else if (gapDuration > maxGapDuration) {
        // Gap is too large to bridge
        break;
      }
    }

    // If feature is currently active, return its status
    return {
      isActive: true,
      endTime: featureEndTime,
      details: analyzeEvent(currentEvent).details || {},
      restrictedAccess,
      membersOnly,
      restrictionType,
      specialEvent: false,
      eventTitle: currentEvent.title,
    };
  }

  // If feature is not currently active, find when it will next be available
  if (!currentEvent) {
    for (const event of todayEvents) {
      const eventStart = new Date(event.start);

      // Only look at future events
      if (eventStart > now) {
        const analysis = analyzeEvent(event);
        const hasFeature =
          (type === "lanes" && analysis.lanes) ||
          (type === "kids" && analysis.kids);

        if (hasFeature) {
          nextFeatureStartTime = eventStart;
          restrictedAccess = analysis.restrictedAccess;
          membersOnly = analysis.membersOnly;
          restrictionType = analysis.type;
          break; // Found the next event with the feature
        }
      }
    }

    // If we found a future event with the feature
    if (nextFeatureStartTime) {
      return {
        isActive: false,
        inGap: true,
        nextStartTime: nextFeatureStartTime,
        restrictedAccess,
        membersOnly,
        restrictionType: restrictionType,
      };
    }
  }

  // No more events with this feature today
  return {
    isActive: false,
    inGap: false,
  };
}
