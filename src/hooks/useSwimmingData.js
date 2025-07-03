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
        // Use timestamp cache buster (changes every second)
        const cacheBuster = Date.now();

        // Check if we're in production (GitHub Pages)
        const isProduction = window.location.hostname === 'isthelclcpoolopen.ca';

        let dataUrl;
        if (isProduction) {
          // In production, use raw GitHub URL to bypass GitHub Pages CDN
          dataUrl = `https://raw.githubusercontent.com/gruberb/isthelclcpoolopen/main/public/data/pool.json?t=${cacheBuster}`;
        } else {
          // In development, use local file
          dataUrl = `${process.env.PUBLIC_URL}/data/pool.json?t=${cacheBuster}`;
        }

        const response = await fetch(dataUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });

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
