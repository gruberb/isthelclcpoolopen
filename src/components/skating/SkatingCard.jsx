import React from "react";
import { formatTime } from "../../utils/dateUtils";

function SkatingCard({ event, isCurrent, isPast }) {
  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getWeekday = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Card class based on event status
  const cardClass = isPast
    ? "opacity-50 grayscale-[60%]"
    : isCurrent
      ? "border-green-500"
      : "";

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition transform hover:-translate-y-1 hover:shadow-lg ${cardClass}`}
    >
      <div className="text-gray-600 text-sm">{formatDate(event.start)}</div>
      <div className="text-gray-800 font-bold text-xl mt-1">
        {getWeekday(event.start)}
      </div>
      <div className="text-gray-700 text-lg mt-2">
        {formatTime(event.start)} – {formatTime(event.end)}
      </div>
      <div className="text-blue-700 font-bold text-lg mt-3">{event.title}</div>
    </div>
  );
}

export default SkatingCard;
