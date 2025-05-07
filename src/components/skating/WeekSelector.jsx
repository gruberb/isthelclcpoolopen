import React, { useEffect } from "react";

function WeekSelector({ selectedWeek, onWeekChange }) {
  // Scroll to top when week changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedWeek]);

  return (
    <div className="text-3xl font-semibold text-center text-gray-800 pt-3">
      <h1 className="text-2xl font-medium">
        When can I go skating{" "}
        <select
          className="inline-block px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 font-medium"
          value={selectedWeek}
          onChange={(e) => {
            onWeekChange(parseInt(e.target.value, 10));
            // Also scroll to top immediately when user changes the week
            window.scrollTo(0, 0);
          }}
        >
          <option value="0">this week</option>
          <option value="1">next week</option>
        </select>
      </h1>
    </div>
  );
}

export default WeekSelector;
