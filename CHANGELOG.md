# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/gruberb/isthelclcpoolopen/releases/tag/v1.1.0
