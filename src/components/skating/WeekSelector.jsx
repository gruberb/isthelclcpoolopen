import React from "react";

function WeekSelector({ selectedWeek, onWeekChange }) {
  return (
    <div className="flex items-center justify-center">
      <h1 className="text-2xl font-medium">
        When can I go skating{" "}
        <select
          className="inline-block px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 font-medium"
          value={selectedWeek}
          onChange={(e) => onWeekChange(parseInt(e.target.value, 10))}
        >
          <option value="0">this week</option>
          <option value="1">next week</option>
        </select>
      </h1>
    </div>
  );
}

export default WeekSelector;
