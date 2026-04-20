require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { buildApiUrl, expandAndFilter, toLegacyEvent } = require("./devextreme-adapter");

const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
const DATE_RANGE_DAYS = 8;

function getOutputDirectory() {
  if (process.env.DATA_PATH) {
    return process.env.DATA_PATH;
  }
  return path.join(__dirname, "..", "public", "data");
}

async function fetchPoolData() {
  const OUTPUT_DIR = getOutputDirectory();
  console.log(`🏊 Starting pool data scraper v2...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  try {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    endDate.setHours(23, 59, 0, 0);

    const apiUrl = buildApiUrl(FACILITY_ID, startDate, endDate);

    console.log(`🌐 Fetching data from Connect2Rec DevExtreme endpoint...`);
    console.log(`📅 Date range: ${startDate.toDateString()} to ${endDate.toDateString()}`);

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "LCLC-Pool-Dashboard/2.0",
        Accept: "application/json",
      },
      timeout: 30000,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json();
    if (!Array.isArray(raw)) {
      throw new Error(`Invalid API response: expected array, got ${typeof raw}`);
    }

    console.log(`✅ Fetched ${raw.length} raw entries (concrete + recurring templates)`);

    const { events, recurringCount, occurrenceCount } = expandAndFilter(raw, startDate, endDate);
    const data = events.map(toLegacyEvent);

    console.log(`📦 ${recurringCount} recurring templates expanded into ${occurrenceCount} occurrences`);
    console.log(`📦 ${data.length} total events in window`);

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const timestamp = new Date();
    const output = {
      data,
      lastUpdated: timestamp.toISOString(),
      metadata: {
        facilityId: FACILITY_ID,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        eventCount: data.length,
        generatedAt: timestamp.toISOString(),
        generatedBy: process.env.GITHUB_ACTIONS ? "GitHub Actions" : "Local Development",
        scraperVersion: "v2",
      },
    };

    const outputPath = path.join(OUTPUT_DIR, "pool.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`💾 Pool data saved to: ${outputPath}`);
    console.log(`🎉 Pool scraper v2 completed successfully!`);

    if (process.env.GITHUB_ACTIONS) {
      console.log(`::notice title=Pool Data Updated::v2 scraped ${data.length} events (${occurrenceCount} from recurrence expansion)`);
    }
  } catch (error) {
    console.error(`❌ Error in pool scraper v2:`, error);
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Pool Scraper v2 Failed::${error.message}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  fetchPoolData();
}

module.exports = { fetchPoolData };
