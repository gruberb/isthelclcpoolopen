 /**
 * Format a time (e.g., "7:30 PM")
 * @param {Date} date - Date to format
 * @returns {string} - Formatted time string
 */
export function formatTime(date) {
  if (!date) return "";

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Format time remaining until a specific time
 * @param {Date} endTime - End time
 * @returns {string} - Formatted time remaining
 */
export function formatTimeRemaining(endTime) {
  if (!endTime) return "Unknown";

  const now = new Date();
  const diff = endTime - now;

  if (diff <= 0) return "Ended";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

/**
 * Format a date to display (e.g., "Monday, January 1")
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  if (!date) return "";

  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format minutes as hours and minutes (e.g., "2h 15m" or "45m")
 * @param {number} minutes - Minutes to format
 * @returns {string} - Formatted string
 */
export function formatMinutes(minutes) {
  if (!minutes && minutes !== 0) return "";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get the bounds of a week (Monday to Sunday)
 * @param {number} offsetWeeks - Number of weeks to offset from current week
 * @returns {Object} - { start, end } dates of the week
 */
export function getWeekBounds(offsetWeeks = 0) {
  // Use the current date
  const today = new Date();

  // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
  const dow = today.getDay();

  // Calculate days to subtract to get to Monday of this week
  const daysToMonday = (dow + 6) % 7; // Convert Sunday=0 to Monday=0

  // Create start date (Monday of the week)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToMonday + offsetWeeks * 7);
  startDate.setHours(0, 0, 0, 0);

  // Create end date (Sunday of the week)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);

  return { start: startDate, end: endDate };
}
