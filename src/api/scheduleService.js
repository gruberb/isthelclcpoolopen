import {
  FACILITY_ID,
  API_BASE_URL,
  CORS_PROXY,
  DATE_RANGE_DAYS,
  CACHE_DURATION_MS,
  DATA_FILE_PATH,
} from "../constants.js";

// Cache key for local storage
const SCHEDULE_CACHE_KEY = "lclc_schedule_cache";
const CACHE_TIMESTAMP_KEY = "lclc_schedule_timestamp";

/**
 * Check if cached data is still valid
 * @returns {boolean} True if cache is valid
 */
function isCacheValid() {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheTime = parseInt(timestamp, 10);
    const now = Date.now();

    // Cache is valid if it's less than CACHE_DURATION_MS old (e.g., 30 minutes)
    return now - cacheTime < CACHE_DURATION_MS;
  } catch (e) {
    console.warn("Error checking cache validity:", e);
    return false;
  }
}

/**
 * Get cached schedule data
 * @returns {Array|null} Cached schedule data or null if no valid cache
 */
function getCachedSchedule() {
  try {
    if (!isCacheValid()) return null;

    const cachedData = localStorage.getItem(SCHEDULE_CACHE_KEY);
    if (!cachedData) return null;

    return JSON.parse(cachedData);
  } catch (e) {
    console.warn("Error retrieving cache:", e);
    return null;
  }
}

/**
 * Cache schedule data
 * @param {Array} data Schedule data to cache
 */
function cacheSchedule(data) {
  try {
    localStorage.setItem(SCHEDULE_CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn("Error caching schedule:", e);
  }
}

/**
 * Fetches schedule data from the JSON file
 * @returns {Promise<Array>} Schedule data
 */
export async function fetchScheduleData() {
  try {
    // First check if we have valid cached data
    const cachedData = getCachedSchedule();
    if (cachedData) {
      console.log("Using cached schedule data");
      return cachedData;
    }

    // No valid cache, fetch from JSON file
    const filePath = `/data/pool.json`; // Fixed path
    console.log(`Fetching pool data from ${filePath}`);

    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch schedule data from JSON: ${response.status}`,
      );
    }

    const jsonData = await response.json();

    // Extract the actual data from the wrapper
    const data = jsonData.data || [];

    // Cache successful response
    cacheSchedule(data);

    return data;
  } catch (error) {
    console.error("Error in fetchScheduleData:", error);

    // If API fails completely, try to use expired cache as fallback
    try {
      const expiredCache = localStorage.getItem(SCHEDULE_CACHE_KEY);
      if (expiredCache) {
        console.log("Using expired cache as fallback");
        return JSON.parse(expiredCache);
      }
    } catch (cacheError) {
      console.error("Failed to use expired cache:", cacheError);
    }

    throw error;
  }
}
