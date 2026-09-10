import React, { useMemo } from "react";
import { facilityNow } from "../../utils/timezone";

const DAYS_AHEAD = 8;

// Composed by hand rather than one toLocaleDateString call: the en-US pattern for weekday
// plus day-of-month is "12 Sat", which reads as a time on a row of buttons.
function chipLabel(date, todayKey, tomorrowKey) {
  const key = date.toDateString();
  if (key === todayKey) return "Today";
  if (key === tomorrowKey) return "Tomorrow";

  const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday} ${date.getDate()}`;
}

function DateSelector({ selectedDate, onDateChange }) {
  // Built during render, not in an effect. An effect leaves the first paint without the row
  // and then drops the schedule card once the state lands.
  const days = useMemo(() => {
    const today = facilityNow();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayKey = today.toDateString();
    const tomorrowKey = tomorrow.toDateString();

    return Array.from({ length: DAYS_AHEAD }, (_, offset) => {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);
      return { date, label: chipLabel(date, todayKey, tomorrowKey) };
    });
  }, []);

  // One scrolling row replaces the previous Today/Tomorrow buttons plus an 8-day select. Both
  // were bound to the same state and could contradict each other on screen. Eight chips need
  // ~680px, so this scrolls by design; Today and Tomorrow lead and are both visible at rest.
  return (
    <div className="-mx-4 mb-3 md:mb-4 overflow-x-auto no-scrollbar">
      <div className="flex w-max mx-auto gap-2 px-4 py-1.5">
        {days.map(({ date, label }) => {
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={date.toDateString()}
              onClick={() => onDateChange(date)}
              aria-pressed={isSelected}
              className={`brutal-btn shrink-0 px-3 py-3 text-xs ${
                isSelected
                  ? "bg-brutal-blue text-white"
                  : "bg-white text-brutal-black hover:bg-brutal-cream"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateSelector;
