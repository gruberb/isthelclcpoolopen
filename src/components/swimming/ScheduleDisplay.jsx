import React, { useState, useEffect, useRef } from "react";
import DateSelector from "../common/DateSelector";
import { analyzeEvent } from "../../utils/eventParser";
import { formatTime } from "../../utils/dateUtils";

function ScheduleDisplay({ data }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentEventRef = useRef(null);

  const eventsForDate = data.filter((event) => {
    const eventStart =
      event.start instanceof Date ? event.start : new Date(event.start);
    return eventStart.toDateString() === selectedDate.toDateString();
  });

  useEffect(() => {
    if (
      selectedDate.toDateString() === new Date().toDateString() &&
      currentEventRef.current
    ) {
      currentEventRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedDate, eventsForDate]);

  const getEventClass = (analysis, isCurrent, isPast) => {
    if (isPast) {
      return "bg-gray-50 border-l-4 border-gray-200 opacity-50";
    }
    if (isCurrent) {
      if (analysis.closedToPublic) {
        return "border-l-4 border-orange-400 bg-orange-50";
      } else if (analysis.isSensory) {
        return "border-l-4 border-teal-400 bg-teal-50";
      } else if (analysis.restrictedAccess) {
        return "border-l-4 border-purple-400 bg-purple-50";
      } else if (analysis.membersOnly) {
        return "border-l-4 border-blue-500 bg-blue-50";
      } else {
        return "border-l-4 border-green-400 bg-green-50";
      }
    }
    if (analysis.closedToPublic) {
      return "border-l-4 border-orange-400 bg-white";
    } else if (analysis.membersOnly) {
      return "border-l-4 border-blue-500 bg-white";
    } else if (analysis.isSensory) {
      return "border-l-4 border-teal-400 bg-white";
    } else if (analysis.restrictedAccess) {
      return "border-l-4 border-purple-400 bg-white";
    }
    return "bg-white";
  };

  const getAvailabilityClass = (isAvailable) => {
    return isAvailable
      ? "text-green-600 font-semibold"
      : "text-red-600 font-semibold";
  };

  const getScheduleTitle = () => {
    if (selectedDate.toDateString() === new Date().toDateString()) {
      return "Today";
    } else if (
      selectedDate.toDateString() ===
      new Date(Date.now() + 86400000).toDateString()
    ) {
      return "Tomorrow";
    } else {
      return selectedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 w-full max-w-md">
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md mb-24 w-full max-w-2xl">
        <div className="px-6 py-6 text-center border-b border-gray-200">
          <h2 className="text-2xl font-light text-gray-900 tracking-wide">
            {getScheduleTitle() === "Today"
              ? "Today's Swimming Schedule"
              : getScheduleTitle() === "Tomorrow"
                ? "Tomorrow's Swimming Schedule"
                : `Swimming Schedule for ${getScheduleTitle()}`}
          </h2>
        </div>

        {eventsForDate.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No swimming events scheduled for this day.
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {eventsForDate.map((event) => {
              const now = new Date();
              const analysis = analyzeEvent(event);
              const eventStart =
                event.start instanceof Date
                  ? event.start
                  : new Date(event.start);
              const eventEnd =
                event.end instanceof Date ? event.end : new Date(event.end);

              const isCurrent =
                eventStart <= now &&
                eventEnd > now &&
                eventStart.toDateString() === now.toDateString();
              const isPast = eventEnd < now;

              const hasLanes =
                analysis.lanes && !event.title.includes("LAP POOL CLOSED");

              let restrictionLabel = "";
              let restrictionColor = "";
              if (analysis.closedToPublic) {
                restrictionLabel = "Closed to Public";
                restrictionColor = "text-orange-600";
              } else if (analysis.membersOnly) {
                restrictionLabel = "Members Only";
                restrictionColor = "text-blue-600";
              } else if (analysis.isSensory) {
                restrictionLabel = "Sensory - Quiet";
                restrictionColor = "text-teal-600";
              } else if (analysis.restrictedAccess) {
                restrictionLabel =
                  analysis.type === "Women's Only (All Pools)"
                    ? "Women Only"
                    : "Seniors 60+ Only";
                restrictionColor = "text-purple-600";
              }

              return (
                <div
                  key={`${event.id}-${eventStart.getTime()}`}
                  ref={isCurrent ? currentEventRef : null}
                  className={`p-4 rounded-md w-full flex flex-col items-center text-center ${getEventClass(
                    analysis,
                    isCurrent,
                    isPast,
                  )}`}
                >
                  <div className="text-lg text-gray-700 font-light">
                    {formatTime(eventStart)} – {formatTime(eventEnd)}{" "}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center text-green-600">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-1" />
                        NOW
                      </span>
                    )}
                  </div>

                  <div className="text-xl font-medium mt-2 text-gray-800">
                    {event.title}
                  </div>

                  <div className="text-sm mt-2 text-gray-600 flex flex-wrap justify-center items-center">
                    <span>
                      Lanes:{" "}
                      <span className={getAvailabilityClass(hasLanes)}>
                        {hasLanes ? "✓" : "✗"}
                      </span>
                    </span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>
                      Kids:{" "}
                      <span className={getAvailabilityClass(analysis.kids)}>
                        {analysis.kids ? "✓" : "✗"}
                      </span>
                    </span>
                  </div>
                  {restrictionLabel && (
                    <span
                      className={`mt-1 ml-4 font-medium ${restrictionColor}`}
                    >
                      ({restrictionLabel})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleDisplay;
