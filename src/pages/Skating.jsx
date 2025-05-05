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

  // Update events when week selection changes
  useEffect(() => {
    if (!loading) {
      setEvents(getEventsForWeek(selectedWeek));
    }
  }, [loading, selectedWeek, getEventsForWeek]);

  // Handle week change
  const handleWeekChange = (weekOffset) => {
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
    <Layout title="" lastUpdated={lastUpdated}>
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
            const isCurrent =
              event.start <= now &&
              event.end > now &&
              event.start.toDateString() === now.toDateString();

            const isPast = event.end < now;

            return (
              <div key={event.id}>
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
