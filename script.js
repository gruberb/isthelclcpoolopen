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
    const scheduleContent = document.getElementById("schedule-content");
    if (scheduleContent) {
      scheduleContent.innerHTML =
        '<div class="error">Unable to load schedule. Please try again later.</div>';
    }
  }
}

function isSwimmingEvent(event) {
  const title = event.title || "";
  const lower = title.toLowerCase();

  // Always include "Busy" events
  if (title === "Busy") {
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
    if (title === "Pool Party" || title === "Private Pool Party Rental") {
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
    type: "",
    details: {},
  };

  // Check for Busy events
  if (title === "Busy") {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = "Busy/Maintenance";
    return analysis;
  }

  // Check for members-only events
  if (title === "Members Swim") {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.membersOnly = true;
    analysis.type = "Members Only";
    return analysis;
  }

  // Check for specific event types based on patterns in the title
  if (lower.includes("recreational swim")) {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.type = "Recreational";

    // Parse lane information
    const laneMatch = title.match(/(\d+)\s*lanes?/i);
    if (laneMatch) {
      analysis.details.lanes = parseInt(laneMatch[1]);
    }
  } else if (
    lower.includes("lessons & lanes") ||
    lower.includes("lessons and lanes")
  ) {
    analysis.lanes = true;
    analysis.kids = false;
    analysis.type = "Lessons & Lanes";

    // Parse lane information
    const laneMatch = title.match(/(\d+)\s*lanes?/i);
    if (laneMatch) {
      analysis.details.lanes = parseInt(laneMatch[1]);
    }
  } else if (
    lower.includes("public swim") ||
    lower.includes("public swimming")
  ) {
    analysis.kids = true;
    if (lower.includes("no lanes")) {
      analysis.lanes = false;
      analysis.type = "Public Swimming (No Lanes)";
    } else {
      analysis.lanes = true;
      analysis.type = "Public Swimming";
    }
  } else if (lower.includes("elderfit") || lower.includes("senior swim")) {
    analysis.lanes = false;
    analysis.kids = false;
    if (lower.includes("play") && lower.includes("therapy")) {
      analysis.kids = true;
    }
    analysis.type = "Senior Program";
  } else if (lower.includes("aquafit")) {
    analysis.lanes = false;
    analysis.kids = false;
    if (lower.includes("play") && lower.includes("therapy")) {
      analysis.kids = true;
    }
    analysis.type = "Aquafit";
  } else if (
    lower.includes("parent & tot") ||
    lower.includes("parent and tot")
  ) {
    analysis.lanes = false;
    analysis.kids = true;
    analysis.type = "Parent & Tot";
  } else if (lower.includes("sensory swim")) {
    analysis.lanes = false;
    analysis.kids = true;
    analysis.type = "Sensory Swim";
  } else if (lower.includes("women's only") || lower.includes("women only")) {
    analysis.lanes = true;
    analysis.kids = false;
    analysis.type = "Women's Only";
  } else if (
    lower.includes("private rental") ||
    lower.includes("closed to the public") ||
    lower.includes("closed to public")
  ) {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = "Private/Closed";
  } else {
    // Default parsing for other events
    if (lower.includes("lane") || lower.includes("lanes")) {
      analysis.lanes = true;
    }

    if (
      lower.includes("play") ||
      lower.includes("family") ||
      lower.includes("recreational")
    ) {
      analysis.kids = true;
    }
  }

  // Check if therapy pool is mentioned
  if (lower.includes("therapy pool")) {
    analysis.details.therapyPool = true;
  }

  // Check if play pool is mentioned
  if (lower.includes("play pool")) {
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
  const lastUpdatedElement = document.getElementById("last-updated");
  if (lastUpdatedElement) {
    lastUpdatedElement.textContent = now.toLocaleTimeString();
  }

  // Display user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneElement = document.getElementById("user-timezone");
  if (timezoneElement) {
    timezoneElement.textContent = userTimezone;
  }
}

function updateCurrentStatus(now) {
  let currentLanes = false;
  let currentKids = false;
  let currentMembersOnly = false;
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
  const lanesStatus = document.getElementById("lanes-status");
  const kidsStatus = document.getElementById("kids-status");
  const lanesTime = document.getElementById("lanes-time");
  const kidsTime = document.getElementById("kids-time");

  lanesStatus.textContent = currentLanes ? "YES" : "NO";
  lanesStatus.className = `status-indicator ${currentMembersOnly ? "members" : currentLanes ? "open" : "closed"}`;
  kidsStatus.textContent = currentKids ? "YES" : "NO";
  kidsStatus.className = `status-indicator ${currentMembersOnly ? "members" : currentKids ? "open" : "closed"}`;

  if (currentMembersOnly) {
    lanesTime.textContent =
      "Members only - " + formatTimeRemaining(currentLanesEnd);
    kidsTime.textContent =
      "Members only - " + formatTimeRemaining(currentKidsEnd);
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
  const dateSelect = document.getElementById("date-select");
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
  document.getElementById("today-btn").addEventListener("click", () => {
    dateSelect.value = today.toDateString();
    showScheduleForDate(today);
    updateDateButtons(today);
  });

  document.getElementById("tomorrow-btn").addEventListener("click", () => {
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
    .getElementById("today-btn")
    .classList.toggle(
      "active",
      selectedDate.toDateString() === today.toDateString(),
    );
  document
    .getElementById("tomorrow-btn")
    .classList.toggle(
      "active",
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
          if (analysis.type === "Busy/Maintenance") {
            eventClass = "busy";
          } else {
            eventClass = analysis.membersOnly ? "members" : "current";
          }
        } else if (isPast) {
          eventClass = "past";
        } else if (analysis.membersOnly) {
          eventClass = "members";
        } else if (analysis.type === "Busy/Maintenance") {
          eventClass = "busy";
        }

        const lanesClass = analysis.membersOnly
          ? "members-checkmark"
          : analysis.lanes
            ? "checkmark"
            : "cross";
        const kidsClass = analysis.membersOnly
          ? "members-checkmark"
          : analysis.kids
            ? "checkmark"
            : "cross";

        let eventDetails = "";
        if (analysis.details.lanes) {
          eventDetails += `${analysis.details.lanes} lanes`;
        }
        if (analysis.type && analysis.type !== "Mixed Use") {
          eventDetails += (eventDetails ? " • " : "") + analysis.type;
        }
        if (analysis.details.therapyPool) {
          eventDetails += (eventDetails ? " • " : "") + "Therapy pool";
        }
        if (analysis.details.playPool) {
          eventDetails += (eventDetails ? " • " : "") + "Play pool";
        }

        return `
                <div class="event ${eventClass}" ${isCurrent ? 'id="current-event"' : ""}>
                    <div class="event-time">
                        ${formatTime(event.start)} -
                        ${formatTime(event.end)}
                        ${isCurrent ? '<span style="margin-left: 10px; color: #28a745;">◉ NOW</span>' : ""}
                    </div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-details">
                        Lanes: <span class="${lanesClass}">${analysis.lanes ? "✓" : "✗"}</span> |
                        Kids: <span class="${kidsClass}">${analysis.kids ? "✓" : "✗"}</span>
                        ${eventDetails ? '<br><small style="color: #666;">' + eventDetails + "</small>" : ""}
                        ${analysis.membersOnly ? '<span style="margin-left: 10px; color: #0056b3; font-weight: bold;">(Members Only)</span>' : ""}
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
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    document.getElementById(`${tab.dataset.tab}-tab`).classList.add("active");

    // If switching to schedule tab and showing today's schedule, scroll to current event
    if (tab.dataset.tab === "schedule") {
      const dateSelect = document.getElementById("date-select");
      const selectedDate = new Date(dateSelect.value);
      const today = new Date();

      if (selectedDate.toDateString() === today.toDateString()) {
        setTimeout(() => {
          const currentEvent = document.getElementById("current-event");
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
