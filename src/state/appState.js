/**
 * Simple state management for the application
 */
class AppState {
  constructor() {
    this.allEvents = [];
    this.selectedDate = new Date();
    this.lastUpdated = null;
    this.listeners = [];
  }

  /**
   * Set the events data
   * @param {Array} events The events to set
   */
  setEvents(events) {
    this.allEvents = events;
    this.lastUpdated = new Date();
    this.notifyListeners();
  }

  /**
   * Set the selected date
   * @param {Date} date The date to set
   */
  setSelectedDate(date) {
    this.selectedDate = date;
    this.notifyListeners();
  }

  /**
   * Get events for a specific date
   * @param {Date} date The date to get events for
   * @returns {Array} Events for the date
   */
  getEventsForDate(date) {
    const dateStr = date.toDateString();
    return this.allEvents.filter(
      (event) => event.start.toDateString() === dateStr,
    );
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener The listener function
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of state changes
   */
  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

// Create a singleton instance
const appState = new AppState();
export default appState;
