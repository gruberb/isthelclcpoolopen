import appState from "../state/appState.js";
import { analyzeEvent, getNextEvent } from "../utils/eventParser.js";
import { formatTimeRemaining, formatTime } from "../utils/dateUtils.js";
import { DOM_IDS, CSS_CLASSES } from "/constants.js";

/**
 * Find the current status and next time change for a particular feature (lanes or kids)
 * This accounts for gaps in the schedule and finds when the feature will actually end or begin
 * @param {Array} events List of events
 * @param {Date} now Current date/time
 * @param {string} type Type to look for ("lanes" or "kids")
 * @returns {Object} Information about the current status and next time change
 */
function findFeatureStatus(events, now, type) {
  // Get today's events
  const todayStr = now.toDateString();
  const todayEvents = events.filter(
    (event) => new Date(event.start).toDateString() === todayStr,
  );

  // Sort by start time
  todayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));

  // Find currently active and next events
  let currentEvent = null;
  let nextEvent = null;

  // Find the current event that provides the feature
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

      // Special case: LAP POOL CLOSED overrides
      const explicitlyClosed =
        type === "lanes" && event.title.includes("LAP POOL CLOSED");

      if (hasFeature && !explicitlyClosed) {
        currentEvent = event;
        break; // Found a current event with the feature
      }
    }
  }

  // Find the next event that will provide the feature
  for (const event of todayEvents) {
    const eventStart = new Date(event.start);

    // Only look at future events
    if (eventStart > now) {
      const analysis = analyzeEvent(event);
      const hasFeature =
        (type === "lanes" && analysis.lanes) ||
        (type === "kids" && analysis.kids);

      // Special case: LAP POOL CLOSED overrides
      const explicitlyClosed =
        type === "lanes" && event.title.includes("LAP POOL CLOSED");

      if (hasFeature && !explicitlyClosed) {
        nextEvent = event;
        break; // Found the next event with the feature
      }
    }
  }

  // If we have a current event with the feature
  if (currentEvent) {
    const analysis = analyzeEvent(currentEvent);
    return {
      isActive: true,
      endTime: new Date(currentEvent.end),
      details: analysis.details || {},
      restrictedAccess: analysis.restrictedAccess,
      membersOnly: analysis.membersOnly,
      restrictionType: analysis.type,
    };
  }

  // If we're in a gap but have a future event with the feature
  if (!currentEvent && nextEvent) {
    return {
      isActive: false,
      inGap: true,
      nextStartTime: new Date(nextEvent.start),
    };
  }

  // No more events with this feature today
  return {
    isActive: false,
    inGap: false,
  };
}

/**
 * Update the current status display
 */
export function updateCurrentStatus() {
  const now = new Date();

  // Get status for lanes and kids pools
  const lanesStatus = findFeatureStatus(appState.allEvents, now, "lanes");
  const kidsStatus = findFeatureStatus(appState.allEvents, now, "kids");

  // Update status indicators
  const lanesStatusEl = document.getElementById(DOM_IDS.LANES_STATUS);
  const kidsStatusEl = document.getElementById(DOM_IDS.KIDS_STATUS);
  const lanesTimeEl = document.getElementById(DOM_IDS.LANES_TIME);
  const kidsTimeEl = document.getElementById(DOM_IDS.KIDS_TIME);

  if (!lanesStatusEl || !kidsStatusEl || !lanesTimeEl || !kidsTimeEl) {
    console.warn("Status elements not found");
    return;
  }

  // Update lanes status
  lanesStatusEl.textContent = lanesStatus.isActive ? "YES" : "NO";
  lanesStatusEl.className = `${CSS_CLASSES.STATUS_INDICATOR} ${
    lanesStatus.restrictedAccess
      ? CSS_CLASSES.RESTRICTED
      : lanesStatus.membersOnly
        ? CSS_CLASSES.MEMBERS
        : lanesStatus.isActive
          ? CSS_CLASSES.OPEN
          : CSS_CLASSES.CLOSED
  }`;

  // Update kids status
  kidsStatusEl.textContent = kidsStatus.isActive ? "YES" : "NO";
  kidsStatusEl.className = `${CSS_CLASSES.STATUS_INDICATOR} ${
    kidsStatus.restrictedAccess
      ? CSS_CLASSES.RESTRICTED
      : kidsStatus.membersOnly
        ? CSS_CLASSES.MEMBERS
        : kidsStatus.isActive
          ? CSS_CLASSES.OPEN
          : CSS_CLASSES.CLOSED
  }`;

  // Update time information for lanes
  if (lanesStatus.isActive) {
    let lanesDetail = formatTimeRemaining(lanesStatus.endTime);

    // Add restriction information if applicable
    if (lanesStatus.restrictedAccess) {
      const restrictionType =
        lanesStatus.restrictionType === "Women's Only (All Pools)"
          ? "Women only"
          : "Seniors 60+";
      lanesDetail = `${restrictionType} - ${lanesDetail}`;
    } else if (lanesStatus.membersOnly) {
      lanesDetail = `Members only - ${lanesDetail}`;
    }
    // Removed lane count information as requested

    lanesTimeEl.textContent = lanesDetail;
  } else if (lanesStatus.inGap) {
    lanesTimeEl.textContent = `Opens at ${formatTime(lanesStatus.nextStartTime)}`;
  } else {
    lanesTimeEl.textContent = "No more lane swimming today";
  }

  // Update time information for kids
  if (kidsStatus.isActive) {
    let kidsDetail = formatTimeRemaining(kidsStatus.endTime);

    // Add restriction information if applicable
    if (kidsStatus.restrictedAccess) {
      const restrictionType =
        kidsStatus.restrictionType === "Women's Only (All Pools)"
          ? "Women only"
          : "Seniors 60+";
      kidsDetail = `${restrictionType} - ${kidsDetail}`;
    } else if (kidsStatus.membersOnly) {
      kidsDetail = `Members only - ${kidsDetail}`;
    }

    kidsTimeEl.textContent = kidsDetail;
  } else if (kidsStatus.inGap) {
    kidsTimeEl.textContent = `Opens at ${formatTime(kidsStatus.nextStartTime)}`;
  } else {
    kidsTimeEl.textContent = "No more kids swimming today";
  }

  // Update last updated time
  const lastUpdatedElement = document.getElementById(DOM_IDS.LAST_UPDATED);
  if (lastUpdatedElement && appState.lastUpdated) {
    lastUpdatedElement.textContent = appState.lastUpdated.toLocaleTimeString();
  }
}

/**
 * Initialize the status display
 */
export function initializeStatusDisplay() {
  // Subscribe to state changes to update the status display
  appState.subscribe(updateCurrentStatus);
}
