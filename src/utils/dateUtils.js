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
