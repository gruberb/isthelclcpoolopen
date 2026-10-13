import React from "react";

// `striped` is the second stripe colour, or falsy for a solid bar.
export function barStyle(fill, striped) {
  return {
    background: striped ? `repeating-linear-gradient(135deg, ${fill} 0 4px, ${striped} 4px 7px)` : fill,
  };
}

function shortHour(h) {
  return `${h % 12 || 12}${h < 12 ? "a" : "p"}`;
}

const COLUMNS = "grid grid-cols-[3.5rem_1fr_3.5rem] gap-2";

/**
 * One row per day on a shared hour axis. `days[0]` is today and gets the now marker.
 * Each day: { key, label, summary, segments: [{ key, start, end, fill, striped }] }.
 * Rows are buttons when `onSelect` is given, so the chart can double as a day picker.
 */
function WeekChart({ title = "This week", controls, days, now, selected, onSelect, summaryLabel, legend, footer }) {
  // One scale for every row so the same hour lines up down the chart.
  const segments = days.flatMap((d) => d.segments);
  const firstHour = segments.length ? Math.min(...segments.map((s) => s.start.getHours())) : 6;
  const lastHour = segments.length
    ? Math.max(...segments.map((s) => s.end.getHours() + (s.end.getMinutes() > 0 ? 1 : 0)))
    : 22;

  const span = (lastHour - firstHour) * 60;
  const pct = (date) => {
    const minutes = (date.getHours() - firstHour) * 60 + date.getMinutes();
    return Math.min(100, Math.max(0, (minutes / span) * 100));
  };
  const ticks = [];
  for (let h = Math.ceil(firstHour / 3) * 3; h < lastHour; h += 3) ticks.push(h);
  const tickLeft = (h) => `${((h - firstHour) / (lastHour - firstHour)) * 100}%`;

  const Row = onSelect ? "button" : "div";

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-2 min-h-[2.25rem]">
        <h2 className="font-display font-bold text-sm uppercase tracking-wider">{title}</h2>
        {controls}
      </div>

      <div className="border-2 border-brutal-black shadow-brutal bg-white">
        <div className={`${COLUMNS} pl-3 pr-3 pt-2`} aria-hidden="true">
          <span />
          <div className="relative h-4">
            {ticks.map((h) => (
              <span
                key={h}
                className="absolute -translate-x-1/2 font-display text-[10px] font-bold text-brutal-muted"
                style={{ left: tickLeft(h) }}
              >
                {shortHour(h)}
              </span>
            ))}
          </div>
          <span className="font-display text-[10px] font-bold uppercase text-right text-brutal-muted">
            {summaryLabel}
          </span>
        </div>

        <ul className="divide-y divide-black/15">
          {days.map((day, i) => {
            const isSelected = selected === i;
            return (
              <li key={day.key}>
                <Row
                  {...(onSelect ? { onClick: () => onSelect(i), "aria-pressed": isSelected } : {})}
                  className={`w-full ${COLUMNS} items-center pl-2 pr-3 py-2.5 text-left border-l-4 ${
                    onSelect ? "hover:bg-brutal-cream" : ""
                  } ${isSelected ? "bg-brutal-cream border-l-brutal-black" : "border-l-transparent"}`}
                >
                  <span className="font-display font-bold text-xs uppercase tracking-wider">{day.label}</span>
                  <span className="relative h-5 border border-brutal-black bg-white overflow-hidden">
                    {ticks.map((h) => (
                      <span key={h} className="absolute inset-y-0 w-px bg-black/15" style={{ left: tickLeft(h) }} />
                    ))}
                    {day.segments.map((s) => (
                      <span
                        key={s.key}
                        className="absolute inset-y-0"
                        style={{
                          ...barStyle(s.fill, s.striped),
                          left: `${pct(s.start)}%`,
                          width: `${pct(s.end) - pct(s.start)}%`,
                        }}
                      />
                    ))}
                    {i === 0 && (
                      <>
                        <span className="absolute inset-y-0 left-0 bg-white/70" style={{ width: `${pct(now)}%` }} />
                        <span className="absolute -inset-y-px w-0.5 bg-black" style={{ left: `${pct(now)}%` }} />
                      </>
                    )}
                  </span>
                  <span className="font-display font-bold text-xs tabular-nums text-right whitespace-nowrap">
                    {day.summary}
                  </span>
                </Row>
              </li>
            );
          })}
        </ul>
        {footer}
      </div>

      {legend && legend.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-3 font-display text-xs uppercase tracking-wide text-brutal-muted">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 border border-brutal-black" style={barStyle(item.fill, item.striped)} />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default WeekChart;
