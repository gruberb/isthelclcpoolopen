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
// clock disagrees with it, so locals never see chrome they do not need. This sits beside the
// wordmark, so it only carries the delta: the wordmark already supplies the place. The full
// sentence, including the viewer's zone id, stays in the title attribute.
function TimeZoneNotice() {
  const offset = viewerOffsetMinutes();
  if (offset === 0) return null;

  const signed = formatOffset(offset);
  const abbreviation = facilityZoneAbbreviation();
  const explanation = `Schedules are shown in ${FACILITY_CITY} time (${abbreviation}). Your device timezone is ${viewerTimeZone()}, ${signed}.`;

  return (
    <span
      className="brutal-badge bg-brutal-cream text-brutal-black shrink-0"
      title={explanation}
    >
      {abbreviation}&nbsp;{signed}
      {/* title does nothing on touch and is not reliably announced. */}
      <span className="sr-only">. {explanation}</span>
    </span>
  );
}

function Layout({ children, title }) {
  return (
    <div className="min-h-screen bg-brutal-white">
      <div className="max-w-6xl mx-auto px-4 py-2 md:py-6">
        {title && (
          <header className="flex items-baseline justify-between gap-3 border-b-3 border-brutal-blue pb-2 mb-3 md:pb-3 md:mb-5">
            <h1 className="font-display text-lg md:text-3xl font-bold leading-tight text-brutal-black uppercase tracking-wider">
              {title}
            </h1>
            <TimeZoneNotice />
          </header>
        )}
        {/* Footer is fixed and ~80px tall. Cleared here rather than in each view, which
            previously meant nine hardcoded margins, two of them smaller than the footer. */}
        <main className="pb-32 md:pb-24">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default Layout;
