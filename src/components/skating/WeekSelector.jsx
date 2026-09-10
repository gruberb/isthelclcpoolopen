import { useEffect } from "react";

function WeekSelector({ selectedWeek, onWeekChange }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedWeek]);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          onWeekChange(0);
          window.scrollTo(0, 0);
        }}
        className={`brutal-btn px-6 py-2 text-sm ${
          selectedWeek === 0
            ? "bg-brutal-blue text-white"
            : "bg-white text-brutal-black hover:bg-brutal-cream"
        }`}
      >
        This Week
      </button>
      <button
        onClick={() => {
          onWeekChange(1);
          window.scrollTo(0, 0);
        }}
        className={`brutal-btn px-6 py-2 text-sm ${
          selectedWeek === 1
            ? "bg-brutal-blue text-white"
            : "bg-white text-brutal-black hover:bg-brutal-cream"
        }`}
      >
        Next Week
      </button>
    </div>
  );
}

export default WeekSelector;
