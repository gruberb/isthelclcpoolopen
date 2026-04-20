const { rrulestr } = require("rrule");

const API_BASE_URL = "https://www.connect2rec.com/Facility/GetScheduleCustomAppointmentsForDevExtremeScheduler";

function buildApiUrl(facilityId, startDate, endDate) {
  return `${API_BASE_URL}?selectedFacilityId=${facilityId}&start=${formatWindowParam(startDate)}&end=${formatWindowParam(endDate)}`;
}

function formatWindowParam(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}

function parseFloatingDateAsUTC(str) {
  const m = str && str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

function parseExceptionDateAsUTC(str) {
  const m = str && str.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
}

function formatFloatingFromUTC(date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}.000`;
}

function formatRRuleDtstartUTC(date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function expandRecurring(template, windowStartUTC, windowEndUTC) {
  const dtstart = parseFloatingDateAsUTC(template.StartDate);
  const dtend = parseFloatingDateAsUTC(template.EndDate);
  if (!dtstart || !dtend) return [];

  const durationMs = dtend - dtstart;

  const exceptions = new Set();
  if (template.RecurrenceException) {
    for (const ex of String(template.RecurrenceException).split(",")) {
      const exDate = parseExceptionDateAsUTC(ex.trim());
      if (exDate) exceptions.add(exDate.getTime());
    }
  }

  let rule;
  try {
    const ruleStr = `DTSTART:${formatRRuleDtstartUTC(dtstart)}\nRRULE:${template.RecurrenceRule}`;
    rule = rrulestr(ruleStr);
  } catch (err) {
    console.warn(`⚠️  Failed to parse RRULE for "${template.Text}": ${err.message}`);
    return [];
  }

  const occurrences = rule.between(windowStartUTC, windowEndUTC, true);

  return occurrences
    .filter((occ) => !exceptions.has(occ.getTime()))
    .map((occ) => ({
      ...template,
      Id: `${template.Id}__${formatRRuleDtstartUTC(occ)}`,
      StartDate: formatFloatingFromUTC(occ),
      EndDate: formatFloatingFromUTC(new Date(occ.getTime() + durationMs)),
      RecurrenceRule: null,
      RecurrenceException: null,
    }));
}

function toWindowUTC(date, hours = 0, minutes = 0, seconds = 0) {
  return new Date(Date.UTC(
    date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds,
  ));
}

function expandAndFilter(rawEntries, windowStart, windowEnd) {
  const windowStartUTC = toWindowUTC(windowStart, 0, 0, 0);
  const windowEndUTC = toWindowUTC(windowEnd, 23, 59, 0);

  const expanded = [];
  let recurringCount = 0;
  let occurrenceCount = 0;

  for (const item of rawEntries) {
    if (item.RecurrenceRule) {
      recurringCount++;
      const occs = expandRecurring(item, windowStartUTC, windowEndUTC);
      occurrenceCount += occs.length;
      expanded.push(...occs);
    } else {
      expanded.push(item);
    }
  }

  const inWindow = expanded.filter((item) => {
    const start = parseFloatingDateAsUTC(item.StartDate);
    return start && start >= windowStartUTC && start <= windowEndUTC;
  });

  inWindow.sort((a, b) => a.StartDate.localeCompare(b.StartDate));

  return { events: inWindow, recurringCount, occurrenceCount };
}

function toLegacyEvent(item) {
  return {
    id: item.Id,
    title: item.Text,
    start: item.StartDate,
    end: item.EndDate,
    backgroundColor: item.BackgroundColor,
    textColor: item.TextColor,
    allDay: !!item.AllDay,
  };
}

module.exports = {
  API_BASE_URL,
  buildApiUrl,
  expandAndFilter,
  toLegacyEvent,
};
