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

1. **Overview** — executive summary. Eyebrow ("100-Day Integration Plan") /
   headline ("One team, one mission") / a single **day-line** (Day N of 100 ·
   days left · next board meeting) with a **slim progress bar** / live-sync (or
   cached-data) banner at top,
   then: **four KPI tiles** (overall % complete, on-track / need-attention /
   off-track workstream counts, from `rollupWorkstreamHealth`), then
   **workstreams grouped by flagship pillar** as compact rows
   (`name · leader · mini health bar · completion%`). Grouping is dynamic off
   the Sheet's flagship-goal field. Clicking a workstream name opens its tasks;
   clicking a flagged bar segment opens Needs Action filtered to that
   workstream; leader is inline-editable; the 100-Day goal shows on hover.
   The full per-workstream table now lives in the Workstream Tasks tab.
2. **Workstream Tasks** — keyword search (top), a column-header row + legend,
   then one card per workstream whose header **mirrors the Overview row** and
   drops down to the task table (Ranking · Task · Due Date · Status, with RACI
   + subtasks + notes under each task). Ranking is editable, unique per
   workstream, and sortable; tasks also sort by due date.
3. **Needs Action** — flat list of flagged tasks grouped At Risk → Blocked →
   Off Track, each with workstream, owner, due date, and an editable
   **Reason** (persists to sheet column K). Click an item → opens that task in
   the Workstream Tasks tab (expanded, scrolled, highlighted). Can be filtered
   to one workstream.
4. **By Accountable** — tasks grouped by the Accountable person.
5. **AI Automations** — running list of proposed automations (status persisted
   in browser).

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
