require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const LOCAL_DATA_DIR = path.join(__dirname, "..", "public", "data");
// if DATA_PATH is set in the env, use that; otherwise fall back locally
const OUTPUT_DIR = process.env.DATA_PATH || LOCAL_DATA_DIR;

async function fetchLibrariesData() {
  try {
    console.log("Fetching South Shore libraries data");

    const targetUrl = "https://www.southshorepubliclibraries.ca/libraries/";

    console.log(`Fetching from: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 Library Dashboard Scraper",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    const html = await response.text();
    const libraries = parseLibraryHours(html);

    // make sure it exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Store data with timestamp
    const output = {
      libraries: libraries,
      lastUpdated: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, "libraries.json"),
      JSON.stringify(output, null, 2),
    );

    console.log(
      `Libraries data saved successfully at ${new Date().toLocaleString()}`,
    );
  } catch (error) {
    console.error("Error fetching libraries data:", error);
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

  // If no library data was found, throw an error
  if (Object.keys(libraries).length === 0) {
    throw new Error("Could not parse library data from HTML");
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

      // Parse time (e.g. "10AM-5PM" or "Closed")
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

  // Handle "12PM-5PM" format
  if (timeStr.includes("-")) {
    timeStr = timeStr.split("-")[0];
  }

  // Remove any spaces
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
fetchLibrariesData();
