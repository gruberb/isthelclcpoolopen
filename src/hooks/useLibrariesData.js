import { useState, useEffect } from "react";

export function useLibrariesData() {
  const [libraries, setLibraries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Cache busting - changes every hour (library hours don't change often)
        const cacheBuster = Math.floor(Date.now() / (60 * 60 * 1000));
        const response = await fetch(
          `${process.env.PUBLIC_URL}/data/libraries.json?t=${cacheBuster}`,
          {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch library data: ${response.status}`);
        }

        const jsonData = await response.json();

        // Update state
        setLibraries(jsonData.libraries);
        setLastUpdated(new Date(jsonData.lastUpdated));
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
      // Library is closed today, find next open day
      return findNextOpenDay(library, now, dayOfWeek);
    }

    const [openHour, openMinute] = todayHours.open.split(":").map(Number);
    const [closeHour, closeMinute] = todayHours.close.split(":").map(Number);

    const isOpen =
      (currentHour > openHour ||
        (currentHour === openHour && currentMinute >= openMinute)) &&
      (currentHour < closeHour ||
        (currentHour === closeHour && currentMinute < closeMinute));

    // Calculate time remaining or time until opening
    if (isOpen) {
      // Calculate minutes until closing
      let minutesUntilClosing =
        (closeHour - currentHour) * 60 + (closeMinute - currentMinute);
      return { isOpen, timeRemaining: minutesUntilClosing };
    } else {
      // If it's before opening time today
      if (
        currentHour < openHour ||
        (currentHour === openHour && currentMinute < openMinute)
      ) {
        const minutesUntilOpening =
          (openHour - currentHour) * 60 + (openMinute - currentMinute);
        return { isOpen, minutesUntilOpening, nextOpenDay: dayOfWeek };
      } else {
        // It's after closing time, find next open day
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
  // Array of all weekdays
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

  // Hours left in the current day
  const hoursLeftToday = 24 - now.getHours() - now.getMinutes() / 60;

  let nextOpenDay = null;
  let hoursUntilOpen = 0;

  // Check each day of the week, starting from tomorrow
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (todayIndex + i) % 7;
    const nextDay = daysOfWeek[nextDayIndex];

    const hours = library.hours[nextDay];
    if (hours && hours.open) {
      nextOpenDay = nextDay;

      // Parse opening hours
      const [openHour, openMinute] = hours.open.split(":").map(Number);

      // Calculate total hours until opening
      if (i === 1) {
        // For tomorrow, account for remaining hours today
        hoursUntilOpen = hoursLeftToday + openHour + openMinute / 60;
      } else {
        // For days after tomorrow, add full days
        hoursUntilOpen =
          hoursLeftToday + (i - 1) * 24 + openHour + openMinute / 60;
      }

      break;
    }
  }

  if (nextOpenDay) {
    // Convert hours to minutes for consistency
    const minutesUntilOpening = Math.round(hoursUntilOpen * 60);
    return { isOpen: false, minutesUntilOpening, nextOpenDay };
  }

  // If no open days found
  return { isOpen: false, inGap: false };
}
