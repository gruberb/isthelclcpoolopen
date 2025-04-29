/**
 * Unit tests for the appState module
 */

import appState from "../src/state/appState.js";

describe("AppState Tests", () => {
  // Save original event state for restoration
  const originalEvents = [...appState.allEvents];
  const originalSelectedDate = appState.selectedDate;
  const originalSubscribers = [...appState.subscribers];

  // Reset appState after each test
  afterEach(() => {
    appState.allEvents = [...originalEvents];
    appState.selectedDate = originalSelectedDate;
    appState.subscribers = [...originalSubscribers];
    appState.isLoading = false;
    appState.error = null;
  });

  describe("Event Management", () => {
    test("should set events and convert dates", () => {
      // Mock events with string dates
      const mockEvents = [
        {
          id: "1",
          title: "Test Event 1",
          start: "2025-04-29T14:00:00.000",
          end: "2025-04-29T16:00:00.000",
        },
        {
          id: "2",
          title: "Test Event 2",
          start: "2025-04-29T17:00:00.000",
          end: "2025-04-29T19:00:00.000",
        },
      ];

      // Create a spy on notifySubscribers
      const notifySpy = jest.spyOn(appState, "notifySubscribers");

      // Set events
      appState.setEvents(mockEvents);

      // Check that events were set correctly
      expect(appState.allEvents).toHaveLength(2);
      expect(appState.allEvents[0].id).toBe("1");
      expect(appState.allEvents[1].id).toBe("2");

      // Check that dates were converted to Date objects
      expect(appState.allEvents[0].start).toBeInstanceOf(Date);
      expect(appState.allEvents[0].end).toBeInstanceOf(Date);
      expect(appState.allEvents[1].start).toBeInstanceOf(Date);
      expect(appState.allEvents[1].end).toBeInstanceOf(Date);

      // Check that lastUpdated was set
      expect(appState.lastUpdated).toBeInstanceOf(Date);

      // Check that isLoading was set to false
      expect(appState.isLoading).toBe(false);

      // Check that error was set to null
      expect(appState.error).toBeNull();

      // Check that subscribers were notified
      expect(notifySpy).toHaveBeenCalled();

      // Clean up spy
      notifySpy.mockRestore();
    });

    test("should filter events for specific date", () => {
      // Set up events on different dates
      const mockEvents = [
        {
          id: "1",
          title: "Test Event 1",
          start: new Date("2025-04-29T14:00:00.000"),
          end: new Date("2025-04-29T16:00:00.000"),
        },
        {
          id: "2",
          title: "Test Event 2",
          start: new Date("2025-04-30T17:00:00.000"),
          end: new Date("2025-04-30T19:00:00.000"),
        },
      ];

      // Set events directly to avoid conversion
      appState.allEvents = mockEvents;

      // Test filtering for April 29
      const april29 = new Date("2025-04-29T00:00:00.000");
      const april29Events = appState.getEventsForDate(april29);

      expect(april29Events).toHaveLength(1);
      expect(april29Events[0].id).toBe("1");

      // Test filtering for April 30
      const april30 = new Date("2025-04-30T00:00:00.000");
      const april30Events = appState.getEventsForDate(april30);

      expect(april30Events).toHaveLength(1);
      expect(april30Events[0].id).toBe("2");

      // Test filtering for date with no events
      const may1 = new Date("2025-05-01T00:00:00.000");
      const may1Events = appState.getEventsForDate(may1);

      expect(may1Events).toHaveLength(0);
    });

    test("should handle null date in getEventsForDate", () => {
      const events = appState.getEventsForDate(null);
      expect(events).toHaveLength(0);
    });
  });

  describe("Date Selection", () => {
    test("should set selected date", () => {
      // Create a spy on notifySubscribers
      const notifySpy = jest.spyOn(appState, "notifySubscribers");

      // Set selected date
      const newDate = new Date("2025-04-29T00:00:00.000");
      appState.setSelectedDate(newDate);

      // Check that date was set correctly
      expect(appState.selectedDate).toEqual(newDate);

      // Check that subscribers were notified
      expect(notifySpy).toHaveBeenCalled();

      // Clean up spy
      notifySpy.mockRestore();
    });

    test("should ignore invalid dates", () => {
      // Create a spy on notifySubscribers
      const notifySpy = jest.spyOn(appState, "notifySubscribers");

      // Current selected date
      const currentDate = appState.selectedDate;

      // Try to set invalid date
      appState.setSelectedDate(new Date("invalid"));

      // Check that date was not changed
      expect(appState.selectedDate).toEqual(currentDate);

      // Check that subscribers were not notified
      expect(notifySpy).not.toHaveBeenCalled();

      // Clean up spy
      notifySpy.mockRestore();
    });
  });

  describe("Loading and Error States", () => {
    test("should set loading state", () => {
      // Create a spy on notifySubscribers
      const notifySpy = jest.spyOn(appState, "notifySubscribers");

      // Set loading state
      appState.setLoading(true);

      // Check that loading state was set correctly
      expect(appState.isLoading).toBe(true);

      // Check that subscribers were notified
      expect(notifySpy).toHaveBeenCalled();

      // Clean up spy
      notifySpy.mockRestore();
    });

    test("should set error state", () => {
      // Create a spy on notifySubscribers
      const notifySpy = jest.spyOn(appState, "notifySubscribers");

      // Set error state
      appState.setError("Test error");

      // Check that error state was set correctly
      expect(appState.error).toBe("Test error");

      // Check that loading state was set to false
      expect(appState.isLoading).toBe(false);

      // Check that subscribers were notified
      expect(notifySpy).toHaveBeenCalled();

      // Clean up spy
      notifySpy.mockRestore();
    });

    test("should set tab", () => {
      // Create a spy on notifySubscribers
      const notifySpy = jest.spyOn(appState, "notifySubscribers");

      // Set tab
      appState.setTab("schedule");

      // Check that tab was set correctly
      expect(appState.currentTab).toBe("schedule");

      // Check that subscribers were notified
      expect(notifySpy).toHaveBeenCalled();

      // Clean up spy
      notifySpy.mockRestore();

      // Set invalid tab
      appState.setTab("invalid");

      // Check that tab was not changed
      expect(appState.currentTab).toBe("schedule");
    });
  });

  describe("Subscription Management", () => {
    test("should subscribe and notify callbacks", () => {
      // Create mock callback
      const mockCallback = jest.fn();

      // Subscribe
      appState.subscribe(mockCallback);

      // Trigger notification
      appState.notifySubscribers();

      // Check that callback was called
      expect(mockCallback).toHaveBeenCalled();
    });

    test("should unsubscribe callbacks", () => {
      // Create mock callback
      const mockCallback = jest.fn();

      // Subscribe
      appState.subscribe(mockCallback);

      // Unsubscribe
      appState.unsubscribe(mockCallback);

      // Trigger notification
      appState.notifySubscribers();

      // Check that callback was not called
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test("should ignore non-function subscribers", () => {
      // Try to subscribe with non-function
      appState.subscribe("not a function");

      // Check that it didn't throw an error
      expect(() => {
        appState.notifySubscribers();
      }).not.toThrow();
    });

    test("should handle errors in subscriber callbacks", () => {
      // Create a mock callback that throws an error
      const mockCallback = jest.fn(() => {
        throw new Error("Test error");
      });

      // Create a spy on console.error
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Subscribe
      appState.subscribe(mockCallback);

      // Trigger notification - should not throw
      expect(() => {
        appState.notifySubscribers();
      }).not.toThrow();

      // Check that error was logged
      expect(consoleSpy).toHaveBeenCalled();

      // Clean up
      appState.unsubscribe(mockCallback);
      consoleSpy.mockRestore();
    });
  });
});
