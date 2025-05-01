import { fetchScheduleData } from "./api/scheduleService.js";
import { convertToLocalTime } from "./utils/dateUtils.js";
import { isSwimmingEvent } from "./utils/eventParser.js";
import {
  initializeStatusDisplay,
  updateCurrentStatus,
} from "./components/statusDisplay.js";
import {
  initializeScheduleDisplay,
  initializeTabs,
} from "./components/scheduleDisplay.js";
import appState from "./state/appState.js";
import {
  REFRESH_INTERVAL,
  TIME_UPDATE_INTERVAL,
  DOM_IDS,
  CSS_CLASSES,
} from "./constants.js";

/**
 * Process schedule data from the API
 * @param {Array} data Raw schedule data from the API
 */
function processSchedule(data) {
  const now = new Date();

  // Filter for swimming events only and handle timezone conversion
  const events = data
    .filter(isSwimmingEvent)
    .map((event) => {
      const start = convertToLocalTime(event.start);
      const end = convertToLocalTime(event.end);

      // Skip events with invalid dates
      if (!start || !end) {
        console.warn("Skipping event with invalid dates:", event);
        return null;
      }

      return {
        id: event.id,
        title: event.title,
        start: start,
        end: end,
        backgroundColor: event.backgroundColor,
        textColor: event.textColor,
        allDay: event.allDay,
        facility: event.facility || "LCLC > BMO Financial Group Aquatic Centre",
      };
    })
    .filter((event) => event !== null) // Remove any null events
    .sort((a, b) => a.start - b.start);

  // Update application state with the processed events
  appState.setEvents(events);
  appState.setSelectedDate(now);

  // Display user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneElement = document.getElementById(DOM_IDS.USER_TIMEZONE);
  if (timezoneElement) {
    timezoneElement.textContent = userTimezone;
  }

  // Mark loading as complete
  document.body.classList.remove("loading");
}

/**
 * Fetch the schedule data and process it
 */
async function fetchSchedule() {
  try {
    const data = await fetchScheduleData();
    processSchedule(data);
  } catch (error) {
    console.error("Error:", error);
    const scheduleContent = document.getElementById(DOM_IDS.SCHEDULE_CONTENT);
    if (scheduleContent) {
      scheduleContent.innerHTML = `<div class="${CSS_CLASSES.ERROR}">Unable to load schedule. Please try again later.</div>`;
    }

    // Still remove loading state even on error
    document.body.classList.remove("loading");
  }
}

/**
 * Initialize essential UI components immediately
 */
function initializeEssentialUI() {
  // Initialize status display placeholders immediately for better perceived performance
  const lanesStatusEl = document.getElementById(DOM_IDS.LANES_STATUS);
  const kidsStatusEl = document.getElementById(DOM_IDS.KIDS_STATUS);

  if (lanesStatusEl) lanesStatusEl.textContent = "-";
  if (kidsStatusEl) kidsStatusEl.textContent = "-";

  // Set up tabs right away as this is a simple DOM operation
  initializeTabs();

  // Add loading indicator to body for initial state
  document.body.classList.add("loading");
}

/**
 * Initialize the full application
 */
function initializeApp() {
  // Initialize all components
  initializeStatusDisplay();
  initializeScheduleDisplay();

  // Initial fetch
  fetchSchedule();

  // Refresh every X minutes
  setInterval(fetchSchedule, REFRESH_INTERVAL);

  // Update time remaining every minute
  setInterval(() => {
    if (appState.allEvents.length > 0) {
      updateCurrentStatus();
    }
  }, TIME_UPDATE_INTERVAL);
}

// Split initialization into critical and non-critical paths
document.addEventListener("DOMContentLoaded", () => {
  // Initialize essential UI immediately for fast initial render
  initializeEssentialUI();

  // Defer full initialization to let the page render first
  // This improves perceived performance
  setTimeout(initializeApp, 10);
});
