require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Constants from the original code
const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
const API_BASE_URL =
  "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
const DATE_RANGE_DAYS = 8;

const LOCAL_DATA_DIR = path.join(__dirname, "../", "public", "data");
// if DATA_PATH is set in the env, use that; otherwise fall back locally
const OUTPUT_DIR = process.env.DATA_PATH || LOCAL_DATA_DIR;

// Format date for API
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Use Atlantic Time offset (-03:00 for daylight savings)
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
}

async function fetchPoolData() {
  try {
    // Generate date range for the request
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    endDate.setHours(0, 0, 0, 0);

    const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;

    console.log(`Fetching pool data from: ${apiUrl}`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status}`);
    }

    const data = await response.json();
    const timestamp = new Date();

    // Save data with timestamp
    const output = {
      data,
      lastUpdated: timestamp.toISOString(),
    };
    // make sure it exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "pool.json"),
      JSON.stringify(output, null, 2),
    );

    console.log(
      `Pool data saved successfully at ${timestamp.toLocaleString()}`,
    );
  } catch (error) {
    console.error("Error fetching pool data:", error);
  }
}

// Execute the function
fetchPoolData();
