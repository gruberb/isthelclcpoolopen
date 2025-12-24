import React from "react";
import { formatTime } from "../../utils/dateUtils";

function SkatingCard({ event, isCurrent, isPast }) {
  const eventDate =
    event.start instanceof Date ? event.start : new Date(event.start);
  const isTodayEvent = eventDate.toDateString() === new Date().toDateString();

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getWeekday = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });

  const getCardStyles = () => {
    if (isPast) {
      return "bg-gray-50 border-l-4 border-gray-200 opacity-50";
    }
    if (isCurrent) {
      return "bg-green-50 border-l-4 border-green-400";
    }
    if (isTodayEvent) {
      return "bg-blue-50 border-l-4 border-blue-400";
    }
    return "bg-white border-l-4 border-blue-300";
  };

  return (
    <div
      className={`p-6 transition-all hover:bg-gray-50 border-gray-200 shadow-sm ${getCardStyles()}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-sm font-medium text-gray-600 mb-2">
          {getWeekday(event.start)}, {formatDate(event.start)}
        </div>

        <div className="text-xl font-semibold text-gray-900 mb-2">
          {event.title}
          {isCurrent && (
            <span className="ml-2 inline-flex items-center text-xs font-semibold text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse" />
              NOW
            </span>
          )}
        </div>

        <div className="text-base text-gray-700">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
      </div>
    </div>
  );
}

export default SkatingCard;
