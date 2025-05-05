import React from "react";
import { formatTime } from "../../utils/dateUtils";

function SkatingCard({ event, isCurrent, isPast }) {
  // Detect if this event’s date is today
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

  // apply a border or fade if past/current/today
  let cardClass =
    "rounded-lg shadow-md p-6 flex flex-col items-center text-center transition-transform hover:-translate-y-1 hover:shadow-lg";
  if (isPast) cardClass += " opacity-50 grayscale-[60%]";
  if (isCurrent) cardClass += " border-2 border-green-500";
  if (isTodayEvent) cardClass += " bg-green-200";
  console.log("IS TODAY");
  return (
    <div className={`${cardClass}`}>
      {/* Day, Date */}
      <div className="text-gray-600 text-sm font-semibold">
        {getWeekday(event.start)}, {formatDate(event.start)}
      </div>

      {/* Title */}
      <div className="text-gray-800 font-bold text-xl mt-2">{event.title}</div>

      {/* Time */}
      <div className="text-gray-700 text-lg mt-1 font-">
        {formatTime(event.start)} – {formatTime(event.end)}
      </div>
    </div>
  );
}

export default SkatingCard;
