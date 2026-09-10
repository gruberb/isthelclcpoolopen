import React from "react";
import Footer from "./Footer";
import {
  FACILITY_CITY,
  facilityZoneAbbreviation,
  formatOffset,
  viewerOffsetMinutes,
  viewerTimeZone,
} from "../../utils/timezone";

// Every schedule on the site is rendered in facility time. Say so, but only to viewers whose
// clock disagrees with it, so locals never see chrome they do not need. The offset is the
// load-bearing part and stays visible at every width; the zone id is supplementary.
function TimeZoneNotice() {
  const offset = viewerOffsetMinutes();
  if (offset === 0) return null;

  const zone = viewerTimeZone();
  const signed = formatOffset(offset);

  return (
    <span
      className="brutal-badge bg-brutal-cream text-brutal-black mt-2"
      title={`Schedules are shown in ${FACILITY_CITY} time (${facilityZoneAbbreviation()}). Your device timezone is ${zone}, ${signed}.`}
    >
      {FACILITY_CITY} time &middot; you&rsquo;re {signed}
      {zone && <span className="hidden sm:inline">&nbsp;({zone})</span>}
    </span>
  );
}

function Layout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-brutal-white">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-6">
        {title && (
          <div className="mb-4 md:mb-6 text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-brutal-black uppercase tracking-wider mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-brutal-black/60 uppercase tracking-wide">
                {subtitle}
              </p>
            )}
            <TimeZoneNotice />
          </div>
        )}
        <div className="border-b-3 border-brutal-blue mb-4 md:mb-6" />
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
