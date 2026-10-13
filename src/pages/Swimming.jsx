import React, { useMemo, useState } from "react";
import Shell, { ErrorNotice, useScheduleView } from "../components/common/Shell";
import StatusCard from "../components/common/StatusCard";
import WeekChart from "../components/common/WeekChart";
import DayList from "../components/common/DayList";
import Loading from "../components/common/Loading";
import { useSwimmingData } from "../hooks/useSwimmingData";
import { analyzeEvent, findFeatureStatus } from "../utils/eventParser";
import { ACCESS_TYPES, ACCESS_TYPE_LABELS } from "../utils/constants";
import { formatMinutes, formatTime } from "../utils/dateUtils";
import { facilityNow } from "../utils/timezone";
import { dayLabel, hoursLabel, scheduleDays } from "../utils/schedule";

const TITLE = "Is the LCLC pool open?";

// Lanes and kids each own one colour wherever they appear. Orange carries black text:
// white on it is under 4.5:1.
const FEATURES = {
  lanes: { label: "Lanes", fill: "#2563eb", ink: "#fff" },
  kids: { label: "Kids", fill: "#ea580c", ink: "#000" },
};

// Restrictions are text badges and chart stripes rather than more colours, which would
// collide with the two feature colours.
const RESTRICTION_BY_TYPE = {
  [ACCESS_TYPE_LABELS[ACCESS_TYPES.MEMBERS]]: "Members only",
  [ACCESS_TYPE_LABELS[ACCESS_TYPES.WOMENS]]: "Women only",
  [ACCESS_TYPE_LABELS[ACCESS_TYPES.SENIORS]]: "Seniors 60+",
  [ACCESS_TYPE_LABELS[ACCESS_TYPES.SENSORY]]: "Sensory",
  [ACCESS_TYPE_LABELS[ACCESS_TYPES.CLOSED]]: "Closed to public",
};

function statusDetail(status, now) {
  const restriction = RESTRICTION_BY_TYPE[status.restrictionType];
  if (status.isActive) {
    const left = `${formatMinutes(Math.floor((status.endTime - now) / 60000))} left`;
    return restriction ? `${restriction} · ${left}` : left;
  }
  if (status.inGap) {
    const opens = `Opens ${formatTime(status.nextStartTime)}`;
    return restriction ? `${opens} · ${restriction}` : opens;
  }
  return "Done for today";
}

function Availability({ feature, open }) {
  const f = FEATURES[feature];
  return (
    <span
      className={`w-14 justify-center brutal-badge text-[10px] ${
        open ? "" : "bg-white text-brutal-faint border-brutal-faint line-through"
      }`}
      style={open ? { background: f.fill, color: f.ink } : undefined}
    >
      {f.label}
      <span className="sr-only">{open ? " open" : " closed"}</span>
    </span>
  );
}

function FeatureToggle({ value, onChange }) {
  return (
    <div className="flex border-2 border-brutal-black shadow-brutal-sm" role="group" aria-label="Show availability for">
      {Object.entries(FEATURES).map(([id, f]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={`px-3 py-1.5 font-display font-bold text-xs uppercase tracking-wider ${
            value === id ? "" : "bg-white hover:bg-brutal-cream"
          }`}
          style={value === id ? { background: f.fill, color: f.ink } : undefined}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

function Schedule({ data, now }) {
  const [feature, setFeature] = useState("lanes");
  const [selected, setSelected] = useState(0);

  const days = useMemo(() => {
    const sessions = data.map((event) => {
      const analysis = analyzeEvent(event);
      const start = new Date(event.start);
      return {
        key: `${event.id}-${start.getTime()}`,
        title: event.title,
        start,
        end: new Date(event.end),
        analysis,
        badge: RESTRICTION_BY_TYPE[analysis.type],
      };
    });
    return scheduleDays(sessions, now);
  }, [data, now]);

  const { fill } = FEATURES[feature];
  let hasRestricted = false;
  const chartDays = days.map((day) => {
    const open = day.sessions.filter((s) => s.analysis[feature]);
    hasRestricted ||= open.some((s) => s.badge);
    return {
      key: day.key,
      label: dayLabel(day.date, now),
      summary: hoursLabel(open.reduce((sum, s) => sum + (s.end - s.start) / 60000, 0)),
      segments: open.map((s) => ({ key: s.key, start: s.start, end: s.end, fill, striped: Boolean(s.badge) })),
    };
  });

  return (
    <>
      <WeekChart
        controls={<FeatureToggle value={feature} onChange={setFeature} />}
        days={chartDays}
        now={now}
        selected={selected}
        onSelect={setSelected}
        summaryLabel="Open"
        legend={[
          { label: "Open to all", fill },
          ...(hasRestricted ? [{ label: "Members, women, seniors or sensory only", fill, striped: true }] : []),
        ]}
      />
      <DayList
        days={days}
        selected={selected}
        onSelect={setSelected}
        now={now}
        renderAside={(s) => (
          <>
            <Availability feature="lanes" open={s.analysis.lanes} />
            <Availability feature="kids" open={s.analysis.kids} />
          </>
        )}
      />
    </>
  );
}

function Swimming() {
  const { data, loading, error } = useSwimmingData();
  const showSchedule = useScheduleView();
  const now = useMemo(() => facilityNow(), []);

  if (loading) return <Shell title={TITLE}><Loading /></Shell>;
  if (error) return <Shell title={TITLE}><ErrorNotice error={error} /></Shell>;

  return (
    <Shell title={TITLE}>
      {showSchedule ? (
        <Schedule data={data} now={now} />
      ) : (
        <div className="flex-1 grid grid-rows-2 gap-5 md:gap-8">
          <StatusCard title="Lanes" {...cardProps(findFeatureStatus(data, now, "lanes"), now)} />
          <StatusCard title="Kids pool" {...cardProps(findFeatureStatus(data, now, "kids"), now)} />
        </div>
      )}
    </Shell>
  );
}

function cardProps(status, now) {
  return { open: status.isActive, detail: statusDetail(status, now) };
}

export default Swimming;
