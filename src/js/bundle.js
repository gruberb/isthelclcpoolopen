(function () {
  'use strict';

  // Facility information
  const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
  const API_BASE_URL =
    "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
  const CORS_PROXY = "https://corsproxy.io/?";
  const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  // Date range
  const DATE_RANGE_DAYS = 8; // Today + 7 days

  // Time intervals
  const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  const TIME_UPDATE_INTERVAL = 60 * 1000; // 1 minute

  // Event colors from the API
  const EVENT_COLORS = {
    POOL: "#0000FF", // Blue for pool events
    BUSY: "#00FF00", // Green for busy events
  };

  // Keywords for identifying swimming events
  const SWIM_KEYWORDS = [
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
  ];

  // Keywords for excluding non-pool events
  const NON_POOL_KEYWORDS = ["skating club", "hockey", "ice"];

  // Event types (used for UI categorization)
  const EVENT_TYPES = {
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
    WOMENS_ONLY: "Women's Only",
    WOMENS_ONLY_FULL: "Women's Only (All Pools)",
    SENIOR_ONLY_60: "Seniors 60+ Only",
    PRIVATE_CLOSED: "Private/Closed",
    MIXED_USE: "Mixed Use",
    REGULAR: "Regular",
  };

  // CSS Classes
  const CSS_CLASSES = {
    STATUS_INDICATOR: "status-indicator",
    OPEN: "open",
    CLOSED: "closed",
    MEMBERS: "members",
    RESTRICTED: "restricted",
    MEMBERS_CHECKMARK: "members-checkmark",
    RESTRICTED_CHECKMARK: "restricted-checkmark",
    CHECKMARK: "checkmark",
    CROSS: "cross",
    CURRENT: "current",
    PAST: "past",
    BUSY: "busy",
    EVENT: "event",
    ERROR: "error",
    LOADING: "loading",
    ACTIVE: "active",
    TAB: "tab",
    TAB_CONTENT: "tab-content",
  };

  // DOM Element IDs
  const DOM_IDS = {
    LANES_STATUS: "lanes-status",
    KIDS_STATUS: "kids-status",
    LANES_TIME: "lanes-time",
    KIDS_TIME: "kids-time",
    SCHEDULE_CONTENT: "schedule-content",
    LAST_UPDATED: "last-updated",
    USER_TIMEZONE: "user-timezone",
    DATE_SELECT: "date-select",
    TODAY_BTN: "today-btn",
    TOMORROW_BTN: "tomorrow-btn",
    CURRENT_EVENT: "current-event",
    SCHEDULE_TITLE: "#schedule h3",
  };

  // Keywords for event parsing
  const KEYWORDS = {
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
  };

  // Pool availability configuration
  const POOL_AVAILABILITY = {
    // Special event titles
    SPECIAL_EVENTS: {
      BUSY: "Busy",
      POOL_PARTY: "Pool Party",
      PRIVATE_POOL_PARTY: "Private Pool Party Rental",
    },

    // Events where lanes are ALWAYS open
    LANES_ALWAYS_OPEN: [
      "members swim",
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
    ],

    // Access type indicators
    ACCESS_MEMBERS: ["members swim", "member only"],
    ACCESS_WOMENS: ["women's only swim", "modl women's only swim", "women only"],
    ACCESS_SENIORS: ["senior swim", "seniors 60+"],
  };

  // Enhanced scheduleService.js with caching

  // Cache key for local storage
  const SCHEDULE_CACHE_KEY = "lclc_schedule_cache";
  const CACHE_TIMESTAMP_KEY = "lclc_schedule_timestamp";

  /**
   * Format a date for API consumption (in Atlantic timezone)
   * @param {Date} date The date to format
   * @returns {string} Formatted date string
   */
  function formatDateForAPI(date) {
    // Format date as YYYY-MM-DD for simplicity
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Use Atlantic Time offset (-03:00 for daylight savings)
    return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
  }

  /**
   * Check if cached data is still valid
   * @returns {boolean} True if cache is valid
   */
  function isCacheValid() {
    try {
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      if (!timestamp) return false;

      const cacheTime = parseInt(timestamp, 10);
      const now = Date.now();

      // Cache is valid if it's less than CACHE_DURATION_MS old (e.g., 30 minutes)
      return now - cacheTime < CACHE_DURATION_MS;
    } catch (e) {
      console.warn("Error checking cache validity:", e);
      return false;
    }
  }

  /**
   * Get cached schedule data
   * @returns {Array|null} Cached schedule data or null if no valid cache
   */
  function getCachedSchedule() {
    try {
      if (!isCacheValid()) return null;

      const cachedData = localStorage.getItem(SCHEDULE_CACHE_KEY);
      if (!cachedData) return null;

      return JSON.parse(cachedData);
    } catch (e) {
      console.warn("Error retrieving cache:", e);
      return null;
    }
  }

  /**
   * Cache schedule data
   * @param {Array} data Schedule data to cache
   */
  function cacheSchedule(data) {
    try {
      localStorage.setItem(SCHEDULE_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (e) {
      console.warn("Error caching schedule:", e);
    }
  }

  /**
   * Fetches schedule data from the API with retries
   * @param {number} retries Number of retries on failure
   * @returns {Promise<Array>} Schedule data from the API
   */
  async function fetchFromAPI(retries = 2) {
    // Generate date range for the request
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    endDate.setHours(0, 0, 0, 0);

    const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;

    try {
      const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl), {
        headers: {
          Accept: "application/json",
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();

      // Cache successful response
      cacheSchedule(data);

      return data;
    } catch (error) {
      console.error("Error fetching schedule:", error);

      // Retry logic
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        return await fetchFromAPI(retries - 1);
      }

      throw error;
    }
  }

  /**
   * Fetches schedule data with cache support
   * @returns {Promise<Array>} Schedule data
   */
  async function fetchScheduleData() {
    try {
      // First check if we have valid cached data
      const cachedData = getCachedSchedule();
      if (cachedData) {
        console.log("Using cached schedule data");
        return cachedData;
      }

      // No valid cache, fetch fresh data
      return await fetchFromAPI();
    } catch (error) {
      console.error("Error in fetchScheduleData:", error);

      // If API fails completely, try to use expired cache as fallback
      try {
        const expiredCache = localStorage.getItem(SCHEDULE_CACHE_KEY);
        if (expiredCache) {
          console.log("Using expired cache as fallback");
          return JSON.parse(expiredCache);
        }
      } catch (cacheError) {
        console.error("Failed to use expired cache:", cacheError);
      }

      throw error;
    }
  }

  /**
   * Convert a date string from Atlantic Time to user's local timezone
   * @param {string} dateString Date string to convert
   * @returns {Date|null} Converted date or null if invalid
   */
  function convertToLocalTime(dateString) {
    // Parse the input date string as is
    const inputDate = new Date(dateString);

    // If the date is invalid, return null
    if (isNaN(inputDate.getTime())) {
      console.error("Invalid date:", dateString);
      return null;
    }

    // The API returns times without timezone information,
    // but we know they're in Atlantic Time
    // We need to convert to the user's local timezone

    // Get the user's current timezone offset
    const userOffset = new Date().getTimezoneOffset();

    // Atlantic Time is UTC-4 during standard time, UTC-3 during daylight savings
    // We'll use a simple check for daylight savings based on the date
    const isSummer = inputDate.getMonth() >= 3 && inputDate.getMonth() <= 10;
    const atlanticOffset = isSummer ? -3 * 60 : -4 * 60; // Convert hours to minutes

    // Calculate the difference in minutes
    const offsetDiff = userOffset + atlanticOffset;

    // Apply the offset
    return new Date(inputDate.getTime() + offsetDiff * 60 * 1000);
  }

  /**
   * Format a time string in a human-readable format
   * @param {Date} date The date to format
   * @returns {string} Formatted time string
   */
  function formatTime(date) {
    if (!date) return "";

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  /**
   * Format the remaining time until a specific date
   * @param {Date} endTime The end time to calculate remaining time to
   * @returns {string} Formatted remaining time string
   */
  function formatTimeRemaining(endTime) {
    if (!endTime) return "Unknown";

    const now = new Date();
    const diff = endTime - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  /**
   * Determine if an event is a swimming event
   * @param {Object} event The event to check
   * @returns {boolean} True if it's a swimming event
   */
  function isSwimmingEvent(event) {
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
  function analyzeEvent(event) {
    const title = event.title;
    const lowerTitle = title.toLowerCase();

    // Check if this is a "Busy" event first
    if (title === POOL_AVAILABILITY.SPECIAL_EVENTS.BUSY) {
      return {
        lanes: false,
        kids: false,
        membersOnly: false,
        restrictedAccess: false,
        type: EVENT_TYPES.BUSY_MAINTENANCE,
        details: { lanes: 0 },
      };
    }

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
   * Simple state management for the application
   */
  class AppState {
    constructor() {
      this.allEvents = [];
      this.currentTab = "current"; // 'current' or 'schedule'
      this.lastUpdated = null;
      this.subscribers = [];
      this.isLoading = false;
      this.error = null;
      this.selectedDate = new Date(); // Initialize with current date
    }

    /**
     * Set events in the state
     * @param {Array} events The new events data
     */
    setEvents(events) {
      this.allEvents = events.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

      this.lastUpdated = new Date();
      this.isLoading = false;
      this.error = null;

      this.notifySubscribers();
    }

    /**
     * Set the selected date
     * @param {Date} date The date to select
     */
    setSelectedDate(date) {
      if (date instanceof Date && !isNaN(date.getTime())) {
        this.selectedDate = date;
        this.notifySubscribers();
      }
    }

    /**
     * Get events for a specific date
     * @param {Date} date The date to get events for
     * @returns {Array} Events for the specified date
     */
    getEventsForDate(date) {
      if (!date) {
        return [];
      }

      const dateStr = date.toDateString();
      return this.allEvents.filter(
        (event) => new Date(event.start).toDateString() === dateStr,
      );
    }

    /**
     * Set the loading state
     * @param {boolean} isLoading Whether the app is loading data
     */
    setLoading(isLoading) {
      this.isLoading = isLoading;
      this.notifySubscribers();
    }

    /**
     * Set an error state
     * @param {string} error The error message
     */
    setError(error) {
      this.error = error;
      this.isLoading = false;
      this.notifySubscribers();
    }

    /**
     * Change the current tab
     * @param {string} tab The tab to switch to ('current' or 'schedule')
     */
    setTab(tab) {
      if (tab === "current" || tab === "schedule") {
        this.currentTab = tab;
        this.notifySubscribers();
      }
    }

    /**
     * Subscribe to state changes
     * @param {Function} callback Function to call when state changes
     */
    subscribe(callback) {
      if (typeof callback === "function") {
        this.subscribers.push(callback);
      }
    }

    /**
     * Unsubscribe from state changes
     * @param {Function} callback The callback to remove
     */
    unsubscribe(callback) {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    }

    /**
     * Notify all subscribers of state changes
     */
    notifySubscribers() {
      this.subscribers.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error("Error in subscriber callback:", error);
        }
      });
    }
  }

  // Create and export a singleton instance
  const appState = new AppState();

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
  function updateCurrentStatus() {
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
  function initializeStatusDisplay() {
    // Subscribe to state changes to update the status display
    appState.subscribe(updateCurrentStatus);
  }

  /**
   * Populate the date selector with options for the next week
   */
  function populateDateSelector() {
    const dateSelect = document.getElementById(DOM_IDS.DATE_SELECT);
    if (!dateSelect) {
      console.warn("Date selector not found");
      return;
    }

    const today = new Date();
    const dates = [];

    // Generate dates for today and the next days
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    dateSelect.innerHTML = dates
      .map((date) => {
        const dateStr = date.toDateString();
        const isToday = dateStr === today.toDateString();
        const isTomorrow =
          dateStr === new Date(today.getTime() + 86400000).toDateString();

        let label;
        if (isToday) {
          label = "Today";
        } else if (isTomorrow) {
          label = "Tomorrow";
        } else {
          label = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
        }

        return `<option value="${dateStr}" ${isToday ? "selected" : ""}>${label}</option>`;
      })
      .join("");

    // Event listeners for date selection
    dateSelect.addEventListener("change", (e) => {
      const selectedDate = new Date(e.target.value);
      appState.setSelectedDate(selectedDate);
    });

    // Event listeners for today/tomorrow buttons
    const todayBtn = document.getElementById(DOM_IDS.TODAY_BTN);
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        dateSelect.value = today.toDateString();
        appState.setSelectedDate(today);
      });
    }

    const tomorrowBtn = document.getElementById(DOM_IDS.TOMORROW_BTN);
    if (tomorrowBtn) {
      tomorrowBtn.addEventListener("click", () => {
        const tomorrow = new Date(today.getTime() + 86400000);
        dateSelect.value = tomorrow.toDateString();
        appState.setSelectedDate(tomorrow);
      });
    }
  }

  /**
   * Update the date buttons (today/tomorrow) based on the selected date
   */
  function updateDateButtons() {
    const selectedDate = appState.selectedDate;
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);

    const todayBtn = document.getElementById(DOM_IDS.TODAY_BTN);
    const tomorrowBtn = document.getElementById(DOM_IDS.TOMORROW_BTN);

    if (todayBtn) {
      todayBtn.classList.toggle(
        CSS_CLASSES.ACTIVE,
        selectedDate.toDateString() === today.toDateString(),
      );
    }

    if (tomorrowBtn) {
      tomorrowBtn.classList.toggle(
        CSS_CLASSES.ACTIVE,
        selectedDate.toDateString() === tomorrow.toDateString(),
      );
    }
  }

  /**
   * Show the schedule for a specific date
   */
  function showScheduleForDate() {
    // Make sure selectedDate exists
    const date = appState.selectedDate || new Date();
    const dateStr = date.toDateString();
    const scheduleContent = document.getElementById(DOM_IDS.SCHEDULE_CONTENT);

    if (!scheduleContent) {
      console.warn("Schedule content element not found");
      return;
    }

    const now = new Date();
    const dayEvents = appState.getEventsForDate(date);

    if (dayEvents.length === 0) {
      scheduleContent.innerHTML =
        '<div class="event">No swimming events scheduled for this day.</div>';
    } else {
      const scheduleTitle = document.querySelector(DOM_IDS.SCHEDULE_TITLE);
      if (scheduleTitle) {
        if (dateStr === now.toDateString()) {
          scheduleTitle.textContent = "Today's Swimming Schedule";
        } else if (
          dateStr === new Date(now.getTime() + 86400000).toDateString()
        ) {
          scheduleTitle.textContent = "Tomorrow's Swimming Schedule";
        } else {
          scheduleTitle.textContent = `Swimming Schedule for ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
        }
      }

      scheduleContent.innerHTML = dayEvents
        .map((event) => {
          const analysis = analyzeEvent(event);
          const isCurrent =
            event.start <= now &&
            event.end >= now &&
            dateStr === now.toDateString();
          const isPast = event.end < now;

          let eventClass = "";
          if (isCurrent) {
            if (analysis.type === "Busy/Maintenance") {
              eventClass = CSS_CLASSES.BUSY;
            } else if (analysis.restrictedAccess) {
              eventClass = CSS_CLASSES.RESTRICTED;
            } else {
              eventClass = analysis.membersOnly
                ? CSS_CLASSES.MEMBERS
                : CSS_CLASSES.CURRENT;
            }
          } else if (isPast) {
            eventClass = CSS_CLASSES.PAST;
          } else if (analysis.membersOnly) {
            eventClass = CSS_CLASSES.MEMBERS;
          } else if (analysis.restrictedAccess) {
            eventClass = CSS_CLASSES.RESTRICTED;
          } else if (analysis.type === "Busy/Maintenance") {
            eventClass = CSS_CLASSES.BUSY;
          }

          // Ensure lap pool closed is properly displayed
          const hasLanes =
            analysis.lanes && !event.title.includes("LAP POOL CLOSED");

          const lanesClass = analysis.restrictedAccess
            ? CSS_CLASSES.RESTRICTED_CHECKMARK
            : analysis.membersOnly
              ? CSS_CLASSES.MEMBERS_CHECKMARK
              : hasLanes
                ? CSS_CLASSES.CHECKMARK
                : CSS_CLASSES.CROSS;

          const kidsClass = analysis.restrictedAccess
            ? CSS_CLASSES.RESTRICTED_CHECKMARK
            : analysis.membersOnly
              ? CSS_CLASSES.MEMBERS_CHECKMARK
              : analysis.kids
                ? CSS_CLASSES.CHECKMARK
                : CSS_CLASSES.CROSS;

          let restrictionLabel = "";
          if (analysis.membersOnly) {
            restrictionLabel = "(Members Only)";
          } else if (analysis.restrictedAccess) {
            restrictionLabel =
              analysis.type === "Women's Only (All Pools)"
                ? "(Women Only)"
                : "(Seniors 60+ Only)";
          }

          return `
          <div class="${CSS_CLASSES.EVENT} ${eventClass}" ${isCurrent ? `id="${DOM_IDS.CURRENT_EVENT}"` : ""}>
              <div class="event-time">
                  ${formatTime(event.start)} -
                  ${formatTime(event.end)}
                  ${isCurrent ? '<span style="margin-left: 10px; color: #28a745;">◉ NOW</span>' : ""}
              </div>
              <div class="event-title">${event.title}</div>
              <div class="event-details">
                  Lanes: <span class="${lanesClass}">${hasLanes ? "✓" : "✗"}</span> |
                  Kids: <span class="${kidsClass}">${analysis.kids ? "✓" : "✗"}</span>
                  ${restrictionLabel ? `<br><span style="margin-left: 10px; color: ${analysis.restrictedAccess ? "#9c27b0" : "#0056b3"}; font-weight: bold;">${restrictionLabel}</span>` : ""}
              </div>
          </div>
        `;
        })
        .join("");

      // If we're displaying today's schedule, scroll to current event
      if (dateStr === now.toDateString()) {
        setTimeout(() => {
          const currentEvent = document.getElementById(DOM_IDS.CURRENT_EVENT);
          if (currentEvent) {
            currentEvent.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100); // Small delay to ensure DOM is updated
      }
    }
  }

  /**
   * Initialize the schedule display
   */
  function initializeScheduleDisplay() {
    populateDateSelector();

    // Subscribe to state changes to update the schedule display
    appState.subscribe(() => {
      showScheduleForDate();
      updateDateButtons();
    });
  }

  /**
   * Initialize tab switching behavior
   */
  function initializeTabs() {
    document.querySelectorAll(`.${CSS_CLASSES.TAB}`).forEach((tab) => {
      tab.addEventListener("click", () => {
        document
          .querySelectorAll(`.${CSS_CLASSES.TAB}`)
          .forEach((t) => t.classList.remove(CSS_CLASSES.ACTIVE));
        document
          .querySelectorAll(`.${CSS_CLASSES.TAB_CONTENT}`)
          .forEach((c) => c.classList.remove(CSS_CLASSES.ACTIVE));

        tab.classList.add(CSS_CLASSES.ACTIVE);
        document
          .getElementById(`${tab.dataset.tab}-tab`)
          .classList.add(CSS_CLASSES.ACTIVE);

        // If switching to schedule tab and showing today's schedule, scroll to current event
        if (tab.dataset.tab === "schedule") {
          const dateSelect = document.getElementById(DOM_IDS.DATE_SELECT);
          if (dateSelect) {
            const selectedDate = new Date(dateSelect.value);
            const today = new Date();

            if (selectedDate.toDateString() === today.toDateString()) {
              setTimeout(() => {
                const currentEvent = document.getElementById(
                  DOM_IDS.CURRENT_EVENT,
                );
                if (currentEvent) {
                  currentEvent.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }, 100);
            }
          }
        }
      });
    });
  }

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

})();
