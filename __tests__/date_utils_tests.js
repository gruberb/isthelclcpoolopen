/**
 * Unit tests for dateUtils functions
 */

import {
  convertToLocalTime,
  formatTime,
  formatTimeRemaining,
  formatDate,
} from "../src/utils/dateUtils.js";

describe("Date Utils Tests", () => {
  describe("convertToLocalTime", () => {
    test("should convert a date string to a Date object", () => {
      const atlanticTime = "2025-04-29T10:00:00.000";
      const result = convertToLocalTime(atlanticTime);

      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(3); // April is 3 (zero-indexed)
    });

    test("should return null for invalid date input", () => {
      // Temporarily capture console.error
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const invalidDate = "not-a-date";
      const result = convertToLocalTime(invalidDate);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe("formatTime", () => {
    test("should format time in a human-readable format", () => {
      const testDate = new Date(2025, 3, 29, 14, 30, 0);
      const result = formatTime(testDate);

      // Accept either format based on locale settings
      expect(["2:30 PM", "2:30 p.m."]).toContain(result);
    });

    test("should handle midnight correctly", () => {
      const testDate = new Date(2025, 3, 29, 0, 0, 0);
      const result = formatTime(testDate);

      // Accept either format based on locale settings
      expect(["12:00 AM", "12:00 a.m."]).toContain(result);
    });

    test("should handle noon correctly", () => {
      const testDate = new Date(2025, 3, 29, 12, 0, 0);
      const result = formatTime(testDate);

      // Accept either format based on locale settings
      expect(["12:00 PM", "12:00 p.m."]).toContain(result);
    });

    test("should return empty string for null input", () => {
      const result = formatTime(null);

      expect(result).toBe("");
    });
  });

  describe("formatTimeRemaining", () => {
    let originalDate;

    beforeEach(() => {
      // Store the original Date constructor
      originalDate = global.Date;

      // Mock the Date constructor to return a fixed time when called without args
      const mockDate = jest.fn(
        () => new originalDate("2025-04-29T15:30:00.000Z"),
      );
      mockDate.UTC = originalDate.UTC;
      mockDate.parse = originalDate.parse;
      mockDate.now = jest.fn(() =>
        new originalDate("2025-04-29T15:30:00.000Z").getTime(),
      );

      // This allows "new Date()" to use our mock, but "new Date(someArg)" to use the original
      global.Date = function (...args) {
        if (args.length === 0) {
          return mockDate();
        }
        return new originalDate(...args);
      };

      // Copy static methods from originalDate to our mockDate constructor function
      Object.setPrototypeOf(global.Date, originalDate);
      global.Date.now = mockDate.now;
    });

    afterEach(() => {
      // Restore the original Date constructor
      global.Date = originalDate;
    });

    test("should format time remaining in hours and minutes", () => {
      // End time 2 hours and 15 minutes from mock now
      const endTime = new Date("2025-04-29T17:45:00.000Z");

      const result = formatTimeRemaining(endTime);

      expect(result).toBe("2h 15m remaining");
    });

    test("should format time remaining in minutes only when less than an hour", () => {
      // End time 45 minutes from mock now
      const endTime = new Date("2025-04-29T16:15:00.000Z");

      const result = formatTimeRemaining(endTime);

      expect(result).toBe("45m remaining");
    });

    test("should handle past end times", () => {
      // End time in the past from mock now
      const endTime = new Date("2025-04-29T15:00:00.000Z");

      const result = formatTimeRemaining(endTime);

      expect(result).toBe("Ended");
    });

    test("should return 'Unknown' for null input", () => {
      const result = formatTimeRemaining(null);

      expect(result).toBe("Unknown");
    });
  });

  describe("formatDate", () => {
    test("should format date in a standard format", () => {
      const testDate = new Date(2025, 3, 29);
      const result = formatDate(testDate);

      // Don't test the exact day of week since it depends on locale
      expect(result).toContain("April 29");
      expect(result).toContain("2025");
    });

    test("should return empty string for null input", () => {
      const result = formatDate(null);

      expect(result).toBe("");
    });
  });
});
