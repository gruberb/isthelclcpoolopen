require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

// Environment-aware path configuration
function getOutputDirectory() {
  if (process.env.DATA_PATH) {
    return process.env.DATA_PATH;
  }
  return path.join(__dirname, "..", "public", "data");
}

async function fetchLibrariesData() {
  const OUTPUT_DIR = getOutputDirectory();
  console.log(`📚 Starting libraries data scraper...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  try {
    const targetUrl = "https://www.southshorepubliclibraries.ca/libraries/";
    console.log(`🌐 Fetching from: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "LCLC-Libraries-Dashboard/1.0",
      },
      timeout: 30000
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const libraries = parseLibraryHours(html);

    if (Object.keys(libraries).length === 0) {
      throw new Error("No library data parsed from HTML");
    }

    console.log(`✅ Successfully parsed ${Object.keys(libraries).length} libraries`);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Created output directory: ${OUTPUT_DIR}`);
    }

    // Prepare output data
    const timestamp = new Date();
    const output = {
      libraries: libraries,
      lastUpdated: timestamp.toISOString(),
      metadata: {
        sourceUrl: targetUrl,
        libraryCount: Object.keys(libraries).length,
        generatedAt: timestamp.toISOString(),
        generatedBy: process.env.GITHUB_ACTIONS ? 'GitHub Actions' : 'Local Development'
      }
    };

    const outputPath = path.join(OUTPUT_DIR, "libraries.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`💾 Libraries data saved to: ${outputPath}`);
    console.log(`🕒 Last updated: ${timestamp.toLocaleString()}`);
    console.log(`🎉 Libraries scraper completed successfully!`);

    if (process.env.GITHUB_ACTIONS) {
      console.log(`::notice title=Libraries Data Updated::Successfully scraped ${Object.keys(libraries).length} libraries`);
    }

  } catch (error) {
    console.error(`❌ Error in libraries scraper:`, error);
    
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Libraries Scraper Failed::${error.message}`);
    }
    
    process.exit(1);
  }
}

// Parse library hours from HTML string
function parseLibraryHours(html) {
  const { window } = new JSDOM(html);
  const doc = window.document;

  const libraries = {};

  // Parse Margaret Hennigar Library (Bridgewater)
  const bridgewaterTable = doc.querySelector(".avia-table-1");
  if (bridgewaterTable) {
    libraries.bridgewater = {
      name: "Margaret Hennigar Library",
      location: "135 North Park St, Bridgewater",
      phone: "1-902-543-9222",
      hours: parseHoursFromTable(bridgewaterTable, window),
    };
  }

  // Parse Lunenburg Library
  const lunenburgTable = doc.querySelector(".avia-table-2");
  if (lunenburgTable) {
    libraries.lunenburg = {
      name: "Lunenburg Library",
      location: "97 Kaulbach St, Lunenburg",
      phone: "1-902-634-8008",
      hours: parseHoursFromTable(lunenburgTable, window),
    };
  }

  // Parse Liverpool Branch Library
  const liverpoolTable = doc.querySelector(".avia-table-3");
  if (liverpoolTable) {
    libraries.liverpool = {
      name: "Liverpool Branch Library",
      location: "54 Harley Umphrey Drive, Liverpool",
      phone: "1-902-354-5270",
      hours: parseHoursFromTable(liverpoolTable, window),
    };
  }

  // Parse Alean Freeman Library
  const aleanFreemanTable = doc.querySelector(".avia-table-4");
  if (aleanFreemanTable) {
    libraries.aleanFreeman = {
      name: "Alean Freeman Library",
      location: "5060 Highway 210, Greenfield",
      phone: "1-902-685-5400",
      hours: parseHoursFromTable(aleanFreemanTable, window),
    };
  }

  return libraries;
}

// Parse hours from a table element
function parseHoursFromTable(table, window) {
  const hours = {};
  const rows = table.querySelectorAll("tr");

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 2) {
      const day = cells[0].textContent.trim().toLowerCase();
      const timeStr = cells[1].textContent.trim();

      let open = null;
      let close = null;

      if (timeStr !== "Closed") {
        const timeParts = timeStr.split("-");
        if (timeParts.length === 2) {
          open = convertTo24Hour(timeParts[0].trim());
          close = convertTo24Hour(timeParts[1].trim());
        }
      }

      hours[day] = { open, close };
    }
  });

  return hours;
}

// Convert times like "10AM" to 24h format
function convertTo24Hour(timeStr) {
  if (!timeStr || timeStr === "Closed") return null;

  if (timeStr.includes("-")) {
    timeStr = timeStr.split("-")[0];
  }

  timeStr = timeStr.trim();

  let hours = parseInt(timeStr.replace(/[^0-9]/g, ""));
  const isPM = timeStr.toLowerCase().includes("pm");

  if (isPM && hours !== 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  return hours.toString().padStart(2, "0") + ":00";
}

// Execute the function
if (require.main === module) {
  fetchLibrariesData();
}

module.exports = { fetchLibrariesData };