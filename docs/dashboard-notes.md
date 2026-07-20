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
      The **Need attention** and **Off track** tiles are **clickable** (pointer
      cursor + hover shadow, keyboard-accessible) and jump straight to the Needs
      Action tab via `openNeedsAction` (resets `naFilter` and `review`). Overall
      completion and On track are non-interactive.
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
3. **Needs Action** — a **single flat list** of flagged tasks (no more At Risk /
   Blocked / Off Track grouping; health shows as a colored pill + left border per
   row). Each row: a left **"Flagged" (date-joined) column**, then health pill ·
   workstream · description · due date · owner · Open task, then an editable
   **Reason** (persists to sheet column K). Click a row → opens that task in the
   Workstream Tasks tab (expanded, scrolled, highlighted). Can be filtered to one
   workstream.
   - **Date joined the list.** Tracked in a dedicated **"Needs Action Log"** sheet
     tab (`Task ID · Workstream · Description · First Flagged`), reconciled on
     every page load by `reconcileNeedsActionLog()` in `lib/sheets.ts` (called
     from `app/hundredday/page.tsx`): newly-flagged tasks are stamped with today's
     ET date, tasks no longer flagged are dropped (so a re-flag gets a fresh
     date), existing dates carried forward. The `taskId → date` map is passed to
     the client as `joinDates`. "Start the clock now" — everything flagged the
     first day is dated that day; dates become meaningful as items flag over time.
     Best-effort: if the sheet can't be written (e.g. no creds locally) it returns
     `{}` and the column shows "—". (Note: giving a **local Turbopack dev server**
     real creds makes `/hundredday` 500 with `ArrayBuffer is not detachable` — a
     pre-existing googleapis-in-dev-SSR issue, NOT from this code; production build
     is fine. Normal local dev uses the cached-data fallback and never hits it.)
   - **Sort.** The list sorts by join date, **newest on top by default**; the
     **"Flagged" header toggles** asc/desc (↑/↓). Blank dates sort to the bottom;
     ties break by workstream name.
   - **Review mode / stepper.** Opening a flagged task from here enters a review
     mode: a floating bar (bottom-center) shows **← Needs Action · Prev ·
     "X of N flagged" · Next**, walking the flagged queue *in the exact order this
     tab currently shows* (Needs Action passes its ordered queue to `onOpenTask`,
     so it always matches the active sort + filter — the old `buildReviewQueue`
     was removed). **Prev** disables at the first item, **Next** at the last; the
     bar clears when you switch tabs. **← Needs Action** returns you scrolled to
     (and briefly highlighting) the task you left off on. State: `review`,
     `naReturnTaskId` in `HundredDayDashboard`. The browser back button is
     intentionally NOT wired (tab state isn't in history, only the scroll hash).
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
- **Same-day idempotency.** State also stores `lastPosted` (ET date). If it has
  already posted today, the script returns `SILENT` — so the reminder can post to
  the channel at most once per day even if the scheduled task fires more than once
  (which happened Jul 17 2026: one run double-posted; the duplicate was deleted and
  this guard added). The task prompt also instructs a single `chat_post`.

## Daily two-way sync check

- Scheduled task `mhs-integration-sync-check`, **8:30 AM ET daily** (`30 8 * * *`),
  posts a **Roam DM to Ben** (userId `db650bb4-137b-4035-a199-361794b4e15d`).
- Runs `scripts/sync-check.mjs`, which verifies the app ↔ Sheet two-way flow using
  the **same Google service account the deployed app uses**, and prints a
  Roam-ready status (exit 0 healthy, 1 on any failure). The scheduled prompt
  posts stdout verbatim either way.
- Checks: (1) **live site reachable** — HEAD `…/hundredday`; `200` or `401`
  (Netlify access-protection) both count as up; (2) **read** — pulls real task
  rows from a workstream tab (the app's read source); (3) **write** — a canary
  `write → read-back` in a dedicated **"Sync Canary"** tab (zero risk to task
  data; proves the write credential/permission works). Note the deployed app is
  behind Netlify auth (401), so the check can't hit the app's HTTP endpoints — it
  validates the shared Sheet + the app's service-account read/write path, which is
  what the two-way sync depends on.

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
  The 2 live scheduled tasks (daily digest, weekly reminder) are listed as
  Active so the tab reflects what's actually running.
- **Needs Action redesigned** to a single flat list sorted by **date joined the
  list** (newest first, sortable "Flagged" header), with the join date in a left
  column backed by a new **"Needs Action Log"** sheet tab
  (`reconcileNeedsActionLog`, stamped on page load). Health grouping replaced by
  an inline pill. Stepper now follows the tab's live display order. See Tabs
  item 3.
