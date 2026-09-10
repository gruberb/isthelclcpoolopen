export const FACILITY_TIME_ZONE = "America/Halifax";
export const FACILITY_CITY = "Halifax";

const facilityFields = new Intl.DateTimeFormat("en-US", {
  timeZone: FACILITY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const facilityZoneName = new Intl.DateTimeFormat("en-US", {
  timeZone: FACILITY_TIME_ZONE,
  timeZoneName: "short",
});

function partsOf(formatter, instant) {
  const fields = {};
  for (const { type, value } of formatter.formatToParts(instant)) {
    fields[type] = value;
  }
  return fields;
}

/**
 * "Now" placed on the same floating timeline as the schedule data.
 *
 * pool.json, skating.json and libraries.json all carry Halifax wall-clock times with no
 * offset, so `new Date(event.start)` resolves them in the viewer's zone. This returns a Date
 * whose viewer-local fields read the Halifax wall clock, which puts it in the same domain:
 * comparisons, getHours(), getDay(), toDateString() and subtraction against schedule dates
 * are then correct regardless of where the viewer is.
 *
 * The epoch value is deliberately not a real instant. Never compare it against a true
 * timestamp such as the `lastUpdated` field in the data files.
 */
export function facilityNow(instant = new Date()) {
  const f = partsOf(facilityFields, instant);
  // Older ICU renders midnight under hour12:false as hour 24 while leaving the date on the
  // same day, so the raw value would reconstruct a day late. Verified against hourCycle h24.
  return new Date(
    Number(f.year),
    Number(f.month) - 1,
    Number(f.day),
    Number(f.hour) % 24,
    Number(f.minute),
    Number(f.second)
  );
}

/**
 * Viewer's wall clock minus the facility's, in minutes. Negative when the viewer is behind
 * Halifax (Toronto is -60). Zero means no adjustment is being applied and the timezone
 * notice should stay hidden.
 */
export function viewerOffsetMinutes(instant = new Date()) {
  return Math.round((instant - facilityNow(instant)) / 60000);
}

/** Current facility zone abbreviation, "AST" or "ADT". */
export function facilityZoneAbbreviation(instant = new Date()) {
  const name = partsOf(facilityZoneName, instant).timeZoneName;
  return name || "AST";
}

/**
 * The viewer's IANA zone id, e.g. "America/Toronto".
 *
 * Deliberately not reduced to a city: browsers canonicalize aliases, so someone in Montreal
 * reports America/Toronto and someone in Kolkata can report Asia/Calcutta. The zone id is the
 * only label that is honest about being a zone rather than a location.
 */
export function viewerTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
}

/** Signed offset for display: "-1h", "+8h", "+5h45m", "+30m" (Newfoundland). */
export function formatOffset(minutes) {
  const sign = minutes < 0 ? "-" : "+";
  const total = Math.abs(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours === 0) return `${sign}${mins}m`;
  return mins === 0 ? `${sign}${hours}h` : `${sign}${hours}h${mins}m`;
}
