import { useState, useEffect, useCallback } from "react";
import { convertToLocalTime } from "../utils/dateUtils";

export function useSkatingData() {
  const [data, setData] = useState([]); // processed events array
  const [loading, setLoading] = useState(true); // spinner flag
  const [error, setError] = useState(null); // error message
  const [lastUpdated, setLastUpdated] = useState(null); // Date

  useEffect(() => {
    async function fetchData() {
      try {
        // Cache buster that changes every 30 minutes
        const cacheBuster = Math.floor(Date.now() / (30 * 60 * 1000));
        const res = await fetch(
          `${process.env.PUBLIC_URL}/data/skating.json?t=${cacheBuster}`,
          {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Parse & process
        const processed = processData(json.data);
        const updatedAt = new Date(json.lastUpdated);

        setData(processed);
        setLastUpdated(updatedAt);
      } catch (err) {
        console.error("Error fetching skating data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Returns only events for the given week offset (0 = this week, 1 = next)
  const getEventsForWeek = useCallback(
    (weekOffset = 0) => {
      const { start, end } = getWeekBounds(weekOffset);
      return data.filter((ev) => {
        const d = new Date(ev.start);
        return d >= start && d <= end;
      });
    },
    [data],
  );

  return {
    data,
    loading,
    error,
    lastUpdated,
    getEventsForWeek,
  };
}

// ——— Helpers —————————————————————————————————————————————

// Turn raw JSON array into fully‐typed events with Date objects
function processData(rawData) {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((event) => {
      const start = convertToLocalTime(event.start);
      const end = convertToLocalTime(event.end);
      if (
        !(start instanceof Date) ||
        isNaN(start) ||
        !(end instanceof Date) ||
        isNaN(end)
      ) {
        return null;
      }
      return {
        id: event.id,
        title: event.title,
        start,
        end,
        backgroundColor: event.backgroundColor,
        textColor: event.textColor,
        allDay: event.allDay,
      };
    })
    .filter((evt) => evt !== null)
    .sort((a, b) => a.start - b.start);
}

// Monday 00:00:00 of this week + offset, through Sunday 23:59:59
function getWeekBounds(offsetWeeks = 0) {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun,1=Mon…
  const toMon = (dow + 6) % 7; // days back to Monday
  const mon = new Date(today);
  mon.setDate(today.getDate() - toMon + offsetWeeks * 7);
  mon.setHours(0, 0, 0, 0);

  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);

  return { start: mon, end: sun };
}
