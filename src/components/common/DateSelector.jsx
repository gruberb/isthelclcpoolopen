import React, { useEffect, useState } from "react";

function DateSelector({ selectedDate, onDateChange }) {
  const [dates, setDates] = useState([]);

  // Generate date options when component mounts
  useEffect(() => {
    const today = new Date();
    const options = [];

    // Generate dates for today and the next week
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push(date);
    }

    setDates(options);
  }, []);

  // Format date for display in dropdown
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
    <div className="text-center mb-6">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => onDateChange(dates[0])}
          className={`px-4 py-2 rounded-md text-sm font-medium mr-2 ${
            selectedDate.toDateString() === dates[0]?.toDateString()
              ? "bg-blue-700 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => onDateChange(dates[1])}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedDate.toDateString() === dates[1]?.toDateString()
              ? "bg-blue-700 text-white"
              : "bg-white text-gray-700 border border-gray-300"
          }`}
        >
          Tomorrow
        </button>
      </div>

      <select
        className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
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
