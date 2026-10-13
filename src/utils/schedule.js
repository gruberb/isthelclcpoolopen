import { formatMinutes, formatTime } from "./dateUtils";

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Rounded rather than floored so the 23h and 25h days around DST still count as one day.
export function dayOffset(date, now) {
  return Math.round((startOfDay(date) - startOfDay(now)) / 86400000);
}

export function dayLabel(date, now, long = false) {
  const offset = dayOffset(date, now);
  if (offset === 0) return "Today";
  if (offset === 1) return long ? "Tomorrow" : "Tmrw";
  if (long) return date.toLocaleDateString("en-US", { weekday: "long" });
  return `${date.toLocaleDateString("en-US", { weekday: "short" })} ${date.getDate()}`;
}

export function hoursLabel(minutes) {
  return minutes ? `${Math.round(minutes / 30) / 2}h` : "–";
}

/**
 * Buckets sessions ({ start, end } Dates, facility wall clock) into days starting today.
 * Spans through the last scheduled day, at least `minDays` so a sparse feed still shows the
 * week ahead, and at most `maxDays` so the week chart stays about one phone screen tall.
 */
export function scheduleDays(sessions, now, { minDays = 7, maxDays = 14 } = {}) {
  const last = sessions.reduce((max, s) => Math.max(max, dayOffset(s.start, now)), 0);
  const count = Math.min(maxDays, Math.max(minDays, last + 1));

  const days = Array.from({ length: count }, (_, i) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() + i);
    return { date, key: date.toDateString(), sessions: [] };
  });
  for (const session of sessions) {
    const i = dayOffset(session.start, now);
    if (i >= 0 && i < count) days[i].sessions.push(session);
  }
  for (const day of days) day.sessions.sort((a, b) => a.start - b.start);
  return days;
}

function whenLabel(date, now) {
  const offset = dayOffset(date, now);
  if (offset === 0) return formatTime(date);
  return `${dayLabel(date, now, true)} ${formatTime(date)}`;
}

/** Whether a session is running now, and the line under the YES/NO that explains it. */
export function sessionStatus(sessions, now) {
  const sorted = [...sessions].sort((a, b) => a.start - b.start);
  const current = sorted.find((s) => s.start <= now && s.end > now);
  if (current) {
    return { open: true, session: current, detail: `${formatMinutes(Math.floor((current.end - now) / 60000))} left` };
  }
  const next = sorted.find((s) => s.start > now);
  if (!next) return { open: false, detail: "None scheduled" };
  return { open: false, session: next, detail: `Next ${whenLabel(next.start, now)}` };
}
