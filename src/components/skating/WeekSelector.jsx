import { useEffect } from "react";

function WeekSelector({ selectedWeek, onWeekChange }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedWeek]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-gray-700">When can I go skating</p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            onWeekChange(0);
            window.scrollTo(0, 0);
          }}
          className={`px-6 py-2 text-sm border transition-colors ${
            selectedWeek === 0
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          This Week
        </button>
        <button
          onClick={() => {
            onWeekChange(1);
            window.scrollTo(0, 0);
          }}
          className={`px-6 py-2 text-sm border transition-colors ${
            selectedWeek === 1
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          Next Week
        </button>
      </div>
    </div>
  );
}

export default WeekSelector;
