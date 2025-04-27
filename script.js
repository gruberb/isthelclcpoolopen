let allEvents = [];

async function fetchSchedule() {
  try {
    // Generate date range for the request
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    endDate.setHours(0, 0, 0, 0);

    // Format dates for API (using Atlantic timezone)
    const formatDateForAPI = (date) => {
      // Format date as YYYY-MM-DD for simplicity
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      // Use Atlantic Time offset (-03:00 for daylight savings)
      return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
    };

    const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;

    const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }

    const data = await response.json();
    processSchedule(data);
  } catch (error) {
    console.error("Error:", error);
    const scheduleContent = document.getElementById(DOM_IDS.SCHEDULE_CONTENT);
    if (scheduleContent) {
      scheduleContent.innerHTML = `<div class="${CSS_CLASSES.ERROR}">Unable to load schedule. Please try again later.</div>`;
    }
  }
}

function isSwimmingEvent(event) {
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

function analyzeEvent(event) {
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
    analysis.kids = true;
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

  return analysis;
}

function formatTimeRemaining(endTime) {
  const now = new Date();
  const diff = endTime - now;

  if (diff <= 0) return "Closing now";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const strTime =
    minutes === 0
      ? `${hours}${ampm}`
      : `${hours}:${minutes.toString().padStart(2, "0")}${ampm}`;
  return strTime;
}

// Convert a date string from Atlantic Time to user's local timezone
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

function getNextEvent(events, now, type) {
  return events.find((event) => {
    const analysis = analyzeEvent(event);
    return (
      event.start > now && (type === "lanes" ? analysis.lanes : analysis.kids)
    );
  });
}

function processSchedule(data) {
  const now = new Date();

  // Filter for swimming events only and handle timezone conversion
  allEvents = data
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

  // Update current status
  updateCurrentStatus(now);

  // Populate date selector
  populateDateSelector();

  // Show today's schedule
  showScheduleForDate(now);
  updateDateButtons(now);

  // Update last updated time
  const lastUpdatedElement = document.getElementById(DOM_IDS.LAST_UPDATED);
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = now.toLocaleTimeString();
  }

  // Display user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneElement = document.getElementById(DOM_IDS.USER_TIMEZONE);
  if (timezoneElement) {
    timezoneElement.textContent = userTimezone;
  }
}

function updateCurrentStatus(now) {
  let currentLanes = false;
  let currentKids = false;
  let currentMembersOnly = false;
  let currentRestrictedAccess = false;
  let currentLanesEnd = null;
  let currentKidsEnd = null;
  let currentEventDetails = null;

  allEvents.forEach((event) => {
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
      }
    }
  });

  // Update status indicators
  const lanesStatus = document.getElementById(DOM_IDS.LANES_STATUS);
  const kidsStatus = document.getElementById(DOM_IDS.KIDS_STATUS);
  const lanesTime = document.getElementById(DOM_IDS.LANES_TIME);
  const kidsTime = document.getElementById(DOM_IDS.KIDS_TIME);

  lanesStatus.textContent = currentLanes ? "YES" : "NO";
  lanesStatus.className = `${CSS_CLASSES.STATUS_INDICATOR} ${currentRestrictedAccess ? CSS_CLASSES.RESTRICTED : currentMembersOnly ? CSS_CLASSES.MEMBERS : currentLanes ? CSS_CLASSES.OPEN : CSS_CLASSES.CLOSED}`;
  kidsStatus.textContent = currentKids ? "YES" : "NO";
  kidsStatus.className = `${CSS_CLASSES.STATUS_INDICATOR} ${currentRestrictedAccess ? CSS_CLASSES.RESTRICTED : currentMembersOnly ? CSS_CLASSES.MEMBERS : currentKids ? CSS_CLASSES.OPEN : CSS_CLASSES.CLOSED}`;

  if (currentMembersOnly) {
    lanesTime.textContent =
      "Members only - " + formatTimeRemaining(currentLanesEnd);
    kidsTime.textContent =
      "Members only - " + formatTimeRemaining(currentKidsEnd);
  } else if (currentRestrictedAccess) {
    const restrictionType =
      currentEventDetails.type === EVENT_TYPES.WOMENS_ONLY_FULL
        ? "Women only"
        : "Seniors 60+";
    lanesTime.textContent = `${restrictionType} - ${formatTimeRemaining(currentLanesEnd)}`;
    kidsTime.textContent = `${restrictionType} - ${formatTimeRemaining(currentKidsEnd)}`;
  } else {
    if (currentLanes && currentLanesEnd) {
      let lanesDetail = formatTimeRemaining(currentLanesEnd);
      if (currentEventDetails?.details?.lanes) {
        lanesDetail += ` (${currentEventDetails.details.lanes} lanes)`;
      }
      lanesTime.textContent = lanesDetail;
    } else {
      const nextLanesEvent = getNextEvent(allEvents, now, "lanes");
      if (nextLanesEvent) {
        lanesTime.textContent = `Opens at ${formatTime(nextLanesEvent.start)}`;
      } else {
        lanesTime.textContent = "No more lane swimming today";
      }
    }

    if (currentKids && currentKidsEnd) {
      let kidsDetail = formatTimeRemaining(currentKidsEnd);
      if (currentEventDetails?.type) {
        kidsDetail += ` (${currentEventDetails.type})`;
      }
      kidsTime.textContent = kidsDetail;
    } else {
      const nextKidsEvent = getNextEvent(allEvents, now, "kids");
      if (nextKidsEvent) {
        kidsTime.textContent = `Opens at ${formatTime(nextKidsEvent.start)}`;
      } else {
        kidsTime.textContent = "No more kids swimming today";
      }
    }
  }
}

function populateDateSelector() {
  const dateSelect = document.getElementById(DOM_IDS.DATE_SELECT);
  const today = new Date();
  const dates = [];

  // Generate dates for today and the next days
  let i = 0;
  while (i < DATE_RANGE_DAYS) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
    i++;
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
    showScheduleForDate(selectedDate);
    updateDateButtons(selectedDate);
  });

  // Event listeners for today/tomorrow buttons
  document.getElementById(DOM_IDS.TODAY_BTN).addEventListener("click", () => {
    dateSelect.value = today.toDateString();
    showScheduleForDate(today);
    updateDateButtons(today);
  });

  document
    .getElementById(DOM_IDS.TOMORROW_BTN)
    .addEventListener("click", () => {
      const tomorrow = new Date(today.getTime() + 86400000);
      dateSelect.value = tomorrow.toDateString();
      showScheduleForDate(tomorrow);
      updateDateButtons(tomorrow);
    });
}

function updateDateButtons(selectedDate) {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);

  document
    .getElementById(DOM_IDS.TODAY_BTN)
    .classList.toggle(
      CSS_CLASSES.ACTIVE,
      selectedDate.toDateString() === today.toDateString(),
    );
  document
    .getElementById(DOM_IDS.TOMORROW_BTN)
    .classList.toggle(
      CSS_CLASSES.ACTIVE,
      selectedDate.toDateString() === tomorrow.toDateString(),
    );
}

function showScheduleForDate(date) {
  const dateStr = date.toDateString();
  const scheduleContent = document.getElementById("schedule-content");
  const now = new Date();

  const dayEvents = allEvents.filter(
    (event) => event.start.toDateString() === dateStr,
  );

  if (dayEvents.length === 0) {
    scheduleContent.innerHTML =
      '<div class="event">No swimming events scheduled for this day.</div>';
  } else {
    const scheduleTitle = document.querySelector("#schedule h3");
    if (dateStr === now.toDateString()) {
      scheduleTitle.textContent = "Today's Swimming Schedule";
    } else if (dateStr === new Date(now.getTime() + 86400000).toDateString()) {
      scheduleTitle.textContent = "Tomorrow's Swimming Schedule";
    } else {
      scheduleTitle.textContent = `Swimming Schedule for ${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
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
          if (analysis.type === EVENT_TYPES.BUSY_MAINTENANCE) {
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
        } else if (analysis.type === EVENT_TYPES.BUSY_MAINTENANCE) {
          eventClass = CSS_CLASSES.BUSY;
        }

        const lanesClass = analysis.restrictedAccess
          ? CSS_CLASSES.RESTRICTED_CHECKMARK
          : analysis.membersOnly
            ? CSS_CLASSES.MEMBERS_CHECKMARK
            : analysis.lanes
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
            analysis.type === EVENT_TYPES.WOMENS_ONLY_FULL
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
                        Lanes: <span class="${lanesClass}">${analysis.lanes ? "✓" : "✗"}</span> |
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
        const currentEvent = document.getElementById("current-event");
        if (currentEvent) {
          currentEvent.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100); // Small delay to ensure DOM is updated
    }
  }
}

// Tab switching
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
      const selectedDate = new Date(dateSelect.value);
      const today = new Date();

      if (selectedDate.toDateString() === today.toDateString()) {
        setTimeout(() => {
          const currentEvent = document.getElementById(DOM_IDS.CURRENT_EVENT);
          if (currentEvent) {
            currentEvent.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 100);
      }
    }
  });
});

// Initial fetch
fetchSchedule();

// Refresh every X minutes
setInterval(fetchSchedule, REFRESH_INTERVAL);

// Update time remaining every minute
setInterval(() => {
  if (allEvents.length > 0) {
    updateCurrentStatus(new Date());
  }
}, TIME_UPDATE_INTERVAL);
