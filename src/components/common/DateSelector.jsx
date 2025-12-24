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
          className={`px-6 py-2 text-sm border transition-colors ${
            selectedDate.toDateString() === dates[0]?.toDateString()
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onDateChange(dates[1])}
          className={`px-6 py-2 text-sm border transition-colors ${
            selectedDate.toDateString() === dates[1]?.toDateString()
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          Tomorrow
        </button>
      </div>

      <select
        className="px-4 py-2 text-sm bg-white border border-gray-300 hover:border-blue-400 transition-colors focus:border-blue-500"
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
