import React, { useMemo, useState } from "react";
import Shell, { ErrorNotice, useScheduleView } from "../components/common/Shell";
import StatusCard from "../components/common/StatusCard";
import WeekChart from "../components/common/WeekChart";
import Loading from "../components/common/Loading";
import { useLibrariesData } from "../hooks/useLibrariesData";
import { CONSTANTS } from "../utils/constants";
import { formatMinutes } from "../utils/dateUtils";
import { facilityNow } from "../utils/timezone";
import { dayLabel, scheduleDays } from "../utils/schedule";

const TITLE = "South Shore Libraries";
const OPEN_FILL = "#15803d";

const displayName = (library) => CONSTANTS.LIBRARY_DISPLAY_NAMES[library.name] || library.name;

function statusDetail(status) {
  if (status.isOpen) return `${formatMinutes(status.timeRemaining)} left`;
  if (status.minutesUntilOpening) return `Opens in ${formatMinutes(status.minutesUntilOpening)}`;
  return "Closed today";
}

function atClock(date, clock) {
  const [h, m] = clock.split(":").map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
}

function clockLabel(clock) {
  const [h, m] = clock.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "a" : "p"}`;
}

function Schedule({ libraries, now }) {
  const [key, setKey] = useState(Object.keys(libraries)[0]);
  const library = libraries[key];

  // Hours repeat weekly, so the chart is the next seven days of the weekday table.
  const chartDays = useMemo(
    () =>
      scheduleDays([], now).map((day) => {
        const hours = library.hours[day.date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()];
        const open = hours?.open && hours?.close;
        return {
          key: day.key,
          label: dayLabel(day.date, now),
          summary: open ? `${clockLabel(hours.open)}–${clockLabel(hours.close)}` : "Closed",
          segments: open
            ? [{ key: "open", start: atClock(day.date, hours.open), end: atClock(day.date, hours.close), fill: OPEN_FILL }]
            : [],
        };
      }),
    [library, now],
  );

  return (
    <WeekChart
      controls={
        <select
          aria-label="Library"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="border-2 border-brutal-black shadow-brutal-sm bg-white font-display font-bold uppercase tracking-wider pl-3 py-1"
        >
          {Object.entries(libraries).map(([k, lib]) => (
            <option key={k} value={k}>
              {displayName(lib)}
            </option>
          ))}
        </select>
      }
      days={chartDays}
      now={now}
      selected={0}
      summaryLabel="Hours"
      footer={
        <p className="px-3 py-3 border-t border-black/15 font-display text-sm text-brutal-muted">
          {library.name}, {library.location} ·{" "}
          <a href={`tel:${library.phone}`} className="underline hover:text-brutal-blue">
            {library.phone}
          </a>
        </p>
      }
    />
  );
}

function Libraries() {
  const { libraries, loading, error, isLibraryOpen } = useLibrariesData();
  const showSchedule = useScheduleView();
  const now = useMemo(() => facilityNow(), []);

  if (loading) return <Shell title={TITLE}><Loading /></Shell>;
  if (error) return <Shell title={TITLE}><ErrorNotice error={error} /></Shell>;

  return (
    <Shell title={TITLE}>
      {showSchedule ? (
        <Schedule libraries={libraries} now={now} />
      ) : (
        <div className="flex-1 grid grid-rows-4 md:grid-rows-2 md:grid-cols-2 gap-5 md:gap-8">
          {Object.entries(libraries).map(([k, library]) => {
            const status = isLibraryOpen(k);
            return (
              <StatusCard key={k} size="md" title={displayName(library)} open={status.isOpen} detail={statusDetail(status)} />
            );
          })}
        </div>
      )}
    </Shell>
  );
}

export default Libraries;
