import React, { useState, useEffect, useRef } from "react";
import DateSelector from "../common/DateSelector";
import { analyzeEvent } from "../../utils/eventParser";
import { formatTime } from "../../utils/dateUtils";

function ScheduleDisplay({ data }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentEventRef = useRef(null);

  // Filter events for the selected date - with safety check for Date objects
  const eventsForDate = data.filter((event) => {
    // Ensure event.start is a Date object
    const eventStart =
      event.start instanceof Date ? event.start : new Date(event.start);
    return eventStart.toDateString() === selectedDate.toDateString();
  });

  // Scroll to current event when viewing today's schedule
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

  // Helper function to get event class
  const getEventClass = (event, analysis, isCurrent, isPast) => {
    if (isCurrent) {
      if (analysis.type === "Busy/Maintenance") {
        return "border-l-4 border-orange-500 bg-orange-100";
      } else if (analysis.restrictedAccess) {
        return "border-l-4 border-purple-500 bg-purple-100";
      } else {
        return analysis.membersOnly
          ? "border-l-4 border-blue-700 bg-blue-100"
          : "border-l-4 border-green-600 bg-green-100";
      }
    } else if (isPast) {
      return "opacity-35 bg-gray-50";
    } else if (analysis.membersOnly) {
      return "border-l-4 border-blue-700 bg-blue-100";
    } else if (analysis.restrictedAccess) {
      return "border-l-4 border-purple-500 bg-purple-100";
    } else if (analysis.type === "Busy/Maintenance") {
      return "border-l-4 border-orange-500 bg-orange-100";
    }
    return "";
  };

  // Get checkmark/x styles
  const getAvailabilityClass = (isAvailable, analysis) => {
    if (analysis.restrictedAccess) {
      return "text-purple-700 font-bold";
    } else if (analysis.membersOnly) {
      return "text-blue-700 font-bold";
    } else {
      return isAvailable
        ? "text-green-600 font-bold"
        : "text-red-600 font-bold";
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Center the date picker */}
      <div className="w-full max-w-sm">
        <DateSelector
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mb-[50px]">
        <h3 className="text-2xl font-semibold text-center mb-6">
          {selectedDate.toDateString() === new Date().toDateString()
            ? "Today's Swimming Schedule"
            : selectedDate.toDateString() ===
              new Date(Date.now() + 86400000).toDateString()
              ? "Tomorrow's Swimming Schedule"
              : `Swimming Schedule for ${selectedDate.toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                },
              )}`}
        </h3>

        {eventsForDate.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No swimming events scheduled for this day.
          </div>
        ) : (
          <div className="space-y-4">
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
              if (analysis.membersOnly) {
                restrictionLabel = "(Members Only)";
              } else if (analysis.restrictedAccess) {
                restrictionLabel =
                  analysis.type === "Women's Only (All Pools)"
                    ? "(Women Only)"
                    : "(Seniors 60+ Only)";
              }

              return (
                <div
                  key={`${event.id}-${eventStart.getTime()}`}
                  ref={isCurrent ? currentEventRef : null}
                  className={`
                    w-full flex flex-col items-center text-center
                    p-4 rounded-md
                    ${getEventClass(event, analysis, isCurrent, isPast)}
                  `}
                >
                  {/* Time */}
                  <div className="text-lg text-gray-700 font-extralight">
                    {formatTime(eventStart)} – {formatTime(eventEnd)}{" "}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center text-green-600">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-1" />
                        NOW
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="text-xl font-semibold mt-2 text-gray-800">
                    {event.title}
                  </div>

                  {/* Availability */}
                  <div className="text-sm mt-2 text-gray-600 flex flex-wrap justify-center items-center">
                    <span>
                      Lanes:{" "}
                      <span
                        className={getAvailabilityClass(hasLanes, analysis)}
                      >
                        {hasLanes ? "✓" : "✗"}
                      </span>
                    </span>
                    <span className="mx-2 text-gray-400">|</span>
                    <span>
                      Kids:{" "}
                      <span
                        className={getAvailabilityClass(
                          analysis.kids,
                          analysis,
                        )}
                      >
                        {analysis.kids ? "✓" : "✗"}
                      </span>
                    </span>
                  </div>
                  {restrictionLabel && (
                    <span
                      className={`mt-1 ml-4 font-medium ${analysis.restrictedAccess
                        ? "text-purple-700"
                        : "text-blue-700"
                        }`}
                    >
                      {restrictionLabel}
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
