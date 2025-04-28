/**
 * Simple state management for the application
 */
class AppState {
  constructor() {
    this.allEvents = [];
    this.currentTab = "current"; // 'current' or 'schedule'
    this.lastUpdated = null;
    this.subscribers = [];
    this.isLoading = false;
    this.error = null;
    this.selectedDate = new Date(); // Initialize with current date
  }

  /**
   * Set events in the state
   * @param {Array} events The new events data
   */
  setEvents(events) {
    this.allEvents = events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));

    this.lastUpdated = new Date();
    this.isLoading = false;
    this.error = null;

    this.notifySubscribers();
  }

  /**
   * Set the selected date
   * @param {Date} date The date to select
   */
  setSelectedDate(date) {
    if (date instanceof Date && !isNaN(date.getTime())) {
      this.selectedDate = date;
      this.notifySubscribers();
    }
  }

  /**
   * Get events for a specific date
   * @param {Date} date The date to get events for
   * @returns {Array} Events for the specified date
   */
  getEventsForDate(date) {
    if (!date) {
      return [];
    }

    const dateStr = date.toDateString();
    return this.allEvents.filter(
      (event) => new Date(event.start).toDateString() === dateStr,
    );
  }

  /**
   * Set the loading state
   * @param {boolean} isLoading Whether the app is loading data
   */
  setLoading(isLoading) {
    this.isLoading = isLoading;
    this.notifySubscribers();
  }

  /**
   * Set an error state
   * @param {string} error The error message
   */
  setError(error) {
    this.error = error;
    this.isLoading = false;
    this.notifySubscribers();
  }

  /**
   * Change the current tab
   * @param {string} tab The tab to switch to ('current' or 'schedule')
   */
  setTab(tab) {
    if (tab === "current" || tab === "schedule") {
      this.currentTab = tab;
      this.notifySubscribers();
    }
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback Function to call when state changes
   */
  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.push(callback);
    }
  }

  /**
   * Unsubscribe from state changes
   * @param {Function} callback The callback to remove
   */
  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter((sub) => sub !== callback);
  }

  /**
   * Notify all subscribers of state changes
   */
  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in subscriber callback:", error);
      }
    });
  }
}

// Create and export a singleton instance
const appState = new AppState();
export default appState;
