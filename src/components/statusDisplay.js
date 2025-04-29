import appState from "../state/appState.js";
import { analyzeEvent } from "../utils/eventParser.js";
import { formatTimeRemaining, formatTime } from "../utils/dateUtils.js";
import { DOM_IDS, CSS_CLASSES, EVENT_TYPES } from "../constants.js";

/**
 * Find the current status and next time change for a particular feature (lanes or kids)
 * This accounts for gaps in the schedule and finds when the feature will actually end or begin
 * @param {Array} events List of events
 * @param {Date} now Current date/time
 * @param {string} type Type to look for ("lanes" or "kids")
 * @returns {Object} Information about the current status and next time change
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

      // If this event starts exactly when our current sequence ends (no gap)
      // and has the feature we're looking for, extend our continuous time
      if (Math.abs(eventStart - currentEndTime) < 60000 && hasFeature) {
        // Stop extending if we encounter a special event (members only, restricted access)
        if (analysis.restrictedAccess || analysis.membersOnly) {
          break;
        }

        // Extend the continuous availability time
        featureEndTime = eventEnd;
        currentEndTime = eventEnd;
      } else if (eventStart > currentEndTime) {
        // We've found a gap or an event without the feature - this is the end of continuous availability
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
      };
    }
  }

  // No more events with this feature today
  return {
    isActive: false,
    inGap: false,
  };
}

/**
 * Format the time detail text based on event type and remaining time
 * @param {Object} status The feature status object
 * @returns {string} Formatted time detail string
 */
function formatTimeDetail(status) {
  if (!status.isActive) {
    if (status.inGap) {
      let openText = `Opens at ${formatTime(status.nextStartTime)}`;
      if (status.restrictedAccess) {
        openText += " (Restricted)";
      } else if (status.membersOnly) {
        openText += " (Members Only)";
      }
      return openText;
    }
    return "No more swimming today";
  }

  let timeRemaining = formatTimeRemaining(status.endTime);

  // For special events, add access type to the time remaining
  if (status.restrictedAccess) {
    const restrictionType =
      status.restrictionType === EVENT_TYPES.WOMENS_ONLY_FULL
        ? "Women only"
        : status.restrictionType === EVENT_TYPES.SENIOR_ONLY_60
          ? "Seniors 60+"
          : "Restricted access";
    return `${restrictionType} - ${timeRemaining}`;
  } else if (status.membersOnly) {
    return `Members only - ${timeRemaining}`;
  }

  return timeRemaining;
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

  // Simplify status indicators to just YES/NO
  lanesStatusEl.textContent = lanesStatus.isActive ? "YES" : "NO";
  kidsStatusEl.textContent = kidsStatus.isActive ? "YES" : "NO";

  // Set appropriate CSS classes (keep the color coding)
  lanesStatusEl.className = `${CSS_CLASSES.STATUS_INDICATOR} ${
    lanesStatus.restrictedAccess
      ? CSS_CLASSES.RESTRICTED
      : lanesStatus.membersOnly
        ? CSS_CLASSES.MEMBERS
        : lanesStatus.isActive
          ? CSS_CLASSES.OPEN
          : CSS_CLASSES.CLOSED
  }`;

  kidsStatusEl.className = `${CSS_CLASSES.STATUS_INDICATOR} ${
    kidsStatus.restrictedAccess
      ? CSS_CLASSES.RESTRICTED
      : kidsStatus.membersOnly
        ? CSS_CLASSES.MEMBERS
        : kidsStatus.isActive
          ? CSS_CLASSES.OPEN
          : CSS_CLASSES.CLOSED
  }`;

  // Update time information using the formatting function
  lanesTimeEl.textContent = formatTimeDetail(lanesStatus);
  kidsTimeEl.textContent = formatTimeDetail(kidsStatus);

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
