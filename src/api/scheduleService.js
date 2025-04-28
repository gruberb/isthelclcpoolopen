import {
  FACILITY_ID,
  API_BASE_URL,
  CORS_PROXY,
  DATE_RANGE_DAYS,
} from "../constants.js";

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
 * Fetches schedule data from the API
 * @returns {Promise<Array>} Schedule data from the API
 */
export async function fetchScheduleData() {
  try {
    // Generate date range for the request
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + DATE_RANGE_DAYS);
    endDate.setHours(0, 0, 0, 0);

    const apiUrl = `${API_BASE_URL}?selectedId=${FACILITY_ID}&start=${formatDateForAPI(startDate)}&end=${formatDateForAPI(endDate)}`;

    const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch schedule");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching schedule:", error);
    throw error;
  }
}
