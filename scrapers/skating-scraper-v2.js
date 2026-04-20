require("dotenv").config();
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { buildApiUrl, expandAndFilter, toLegacyEvent } = require("./devextreme-adapter");

const FACILITY_ID = "3981fb3b-0cd1-42a3-a538-e6c3f35e50ee";
const WEEKS_TO_FETCH = 2;

function getOutputDirectory() {
  if (process.env.DATA_PATH) {
    return process.env.DATA_PATH;
  }
  return path.join(__dirname, "..", "public", "data");
}

function getWeekBounds(offsetWeeks = 0) {
  const today = new Date();
  const dow = today.getDay();
  const deltaToMon = (dow + 6) % 7;
  const mon = new Date(today);
  mon.setHours(0, 0, 0, 0);
  mon.setDate(today.getDate() - deltaToMon + offsetWeeks * 7);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 0, 0);
  return { start: mon, end: sun };
}

function isPublicSkateEvent(event) {
  const t = (event.title || "").toLowerCase();
  return (
    t.includes("public skate") ||
    t.includes("public skating") ||
    t.includes("adult skate") ||
    t.includes("adult skating")
  );
}

async function fetchSkatingData() {
  const OUTPUT_DIR = getOutputDirectory();
  console.log(`⛸️  Starting skating data scraper v2...`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  try {
    let totalRaw = 0;
    let totalRecurring = 0;
    let totalOccurrences = 0;
    const allLegacyEvents = [];

    for (let i = 0; i < WEEKS_TO_FETCH; i++) {
      const { start, end } = getWeekBounds(i);
      const apiUrl = buildApiUrl(FACILITY_ID, start, end);

      console.log(`🌐 Fetching skating data for week ${i + 1} (${start.toDateString()} - ${end.toDateString()})...`);

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "LCLC-Skating-Dashboard/2.0",
          Accept: "application/json",
        },
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`API request failed for week ${i + 1}: ${response.status} ${response.statusText}`);
      }

      const raw = await response.json();
      if (!Array.isArray(raw)) {
        throw new Error(`Invalid API response for week ${i + 1}: expected array, got ${typeof raw}`);
      }

      totalRaw += raw.length;

      const { events, recurringCount, occurrenceCount } = expandAndFilter(raw, start, end);
      totalRecurring += recurringCount;
      totalOccurrences += occurrenceCount;

      allLegacyEvents.push(...events.map(toLegacyEvent));
    }

    const seen = new Set();
    const dedupedAll = allLegacyEvents.filter((ev) => {
      const key = `${ev.id}|${ev.start}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const publicSkatingEvents = dedupedAll.filter(isPublicSkateEvent);

    console.log(`✅ Fetched ${totalRaw} raw entries; ${totalRecurring} recurring → ${totalOccurrences} occurrences`);
    console.log(`📦 ${publicSkatingEvents.length} public skating events (of ${dedupedAll.length} total in window)`);

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const timestamp = new Date();
    const output = {
      data: publicSkatingEvents,
      lastUpdated: timestamp.toISOString(),
      metadata: {
        facilityId: FACILITY_ID,
        weeksToFetch: WEEKS_TO_FETCH,
        totalEvents: dedupedAll.length,
        publicEvents: publicSkatingEvents.length,
        generatedAt: timestamp.toISOString(),
        generatedBy: process.env.GITHUB_ACTIONS ? "GitHub Actions" : "Local Development",
        scraperVersion: "v2",
      },
    };

    const outputPath = path.join(OUTPUT_DIR, "skating.json");
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`💾 Skating data saved to: ${outputPath}`);
    console.log(`🎉 Skating scraper v2 completed successfully!`);

    if (process.env.GITHUB_ACTIONS) {
      console.log(`::notice title=Skating Data Updated::v2 scraped ${publicSkatingEvents.length} public skating events`);
    }
  } catch (error) {
    console.error(`❌ Error in skating scraper v2:`, error);
    if (process.env.GITHUB_ACTIONS) {
      console.log(`::error title=Skating Scraper v2 Failed::${error.message}`);
    }
    process.exit(1);
  }
}

if (require.main === module) {
  fetchSkatingData();
}

module.exports = { fetchSkatingData };
