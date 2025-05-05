import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import WeekSelector from "../components/skating/WeekSelector";
import SkatingCard from "../components/skating/SkatingCard";
import Loading from "../components/common/Loading";
import { useSkatingData } from "../hooks/useSkatingData";

function Skating() {
  const { loading, error, lastUpdated, getEventsForWeek } = useSkatingData();
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [events, setEvents] = useState([]);

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

  return (
    <Layout title="When can I go skating?" lastUpdated={lastUpdated}>
      <div className="mb-8">
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
        <div className="space-y-6 mt-6 mb-12">
          {events.map((event) => {
            // Now safe to call getTime(), toDateString(), etc.
            const key = `${event.id}-${event.start.getTime()}`;
            const isCurrent =
              event.start <= now &&
              event.end > now &&
              event.start.toDateString() === now.toDateString();
            const isPast = event.end < now;

            return (
              <div key={key}>
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
