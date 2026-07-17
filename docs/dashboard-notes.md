# MHS × Radial 100-Day Integration Dashboard — Design & Change Notes

Living reference for how the dashboard works and the changes made in the
Jul 2026 build session. Live at https://mhsintegration.netlify.app/hundredday
(Netlify, Next.js 16 / Turbopack). Repo: benthegitofhubs/mhs-integration-dashboard.

---

## Source of truth

- **Google Sheet** (native Google Sheets format): `1FzP8ePYCDHoBxx8bW0Ft2mbLEqfzYNmf2zobBF8pbvA`
  — "Radial x Mindful Health Solutions - 100 Day Integration Plan". The old
  Excel/Office file (`1Gm5…`) is retired (Sheets API can't read Office files).
- The app reads live on every page load (`export const dynamic = "force-dynamic"`)
  and writes changes back immediately. Service account:
  `radial-mhs-integration@radial-mhs-integration.iam.gserviceaccount.com`
  (shared as Editor). Credentials via `GOOGLE_SERVICE_ACCOUNT_JSON` env
  (Netlify) / `~/.mhs_service_account.json` (scripts).
- **Cached-data fallback.** If the Sheet can't be read (missing/invalid creds,
  quota, unreachable), `fetchWorkstreamsResult()` returns the bundled static
  snapshot with `live: false`. The dashboard then swaps the green "Live sync"
  banner for an amber "⚠ Live sync unavailable — showing cached data" warning,
  so stale figures are never presented as live. `fetchWorkstreams()` remains a
  thin wrapper (array only) for the digest route/script.

### What comes from where
- **Workstream name** → Dashboard tab, **column B** (one-way, sheet → app),
  matched positionally via `DASHBOARD_ID_ORDER` in `lib/sheets.ts`.
- **100-Day Goal** → Dashboard tab, **column E** ("Final"), falling back to D.
- **Leader** → each workstream tab's `Leader: X | Supporting: …` header row
  (two-way editable in app).
- **Per-task fields** (two-way, matched by header name so column order is safe)
  in each of the 15 workstream tabs:
  - A `Ranking #` · B `Work Item` · C `Subtasks` · D `Due Date`
  - E `Accountable` · F `Responsible` · G `Consulted` · H `Informed` (RACI)
  - I `Status` · J `Notes / Next Steps` · K `Reason for Risk/Off Track/Block`

15 workstreams; tabs mapped in `WS_TAB_MAP`. Dashboard tab is a curated master
list — do not restructure the 15 source tabs (header row, Leader row, column
order). "IM Notes" and "AI Automations" tabs are protected.

---

## Health model (single source: task Status)

You only set **task Status** (Not Started / In Progress / At Risk / Blocked /
Complete). Everything else is derived (`lib/taskHealth.ts` → `calcTaskHealth`):

1. Complete → not flagged (shown as "complete")
2. **Off Track** — due date passed and not Complete (automatic; takes precedence)
3. **Blocked** — Status = Blocked
4. **At Risk** — Status = At Risk
5. **On Track (In Progress/Not Started)** — everything else, including both
   In Progress and Not Started, when not overdue. Not Started is not broken
   out as its own bucket.

Bar segment colors: Complete `#15803d` · On Track (In Progress/Not Started)
`#86efac` · At risk `#eab308` · Blocked `#ea580c` · Off track `#b91c1c`.

There is **no workstream-level status/override** anymore — the app is fully
task-status-driven. (Leftover `Status:` rows in tab headers are ignored.)

---

## Tabs

1. **Overview** — executive summary. Structure, top to bottom:
   1. **Rich top** — eyebrow ("100-Day Integration Plan") · headline
      ("One team, one mission") · **tick-timeline + key-dates**. (The evening
      Jul 16 work restored this rich top; the earlier single day-line + slim
      progress bar was reverted.)
   2. **Four task-level KPI tiles** — Overall Completion · **On Track
      (In Progress/Not Started)** · Need Attention · Off Track. Each shows a
      **percentage** with "X of N **tasks**" beneath, and the four partition
      cleanly to 100%. These count **tasks, not workstreams**
      (`rollupWorkstreamHealth` is no longer what drives the tiles).
   3. **Workstream list** — a **single flat list**, columns **Workstream ·
      Leader · Completion %** only. No pillar grouping, no mini health bars, no
      color legend (all removed in the evening Jul 16 work). Clicking a
      workstream name opens its tasks; leader is inline-editable; the 100-Day
      goal shows on hover. **The Leader and Completion % headers are sortable**
      (click to toggle asc/desc, active column shows ↑/↓); the default —
      completion % descending — is what loads. State: `ovSort` in
      `HundredDayDashboard`. New-column clicks pick a natural default
      (completion→desc, leader→asc A–Z); ties fall back to completion desc
      (leader sort) or name A–Z (completion sort); blank leaders always sink
      to the bottom.
   4. **Live-sync / cached-data banner at the BOTTOM** (moved down from the top).

   The full per-workstream task table lives in the Workstream Tasks tab.
2. **Workstream Tasks** — keyword search (top), a **centered, boxed** legend
   (white card, `#e5e3de` border, `width: fit-content`, `justify-center`), a
   column-header row,
   then one card per workstream whose header **mirrors the Overview row** and
   drops down to the task table (Ranking · Task · Due Date · Status, with RACI
   + subtasks + notes under each task). Ranking is editable, unique per
   workstream, and sortable; tasks also sort by due date.
3. **Needs Action** — flat list of flagged tasks grouped At Risk → Blocked →
   Off Track, each with workstream, owner, due date, and an editable
   **Reason** (persists to sheet column K). Click an item → opens that task in
   the Workstream Tasks tab (expanded, scrolled, highlighted). Can be filtered
   to one workstream.
   - **Review mode / stepper.** Opening a flagged task from here enters a
     review mode: a floating bar (bottom-center) shows **← Needs Action ·
     Prev · "X of N flagged" · Next**, letting you walk the whole flagged
     queue *in the same order this tab renders it* (At Risk → Blocked → Off
     Track, respecting the active workstream filter) without bouncing back and
     forth. **Prev** disables at the first item, **Next** at the last; the bar
     clears when you switch to any other tab. **← Needs Action** returns you
     here scrolled to (and briefly highlighting) the task you left off on.
     State lives in `HundredDayDashboard` (`review`, `naReturnTaskId`);
     `buildReviewQueue()` reproduces the tab's ordering. The browser back
     button is intentionally NOT wired (tab state isn't in history, only the
     scroll hash) — the in-app button covers the workflow without risking the
     hash-scroll logic.
4. **By Accountable** — tasks grouped by the Accountable person.
5. **AI Automations** — automations split into two sections: **Active** (status
   = Active) on top, then **Parking Lot** (everything not Active). Each row keeps
   its status dropdown (Parked / In Review / Active), so changing status moves the
   item between sections live; category shows as a small inline tag. Status
   persists in the browser. (A "suggestion box" idea-submission form + Roam/email
   delivery was designed and built but **held off** per Ben — the form, the
   `/api/submit-idea` route, the `appendAutomationIdea` sheet helper, and the
   "AI Automation Ideas" sheet tab were all removed to avoid dead surface;
   re-add when revisited.)

Top nav is sticky ("frozen"). Location count = 20.

---

## Daily Roam digest

- Scheduled task `mhs-integration-daily-digest`, **9:00 AM ET daily**, posts to
  the Roam **Integration Team** channel (groupId
  `970c268a-f8b3-4c76-a3b5-b8ad907aa0d8`).
- Runs `scripts/digest.ts` (uses `fetchWorkstreams`), then formats:
  header + day line → **Overall Task Health** (✅ complete · 🟢 on track ·
  ⬜ not started · 🟡 at risk · 🟠 blocked · 🔴 off track) → **Needs attention**
  (only workstreams with flagged tasks, by count) → tracker link.

## Weekly Roam reminder (self-sunsetting)

- Scheduled task `mhs-integration-weekly-reminder`, **Fridays 12:00 PM ET**
  (`0 12 * * 5`), posts to the same Roam **Integration Team** channel.
- Runs `scripts/weekly-reminder.mjs` (reads the live Sheet directly via the
  service account, like `blocked-alert.ts`), which **prints the exact message
  to post, or the literal token `SILENT`**. The scheduled prompt just relays
  stdout verbatim (markdown) and posts nothing on `SILENT`.
- Tracks two independent housekeeping metrics across all workstreams: **tasks
  Not Started** and **tasks with no Due Date**. Each metric's section shows
  only while its count > 0, with per-workstream **counts** (Name · Leader — N,
  sorted by count desc). "Owner" is not usable — Responsible is blank sheet-wide
  and Accountable is compound free-text — so the reminder deliberately reports
  at the **workstream + leader** level only.
- **Self-sunsetting.** State in `~/.mhs_weekly_reminder_state.json` remembers
  last run's counts. When a metric first crosses to 0 it posts a one-time
  🎉 congrats ("every task is now started" / "…now has a due date"); when BOTH
  reach 0 it posts a final "signing off" message and then stays `SILENT` every
  week after. If a metric regresses above 0, its section (and future congrats)
  resume automatically. `--dry-run` computes without writing state;
  `--test-ns=N` / `--test-md=M` override totals to exercise the sunset states.

---

## This session's changes (Jul 16, 2026)

- Migrated to native Google Sheets; fixed truncated `b2b`/`ltc` tab names that
  had them silently reading static data.
- RACI replaced single Owner (4 sheet columns + inline editing).
- Subtasks (add / check / delete), Ranking (editable, unique, sortable).
- Workstream name + goal sourced from Dashboard tab; added Service Experience
  to the Dashboard tab.
- Rewrote all 15 Dashboard rollup formulas (correct tabs, ranges, status logic).
- Reframed health reporting: dropped ambiguous workstream "status" rollup in
  favor of per-workstream **task-badge stacked bars** with counts + Completion%.
  (Note: a later change folded **Not Started** back into On Track — the green
  bucket is labeled "On Track (In Progress/Not Started)" and there is no
  separate Not Started segment.)
- 5-tab restructure; sticky nav; keyword search; Needs Action redesign with
  persistent Reason field.
- Daily digest → live data, per-workstream, shortened format, 9 AM ET.
- Removed the pace/Expected-vs-Actual card and redundant section dividers.

## Later Jul 16, 2026 session

- Folded **Not Started** into On Track across the legend and all task-health
  bars; renamed the green bucket "On Track (In Progress/Not Started)". Health
  logic is task-status-driven per leadership decision to trust workstream
  leaders on what to start and when.
- Fixed a React **hydration mismatch** on the progress timeline: the server
  stamps `nowMs` once and passes it down; timeline %, Today marker, and date
  string render from that single value with an explicit ET timezone; plan
  start/end dates parsed with explicit `-04:00` offsets.
- Fixed a "unique key" warning by keying the `KEY_DATES` mapped Fragment.
- Added the **cached-data fallback banner** (see Source of truth).
- Dropped "Mindful Health Solutions ·" from the Overview eyebrow (now just
  "100-Day Integration Plan").
- **Redesigned the Overview into an executive summary** (see Tabs → Overview):
  KPI tiles + pillar-grouped compact rows, replacing the 15-row table.
- **Cleaned the Overview top**: headline → "One team, one mission"; replaced
  the tick-timeline + key-dates table with a single day-line + slim progress
  bar. Removed the inline "next board meeting" editor (`BoardMeetingCell`) —
  the board date now comes from the Sheet's key-dates data.

## Evening Jul 16, 2026 session (final state of the day)

Ran a live pressure-test of the app and reworked the Overview. Net changes,
all shipped to `main` (commits `471c5a6` → `85797cd` → `c57367a`):

- **KPI tiles switched to task-level.** All four tiles (Overall Completion ·
  On Track · Need Attention · Off Track) now count **tasks**, each as a
  percentage with "X of N tasks" beneath, summing to 100% — replacing the
  earlier workstream-level counts driven by `rollupWorkstreamHealth`.
- **On Track tile** subtitled **"(In Progress/Not Started)"** to match the
  health model.
- **Workstream section → single flat list** sorted by **completion %
  descending** (Workstream · Leader · Completion %). Removed the pillar
  grouping, mini health bars, and color legend that the exec-summary redesign
  had introduced earlier the same day.
- **Restored the rich Overview top** (headline · tick-timeline · key dates),
  reverting the afternoon's day-line + slim-progress-bar simplification.
- **Moved the live-sync / cached-data banner to the bottom** of the Overview.
- **Tried and reverted** (NOT in the app): the Integration Health / pace card
  (Expected vs. Actual by today, draggable timeline) and a separate
  **Not Started** task segment — both added earlier in the day and pulled back
  out.

Still open (not blocking): rotate the plaintext GitHub PAT in `.git/config`.

## Jul 17, 2026 session

- **Needs Action review stepper.** Added a floating Prev/Next/Back bar so the
  flagged queue can be worked top-to-bottom without losing your place (see
  Tabs → Needs Action). Opening a task from Needs Action now enters review
  mode; the "← Needs Action" button returns you scrolled to and highlighting
  the last task you were on. New state in `HundredDayDashboard`: `review`
  (`{ queue, index }`), `naReturnTaskId`; helpers `buildReviewQueue`,
  `openFromNeedsAction`, `goToReviewIndex`, `backToNeedsAction`;
  `NeedsActionView` gained `scrollToTaskId` / `onScrolled` props and `na-<id>`
  anchors on each card. Browser back button deliberately left unwired.
- **Workstream Tasks legend** centered and put in a bordered white box for
  legibility.
- **Overview workstream list — sortable Leader & Completion % columns.** Both
  headers toggle asc/desc with an ↑/↓ indicator on the active column; default
  remains completion % descending. See Tabs → Overview item 3.
- **AI Automations restructured** into **Active** (top) + **Parking Lot**
  sections, driven by each item's status; category shown as an inline tag. A
  suggestion-box idea form (→ sheet capture → Roam/email delivery) was fully
  built then held off per Ben; all its pieces were removed. See Tabs item 5.
