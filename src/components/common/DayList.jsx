import React, { useState } from "react";
import { formatTime } from "../../utils/dateUtils";
import { dayLabel } from "../../utils/schedule";

function StepButton({ label, rotate, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="brutal-btn w-10 h-10 flex items-center justify-center bg-white enabled:hover:bg-brutal-cream disabled:opacity-30 disabled:shadow-none disabled:cursor-default"
    >
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className={rotate}>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      </svg>
    </button>
  );
}

function SessionRow({ session, now, aside }) {
  const isNow = session.start <= now && session.end > now;
  const isPast = session.end <= now;

  return (
    <li
      className={`flex items-center gap-3 px-3 py-3 border-l-4 ${
        isNow ? "border-l-brutal-black bg-brutal-yellow/15" : "border-l-transparent"
      } ${isPast ? "opacity-60" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 font-display text-sm tabular-nums text-brutal-muted">
          {formatTime(session.start)} – {formatTime(session.end)}
          {isNow && <span className="brutal-badge bg-brutal-yellow text-black">Now</span>}
        </div>
        <div className="font-display font-bold leading-snug mt-0.5">{session.title}</div>
        {session.badge && (
          <span className="brutal-badge mt-1.5 text-white" style={{ background: session.badge.color }}>
            {session.badge.label}
          </span>
        )}
      </div>
      {aside && <div className="flex flex-col gap-1 shrink-0">{aside}</div>}
    </li>
  );
}

/**
 * The selected day's sessions with previous/next stepping. Sessions: { key, title, start,
 * end, badge?: { label, color } }. Shares `selected` with the WeekChart above it so both always agree.
 */
function DayList({ days, selected, onSelect, now, renderAside }) {
  const [showEarlier, setShowEarlier] = useState(false);
  const day = days[selected];
  const isToday = selected === 0;
  const earlier = isToday ? day.sessions.filter((s) => s.end <= now) : [];
  const visible = isToday && !showEarlier ? day.sessions.filter((s) => s.end > now) : day.sessions;

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3">
        <StepButton label="Previous day" rotate="rotate-90" disabled={selected === 0} onClick={() => onSelect(selected - 1)} />
        <h2 className="text-center" aria-live="polite">
          <span className="block font-display font-bold uppercase tracking-wider">{dayLabel(day.date, now, true)}</span>
          <span className="block font-display text-sm text-brutal-muted">
            {day.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </span>
        </h2>
        <StepButton
          label="Next day"
          rotate="-rotate-90"
          disabled={selected === days.length - 1}
          onClick={() => onSelect(selected + 1)}
        />
      </div>
      <div className="border-2 border-brutal-black shadow-brutal bg-white">
        {earlier.length > 0 && (
          <button
            onClick={() => setShowEarlier((v) => !v)}
            aria-expanded={showEarlier}
            className="w-full px-3 py-2 border-b border-black/15 font-display font-bold text-xs uppercase tracking-wider text-left text-brutal-muted hover:bg-brutal-cream"
          >
            {showEarlier ? "Hide earlier sessions" : `Show ${earlier.length} earlier sessions`}
          </button>
        )}
        {visible.length === 0 ? (
          <p className="p-6 text-center font-display uppercase tracking-wide text-brutal-muted">
            {earlier.length > 0 ? "No more sessions today" : "No sessions"}
          </p>
        ) : (
          <ul className="divide-y divide-black/15">
            {visible.map((s) => (
              <SessionRow key={s.key} session={s} now={now} aside={renderAside?.(s)} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default DayList;
