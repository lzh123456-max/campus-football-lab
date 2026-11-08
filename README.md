# Campus Football Lab

A student football guide with a drill library, an interactive practice-session builder and a three-activity football playground. Made for the Web Technologies personal project by Lian zhihan.

This is a separate project from Learning HTML, with its own Git history. The first development date is 8 November 2026; weekly development must continue through real subsequent changes.

Read [PROJECT.md](PROJECT.md) for the audience and scope, and [CHANGELOG.md](CHANGELOG.md) for real changes.

- Website: https://lzh123456-max.github.io/campus-football-lab/
- Public repository: https://github.com/lzh123456-max/campus-football-lab

## Pages and local preview

The five pages are index.html (introduction), drills.html (eight practices), session.html (plan builder), play.html (three football activities) and about.html (author, decisions and sources). The site uses semantic HTML, CSS and plain JavaScript with no dependencies, backend, accounts or storage.

Run `node serve.mjs` and open http://127.0.0.1:4174. A different port can be passed, for example `node serve.mjs 4175`. VS Code Live Server also works. Stop with Ctrl+C. Run `node prepare.mjs` to prepare dist for static hosting.

GitHub Pages uses the root files: Settings → Pages → Deploy from a branch → main → /(root). A normal push updates it.

## Code to understand

- **style.css:** responsive layout, colours, focus, reduced motion and print rules.
- **nav.js:** mobile menu, expanded state, Escape/outside closing and current page.
- **drill-data.js:** eight practice objects. Keep these and the static cards in drills.html consistent when editing.
- **drills.js:** combine skill, format and keyword filters; update visibility, count and empty state.
- **session.js:** choose three compatible distinct drills, prioritise a skill, divide the minutes and render progress checkboxes.
- **play.js / play.css:** a five-shot penalty game with three aim directions, an independent random keeper, animated feedback, score history, restart-safe timers and reduced-motion support.
- **reaction.js:** a five-round reaction game with random signals, hit/miss feedback, measured response times, timeout handling and tab-visibility pause.
- **formation.js:** three eleven-player presets, bounded drag movement, player selection, keyboard/direction controls and reset.
- **fun-lab.css:** responsive pitch illustrations and controls for the additional activities.
- **HTML:** native navigation, labelled controls and details/summary. The library remains readable without JavaScript.

For 25 minutes, the planner assigns 3 minutes to start, 7+7+6 to the drills and 2 to finish. When there are fewer than three compatible focus drills, it explains that supporting skills complete the plan. A new plan clears the checkmarks. Nothing is persisted.

## First-version verification

All 30 focus/time/player combinations passed exact-total, five-block, unique-drill and compatibility checks. Browser checks passed for filtering, zero results, clearing filters, generating plans, completion and resetting. All four pages were checked at 320 pixels wide without horizontal overflow or missing images. Mobile menu and Escape passed; no console errors were observed.

The source audit checked 81 local references and cross-page anchors, valid labels/ARIA and one h1/main per page. The 1200 × 630 cover is 63,122 bytes; PNG icons are 180 × 180 and 32 × 32.

Real-phone campus Wi-Fi/mobile-data testing, course-platform submission, later weekly development and the live presentation remain student steps. First-day commits do not demonstrate weekly growth.

## Sources and AI assistance

The about page links four FIFA Training Centre articles for general technical concepts. Practice setups, short formats, timings and wording are original examples, not copied FIFA sessions. All diagrams, icons and the cover are original code-drawn assets.

AI assisted with planning, code, English wording, artwork and review. Edit the content where needed, understand the code and explain your decisions in your own words. This is an independent student project, not an official university club.

## Penalty challenge update

The fifth page, play.html, is a theme-related game. Choose left, centre or right, then press Shoot. The keeper chooses one of the three directions independently. A matching direction is a save; otherwise it is a goal. After five attempts the score is final and Play again starts fresh.

The game has explicit ready, shooting, result and finished states. Aim controls are locked during a shot. Restart clears the pending animation and uses a generation token to ignore an obsolete callback. This keeps one click from scoring twice and prevents a restarted game from receiving an old result. Tab, Enter and Space work through native buttons; reduced-motion preferences shorten the animation. No game data is saved.

Focused checks passed for all nine direction combinations, five-shot limits, input guards and restart cancellation. Browser checks passed for a full game, keyboard shooting, score/history, replay, restart during an animation and phone-width layout. At that update, the five-page source audit checked 106 local references and anchors.

## Football playground expansion — 2026-11-09

The Play page now contains three independent activities with ordinary anchor links between them. The quick-pass challenge waits a random 0.5–1.5 seconds, lights one of three teammates and measures successful responses using the browser clock. Early, wrong and late passes count as misses. Five attempts produce a hit count and average/best successful response. Leaving the tab pauses an unfinished round without awarding a miss; resuming starts a fresh wait for the same round.

The formation board switches among three eleven-player layouts. Drag a player, choose one from the select control, or move them with arrow buttons/keys. Positions are clamped inside the pitch, so controls remain usable on a narrow phone. Reset restores the current preset. All movement is local to the page; it does not simulate match outcomes or save a team.

Focused `reaction-check` and `formation-check` program checks passed. A complete browser reaction run recorded an early miss, a timeout miss and three hits; average/best successful reaction times and replay were verified. All three formations displayed eleven players, with select controls, direction buttons, arrow keys, pointer dragging and reset checked in the browser. A shot in the original penalty game still completed normally.

Browser viewports of 320 and 390 pixels showed no horizontal overflow. Reaction targets measured 48 pixels and formation players 44 pixels; player selection and direction buttons also worked in the mobile layout. No browser console errors were observed during these checks.

The current static audit checked 112 local references and anchors across all five pages, with no missing resources, broken local anchors, duplicate IDs or missing label/ARIA targets. The formation pitch is a named group for assistive technology.
