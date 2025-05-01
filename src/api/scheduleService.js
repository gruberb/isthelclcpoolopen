// Enhanced scheduleService.js with caching
import {
  FACILITY_ID,
  API_BASE_URL,
  CORS_PROXY,
  DATE_RANGE_DAYS,
  CACHE_DURATION_MS,
} from "../constants.js";

// Cache key for local storage
const SCHEDULE_CACHE_KEY = "lclc_schedule_cache";
const CACHE_TIMESTAMP_KEY = "lclc_schedule_timestamp";

/**
 * Format a date for API consumption (in Atlantic timezone)
 * @param {Date} date The date to format
 * @returns {string} Formatted date string
 */
function formatDateForAPI(date) {
  // Format date as YYYY-MM-DD for simplicity
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Use Atlantic Time offset (-03:00 for daylight savings)
  return `${year}-${month}-${day}T${hours}:${minutes}:00-03:00`;
}

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
 * Fetches schedule data from the API with retries
 * @param {number} retries Number of retries on failure
 * @returns {Promise<Array>} Schedule data from the API
 */
async function fetchFromAPI(retries = 2) {
  // Generate date range for the request
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
  endDate.setHours(0, 0, 0, 0);

  const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;

  try {
    const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl), {
      headers: {
        Accept: "application/json",
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.status}`);
    }

    const data = await response.json();

    // Cache successful response
    cacheSchedule(data);

    return data;
  } catch (error) {
    console.error("Error fetching schedule:", error);

    // Retry logic
    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts left)`);
      return await fetchFromAPI(retries - 1);
    }

    throw error;
  }
}

/**
 * Fetches schedule data with cache support
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

    // No valid cache, fetch fresh data
    return await fetchFromAPI();
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
