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
} from "/constants.js";

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
  }
}

/**
 * Initialize the application
 */
function initializeApp() {
  // Initialize all components
  initializeStatusDisplay();
  initializeScheduleDisplay();
  initializeTabs();

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

// Start the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp);
