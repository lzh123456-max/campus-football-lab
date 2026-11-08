# Change log

This log records the project's actual changes. The stage index below was assembled on 9 November 2026 from the existing Git history. All times use UTC+08:00 and match the recorded commits.

## Development stages and commit evidence

| Stage | Recorded date and time | Change in that commit | GitHub evidence |
| --- | --- | --- | --- |
| 1. Scope and visual identity | 2026-11-08 16:10:41 | Defined the project scope and added the original social cover, icons and hosting manifest. | [a5bbd34](https://github.com/lzh123456-max/campus-football-lab/commit/a5bbd349c52983bfd90027b0078ea2591e7ef483) |
| 2. Four-page foundation | 2026-11-08 16:19:21 | Added four pages, eight drill entries, responsive styling, mobile navigation, pitch artwork and local/static-host helpers. | [8b36e4a](https://github.com/lzh123456-max/campus-football-lab/commit/8b36e4ae2e2eac4800086048cdb4374d11066a11) |
| 3. Filters and session builder | 2026-11-08 16:23:59 | Added drill-filter and timed session-builder scripts, corrected the library heading style and recorded verification. | [4c75140](https://github.com/lzh123456-max/campus-football-lab/commit/4c7514079156a3f0b53992dd494d482605b88f3d) |
| 4. Fallback wording correction | 2026-11-08 16:24:18 | Corrected the no-JavaScript message to say all eight drills are available on the current page. | [8724cde](https://github.com/lzh123456-max/campus-football-lab/commit/8724cde000faef0e5d05ef6196e60416c16fd24d) |
| 5. Verification and code guide | 2026-11-08 16:27:21 | Documented the code, completed checks, sources, AI assistance and remaining student steps in the README. | [c646e2f](https://github.com/lzh123456-max/campus-football-lab/commit/c646e2f80fb2e3768005e61d040f043cd833c636) |
| 6. Fifth page: penalty challenge | 2026-11-08 19:56:51 | Added the five-shot game, game styles and illustration, and Play links across the site. | [9618473](https://github.com/lzh123456-max/campus-football-lab/commit/9618473d567a3d043dbce3af219bbe7cee129822) |
| 7. Two more football activities | 2026-11-09 00:32:34 | Added the quick-pass reaction game and draggable formation board, and expanded Play into a three-activity playground. | [c6edf6a](https://github.com/lzh123456-max/campus-football-lab/commit/c6edf6af8d51f154c70719f7463c5ce2c1530d0a) |

The linked diffs show the incremental changes across seven commits. The recorded development dates currently cover 8–9 November 2026; they do not yet demonstrate week-by-week development. The full [commit history](https://github.com/lzh123456-max/campus-football-lab/commits/main/) is available for review.

## 2026-11-08 — Scope and identity

Commit: [a5bbd34](https://github.com/lzh123456-max/campus-football-lab/commit/a5bbd349c52983bfd90027b0078ea2591e7ef483).

- Defined a four-page football practice guide for students.
- Selected a separate project folder, colour palette and original visual identity.
- Planned a drill library and a session builder that works without accounts or a database.

## 2026-11-08 — Pages and interactions

Commits: [8b36e4a](https://github.com/lzh123456-max/campus-football-lab/commit/8b36e4ae2e2eac4800086048cdb4374d11066a11), [4c75140](https://github.com/lzh123456-max/campus-football-lab/commit/4c7514079156a3f0b53992dd494d482605b88f3d), [8724cde](https://github.com/lzh123456-max/campus-football-lab/commit/8724cde000faef0e5d05ef6196e60416c16fd24d) and [c646e2f](https://github.com/lzh123456-max/campus-football-lab/commit/c646e2f80fb2e3768005e61d040f043cd833c636). The stage index distinguishes implementation, the wording correction and the documentation review.

- Built four complete English pages with semantic HTML, working navigation and a responsive stylesheet.
- Added eight original drill examples with technical-reading credits.
- Implemented combined skill, format and keyword filters, including empty and reset states.
- Added a session builder with 30 combinations, exact time allocation and five progress checkboxes.
- Verified all 30 plan combinations and checked filtering, completion and reset in a browser.
- Checked all four pages at 320 pixels wide, including mobile-menu opening and Escape closing.
- Fixed the hidden library heading style and clarified the no-JavaScript message.


## 2026-11-08 — Penalty challenge

Commit: [9618473](https://github.com/lzh123456-max/campus-football-lab/commit/9618473d567a3d043dbce3af219bbe7cee129822).

- Added a fifth page with an original five-shot football game and pitch illustration.
- Added left, centre and right aim controls, an independent random goalkeeper, shot animations, goal/save feedback, a five-shot history and replay.
- Locked controls while a shot is in flight and cancelled pending work on restart, so repeated input and old timers cannot award extra goals.
- Added a Play link to every page and a dedicated homepage entry; retained the drill library and session builder.
- Verified all nine aim/keeper combinations, the five-shot limit, duplicate-input guards and restart behaviour with focused checks.
- Played a complete five-shot game in the browser, including Enter-key shooting, final scoring, replay and a restart during a shot.
- Checked the new game at 320 pixels wide and on a phone-sized viewport, and audited 106 local references across the five pages.

## 2026-11-09 — Football playground expansion

Commit: [c6edf6a](https://github.com/lzh123456-max/campus-football-lab/commit/c6edf6af8d51f154c70719f7463c5ce2c1530d0a).

- Expanded the existing Play page into three independent activities, with ordinary anchor links between them; retained the penalty challenge.
- Added a five-round quick-pass challenge with random signals, early/wrong/late misses, reaction-time statistics, replay and tab-visibility pause.
- Added three eleven-player formations, bounded pointer dragging, player selection, direction buttons, arrow-key movement and reset.
- Added responsive pitch controls and reduced-motion rules, and made the formation pitch a named group for assistive technology.
- Passed the focused `reaction-check` and `formation-check` program checks.
- Verified a complete reaction game in the browser: one early miss, one timeout miss and three hits, including average/best successful times and replay.
- Verified all three formations had eleven players and checked select, direction-button, keyboard, pointer-drag and reset controls. Confirmed a shot in the original penalty game still completed normally.
- Checked 320- and 390-pixel browser viewports without horizontal overflow. Verified 48-pixel reaction targets, 44-pixel formation players, player selection and direction buttons in the mobile layout; observed no browser console errors.
- Audited 112 local references and anchors across five pages, with no missing resources, broken local anchors, duplicate IDs or missing label/ARIA targets.

## 2026-11-09 — Development-log review

- Matched the seven earlier stages to their existing commit times and changed files.
- Added a timestamped stage index and direct GitHub diff links so a reviewer can inspect each change.
- Linked this evidence from the README and preserved the existing Git history.

Future weekly entries will be added when the corresponding changes have actually been made.
