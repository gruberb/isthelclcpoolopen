/**
 * Convert a date string from Atlantic Time to user's local timezone
 * @param {string} dateString Date string to convert
 * @returns {Date|null} Converted date or null if invalid
 */
export function convertToLocalTime(dateString) {
  // Parse the input date string as is
  const inputDate = new Date(dateString);

  // If the date is invalid, return null
  if (isNaN(inputDate.getTime())) {
    console.error("Invalid date:", dateString);
    return null;
  }

  // The API returns times without timezone information,
  // but we know they're in Atlantic Time
  // We need to convert to the user's local timezone

  // Get the user's current timezone offset
  const userOffset = new Date().getTimezoneOffset();

  // Atlantic Time is UTC-4 during standard time, UTC-3 during daylight savings
  // We'll use a simple check for daylight savings based on the date
  const isSummer = inputDate.getMonth() >= 3 && inputDate.getMonth() <= 10;
  const atlanticOffset = isSummer ? -3 * 60 : -4 * 60; // Convert hours to minutes

  // Calculate the difference in minutes
  const offsetDiff = userOffset + atlanticOffset;

  // Apply the offset
  return new Date(inputDate.getTime() + offsetDiff * 60 * 1000);
}

/**
 * Format time remaining until a given end time
 * @param {Date} endTime End time
 * @returns {string} Formatted time remaining string
 */
export function formatTimeRemaining(endTime) {
  const now = new Date();
  const diff = endTime - now;

  if (diff <= 0) return "Closing now";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

/**
 * Format a date to a user-friendly time string (e.g., "3pm" or "3:30pm")
 * @param {Date} date Date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const strTime =
    minutes === 0
      ? `${hours}${ampm}`
      : `${hours}:${minutes.toString().padStart(2, "0")}${ampm}`;
  return strTime;
}
