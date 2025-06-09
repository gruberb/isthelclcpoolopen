import { useState, useEffect } from "react";
import { isSwimmingEvent } from "../utils/eventParser";
import { convertToLocalTime } from "../utils/dateUtils";

// Cache configuration
const CACHE_KEY = "swimming_data_cache";
const CACHE_TIMESTAMP_KEY = "swimming_data_timestamp";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export function useSwimmingData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // First check cache
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData.data);
          setLastUpdated(new Date(cachedData.timestamp));
          setLoading(false);
          return;
        }

        // No valid cache, fetch new data
        const response = await fetch(`${process.env.PUBLIC_URL}/data/pool.json`)

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const jsonData = await response.json();

        // Process the data
        const processedData = processData(jsonData.data);
        const timestamp = new Date(jsonData.lastUpdated);

        // Update state
        setData(processedData);
        setLastUpdated(timestamp);

        // Cache the data
        cacheData(processedData, timestamp);
      } catch (err) {
        console.error("Error fetching swimming data:", err);
        setError(err.message);

        // Try to use expired cache as fallback
        const expiredCache = localStorage.getItem(CACHE_KEY);
        if (expiredCache) {
          try {
            const { data, timestamp } = JSON.parse(expiredCache);
            setData(data);
            setLastUpdated(new Date(timestamp));
          } catch (cacheErr) {
            console.error("Failed to use expired cache:", cacheErr);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error, lastUpdated };
}

// Process swimming data
function processData(rawData) {
  if (!rawData || !Array.isArray(rawData)) return [];

  return rawData
    .filter(isSwimmingEvent)
    .map((event) => {
      const start = convertToLocalTime(event.start);
      const end = convertToLocalTime(event.end);

      // Skip events with invalid dates
      if (!start || !end) {
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
    .filter((event) => event !== null)
    .sort((a, b) => a.start - b.start);
}

// Cache helper functions
function getCachedData() {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (!timestamp || !cachedData) return null;

    const now = Date.now();
    const cacheTime = parseInt(timestamp, 10);

    // Check if cache is still valid
    if (now - cacheTime < CACHE_DURATION) {
      return {
        data: JSON.parse(cachedData),
        timestamp: cacheTime,
      };
    }

    return null;
  } catch (err) {
    console.warn("Error reading from cache:", err);
    return null;
  }
}

function cacheData(data, timestamp) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, timestamp.getTime().toString());
  } catch (err) {
    console.warn("Error writing to cache:", err);
  }
}
