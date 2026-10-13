import { useState, useEffect } from "react";

export function useSkatingData(dataFile = "skating") {
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
        const dataUrl = `${process.env.PUBLIC_URL}/data/${dataFile}.json?_t=${timestamp}&_r=${random}`;

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
  }, [dataFile]);

  return {
    data,
    loading,
    error,
    lastUpdated,
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
        // The arena feed pads some names (" Mustangs Game", "Pickup Hockey- ").
        title: event.title.trim().replace(/\s*-$/, ""),
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
