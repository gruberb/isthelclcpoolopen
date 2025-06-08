require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Constants
const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
const API_BASE_URL = "https://www.connect2rec.com/Facility/GetScheduleCustomAppointments";
const DATE_RANGE_DAYS = 8;

// Environment-aware path configuration
function getOutputDirectory() {
  // For GitHub Actions, DATA_PATH will be set to "../public/data"
  if (process.env.DATA_PATH) {
    return process.env.DATA_PATH;
  }
  
  // For local development, default to relative path
  return path.join(__dirname, "..", "public", "data");
}

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
  const OUTPUT_DIR = getOutputDirectory();
  console.log(`🏊 Starting pool data scraper...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  
  try {
    // Generate date range for the request
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    endDate.setHours(0, 0, 0, 0);

    const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;

    console.log(`🌐 Fetching data from Connect2Rec API...`);
    console.log(`📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'LCLC-Pool-Dashboard/1.0'
      },
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error(`Invalid API response: expected array, got ${typeof data}`);
    }

    console.log(`✅ Successfully fetched ${data.length} events`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }

    // Prepare output data
    const timestamp = new Date();
    const output = {
      data,
      lastUpdated: timestamp.toISOString(),
      metadata: {
        facilityId: FACILITY_ID,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        eventCount: data.length,
        generatedAt: timestamp.toISOString(),
        generatedBy: 'GitHub Actions' // or 'Local Development'
      }
    };

    const outputPath = path.join(OUTPUT_DIR, "pool.json");
    
    // Write file with pretty formatting for better git diffs
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`💾 Pool data saved to: ${outputPath}`);
    console.log(`🕒 Last updated: ${timestamp.toLocaleString()}`);
    console.log(`🎉 Pool scraper completed successfully!`);

    // For GitHub Actions, also log summary
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::notice title=Pool Data Updated::Successfully scraped ${data.length} pool events`);
    }

  } catch (error) {
    console.error(`❌ Error in pool scraper:`, error);
    
    // For GitHub Actions, create an error annotation
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Pool Scraper Failed::${error.message}`);
    }
    
    // Exit with error code to fail the GitHub Action
    process.exit(1);
  }
}

// Execute the function
if (require.main === module) {
  fetchPoolData();
}

module.exports = { fetchPoolData };