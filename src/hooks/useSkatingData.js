import { useState, useEffect, useCallback } from "react";
import { convertToLocalTime } from "../utils/dateUtils";

// Cache configuration
const CACHE_KEY = "skating_data_cache";
const CACHE_TIMESTAMP_KEY = "skating_data_timestamp";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function useSkatingData() {
  const [data, setData] = useState([]); // processed events array
  const [loading, setLoading] = useState(true); // spinner flag
  const [error, setError] = useState(null); // error message
  const [lastUpdated, setLastUpdated] = useState(null); // Date

  useEffect(() => {
    async function fetchData() {
      try {
        // 1) Try valid cache
        const cached = getCachedData();
        if (cached) {
          setData(cached.data);
          setLastUpdated(new Date(cached.timestamp));
          setLoading(false);
          return;
        }

        // 2) Fetch fresh
        const res = await fetch("/data/skating.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        // 3) Parse & process
        const processed = processData(json.data);
        const updatedAt = new Date(json.lastUpdated);

        setData(processed);
        setLastUpdated(updatedAt);

        // 4) Cache for next time
        cacheData(processed, updatedAt);
      } catch (err) {
        console.error("Error fetching skating data:", err);
        setError(err.message);
        // fallback to any (even expired) cache
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          try {
            const { data: d, timestamp } = JSON.parse(raw);
            setData(d);
            setLastUpdated(new Date(timestamp));
          } catch {}
        }
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

// LocalStorage cache helpers
function getCachedData() {
  try {
    const ts = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const raw = localStorage.getItem(CACHE_KEY);
    if (!ts || !raw) return null;

    const age = Date.now() - parseInt(ts, 10);
    if (age < CACHE_DURATION) {
      return { data: JSON.parse(raw), timestamp: parseInt(ts, 10) };
    }
  } catch (err) {
    console.warn("Cache read failed:", err);
  }
  return null;
}

function cacheData(data, timestamp) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.getTime().toString());
  } catch (err) {
    console.warn("Cache write failed:", err);
  }
}
