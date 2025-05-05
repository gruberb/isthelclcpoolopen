require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Constants
const FACILITY_ID = "3981fb3b-0cd1-42a3-a538-e6c3f35e50ee"; // Skating facility ID
const API_BASE_URL =
  "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
const WEEKS_TO_FETCH = 2; // Current week and next week
const LOCAL_DATA_DIR = path.join(__dirname, "..", "public", "data");
// if DATA_PATH is set in the env, use that; otherwise fall back locally
const OUTPUT_DIR = process.env.DATA_PATH || LOCAL_DATA_DIR;

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

    // make sure it exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "skating.json"),
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
