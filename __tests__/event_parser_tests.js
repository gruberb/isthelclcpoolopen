/**
 * Unit tests for the event parser function
 */

import { analyzeEvent, isSwimmingEvent } from "../src/utils/eventParser.js";
import responseFixture from "./response_fixture.json";

/**
 * Comprehensive tests for the event parser functions using fixture data
 */
describe("Event Parser Tests", () => {
  // Basic event type detection tests
  describe("Basic event type detection", () => {
    test("should identify regular recreational swim", () => {
      const event = responseFixture.find(
        (e) =>
          e.title === "Recreational Swim - 4 Lanes, Play & Therapy Pools Open",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(true);
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
      expect(result.details.lanes).toBe(4);
    });

    test("should identify Members Swim correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title === "Members Swim" && !e.title.includes("LAP POOL CLOSED"),
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(true);
      expect(result.membersOnly).toBe(true);
      expect(result.restrictedAccess).toBe(false);
      expect(result.type).toBe("Members Only");
    });

    test("should identify Senior Swim correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "Senior Swim - 60+",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(false); // Senior swim should NOT have kids pool open
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(true);
      expect(result.type).toBe("Seniors 60+ Only");
    });

    test("should identify Women's Only Swim correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "MODL Women's Only Swim",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(true);
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(true);
      expect(result.type).toBe("Women's Only (All Pools)");
    });
  });

  // Test the isSwimmingEvent function with fixture data
  describe("isSwimmingEvent function", () => {
    test("should identify swimming events with blue background", () => {
      const swimmingEvent = responseFixture.find(
        (e) =>
          e.title === "Recreational Swim - 4 Lanes, Play & Therapy Pools Open",
      );

      const result = isSwimmingEvent(swimmingEvent);
      expect(result).toBe(true);
    });

    test("should identify busy events as swimming events", () => {
      const busyEvent = responseFixture.find((e) => e.title === "Busy");

      const result = isSwimmingEvent(busyEvent);
      expect(result).toBe(true);
    });

    test("should identify non-swimming events correctly", () => {
      // Using a custom event since we don't have non-swimming events in fixture
      const nonSwimEvent = {
        title: "Meeting",
        backgroundColor: "#FF0000",
      };

      const result = isSwimmingEvent(nonSwimEvent);
      expect(result).toBe(false);
    });

    test("should exclude pool party events if they were in the fixture", () => {
      // Create a synthetic event based on real background color from fixture
      const poolColor = responseFixture[0].backgroundColor;
      const poolPartyEvent = {
        title: "Pool Party",
        backgroundColor: poolColor,
      };

      const result = isSwimmingEvent(poolPartyEvent);
      expect(result).toBe(false);
    });
  });

  // Test special cases
  describe("Special cases and edge conditions", () => {
    test("should handle 'Lessons & Lanes' without Play Pool correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "Lessons & Lanes - 2 Lanes & Therapy Pool Open",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(false); // Only Therapy Pool mentioned, NOT Play Pool
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle complex 'Lessons & Lanes' title correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title ===
          "Lessons & Lanes - 2 Lanes & Therapy Pool Open until 5:30 pm - 1 Lane & Therapy Pool Open after 5:30 pm",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(false); // Only Therapy Pool mentioned, NOT Play Pool
      expect(result.details.lanes).toBe(2); // Should extract the first lane count
    });

    test("should handle 'Lessons & Lanes' with Play Pool correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title === "Lessons & Lanes - 2 Lanes, Play & Therapy Pools Open",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true);
      expect(result.kids).toBe(true); // Explicitly mentions Play Pool
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle 'Public Swim - No Lanes' correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "Public Swim - No Lanes",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(false);
      expect(result.kids).toBe(true); // Public Swim always has kids pool
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle LAP POOL CLOSED correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "Members Swim / LAP POOL CLOSED",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(false); // LAP POOL CLOSED overrides any lane count
      expect(result.kids).toBe(true); // Members Swim has kids pool
      expect(result.membersOnly).toBe(true);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle 'Busy' events correctly", () => {
      const event = responseFixture.find((e) => e.title === "Busy");

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(false); // No lanes during Busy periods
      expect(result.kids).toBe(false); // No kids pool during Busy periods
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
      expect(result.type).toBe("Busy/Maintenance");
    });
  });

  // Test Aquafit and Elderfit events (key bug fix)
  describe("Aquafit and Elderfit events", () => {
    test("should handle 'Aquafit using Lap Pool' correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "Aquafit using Lap Pool - Play & Therapy Pools Open",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(false); // Lap pool is being used for Aquafit
      expect(result.kids).toBe(true); // Play Pool is explicitly mentioned as open
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle 'Elderfit using Lap Pool' correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title === "Elderfit using Lap Pool - Play & Therapy Pools Open",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(false); // Lap pool is being used for Elderfit
      expect(result.kids).toBe(true); // Play Pool is explicitly mentioned as open
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });
  });

  // Test edge cases with real fixture data
  describe("Edge cases and complex titles", () => {
    test("should handle complex title with multiple conditions correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title ===
          "Recreational Swim - Bronze Medallion using 2 Lanes from 7 -8 pm, Play & Therapy Pools Open",
      );

      const result = analyzeEvent(event);

      expect(result.lanes).toBe(true); // Has lanes even though some are in use
      expect(result.kids).toBe(true); // Play Pool explicitly mentioned
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle private rental correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title ===
          "Private Rental - Superheroes United Pools Closed to the Public",
      );

      const result = analyzeEvent(event);

      // Private rentals should have neither lanes nor kids available to the public
      expect(result.lanes).toBe(false);
      expect(result.kids).toBe(false);
      expect(result.membersOnly).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle Parent & Tot Swim correctly", () => {
      const event = responseFixture.find(
        (e) => e.title === "Parent & Tot Swim",
      );

      const result = analyzeEvent(event);

      // Parent & Tot Swim is swimming lessons, so kids pool is closed
      expect(result.kids).toBe(false);
      expect(result.restrictedAccess).toBe(false);
    });

    test("should handle multiple lane counts in title correctly", () => {
      // Look for events with multiple lane counts in the title
      const event = responseFixture.find(
        (e) => e.title.includes("1 Lane") && e.title.includes("2 Lanes"),
      );

      if (event) {
        const result = analyzeEvent(event);

        // Should pick up the first lane count mentioned
        expect(result.details.lanes).toBeGreaterThan(0);
        expect(result.lanes).toBe(true);
      } else {
        // Skip this test if no suitable event in fixture
        console.log("No event with multiple lane counts found in fixture");
      }
    });

    test("should handle events with both lap pool closed and lane count correctly", () => {
      const event = responseFixture.find(
        (e) =>
          e.title.includes("LAP POOL CLOSED") && e.title.match(/\d+\s+Lane/),
      );

      if (event) {
        const result = analyzeEvent(event);

        // LAP POOL CLOSED should override any lane count
        expect(result.lanes).toBe(false);
      } else {
        // Skip this test if no suitable event in fixture
        console.log(
          "No event with both LAP POOL CLOSED and lane count found in fixture",
        );
      }
    });
  });
});
/**
 * Unit tests for the findFeatureStatus function
 */
import { findFeatureStatus } from "../src/components/statusDisplay.js";

describe("Feature Status Tests", () => {
  // Use events data from response_fixture.json
  const events = responseFixture;

  // Helper function to create a date for testing
  function createTestDate(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
  }

  // Test timing for special events (Members, Women's, Seniors)
  describe("Special Event Timing", () => {
    test("should identify members-only swim end time correctly", () => {
      // 7:00 AM on April 29 (during Members Swim)
      const testTime = createTestDate("2025-04-29", "07:00");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.specialEvent).toBe(true); // Should identify as special event
      expect(result.membersOnly).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-04-29T07:30:00.000")); // Should end at 7:30 AM
    });

    test("should identify women's-only swim end time correctly", () => {
      // 5:30 PM on May 3 (during Women's Only Swim)
      const testTime = createTestDate("2025-05-03", "17:30");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.specialEvent).toBe(true); // Should identify as special event
      expect(result.restrictedAccess).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-05-03T18:00:00.000")); // Should end at 6:00 PM
    });

    test("should identify seniors-only swim end time correctly", () => {
      // 2:30 PM on April 30 (during Senior Swim)
      const testTime = createTestDate("2025-04-30", "14:30");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.specialEvent).toBe(true); // Should identify as special event
      expect(result.restrictedAccess).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-04-30T15:30:00.000")); // Should end at 3:30 PM
    });
  });

  // Test accurately detecting Play & Therapy pools
  describe("Play Pool vs Therapy Pool Detection", () => {
    test("should detect Elderfit correctly - lap pool used but play pool open", () => {
      // 10:15 AM on April 29 (during Elderfit)
      const testTime = createTestDate("2025-04-29", "10:15");

      const lanesResult = findFeatureStatus(events, testTime, "lanes");
      expect(lanesResult.isActive).toBe(false); // Lanes not available during Elderfit

      const kidsResult = findFeatureStatus(events, testTime, "kids");
      expect(kidsResult.isActive).toBe(true); // Play pool should be open during Elderfit
    });

    test("should detect Aquafit correctly - lap pool used but play pool open", () => {
      // 7:15 PM on April 30 (during Aquafit)
      const testTime = createTestDate("2025-04-30", "19:15");

      const lanesResult = findFeatureStatus(events, testTime, "lanes");
      expect(lanesResult.isActive).toBe(false); // Lanes not available during Aquafit

      const kidsResult = findFeatureStatus(events, testTime, "kids");
      expect(kidsResult.isActive).toBe(true); // Play pool should be open during Aquafit
    });

    test("should detect Lessons & Lanes without play pool correctly", () => {
      // 5:00 PM on April 30 (during Lessons & Lanes without play pool)
      const testTime = createTestDate("2025-04-30", "17:00");

      const lanesResult = findFeatureStatus(events, testTime, "lanes");
      expect(lanesResult.isActive).toBe(true); // Lanes available

      const kidsResult = findFeatureStatus(events, testTime, "kids");
      expect(kidsResult.isActive).toBe(false); // No play pool during this Lessons & Lanes
    });

    test("should detect Lessons & Lanes with play pool correctly", () => {
      // 1:15 PM on May 2 (during Lessons & Lanes with play pool)
      const testTime = createTestDate("2025-05-02", "13:15");

      const lanesResult = findFeatureStatus(events, testTime, "lanes");
      expect(lanesResult.isActive).toBe(true); // Lanes available

      const kidsResult = findFeatureStatus(events, testTime, "kids");
      expect(kidsResult.isActive).toBe(true); // Play pool open during this Lessons & Lanes
    });
  });

  // Continuous availability and upcoming events
  describe("Continuous availability and upcoming events", () => {
    test("should detect consecutive recreational swims as one continuous period", () => {
      // 1:00 PM on May 3 (during Recreational Swim before Public Swim - No Lanes)
      const testTime = createTestDate("2025-05-03", "13:30");
      const result = findFeatureStatus(events, testTime, "lanes");

      expect(result.isActive).toBe(true);
      expect(result.endTime).toEqual(new Date("2025-05-03T14:30:00.000")); // Until Public Swim starts
    });

    test("should detect upcoming regular event correctly", () => {
      // 11:30 AM on April 29 (after Elderfit, before next Recreational Swim)
      const testTime = createTestDate("2025-04-29", "10:50");

      const lanesResult = findFeatureStatus(events, testTime, "lanes");
      expect(lanesResult.isActive).toBe(false);
      expect(lanesResult.inGap).toBe(true);
      expect(lanesResult.nextStartTime).toEqual(
        new Date("2025-04-29T11:00:00.000"),
      );
    });

    test("should detect upcoming restricted event correctly", () => {
      // 1:30 PM on April 30 (before Senior Swim)
      const testTime = createTestDate("2025-04-30", "13:30");

      const result = findFeatureStatus(events, testTime, "lanes");
      expect(result.isActive).toBe(true); // Currently active recreational swim
      // Should only show time until the current event ends, not include restricted event
      expect(result.endTime).toEqual(new Date("2025-04-30T14:00:00.000"));
    });
  });
});
