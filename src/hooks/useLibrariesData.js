import { useState, useEffect } from "react";

export function useLibrariesData() {
  const [libraries, setLibraries] = useState(null);
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
        const dataUrl = `${process.env.PUBLIC_URL}/data/libraries.json?_t=${timestamp}&_r=${random}`;

        console.log('Fetching library data from:', dataUrl);

        const response = await fetch(dataUrl, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch library data: ${response.status}`);
        }

        const jsonData = await response.json();

        // Log the timestamp to verify fresh data
        const fetchedTimestamp = new Date(jsonData.lastUpdated);
        console.log('Library data timestamp:', fetchedTimestamp.toISOString());

        // Update state
        setLibraries(jsonData.libraries);
        setLastUpdated(fetchedTimestamp);
      } catch (err) {
        console.error("Error fetching library data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Function to check if a library is currently open
  function isLibraryOpen(libraryKey) {
    if (!libraries || !libraries[libraryKey]) {
      return { isOpen: false };
    }

    const library = libraries[libraryKey];
    const now = new Date();
    const dayOfWeek = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const todayHours = library.hours[dayOfWeek];

    if (!todayHours || !todayHours.open || !todayHours.close) {
      return findNextOpenDay(library, now, dayOfWeek);
    }

    const [openHour, openMinute] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);

    const isOpen =
      (currentHour > openHour ||
        (currentHour === openHour && currentMinute >= openMinute)) &&
      (currentHour < closeHour ||
        (currentHour === closeHour && currentMinute < closeMinute));

    if (isOpen) {
      let minutesUntilClosing =
        (closeHour - currentHour) * 60 + (closeMinute - currentMinute);
      return { isOpen, timeRemaining: minutesUntilClosing };
    } else {
      if (
        currentHour < openHour ||
        (currentHour === openHour && currentMinute < openMinute)
      ) {
        const minutesUntilOpening =
          (openHour - currentHour) * 60 + (openMinute - currentMinute);
        return { isOpen, minutesUntilOpening, nextOpenDay: dayOfWeek };
      } else {
        return findNextOpenDay(library, now, dayOfWeek);
      }
    }
  }

  return {
    libraries,
    loading,
    error,
    lastUpdated,
    isLibraryOpen,
  };
}

// Helper function to find the next open day for a library
function findNextOpenDay(library, now, todayName) {
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayIndex = daysOfWeek.indexOf(todayName);
  const hoursLeftToday = 24 - now.getHours() - now.getMinutes() / 60;

  let nextOpenDay = null;
  let hoursUntilOpen = 0;

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayIndex + i) % 7;
    const nextDay = daysOfWeek[nextDayIndex];

    const hours = library.hours[nextDay];
    if (hours && hours.open) {
      nextOpenDay = nextDay;

      const [openHour, openMinute] = hours.open.split(":").map(Number);

      if (i === 1) {
        hoursUntilOpen = hoursLeftToday + openHour + openMinute / 60;
      } else {
        hoursUntilOpen =
          hoursLeftToday + (i - 1) * 24 + openHour + openMinute / 60;
      }

      break;
    }
  }

  if (nextOpenDay) {
    const minutesUntilOpening = Math.round(hoursUntilOpen * 60);
    return { isOpen: false, minutesUntilOpening, nextOpenDay };
  }

  return { isOpen: false, inGap: false };
}
