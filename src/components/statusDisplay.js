import appState from "../state/appState.js";
import { analyzeEvent, getNextEvent } from "../utils/eventParser.js";
import { formatTimeRemaining, formatTime } from "../utils/dateUtils.js";
import { DOM_IDS, CSS_CLASSES } from "/constants.js";

/*
 * Find the last event end time for the current day
 * @param {Array} events List of events
 * @param {Date} now Current date/time
 * @param {string} type Type to look for ("lanes" or "kids")
 * @returns {Date|null} End time of the last event or null if not found
 */
function findLastEventEndTime(events, now, type) {
  // Get only events from today
  const todayStr = now.toDateString();
  const todayEvents = events.filter(
    (event) => event.start.toDateString() === todayStr,
  );

  // Sort by end time descending
  todayEvents.sort((a, b) => b.end - a.end);

  // Find the last event of the specified type
  for (const event of todayEvents) {
    const analysis = analyzeEvent(event);
    if (type === "lanes" && analysis.lanes) {
      return event.end;
    } else if (type === "kids" && analysis.kids) {
      return event.end;
    }
  }

  return null;
}

/**
 * Update the current status display
 */
export function updateCurrentStatus() {
  const now = new Date();
  let currentLanes = false;
  let currentKids = false;
  let currentMembersOnly = false;
  let currentRestrictedAccess = false;
  let currentLanesEnd = null;
  let currentKidsEnd = null;
  let currentEventDetails = null;

  const lastLanesEnd = findLastEventEndTime(appState.allEvents, now, "lanes");
  const lastKidsEnd = findLastEventEndTime(appState.allEvents, now, "kids");

  appState.allEvents.forEach((event) => {
    if (event.start <= now && event.end >= now) {
      const analysis = analyzeEvent(event);

      if (analysis.membersOnly) {
        currentMembersOnly = true;
        currentLanes = true;
        currentKids = true;
        currentLanesEnd = event.end;
        currentKidsEnd = event.end;
        currentEventDetails = analysis;
      } else if (analysis.restrictedAccess) {
        currentRestrictedAccess = true;
        currentLanes = true;
        currentKids = true;
        currentLanesEnd = event.end;
        currentKidsEnd = event.end;
        currentEventDetails = analysis;
      } else {
        if (analysis.lanes) {
          currentLanes = true;
          currentLanesEnd = event.end;
          currentEventDetails = analysis;
        }
        if (analysis.kids) {
          currentKids = true;
          currentKidsEnd = event.end;
          currentEventDetails = analysis;
        }

        // If an event explicitly marks the lap pool as closed, override any other setting
        if (event.title.includes("LAP POOL CLOSED")) {
          currentLanes = false;
        }
      }
    }
  });

  // Update status indicators
  const lanesStatus = document.getElementById(DOM_IDS.LANES_STATUS);
  const kidsStatus = document.getElementById(DOM_IDS.KIDS_STATUS);
  const lanesTime = document.getElementById(DOM_IDS.LANES_TIME);
  const kidsTime = document.getElementById(DOM_IDS.KIDS_TIME);

  if (!lanesStatus || !kidsStatus || !lanesTime || !kidsTime) {
    console.warn("Status elements not found");
    return;
  }

  lanesStatus.textContent = currentLanes ? "YES" : "NO";
  lanesStatus.className = `${CSS_CLASSES.STATUS_INDICATOR} ${
    currentRestrictedAccess
      ? CSS_CLASSES.RESTRICTED
      : currentMembersOnly
        ? CSS_CLASSES.MEMBERS
        : currentLanes
          ? CSS_CLASSES.OPEN
          : CSS_CLASSES.CLOSED
  }`;

  kidsStatus.textContent = currentKids ? "YES" : "NO";
  kidsStatus.className = `${CSS_CLASSES.STATUS_INDICATOR} ${
    currentRestrictedAccess
      ? CSS_CLASSES.RESTRICTED
      : currentMembersOnly
        ? CSS_CLASSES.MEMBERS
        : currentKids
          ? CSS_CLASSES.OPEN
          : CSS_CLASSES.CLOSED
  }`;

  if (currentMembersOnly) {
    lanesTime.textContent =
      "Members only - " + formatTimeRemaining(currentLanesEnd);
    kidsTime.textContent =
      "Members only - " + formatTimeRemaining(currentKidsEnd);
  } else if (currentRestrictedAccess) {
    const restrictionType =
      currentEventDetails.type === "Women's Only (All Pools)"
        ? "Women only"
        : "Seniors 60+";
    lanesTime.textContent = `${restrictionType} - ${formatTimeRemaining(currentLanesEnd)}`;
    kidsTime.textContent = `${restrictionType} - ${formatTimeRemaining(currentKidsEnd)}`;
  } else {
    if (currentLanes) {
      // If lanes are currently open, show time until the last event ends instead of just the current event
      let lanesDetail = formatTimeRemaining(lastLanesEnd || currentLanesEnd);

      // Only show lane count if we have that information
      if (currentEventDetails?.details?.lanes) {
        lanesDetail += ` (${currentEventDetails.details.lanes} lanes)`;
      }
      lanesTime.textContent = lanesDetail;
    } else {
      const nextLanesEvent = getNextEvent(appState.allEvents, now, "lanes");
      if (nextLanesEvent) {
        lanesTime.textContent = `Opens at ${formatTime(nextLanesEvent.start)}`;
      } else {
        lanesTime.textContent = "No more lane swimming today";
      }
    }

    if (currentKids) {
      // If kids swimming is currently open, show time until the last event ends
      let kidsDetail = formatTimeRemaining(lastKidsEnd || currentKidsEnd);
      kidsTime.textContent = kidsDetail;
    } else {
      const nextKidsEvent = getNextEvent(appState.allEvents, now, "kids");
      if (nextKidsEvent) {
        kidsTime.textContent = `Opens at ${formatTime(nextKidsEvent.start)}`;
      } else {
        kidsTime.textContent = "No more kids swimming today";
      }
    }
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
