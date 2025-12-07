require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Constants
const FACILITY_ID = "3981fb3b-0cd1-42a3-a538-e6c3f35e50ee";
const API_BASE_URL =
  "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
const WEEKS_TO_FETCH = 2;

// Environment-aware path configuration
function getOutputDirectory() {
  if (process.env.DATA_PATH) {
    return process.env.DATA_PATH;
  }
  return path.join(__dirname, "..", "public", "data");
}

// Format date for API
function formatDateForAPI(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

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
  const OUTPUT_DIR = getOutputDirectory();
  console.log(`⛸️ Starting skating data scraper...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  try {
    let allData = [];

    // Fetch data for current week and next week
    for (let i = 0; i < WEEKS_TO_FETCH; i++) {
      const { start, end } = getWeekBounds(i);
      const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(start)}&end=${formatDateForAPI(end)}`;

      console.log(`🌐 Fetching skating data for week ${i + 1}...`);

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "LCLC-Skating-Dashboard/1.0",
        },
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(
          `API request failed for week ${i + 1}: ${response.status} ${response.statusText}`,
        );
      }

      const weekData = await response.json();

      if (!Array.isArray(weekData)) {
        throw new Error(
          `Invalid API response for week ${i + 1}: expected array, got ${typeof weekData}`,
        );
      }

      allData = [...allData, ...weekData];
    }

    // Filter for public skating events
    const publicSkatingEvents = allData.filter((e) => {
      const t = e.title.toLowerCase();
      return (
        t.includes("public skate") ||
        t.includes("public skating") ||
        t.includes("adult skating") ||
        t.includes("adult skate")
      );
    });

    console.log(
      `✅ Successfully fetched ${allData.length} total events, ${publicSkatingEvents.length} public skating events`,
    );

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }

    // Prepare output data
    const timestamp = new Date();
    const output = {
      data: publicSkatingEvents,
      lastUpdated: timestamp.toISOString(),
      metadata: {
        facilityId: FACILITY_ID,
        weeksToFetch: WEEKS_TO_FETCH,
        totalEvents: allData.length,
        publicEvents: publicSkatingEvents.length,
        generatedAt: timestamp.toISOString(),
        generatedBy: process.env.GITHUB_ACTIONS
          ? "GitHub Actions"
          : "Local Development",
      },
    };

    const outputPath = path.join(OUTPUT_DIR, "skating.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`💾 Skating data saved to: ${outputPath}`);
    console.log(`🕒 Last updated: ${timestamp.toLocaleString()}`);
    console.log(`🎉 Skating scraper completed successfully!`);

    if (process.env.GITHUB_ACTIONS) {
      console.log(
        `::notice title=Skating Data Updated::Successfully scraped ${publicSkatingEvents.length} skating events`,
      );
    }
  } catch (error) {
    console.error(`❌ Error in skating scraper:`, error);

    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Skating Scraper Failed::${error.message}`);
    }

    process.exit(1);
  }
}

// Execute the function
if (require.main === module) {
  fetchSkatingData();
}

module.exports = { fetchSkatingData };
