import React, { useMemo, useState } from "react";
import Shell, { ErrorNotice, useScheduleView } from "../components/common/Shell";
import StatusCard from "../components/common/StatusCard";
import WeekChart from "../components/common/WeekChart";
import DayList from "../components/common/DayList";
import Loading from "../components/common/Loading";
import { useSkatingData } from "../hooks/useSkatingData";
import { facilityNow } from "../utils/timezone";
import { dayLabel, hoursLabel, scheduleDays, sessionStatus } from "../utils/schedule";

// One status box and one chart colour per series. A series without `match` takes every title
// no other series claims, so a new session name shows up without a code change.
const SKATING_SERIES = [
  { id: "public", label: "Public skate", short: "Public", fill: "#2563eb", ink: "#fff" },
  { id: "adult", label: "Adult skate", short: "Adult", fill: "#ea580c", ink: "#000", match: /adult/i },
];

function seriesOf(series, title) {
  return series.find((s) => s.match?.test(title)) ?? series.find((s) => !s.match);
}

function Schedule({ days, series, now }) {
  const [selected, setSelected] = useState(0);
  const multi = series.length > 1;

  const chartDays = days.map((day) => ({
    key: day.key,
    label: dayLabel(day.date, now),
    summary: hoursLabel(day.sessions.reduce((sum, s) => sum + (s.end - s.start) / 60000, 0)),
    segments: day.sessions.map((s) => ({ key: s.key, start: s.start, end: s.end, fill: s.series.fill })),
  }));

  return (
    <>
      <WeekChart
        days={chartDays}
        now={now}
        selected={selected}
        onSelect={setSelected}
        summaryLabel="Total"
        legend={multi ? series.map((s) => ({ label: s.label, fill: s.fill })) : null}
      />
      <DayList
        days={days}
        selected={selected}
        onSelect={setSelected}
        now={now}
        renderAside={
          multi
            ? (s) => (
                <span className="brutal-badge text-[10px]" style={{ background: s.series.fill, color: s.series.ink }}>
                  {s.series.short}
                </span>
              )
            : undefined
        }
      />
    </>
  );
}

/** Ice schedule page; Hockey reuses it with its own data file and series. */
function Skating({ title = "LCLC Skating", dataFile = "skating", series = SKATING_SERIES }) {
  const { data, loading, error } = useSkatingData(dataFile);
  const showSchedule = useScheduleView();
  const now = useMemo(() => facilityNow(), []);

  const sessions = useMemo(
    () =>
      data
        .map((event) => ({
          key: `${event.id}-${event.start.getTime()}`,
          title: event.title,
          start: event.start,
          end: event.end,
          series: seriesOf(series, event.title),
        }))
        .filter((s) => s.series),
    [data, series],
  );
  const days = useMemo(() => scheduleDays(sessions, now), [sessions, now]);

  if (loading) return <Shell title={title}><Loading /></Shell>;
  if (error) return <Shell title={title}><ErrorNotice error={error} /></Shell>;

  if (showSchedule) {
    return (
      <Shell title={title}>
        <Schedule days={days} series={series} now={now} />
      </Shell>
    );
  }

  return (
    <Shell title={title}>
      <div className={`flex-1 grid gap-5 md:gap-8 ${series.length > 1 ? "grid-rows-2" : "grid-rows-1"}`}>
        {series.map((s) => {
          const status = sessionStatus(sessions.filter((x) => x.series === s), now);
          const detail = s.showTitle && status.session ? `${status.session.title} · ${status.detail}` : status.detail;
          return <StatusCard key={s.id} title={s.label} open={status.open} detail={detail} />;
        })}
      </div>
    </Shell>
  );
}

export default Skating;
