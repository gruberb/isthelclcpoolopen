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
      return "border-l-4 border-l-brutal-black/20 opacity-50";
    }
    if (isCurrent) {
      return "border-l-4 border-l-brutal-green bg-brutal-yellow/10";
    }
    if (isTodayEvent) {
      return "border-l-4 border-l-brutal-blue";
    }
    return "border-l-4 border-l-brutal-blue/40";
  };

  return (
    <div
      className={`border-2 border-brutal-black shadow-brutal-sm p-6 transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none ${getCardStyles()}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="text-xs font-display font-bold text-brutal-black/60 mb-2 uppercase tracking-widest">
          {getWeekday(event.start)}, {formatDate(event.start)}
        </div>

        <div className="font-display text-lg font-bold text-brutal-black uppercase tracking-wide mb-2">
          {event.title}
          {isCurrent && (
            <span className="ml-2 brutal-badge bg-brutal-yellow text-brutal-black text-xs">
              NOW
            </span>
          )}
        </div>

        <div className="text-sm text-brutal-black/60 font-display tracking-wide">
          {formatTime(event.start)} - {formatTime(event.end)}
        </div>
      </div>
    </div>
  );
}

export default SkatingCard;
