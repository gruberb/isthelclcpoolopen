const FACILITY_ID = "3121e68a-d46d-4865-b4ce-fc085f688529";
const API_URL = `https://www.connect2rec.com/Facility/GetScheduleCustomAppointments?selectedId=${FACILITY_ID}`;
const CORS_PROXY = "https://corsproxy.io/?";

// Keywords for identifying swimming events
const SWIM_KEYWORDS = [
  "swim",
  "aqua",
  "pool",
  "water",
  "lap",
  "public swim",
  "family swim",
  "lane swim",
  "recreational swim",
  "members swim",
];

// Time intervals
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const TIME_UPDATE_INTERVAL = 60 * 1000; // 1 minute

// Date range
const DATE_RANGE_DAYS = 8; // Today + 7 days
