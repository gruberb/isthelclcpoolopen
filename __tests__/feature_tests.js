/**
 * Unit tests for the findFeatureStatus function
 */

// Import the function to test
import { findFeatureStatus } from "../src/components/statusDisplay.js";
import responseFixture from "./response_fixture.json";

// Mock the analyzeEvent function
jest.mock("../src/utils/eventParser", () => ({
  analyzeEvent: (event) => {
    const title = event.title;

    // Check for specific conditions
    const membersOnly = title.includes("Members");
    const restrictedAccess =
      title.includes("Senior Swim") ||
      title.includes("Women") ||
      title.includes("Sensory");

    // For lanes, check for numeric lanes count and LAP POOL CLOSED
    const lanesCountMatch = title.match(/(\d+)\s+Lane/);
    const hasExplicitLaneCount = !!lanesCountMatch;
    const lanesCount = hasExplicitLaneCount ? parseInt(lanesCountMatch[1]) : 0;

    // CRITICAL: LAP POOL CLOSED overrides lane count completely
    const lapPoolClosed = title.includes("LAP POOL CLOSED");
    const explicitlyNoLanes = title.includes("No Lanes");

    // Check for kids pools
    const kidsPoolsOpen = title.includes("Play") || title.includes("Therapy");

    // Determine lane availability:
    // If LAP POOL CLOSED appears anywhere in the title, lanes are not available
    // regardless of whether there's a lane count mentioned
    const lanesAvailable =
      hasExplicitLaneCount && !lapPoolClosed && !explicitlyNoLanes;

    return {
      lanes: lanesAvailable,
      kids: kidsPoolsOpen,
      membersOnly,
      restrictedAccess,
      type: title.includes("Women")
        ? "Women's Only (All Pools)"
        : title.includes("Senior")
          ? "Seniors 60+"
          : title.includes("Sensory")
            ? "Sensory Swim"
            : "Regular",
      details: {
        lanes: lanesCount,
      },
    };
  },
}));

describe("Feature Status Tests", () => {
  // Use events data from response_fixture.json
  const events = responseFixture;

  // Helper function to create a date for testing
  function createTestDate(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  // Test findFeatureStatus for lanes
  describe("Lane Swimming Status", () => {
    test("should detect continuous lane availability spanning multiple events", () => {
      // April 27 at 8:15 AM (during first recreational swim)
      const testTime = createTestDate("2025-04-27", "08:15");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-04-27T12:30:00.000"));
    });

    test("should handle lanes explicitly closed with LAP POOL CLOSED", () => {
      // April 28 at 10:30 AM (during LAP POOL CLOSED)
      const testTime = createTestDate("2025-04-28", "10:30");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(false); // No more lane swimming today
    });

    test("should handle gaps between events with lanes", () => {
      // April 27 at 5:50 PM (during gap before 6 PM session)
      const testTime = createTestDate("2025-04-27", "17:50");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(true);
      expect(result.nextStartTime).toEqual(new Date("2025-04-27T18:00:00.000"));
    });

    test('should handle events with "No Lanes" in the title', () => {
      // April 27 at 2:00 PM (during "Public Swimming - No Lanes")
      const testTime = createTestDate("2025-04-27", "14:00");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(true);
      expect(result.nextStartTime).toEqual(new Date("2025-04-27T18:00:00.000"));
    });

    test("should show no lanes available when title includes LAP POOL CLOSED even with lane count", () => {
      // April 28 at 6:30 PM (during Special Olympics with LAP POOL CLOSED)
      const testTime = createTestDate("2025-04-28", "18:30");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(false); // No more lane swimming today
    });
  });

  // Test findFeatureStatus for kids pools
  describe("Kids Pools Status", () => {
    test("should detect kids pools availability when lap pool is closed", () => {
      // April 28 at 10:30 AM (during recreational swim with lap pool closed)
      const testTime = createTestDate("2025-04-28", "10:30");
      const result = findFeatureStatus(events, testTime, "kids");

      expect(result.isActive).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-04-28T15:30:00.000"));
    });

    test("should detect when kids pools are not available", () => {
      // April 27 at 4:30 PM (during "Busy" period)
      const testTime = createTestDate("2025-04-27", "16:30");
      const result = findFeatureStatus(events, testTime, "kids");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(true);
      expect(result.nextStartTime).toEqual(new Date("2025-04-27T18:00:00.000"));
    });

    test("should handle small gaps between events", () => {
      // April 27 at 5:50 PM (during gap between Sensory Swim and Barracudas)
      const testTime = createTestDate("2025-04-27", "17:50");
      const result = findFeatureStatus(events, testTime, "kids");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(true);
      expect(result.nextStartTime).toEqual(new Date("2025-04-27T18:00:00.000"));
    });

    test("should identify when no more kids pools events are available today", () => {
      // April 27 at 8:30 PM (after all events)
      const testTime = createTestDate("2025-04-27", "20:30");
      const result = findFeatureStatus(events, testTime, "kids");

      expect(result.isActive).toBe(false);
      expect(result.inGap).toBe(false); // No more events today
    });

    test("should detect continuous kids pool availability across events with LAP POOL CLOSED", () => {
      // April 28 at 6:30 PM (during Special Olympics with LAP POOL CLOSED)
      const testTime = createTestDate("2025-04-28", "18:30");
      const result = findFeatureStatus(events, testTime, "kids");

      expect(result.isActive).toBe(true);
      // Should include all consecutive events until 9 PM
      expect(result.endTime).toEqual(new Date("2025-04-28T21:00:00.000"));
    });
  });

  // Test for special cases and edge conditions
  describe("Special Cases and Edge Conditions", () => {
    test("should handle members-only swim", () => {
      // April 28 at 7:00 AM (during members swim with lap pool closed)
      const testTime = createTestDate("2025-04-28", "07:00");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false); // Lap pool is closed
      expect(result.inGap).toBe(false); // No more lane swimming today
    });

    test("should handle restricted access swims", () => {
      // April 27 at 5:15 PM (during Sensory Swim)
      const testTime = createTestDate("2025-04-27", "17:15");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false); // No lanes during Sensory Swim
      expect(result.inGap).toBe(true);
      expect(result.nextStartTime).toEqual(new Date("2025-04-27T18:00:00.000"));
    });

    test("should handle events exactly at boundaries", () => {
      // April 27 at exactly 9:00 AM (transition from recreational to lessons)
      const testTime = createTestDate("2025-04-27", "09:00");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-04-27T12:30:00.000"));
    });

    test("should handle events exactly at end time", () => {
      // April 27 at exactly 8:00 PM (end of last event)
      const testTime = createTestDate("2025-04-27", "20:00");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(false); // End time is exclusive
      expect(result.inGap).toBe(false); // No more events today
    });
  });
});
