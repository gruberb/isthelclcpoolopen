import { useState, useEffect, useCallback } from "react";
import { getWeekBounds } from "../utils/dateUtils";

export function useSkatingData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Aggressive cache busting - timestamp + random string
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);

        // Use regular GitHub Pages URL with cache busting
        const dataUrl = `${process.env.PUBLIC_URL}/data/skating.json?_t=${timestamp}&_r=${random}`;

        console.log('Fetching skating data from:', dataUrl);

        const res = await fetch(dataUrl, {
          method: 'GET',
          cache: 'reload',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // Log the timestamp to verify fresh data
        const fetchedTimestamp = new Date(json.lastUpdated);
        console.log('Skating data timestamp:', fetchedTimestamp.toISOString());

        // Parse & process
        const processed = processData(json.data);

        setData(processed);
        setLastUpdated(fetchedTimestamp);
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

// Turn raw JSON array into fully‐typed events with Date objects
function processData(rawData) {
  if (!Array.isArray(rawData)) return [];

  return rawData
    .map((event) => {
      // Convert string dates to Date objects
      const start = new Date(event.start);
      const end = new Date(event.end);

      // Check if the dates are valid
      if (isNaN(start) || isNaN(end)) {
        console.warn('Invalid date found in event:', event);
        return null;
      }

      return {
        id: event.id,
        title: event.title,
        start: start,
        end: end,
        backgroundColor: event.backgroundColor,
        textColor: event.textColor,
        allDay: event.allDay,
      };
    })
    .filter((evt) => evt !== null)
    .sort((a, b) => a.start - b.start);
}
