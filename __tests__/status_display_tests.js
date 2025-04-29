/**
 * Comprehensive tests for the statusDisplay functions
 */

import {
  findFeatureStatus,
  updateCurrentStatus,
  initializeStatusDisplay,
} from "../src/components/statusDisplay.js";
import appState from "../src/state/appState.js";
import responseFixture from "./response_fixture.json";

// Mock the analyzeEvent function
jest.mock("../src/utils/eventParser", () => ({
  analyzeEvent: jest.fn((event) => {
    // Default implementation that returns basic results
    const title = event.title || "";

    return {
      lanes: !title.includes("No Lanes") && !title.includes("LAP POOL CLOSED"),
      kids: title.includes("Play") || title.includes("Recreational"),
      membersOnly: title.includes("Members"),
      restrictedAccess: title.includes("Senior") || title.includes("Women"),
      type: title.includes("Women")
        ? "Women's Only (All Pools)"
        : title.includes("Senior")
          ? "Seniors 60+ Only"
          : "Regular",
      details: { lanes: 0 },
    };
  }),
}));

// Mock DOM elements
const mockElements = {};
document.getElementById = jest.fn((id) => {
  // Create mock element if it doesn't exist
  if (!mockElements[id]) {
    mockElements[id] = {
      textContent: "",
      className: "",
    };
  }
  return mockElements[id];
});

// Mock appState
jest.mock("../src/state/appState", () => ({
  allEvents: [],
  lastUpdated: new Date(),
  subscribe: jest.fn(),
  setEvents: jest.fn(),
}));

// Mock formatTime and formatTimeRemaining
jest.mock("../src/utils/dateUtils", () => ({
  formatTime: jest.fn((date) => {
    if (!date) return "";
    return "2:30 PM"; // Simple mock
  }),
  formatTimeRemaining: jest.fn((date) => {
    if (!date) return "Unknown";
    return "30m remaining"; // Simple mock
  }),
  convertToLocalTime: jest.fn((date) => new Date(date)),
  formatDate: jest.fn((date) => {
    if (!date) return "";
    return "April 29, 2025";
  }),
}));

describe("Status Display Tests", () => {
  // Helper function to create a date for testing
  function createTestDate(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    Object.keys(mockElements).forEach((key) => {
      mockElements[key].textContent = "";
      mockElements[key].className = "";
    });
  });

  // Test the feature status finder for various scenarios
  describe("Feature Status Finder", () => {
    test("should handle case where no events are found for today", () => {
      const testTime = createTestDate("2025-06-01", "08:00"); // Date not in fixture
      const result = findFeatureStatus(responseFixture, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(false);
    });

    test("should handle case with no current events but future events today", () => {
      // We need events that actually exist in our fixture for this date
      const testTime = createTestDate("2025-04-29", "06:00"); // Before Members Swim at 6:30

      // Get all events for April 29 from fixture
      const april29Events = responseFixture.filter((e) =>
        e.start.includes("2025-04-29"),
      );

      if (april29Events.length === 0) {
        console.log("No events found for April 29 - skipping test");
        return;
      }

      const result = findFeatureStatus(april29Events, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(true);
      // First event should be Members Swim at 6:30
      expect(result.nextStartTime.getHours()).toBe(6);
      expect(result.nextStartTime.getMinutes()).toBe(30);
    });

    test("should handle case with no more events after current time", () => {
      // Set up a scenario where it's 9:30 PM (after all events end)
      const testTime = createTestDate("2025-04-29", "21:30");

      // Get all events for April 29 from fixture
      const april29Events = responseFixture.filter((e) =>
        e.start.includes("2025-04-29"),
      );

      if (april29Events.length === 0) {
        console.log("No events found for April 29 - skipping test");
        return;
      }

      const result = findFeatureStatus(april29Events, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(false);
    });

    test("should correctly identify the end time of a special event", () => {
      // Find Women's only swim
      const womensEvent = responseFixture.find(
        (e) => e.title === "MODL Women's Only Swim",
      );

      if (!womensEvent) {
        console.log("No Women's Only event found - skipping test");
        return;
      }

      // Create a time during this event
      const eventStart = new Date(womensEvent.start);
      const testTime = new Date(eventStart.getTime() + 15 * 60 * 1000); // 15 minutes after start

      const result = findFeatureStatus([womensEvent], testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.specialEvent).toBe(true);
      expect(result.restrictedAccess).toBe(true);
      expect(result.endTime).toEqual(new Date(womensEvent.end));
    });

    test("should handle events in chronological order", () => {
      // Create a set of test events
      const testEvents = [
        {
          title: "First Event",
          start: "2025-04-29T14:00:00.000",
          end: "2025-04-29T15:00:00.000",
        },
        {
          title: "Second Event",
          start: "2025-04-29T15:00:00.000", // Starts exactly when first ends
          end: "2025-04-29T16:00:00.000",
        },
      ];

      const testTime = createTestDate("2025-04-29", "14:30"); // During "First Event"
      const result = findFeatureStatus(testEvents, testTime, "lanes");

      expect(result.isActive).toBe(true);
      // Should extend to the end of the second event
      expect(result.endTime).toEqual(new Date("2025-04-29T16:00:00.000"));
    });

    test("should identify continuous availability when events start exactly when previous ends", () => {
      // Create consecutive events with exact timing
      const consecutiveEvents = [
        {
          title: "First Event",
          start: "2025-04-29T14:00:00.000",
          end: "2025-04-29T15:00:00.000",
        },
        {
          title: "Second Event",
          start: "2025-04-29T15:00:00.000", // Starts exactly when first ends
          end: "2025-04-29T16:00:00.000",
        },
        {
          title: "Third Event",
          start: "2025-04-29T16:00:00.000", // Starts exactly when second ends
          end: "2025-04-29T17:00:00.000",
        },
      ];

      const testTime = createTestDate("2025-04-29", "14:30"); // During "First Event"
      const result = findFeatureStatus(consecutiveEvents, testTime, "lanes");

      expect(result.isActive).toBe(true);
      // Should extend all the way to the end of the third event
      expect(result.endTime).toEqual(new Date("2025-04-29T17:00:00.000"));
    });

    test("should handle small gaps (less than 1 minute) between events as continuous", () => {
      // Create consecutive events with small gaps
      const consecutiveEvents = [
        {
          title: "First Event",
          start: "2025-04-29T14:00:00.000",
          end: "2025-04-29T15:00:00.000",
        },
        {
          title: "Second Event",
          start: "2025-04-29T15:00:30.000", // 30 seconds after first ends
          end: "2025-04-29T16:00:00.000",
        },
      ];

      const testTime = createTestDate("2025-04-29", "14:30"); // During "First Event"
      const result = findFeatureStatus(consecutiveEvents, testTime, "lanes");

      expect(result.isActive).toBe(true);
      // Should extend to the end of the second event despite the 30-second gap
      expect(result.endTime).toEqual(new Date("2025-04-29T16:00:00.000"));
    });

    test("should handle case where no events are found for today", () => {
      const testTime = createTestDate("2025-06-01", "08:00"); // Date not in fixture
      const result = findFeatureStatus(responseFixture, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(false);
    });

    // Add more tests to increase coverage
    test("should handle events with restrictedAccess correctly", () => {
      // Find a Senior Swim event
      const seniorEvent = responseFixture.find(
        (e) => e.title === "Senior Swim - 60+",
      );

      if (!seniorEvent) {
        console.log("No Senior Swim event found - skipping test");
        return;
      }

      // Create a time during this event
      const eventStart = new Date(seniorEvent.start);
      const testTime = new Date(eventStart.getTime() + 15 * 60 * 1000); // 15 minutes after start

      const result = findFeatureStatus([seniorEvent], testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.specialEvent).toBe(true);
      expect(result.restrictedAccess).toBe(true);
      expect(result.restrictionType).toBeDefined();
    });

    test("should handle events with membersOnly correctly", () => {
      // Find a Members Swim event
      const membersEvent = responseFixture.find(
        (e) =>
          e.title === "Members Swim" && !e.title.includes("LAP POOL CLOSED"),
      );

      if (!membersEvent) {
        console.log("No Members Swim event found - skipping test");
        return;
      }

      // Create a time during this event
      const eventStart = new Date(membersEvent.start);
      const testTime = new Date(eventStart.getTime() + 15 * 60 * 1000); // 15 minutes after start

      const result = findFeatureStatus([membersEvent], testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.specialEvent).toBe(true);
      expect(result.membersOnly).toBe(true);
    });

    test("should find next available time when feature is not currently active", () => {
      // Set up test events: gap followed by available event
      const testEvents = [
        {
          title: "Future Event with Lanes",
          start: "2025-04-29T14:00:00.000",
          end: "2025-04-29T15:00:00.000",
        },
      ];

      const testTime = createTestDate("2025-04-29", "13:00"); // Before the event
      const result = findFeatureStatus(testEvents, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(true);
      expect(result.nextStartTime).toEqual(new Date("2025-04-29T14:00:00.000"));
    });
  });

  // Test updateCurrentStatus function
  describe("updateCurrentStatus Function", () => {
    test("should update status elements correctly when lanes are available", () => {
      // Set up mock events
      appState.allEvents = [
        {
          title: "Recreational Swim",
          start: new Date("2025-04-29T14:00:00"),
          end: new Date("2025-04-29T16:00:00"),
        },
      ];

      // Mock current time to be during the event
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate("2025-04-29T15:00:00");
          }
          return new originalDate(...args);
        }
      };
      global.Date.now = () => new originalDate("2025-04-29T15:00:00").getTime();

      // Run the function
      updateCurrentStatus();

      // Check DOM updates
      expect(mockElements["lanes-status"].textContent).toBe("YES");
      expect(mockElements["lanes-status"].className).toContain("open");
      expect(mockElements["lanes-time"].textContent).toBe("30m remaining");

      // Restore Date
      global.Date = originalDate;
    });

    test("should update status elements correctly when lanes are closed", () => {
      // Set up mock events with no current event
      appState.allEvents = [
        {
          title: "Public Swim - No Lanes",
          start: new Date("2025-04-29T14:00:00"),
          end: new Date("2025-04-29T16:00:00"),
        },
      ];

      // Mock current time to be during the event
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate("2025-04-29T15:00:00");
          }
          return new originalDate(...args);
        }
      };
      global.Date.now = () => new originalDate("2025-04-29T15:00:00").getTime();

      // Run the function
      updateCurrentStatus();

      // Check DOM updates
      expect(mockElements["lanes-status"].textContent).toBe("NO");
      expect(mockElements["lanes-status"].className).toContain("closed");

      // Restore Date
      global.Date = originalDate;
    });

    test("should update status elements for members-only events", () => {
      // Set up mock events
      appState.allEvents = [
        {
          title: "Members Swim",
          start: new Date("2025-04-29T14:00:00"),
          end: new Date("2025-04-29T16:00:00"),
        },
      ];

      // Mock current time to be during the event
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate("2025-04-29T15:00:00");
          }
          return new originalDate(...args);
        }
      };
      global.Date.now = () => new originalDate("2025-04-29T15:00:00").getTime();

      // Run the function
      updateCurrentStatus();

      // Check DOM updates
      expect(mockElements["lanes-status"].textContent).toBe("YES");
      expect(mockElements["lanes-status"].className).toContain("members");
      expect(mockElements["lanes-time"].textContent).toContain("Members only");

      // Restore Date
      global.Date = originalDate;
    });

    test("should update status elements for restricted senior access event", () => {
      // Set up mock events
      appState.allEvents = [
        {
          title: "Senior Swim - 60+",
          start: new Date("2025-04-29T14:00:00"),
          end: new Date("2025-04-29T16:00:00"),
        },
      ];

      // Mock current time to be during the event
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate("2025-04-29T15:00:00");
          }
          return new originalDate(...args);
        }
      };
      global.Date.now = () => new originalDate("2025-04-29T15:00:00").getTime();

      // Run the function
      updateCurrentStatus();

      // Check DOM updates
      expect(mockElements["lanes-status"].textContent).toBe("YES");
      expect(mockElements["lanes-status"].className).toContain("restricted");
      expect(mockElements["lanes-time"].textContent).toContain("Seniors 60+");

      // Restore Date
      global.Date = originalDate;
    });

    test("should update status elements for restricted women access event", () => {
      // Set up mock events
      appState.allEvents = [
        {
          title: "MODL Women's Only Swim",
          start: new Date("2025-04-30T14:00:00"),
          end: new Date("2025-04-30T16:00:00"),
        },
      ];

      // Mock current time to be during the event
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            return new originalDate("2025-04-30T15:00:00");
          }
          return new originalDate(...args);
        }
      };
      global.Date.now = () => new originalDate("2025-04-30T15:00:00").getTime();

      // Run the function
      updateCurrentStatus();

      // Check DOM updates
      expect(mockElements["lanes-status"].textContent).toBe("YES");
      expect(mockElements["lanes-status"].className).toContain("restricted");
      expect(mockElements["lanes-time"].textContent).toContain(
        "Women only - 30m remaining",
      );

      // Restore Date
      global.Date = originalDate;
    });

    test("should handle case when DOM elements are not found", () => {
      // Temporarily mock getElementById to return null
      const originalGetElementById = document.getElementById;
      document.getElementById = jest.fn().mockReturnValue(null);

      // This should not throw errors
      expect(() => {
        updateCurrentStatus();
      }).not.toThrow();

      // Restore getElementById
      document.getElementById = originalGetElementById;
    });
  });

  // Test initializeStatusDisplay function
  describe("initializeStatusDisplay Function", () => {
    test("should subscribe to appState changes", () => {
      initializeStatusDisplay();

      expect(appState.subscribe).toHaveBeenCalled();
    });
  });
});
