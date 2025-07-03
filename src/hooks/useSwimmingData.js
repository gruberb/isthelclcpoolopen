import { useState, useEffect } from "react";
import { isSwimmingEvent } from "../utils/eventParser";
import { convertToLocalTime } from "../utils/dateUtils";

export function useSwimmingData() {
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
        const dataUrl = `${process.env.PUBLIC_URL}/data/pool.json?_t=${timestamp}&_r=${random}`;

        console.log('Fetching pool data from:', dataUrl);

        const response = await fetch(dataUrl, {
          method: 'GET',
          cache: 'reload', // Most aggressive cache policy
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const jsonData = await response.json();

        // Log the timestamp to verify fresh data
        const fetchedTimestamp = new Date(jsonData.lastUpdated);
        console.log('Pool data timestamp:', fetchedTimestamp.toISOString());

        // Process the data
        const processedData = processData(jsonData.data);

        // Update state
        setData(processedData);
        setLastUpdated(fetchedTimestamp);
      } catch (err) {
        console.error("Error fetching swimming data:", err);
        setError(err.message);
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
