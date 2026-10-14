# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2026-10-14

### Fixed

- Restricted swim sessions use lighter chart stripes with a dark divider so they remain visible
  against both lanes and kids bars. Session badges use darker matching colours with readable
  white text.

## [2.1.1] - 2026-10-14

### Fixed

- Switching between status and schedule views no longer shifts the centered layout when a
  vertical scrollbar appears or disappears.

## [2.1.0] - 2026-10-13

### Changed

- Restricted swim sessions have their own colours again: members only (slate), women only
  (pink), seniors 60+ (purple), sensory (teal). They are clear of the lanes blue, kids orange,
  the green and red answers and the yellow NOW highlight, and pass 4.5:1 with white text.
- On the Swimming status boxes a running restricted session tints the left edge, the YES and
  the detail line, e.g. "Women only - 45m left".
- In the schedule view the badge on a session row is filled with its restriction colour, and
  week chart bars are striped in the lanes or kids colour plus the restriction colour. The
  legend lists each restriction present instead of one combined entry.

## [2.0.2] - 2026-10-13

### Fixed

- The disabled previous/next day buttons no longer change background on hover or touch. Their
  press effect was already limited to enabled buttons in 2.0.1.

## [2.0.1] - 2026-10-13

### Fixed

- The status boxes shifted and lost their shadow when touched, because `.brutal-card` carried a
  hover press effect and touch screens fire hover on tap. The cards are not controls, so the
  effect is removed.

## [2.0.0] - 2026-10-13

### Changed

- Redesigned every page around one question. The landing view of Swimming, Skating, Hockey and
  Libraries is now only the YES/NO boxes, stacked and stretched to fill the screen: Lanes and
  Kids pool, Public and Adult skate, Hockey (naming what is on the ice), and the four libraries.
- One header on every page and in every state: a facility dropdown (Swimming, Skating, Hockey,
  Libraries, with their icons) on the left and a Schedule item on the right. It replaces the
  wordmark, the tab row and the fixed footer nav, which cost about 80px on every phone screen.
- The schedule view (`?view=schedule`) is a week chart on a shared hour axis plus the selected
  day's sessions. Chart rows and the previous/next buttons pick the day; the current session
  keeps the yellow NOW highlight. Libraries show a week of opening hours per library instead.
- Lanes are blue and kids are orange everywhere: session badges, the chart toggle and the bars.
  Members, women, seniors and sensory sessions are striped bars and a text badge rather than
  extra colours.
- High-contrast light theme: white background, black text, `#3D3D3D` secondary text, and the
  green and red darkened to pass 4.5:1 on white.
- The timezone notice for viewers outside Halifax time moved from the header to the footer.
- Old `?tab=` links still work: any tab other than `status` opens the schedule view.

### Removed

- The Family, Lanes and Events tabs. The week chart answers next, morning, afternoon and
  longest session at a glance, and restricted sessions are marked inline. The slot finders in
  `eventParser.js` that only those tabs used are gone.
- The Skating This Week / Next Week toggle; the chart covers every day in the feed, up to two
  weeks.

## [1.3.0] - 2026-10-13

### Added

- Hockey page at `/hockey` with a footer link, listing games, league nights, practices, camps
  and pickup from the arena schedule, with the same This Week / Next Week view as Skating.
- The skating scraper now also writes `public/data/hockey.json` from the same API fetch. Hockey
  is every ice event except public/adult skate and non-ice entries (Busy, maintenance, holds,
  closures, rentals, skating clubs), so new team names appear without a scraper change.

### Changed

- `useSkatingData`, the Skating page and its empty state take a data file and sport so Hockey
  reuses them instead of duplicating them.
- The skating workflow commits `skating.json` and `hockey.json` together.

## [1.2.1] - 2026-09-10

### Fixed

- The compact header from 1.2.0 was a mobile treatment applied at every width, which left
  desktop with the wordmark and tabs hard left while the content stayed centred, and the
  timezone chip stranded ~1150px from the title. On md+ the wordmark is centred again at
  `text-4xl` with the chip pinned right, via a three-column grid so it stays centred whether
  or not the chip renders.
- Both scrolling rows were left-aligned at every width. `mx-auto` on the `w-max` track centres
  it wherever it fits and resolves to zero once it does not, so desktop and roomier phones get
  a centred row while a narrow phone still gets a left-aligned scrollable one. Using
  `justify-center` here would have made the left overflow unreachable, since `scrollLeft`
  cannot go negative.

### Changed

- Footer byline reads "Made with love by Bastian".

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

[2.1.2]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v2.1.2
[2.1.1]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v2.1.1
[1.2.1]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v1.2.1
[1.2.0]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v1.2.0
[1.1.0]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v1.1.0
