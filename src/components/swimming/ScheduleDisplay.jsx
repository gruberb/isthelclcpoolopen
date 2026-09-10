import React, { useState, useEffect, useRef } from "react";
import DateSelector from "../common/DateSelector";
import { analyzeEvent } from "../../utils/eventParser";
import { formatTime } from "../../utils/dateUtils";
import { facilityNow } from "../../utils/timezone";

function ScheduleDisplay({ data }) {
  const [selectedDate, setSelectedDate] = useState(() => facilityNow());
  const currentEventRef = useRef(null);

  const now = facilityNow();

  const eventsForDate = data.filter((event) => {
    const eventStart =
      event.start instanceof Date ? event.start : new Date(event.start);
    return eventStart.toDateString() === selectedDate.toDateString();
  });

  useEffect(() => {
    if (
      selectedDate.toDateString() === facilityNow().toDateString() &&
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
      return "border-l-4 border-l-brutal-black/20 opacity-50";
    }
    if (isCurrent) {
      if (analysis.closedToPublic) {
        return "border-l-4 border-l-brutal-orange bg-brutal-yellow/10";
      } else if (analysis.isSensory) {
        return "border-l-4 border-l-brutal-teal bg-brutal-yellow/10";
      } else if (analysis.restrictedAccess) {
        return "border-l-4 border-l-brutal-purple bg-brutal-yellow/10";
      } else if (analysis.membersOnly) {
        return "border-l-4 border-l-brutal-blue bg-brutal-yellow/10";
      } else {
        return "border-l-4 border-l-brutal-green bg-brutal-yellow/10";
      }
    }
    if (analysis.closedToPublic) {
      return "border-l-4 border-l-brutal-orange";
    } else if (analysis.membersOnly) {
      return "border-l-4 border-l-brutal-blue";
    } else if (analysis.isSensory) {
      return "border-l-4 border-l-brutal-teal";
    } else if (analysis.restrictedAccess) {
      return "border-l-4 border-l-brutal-purple";
    }
    return "border-l-4 border-l-transparent";
  };

  const getAvailabilityClass = (isAvailable) => {
    return isAvailable
      ? "text-brutal-green font-bold"
      : "text-brutal-red font-bold";
  };

  return (
    <div>
      <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

      <div className="border-2 border-brutal-black shadow-brutal w-full max-w-2xl mx-auto">
        {eventsForDate.length === 0 ? (
          <div className="p-6 text-center text-brutal-black/50 font-display uppercase tracking-wide">
            No swimming events scheduled for this day.
          </div>
        ) : (
          <div className="divide-y divide-brutal-black/10">
            {eventsForDate.map((event) => {
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
                restrictionColor = "bg-brutal-orange text-white";
              } else if (analysis.membersOnly) {
                restrictionLabel = "Members Only";
                restrictionColor = "bg-brutal-blue text-white";
              } else if (analysis.isSensory) {
                restrictionLabel = "Sensory - Quiet";
                restrictionColor = "bg-brutal-teal text-white";
              } else if (analysis.restrictedAccess) {
                restrictionLabel =
                  analysis.type === "Women's Only (All Pools)"
                    ? "Women Only"
                    : "Seniors 60+ Only";
                restrictionColor = "bg-brutal-purple text-white";
              }

              return (
                <div
                  key={`${event.id}-${eventStart.getTime()}`}
                  ref={isCurrent ? currentEventRef : null}
                  className={`p-4 w-full flex flex-col items-center text-center ${getEventClass(
                    analysis,
                    isCurrent,
                    isPast,
                  )}`}
                >
                  <div className="text-sm text-brutal-black/60 font-display tracking-wide">
                    {formatTime(eventStart)} - {formatTime(eventEnd)}{" "}
                    {isCurrent && (
                      <span className="ml-2 brutal-badge bg-brutal-yellow text-brutal-black">
                        NOW
                      </span>
                    )}
                  </div>

                  <div className="font-display text-base font-bold mt-2 text-brutal-black uppercase tracking-wide">
                    {event.title}
                  </div>

                  <div className="text-sm mt-2 text-brutal-black/60 flex flex-wrap justify-center items-center font-display uppercase tracking-wider">
                    <span>
                      Lanes:{" "}
                      <span className={getAvailabilityClass(hasLanes)}>
                        {hasLanes ? "Y" : "N"}
                      </span>
                    </span>
                    <span className="mx-2 text-brutal-black/20 font-bold">|</span>
                    <span>
                      Kids:{" "}
                      <span className={getAvailabilityClass(analysis.kids)}>
                        {analysis.kids ? "Y" : "N"}
                      </span>
                    </span>
                  </div>
                  {restrictionLabel && (
                    <span
                      className={`mt-2 brutal-badge ${restrictionColor}`}
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
