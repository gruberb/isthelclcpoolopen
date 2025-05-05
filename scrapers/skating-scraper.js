// scrapers/skating-scraper.js
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Constants
const FACILITY_ID = "3981fb3b-0cd1-42a3-a538-e6c3f35e50ee"; // Skating facility ID
const API_BASE_URL =
  "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
const WEEKS_TO_FETCH = 2; // Current week and next week

// Format date for API
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Use Atlantic Time offset
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
}

// Get Monday of the week
function getWeekBounds(offsetWeeks = 0) {
  const today = new Date();
  const dow = today.getDay();
  const deltaToMon = (dow + 6) % 7;
  const mon = new Date(today);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(today.getDate() - deltaToMon + offsetWeeks * 7);
  const nextMon = new Date(mon);
  nextMon.setDate(mon.getDate() + 7);
  return { start: mon, end: nextMon };
}

async function fetchSkatingData() {
  try {
    let allData = [];

    // Fetch data for current week and next week
    for (let i = 0; i < WEEKS_TO_FETCH; i++) {
      const { start, end } = getWeekBounds(i);

      const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(start)}&end=${formatDateForAPI(end)}`;

      console.log(`Fetching skating data for week ${i + 1}: ${apiUrl}`);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch schedule for week ${i + 1}: ${response.status}`,
        );
      }

      const weekData = await response.json();
      allData = [...allData, ...weekData];
    }

    // Filter for public skating events
    const publicSkatingEvents = allData.filter((e) => {
      const t = e.title.toLowerCase();
      return (
        t.includes("public skate") ||
        t.includes("public skating") ||
        t.includes("adult skating")
      );
    });

    const timestamp = new Date();

    // Save data with timestamp
    const output = {
      data: publicSkatingEvents,
      lastUpdated: timestamp.toISOString(),
    };

    // Create data directories
    const dataDir = path.join(__dirname, "data");
    const webDataDir = path.join(__dirname, "..", "public", "data");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(webDataDir)) {
      fs.mkdirSync(webDataDir, { recursive: true });
    }

    // Write to scraper's data directory
    fs.writeFileSync(
      path.join(dataDir, "skating.json"),
      JSON.stringify(output, null, 2),
    );

    // Also write to the web directory for development
    fs.writeFileSync(
      path.join(webDataDir, "skating.json"),
      JSON.stringify(output, null, 2),
    );

    console.log(
      `Skating data saved successfully at ${timestamp.toLocaleString()}`,
    );
  } catch (error) {
    console.error("Error fetching skating data:", error);
  }
}

// Execute the function
fetchSkatingData();
