import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/common/Layout";
import WeekSelector from "../components/skating/WeekSelector";
import SkatingCard from "../components/skating/SkatingCard";
import Loading from "../components/common/Loading";
import { useSkatingData } from "../hooks/useSkatingData";

function Skating() {
  const { loading, error, lastUpdated, getEventsForWeek } = useSkatingData();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [events, setEvents] = useState([]);
  const currentEventRef = useRef(null);
  const nextEventRef = useRef(null);

  // Helper to ensure start/end are Date objects
  const normalize = (rawEvents) =>
    rawEvents.map((e) => ({
      ...e,
      start: e.start instanceof Date ? e.start : new Date(e.start),
      end: e.end instanceof Date ? e.end : new Date(e.end),
    }));

  // On mount (and whenever loading or selectedWeek change), load events
  useEffect(() => {
    if (!loading) {
      const weekEvents = getEventsForWeek(selectedWeek);
      setEvents(normalize(weekEvents));
    }
  }, [loading, getEventsForWeek, selectedWeek]);

  // Scroll to current event or next available event when viewing this week's schedule
  useEffect(() => {
    // Only proceed if we're looking at the current week
    if (selectedWeek === 0) {
      // First try to scroll to current event
      if (currentEventRef.current) {
        currentEventRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
      // If no current event, try to scroll to next event
      else if (nextEventRef.current) {
        nextEventRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [selectedWeek, events]);

  const handleWeekChange = (weekOffset) => {
    const weekEvents = getEventsForWeek(weekOffset);
    setEvents(normalize(weekEvents));
    setSelectedWeek(weekOffset);
  };

  if (loading) {
    return (
      <Layout title="When can I go skating?">
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="When can I go skating?">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>Error: {error}</p>
          <p className="mt-2">Refresh the page to try again.</p>
        </div>
      </Layout>
    );
  }

  const now = new Date();

  // Find if there's a current event or a next event to scroll to
  let hasCurrentEvent = false;
  let nextEventIndex = -1;

  // First check if there's any current event
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    if (
      event.start <= now &&
      event.end > now &&
      event.start.toDateString() === now.toDateString()
    ) {
      hasCurrentEvent = true;
      break;
    }
  }

  // If no current event, find the next upcoming event
  if (!hasCurrentEvent) {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.start > now) {
        nextEventIndex = i;
        break;
      }
    }
  }

  return (
    <Layout title="" lastUpdated={lastUpdated}>
      <div className="mb-2 text-base">
        <WeekSelector
          selectedWeek={selectedWeek}
          onWeekChange={handleWeekChange}
        />
      </div>

      {events.length === 0 ? (
        <div className="bg-red-50 p-6 rounded-lg text-center text-red-700">
          No public skating events found for this week.
        </div>
      ) : (
        <div className="space-y-6 mt-6 mb-28">
          {events.map((event, index) => {
            // Now safe to call getTime(), toDateString(), etc.
            const key = `${event.id}-${event.start.getTime()}`;
            const isCurrent =
              event.start <= now &&
              event.end > now &&
              event.start.toDateString() === now.toDateString();
            const isPast = event.end < now;
            const isNextEvent = !hasCurrentEvent && index === nextEventIndex;

            return (
              <div
                key={key}
                ref={
                  isCurrent
                    ? currentEventRef
                    : isNextEvent
                      ? nextEventRef
                      : null
                }
              >
                <SkatingCard
                  event={event}
                  isCurrent={isCurrent}
                  isPast={isPast}
                />
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

export default Skating;
