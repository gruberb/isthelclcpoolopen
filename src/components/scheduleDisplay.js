import appState from "../state/appState.js";
import { analyzeEvent } from "../utils/eventParser.js";
import { formatTime } from "../utils/dateUtils.js";
import { DOM_IDS, CSS_CLASSES } from "/constants.js";

/**
 * Populate the date selector with options for the next week
 */
export function populateDateSelector() {
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
export function updateDateButtons() {
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
export function showScheduleForDate() {
  const date = appState.selectedDate;
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
export function initializeScheduleDisplay() {
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
export function initializeTabs() {
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
