# Campus Football Lab

A student football guide with a drill library and an interactive practice-session builder. Made for the Web Technologies personal project by Lian zhihan.

This is a separate project from Learning HTML, with its own Git history. The first development date is 8 November 2026; weekly development must continue through real subsequent changes.

Read [PROJECT.md](PROJECT.md) for the audience and scope, and [CHANGELOG.md](CHANGELOG.md) for real changes.

- Website: https://lzh123456-max.github.io/campus-football-lab/
- Public repository: https://github.com/lzh123456-max/campus-football-lab

## Pages and local preview

The four pages are index.html (introduction), drills.html (eight practices), session.html (plan builder) and about.html (author, decisions and sources). The site uses semantic HTML, CSS and plain JavaScript with no dependencies, backend, accounts or storage.

Run `node serve.mjs` and open http://127.0.0.1:4174. A different port can be passed, for example `node serve.mjs 4175`. VS Code Live Server also works. Stop with Ctrl+C. Run `node prepare.mjs` to prepare dist for static hosting.

GitHub Pages uses the root files: Settings → Pages → Deploy from a branch → main → /(root). A normal push updates it.

## Code to understand

- **style.css:** responsive layout, colours, focus, reduced motion and print rules.
- **nav.js:** mobile menu, expanded state, Escape/outside closing and current page.
- **drill-data.js:** eight practice objects. Keep these and the static cards in drills.html consistent when editing.
- **drills.js:** combine skill, format and keyword filters; update visibility, count and empty state.
- **session.js:** choose three compatible distinct drills, prioritise a skill, divide the minutes and render progress checkboxes.
- **HTML:** native navigation, labelled controls and details/summary. The library remains readable without JavaScript.

For 25 minutes, the planner assigns 3 minutes to start, 7+7+6 to the drills and 2 to finish. When there are fewer than three compatible focus drills, it explains that supporting skills complete the plan. A new plan clears the checkmarks. Nothing is persisted.

## First-version verification

All 30 focus/time/player combinations passed exact-total, five-block, unique-drill and compatibility checks. Browser checks passed for filtering, zero results, clearing filters, generating plans, completion and resetting. All four pages were checked at 320 pixels wide without horizontal overflow or missing images. Mobile menu and Escape passed; no console errors were observed.

The source audit checked 81 local references and cross-page anchors, valid labels/ARIA and one h1/main per page. The 1200 × 630 cover is 63,122 bytes; PNG icons are 180 × 180 and 32 × 32.

Real-phone campus Wi-Fi/mobile-data testing, course-platform submission, later weekly development and the live presentation remain student steps. First-day commits do not demonstrate weekly growth.

## Sources and AI assistance

The about page links four FIFA Training Centre articles for general technical concepts. Practice setups, short formats, timings and wording are original examples, not copied FIFA sessions. All diagrams, icons and the cover are original code-drawn assets.

AI assisted with planning, code, English wording, artwork and review. Edit the content where needed, understand the code and explain your decisions in your own words. This is an independent student project, not an official university club.
