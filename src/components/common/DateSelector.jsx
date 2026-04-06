import React, { useEffect, useState } from "react";

function DateSelector({ selectedDate, onDateChange }) {
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const today = new Date();
    const options = [];

    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push(date);
    }

    setDates(options);
  }, []);

  const formatOptionLabel = (date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="mb-6 flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => onDateChange(dates[0])}
          className={`brutal-btn px-6 py-2 text-sm ${
            selectedDate.toDateString() === dates[0]?.toDateString()
              ? "bg-brutal-blue text-white"
              : "bg-white text-brutal-black hover:bg-brutal-cream"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onDateChange(dates[1])}
          className={`brutal-btn px-6 py-2 text-sm ${
            selectedDate.toDateString() === dates[1]?.toDateString()
              ? "bg-brutal-blue text-white"
              : "bg-white text-brutal-black hover:bg-brutal-cream"
          }`}
        >
          Tomorrow
        </button>
      </div>

      <select
        className="px-4 py-2 text-sm bg-white border-2 border-brutal-black font-display font-bold uppercase tracking-wider hover:bg-brutal-cream transition-colors"
        value={selectedDate.toDateString()}
        onChange={(e) => {
          const selected = dates.find(
            (date) => date.toDateString() === e.target.value,
          );
          if (selected) onDateChange(selected);
        }}
      >
        {dates.map((date) => (
          <option key={date.toDateString()} value={date.toDateString()}>
            {formatOptionLabel(date)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DateSelector;
