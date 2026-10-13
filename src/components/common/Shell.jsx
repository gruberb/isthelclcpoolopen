import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  FACILITY_CITY,
  facilityZoneAbbreviation,
  formatOffset,
  viewerOffsetMinutes,
  viewerTimeZone,
} from "../../utils/timezone";

const FACILITIES = [
  { path: "/", label: "Swimming", icon: "/icons/Swimming--Streamline-Flex.png" },
  { path: "/skating", label: "Skating", icon: "/icons/Ice-Skating--Streamline-Flex.png" },
  { path: "/hockey", label: "Hockey", icon: "/icons/Hockey--Streamline-Flex.png" },
  { path: "/libraries", label: "Libraries", icon: "/icons/Open-Book--Streamline-Flex.png" },
];

/**
 * Every page has a status view (the YES/NO boxes) and a schedule view. The view lives in the
 * URL so it survives reload, can be shared, and the back button returns to the boxes.
 */
export function useScheduleView() {
  const [params] = useSearchParams();
  // `tab` is the pre-redesign param. Any tab other than status maps to the schedule so old
  // bookmarks of the Schedule, Family, Lanes and Events tabs still land somewhere sensible.
  const tab = params.get("tab");
  return params.get("view") === "schedule" || (tab !== null && tab !== "status");
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
    </svg>
  );
}

function FacilityMenu() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = FACILITIES.find((f) => f.path === pathname) ?? FACILITIES[0];

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 -ml-3 px-3 py-1.5 border-2 border-transparent hover:border-brutal-black"
      >
        <img src={active.icon} alt="" className="w-6 h-6" />
        <span className="font-display font-bold text-lg uppercase tracking-wider">{active.label}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <Chevron />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Facilities"
          className="absolute left-0 top-full mt-2 w-60 bg-white border-2 border-brutal-black shadow-brutal py-1 z-50"
        >
          {FACILITIES.map((f) => (
            <Link
              key={f.path}
              to={f.path}
              role="menuitem"
              aria-current={f === active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 font-display font-bold text-sm uppercase tracking-wider hover:bg-brutal-cream"
            >
              <img src={f.icon} alt="" className="w-5 h-5" />
              <span className="flex-1">{f.label}</span>
              {f === active && (
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="text-brutal-blue">
                  <path d="M3 8.5l3.5 3.5L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleLink() {
  const { pathname } = useLocation();
  const active = useScheduleView();

  return (
    <Link
      to={active ? pathname : `${pathname}?view=schedule`}
      aria-pressed={active}
      onClick={() => window.plausible?.("Tab Click", { props: { tab: active ? "status" : "schedule" } })}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 font-display font-bold text-xs uppercase tracking-wider ${
        active
          ? "bg-brutal-blue text-white border-brutal-black shadow-brutal-sm"
          : "border-transparent hover:border-brutal-black"
      }`}
    >
      <img src="/icons/Calendar-Schedule--Streamline-Flex.png" alt="" className="w-5 h-5" />
      Schedule
    </Link>
  );
}

// Every schedule is rendered in facility time. Said only to viewers whose clock disagrees,
// and in the footer so the header is identical for everyone.
function TimeZoneNotice() {
  const offset = viewerOffsetMinutes();
  if (offset === 0) return null;

  return (
    <p className="font-display text-xs text-brutal-muted mb-2">
      Times are {FACILITY_CITY} time ({facilityZoneAbbreviation()}). Your device is on{" "}
      {viewerTimeZone()}, {formatOffset(offset)}.
    </p>
  );
}

export function ErrorNotice({ error }) {
  return (
    <div className="border-2 border-brutal-red p-4 font-display uppercase tracking-wide text-brutal-red">
      Error: {error}. Refresh the page to try again.
    </div>
  );
}

// The header is the same on every page and in every state (loading, error, status,
// schedule), so navigation never moves under the user's thumb.
function Shell({ title, children }) {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="sticky top-0 z-20 bg-white border-b-2 border-brutal-black">
        <h1 className="sr-only">{title}</h1>
        <div className="max-w-3xl mx-auto h-14 px-4 flex items-center justify-between">
          <FacilityMenu />
          <ScheduleLink />
        </div>
      </header>
      <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 py-4 md:py-8 space-y-8">
        {children}
      </main>
      <footer className="px-4 py-4 text-center">
        <TimeZoneNotice />
        <a
          href="https://bastiangruber.ca"
          target="_blank"
          rel="noopener noreferrer"
          className="font-display font-bold text-xs uppercase tracking-wider text-brutal-muted hover:text-brutal-blue"
        >
          Made with ❤️ by Bastian
        </a>
      </footer>
    </div>
  );
}

export default Shell;
