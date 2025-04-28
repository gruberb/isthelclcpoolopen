// Set up document mock if needed
if (!global.document) {
  global.document = {};
}

// Mock DOM elements used in tests
global.document.getElementById = jest.fn().mockImplementation((id) => {
  return {
    textContent: "",
    className: "",
  };
});

// Create a stub for EventTarget methods
class EventTarget {
  addEventListener() {}
  removeEventListener() {}
}

// Extend document objects
document.createElement = () => {
  return {
    style: {},
    setAttribute: jest.fn(),
    appendChild: jest.fn(),
  };
};

// Mock window.fs
global.window = {
  ...global.window,
  fs: {
    readFile: jest.fn().mockResolvedValue("mocked file content"),
  },
};

// Import real constants
jest.mock(
  "./constants",
  () => ({
    DOM_IDS: {
      LANES_STATUS: "lanes-status",
      KIDS_STATUS: "kids-status",
      LANES_TIME: "lanes-time",
      KIDS_TIME: "kids-time",
      LAST_UPDATED: "last-updated",
    },
    CSS_CLASSES: {
      STATUS_INDICATOR: "status-indicator",
      OPEN: "open",
      CLOSED: "closed",
      RESTRICTED: "restricted",
      MEMBERS: "members-only",
    },
  }),
  { virtual: true },
);

// Mock utility functions
jest.mock(
  "./utils/dateUtils",
  () => ({
    formatTimeRemaining: jest.fn().mockImplementation(() => "30m remaining"),
    formatTime: jest.fn().mockImplementation(() => "7:30 PM"),
  }),
  { virtual: true },
);

// Mock appState with updated interface
jest.mock(
  "./state/appState",
  () => ({
    allEvents: [],
    lastUpdated: new Date(),
    selectedDate: new Date(),
    subscribe: jest.fn(),
    setEvents: jest.fn(),
    setSelectedDate: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
  }),
  { virtual: true },
);

// Mock analyzeEvent in tests that need it
// (let individual tests handle this as needed)
