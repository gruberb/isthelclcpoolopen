# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-10

### Changed

- Rebuilt the top band. It previously spent 283px on the Status tab and 505px on the Schedule
  tab of a ~667px phone viewport before any content, mostly on repetition: the h1 wrapped to
  two lines on every page, the subtitle restated the title, the five tabs wrapped to a second
  row, and the selected date was stated three times. The header is now one row - wordmark left,
  timezone chip right, with the blue rule as its own bottom border - and measures 37px.
  Content now starts at 125px on every route.
- Titles dropped the redundant "Dashboard" and are declared once per page instead of repeated
  across the loading, error and success branches. The subtitles are gone.
- Tab labels shortened to Status / Schedule / Family / Lanes / Events, in a single row that
  fits a 390px phone without wrapping. Tab ids are unchanged, so existing `?tab=` links and
  Plausible event props still work.
- The Today/Tomorrow buttons and the 8-day dropdown became one scrollable row of day chips.
  The two controls were bound to the same state and could contradict each other on screen -
  the dropdown read "TODAY" while the Today button beside it was also highlighted.
- Removed the schedule card header, which restated the date the day chips now sit directly
  above, and the "When can I go skating" line, redundant with the wordmark.
- Footer nav drops the pipe separators; the icons already separate the items, and the row now
  fits one line on a phone instead of wrapping to two, reclaiming ~36px.

### Fixed

- Content was clipped by the fixed footer on the two Status tabs, which are the default
  landing views. Nine components each hardcoded their own clearance and two were smaller than
  the footer; `<main>` now owns it. The footer is ~115px on phones where its links wrap, so
  the previous `mb-24` was short even where it was applied.
- Day labels rendered as "12 Sat". The en-US pattern for weekday plus day-of-month is `d E`,
  so the parts have to be composed rather than requested together.
- The library picker triggered an iOS viewport zoom on focus, and its dropdown arrow
  overlapped long names: `.text-sm` and `.px-4` were outbidding the `select` base rules for
  `font-size: 16px` and `padding-right`.
- Keyboard focus was invisible on every button. `button:focus { outline: none }` removed the
  default ring without replacing it. Replaced with a `:focus-visible` outline, which also
  survives `.brutal-btn`'s box-shadow.
- Tap targets on the tabs and day chips raised to 44px.
- The day row was built in an effect, so the schedule card painted first and then jumped.
- A deep link such as `?tab=special` could land with its tab scrolled out of view and nothing
  appearing selected.

### Removed

- The dead `lastUpdated` prop, passed by all three pages and never rendered, along with the
  now-unused hook destructures, and the empty 0-byte `Header.jsx`.

## [1.1.0] - 2026-09-10

### Fixed

- Every "is it open now" answer was computed against the viewer's clock instead of the
  facility's. The scrapers emit floating timestamps in Halifax wall-clock time
  (`"2026-09-08T10:30:00.000"`, no offset), so `new Date(event.start)` resolves them in the
  browser's zone. Rendered times were therefore correct, but `new Date()` for "now" was not,
  putting it in a different domain from everything it was compared against. Viewing from
  Toronto highlighted the wrong `NOW` slot, reported "remaining" times off by the full offset,
  answered library open/closed against the wrong hour, and picked the wrong calendar day.
  All "now" reads now go through `facilityNow()` in `src/utils/timezone.js`, which places the
  current instant on the same floating timeline as the schedule data.
- `ScheduleDisplay` derived "Tomorrow" from `Date.now() + 86400000`, which is 23 or 25 local
  hours across a DST transition.
- Scraper workflows now run with `TZ=America/Halifax`. The runners are UTC, so overnight runs
  derived their fetch window from a calendar date that had already rolled over while it was
  still the previous evening in Halifax, truncating that evening's events.

### Added

- A header notice, shown only to viewers whose clock differs from the facility's, stating that
  schedules are in Halifax time and by how much the viewer's zone differs. Labelled by IANA
  zone id rather than city, because browsers canonicalize aliases: a viewer in Montreal reports
  `America/Toronto`.
- An ESLint rule rejecting bare `new Date()` outside `src/utils/timezone.js`, so the domain
  boundary is enforced rather than conventional.

### Changed

- `getWeekBounds` had two identical copies. `useSkatingData` now imports the one in `dateUtils`.

[1.2.0]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v1.2.0
[1.1.0]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v1.1.0
