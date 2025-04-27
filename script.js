let allEvents = [];

async function fetchSchedule() {
  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(API_URL), {
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
    document.getElementById("schedule-content").innerHTML =
      '<div class="error">Unable to load schedule. Please try again later.</div>';
  }
}

function isSwimmingEvent(event) {
  const title = event.title || "";
  const lower = title.toLowerCase();

  // Exclude non-pool events
  if (
    lower.includes("skating club") ||
    lower.includes("hockey") ||
    lower.includes("ice")
  ) {
    return false;
  }

  // Check if it has swimming keywords
  const hasSwimKeyword = SWIM_KEYWORDS.some((keyword) =>
    lower.includes(keyword),
  );

  // Filter out specific events
  if (title === "Pool Party" || title === "Private Pool Party Rental") {
    return false;
  }

  return hasSwimKeyword;
}

function analyzeEvent(title) {
  const lower = title.toLowerCase();
  const analysis = {
    lanes: false,
    kids: false,
    membersOnly: false,
    type: "",
  };

  // Check for members-only events
  if (lower.includes("members swim") || lower.includes("member swim")) {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.membersOnly = true;
    analysis.type = "Members Only";
    return analysis;
  }

  // Check for lanes
  if (lower.includes("lane") || lower.includes("lanes")) {
    analysis.lanes = true;
  }

  // Check for kids/public swimming
  if (
    lower.includes("public swimming") ||
    lower.includes("play") ||
    lower.includes("public") ||
    lower.includes("family") ||
    lower.includes("recreational")
  ) {
    analysis.kids = true;
  }

  // Special cases based on specific event titles
  if (
    lower.includes("public swim - no lanes") ||
    lower.includes("public swimming - no lanes")
  ) {
    analysis.lanes = false;
    analysis.kids = true;
    analysis.type = "Public Swimming (Kids only)";
  } else if (
    lower.includes("lessons & lanes") &&
    lower.includes("therapy pool open")
  ) {
    analysis.lanes = true;
    analysis.kids = false;
    analysis.type = "Lane Swimming (Adults only)";
  } else if (lower.includes("recreational swim") && lower.includes("lanes")) {
    analysis.lanes = true;
    analysis.kids = true;
    analysis.type = "Mixed Use";
  } else if (
    lower.includes("all pools closed to public") ||
    lower.includes("all pools closed to the public")
  ) {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = "Closed to Public";
  } else if (lower.includes("pools closed to the public")) {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = "Closed to Public";
  } else if (lower.includes("private pool party") || title === "Pool Party") {
    analysis.lanes = false;
    analysis.kids = false;
    analysis.type = "Private Event";
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

function getNextEvent(events, now, type) {
  return events.find((event) => {
    const analysis = analyzeEvent(event.title);
    return (
      event.start > now && (type === "lanes" ? analysis.lanes : analysis.kids)
    );
  });
}

function processSchedule(data) {
  const now = new Date();

  // Filter for swimming events only
  allEvents = data
    .filter(isSwimmingEvent)
    .map((event) => ({
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      facility: event.facility || "LCLC > BMO Financial Group Aquatic Centre",
    }))
    .sort((a, b) => a.start - b.start);

  // Update current status
  updateCurrentStatus(now);

  // Populate date selector
  populateDateSelector();

  // Show today's schedule
  showScheduleForDate(now);
  updateDateButtons(now);

  // Update last updated time
  document.getElementById("last-updated").textContent =
    now.toLocaleTimeString();
}

function updateCurrentStatus(now) {
  let currentLanes = false;
  let currentKids = false;
  let currentMembersOnly = false;
  let currentLanesEnd = null;
  let currentKidsEnd = null;

  allEvents.forEach((event) => {
    if (event.start <= now && event.end >= now) {
      const analysis = analyzeEvent(event.title);
      if (analysis.membersOnly) {
        currentMembersOnly = true;
        currentLanes = true;
        currentKids = true;
        currentLanesEnd = event.end;
        currentKidsEnd = event.end;
      } else {
        if (analysis.lanes) {
          currentLanes = true;
          currentLanesEnd = event.end;
        }
        if (analysis.kids) {
          currentKids = true;
          currentKidsEnd = event.end;
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
      lanesTime.textContent = formatTimeRemaining(currentLanesEnd);
    } else {
      const nextLanesEvent = getNextEvent(allEvents, now, "lanes");
      if (nextLanesEvent) {
        lanesTime.textContent = `Opens at ${nextLanesEvent.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      } else {
        lanesTime.textContent = "No more lane swimming today";
      }
    }

    if (currentKids && currentKidsEnd) {
      kidsTime.textContent = formatTimeRemaining(currentKidsEnd);
    } else {
      const nextKidsEvent = getNextEvent(allEvents, now, "kids");
      if (nextKidsEvent) {
        kidsTime.textContent = `Opens at ${nextKidsEvent.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
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
        const analysis = analyzeEvent(event.title);
        const isCurrent =
          event.start <= now &&
          event.end >= now &&
          dateStr === now.toDateString();
        const isPast = event.end < now;

        let eventClass = "";
        if (isCurrent) {
          eventClass = analysis.membersOnly ? "members" : "current";
        } else if (isPast) {
          eventClass = "past";
        } else if (analysis.membersOnly) {
          eventClass = "members";
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

        return `
                <div class="event ${eventClass}" ${isCurrent ? 'id="current-event"' : ""}>
                    <div class="event-time">
                        ${event.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                        ${event.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        ${isCurrent ? '<span style="margin-left: 10px; color: #28a745;">◉ NOW</span>' : ""}
                    </div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-details">
                        Lanes: <span class="${lanesClass}">${analysis.lanes ? "✓" : "✗"}</span> |
                        Kids: <span class="${kidsClass}">${analysis.kids ? "✓" : "✗"}</span>
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
