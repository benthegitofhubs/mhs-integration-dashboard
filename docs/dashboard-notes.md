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
      (In Progress/Not Started)** · **Needs Action** · **Not Started**. Each shows
      a **percentage** with "X of N **tasks**" beneath, counting **tasks, not
      workstreams**. The two clickable tiles each **mirror the exact contents of
      the tab they open**: **Needs Action** = all flagged (At Risk + Blocked +
      Off Track, = the Needs Action tab); **Not Started** = status Not Started
      (= the Not Started tab). Both are **clickable** (pointer + hover shadow,
      keyboard-accessible) via a generic `openTab(tab)` (`setActiveTab`, clears
      `review`; also clears `naFilter` for needs-action); tile type carries an
      optional `tab: "needs-action" | "not-started"`. Overall completion and On
      track are non-interactive.
      **Note:** the tiles **no longer sum to 100%** — Not Started overlaps On
      Track (the green bucket includes Not Started), and an overdue Not-Started
      task is also Off Track (so it's in both Needs Action and Not Started). This
      is intentional: each tile's number matches its destination tab, chosen over
      a clean partition. (Replaced the earlier Need Attention [At Risk+Blocked]
      and Off Track tiles, which both linked to Needs Action unfiltered — the old
      `openNeedsAction` and `linksToNeedsAction` are gone.)
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
3. **Needs Action** — a list of flagged tasks **grouped by health in ORDER**
   (At Risk → Blocked → Off Track), each group preceded by a **small labeled
   separator** (`{HEALTH} {count}` + thin rule). `items` sorts by
   `ORDER.indexOf(health)` first, then by join date within each group (the
   "Flagged ↑/↓" header still toggles the within-group date sort). Health also
   shows as a colored pill + left border per row. Above the list (below the shared
   headline) is a **quick-count row**: one colored pill per non-zero health bucket
   in ORDER (`{n} At Risk`/`Blocked`/`Off Track`, styled from `HEALTH_META`), then
   `· {N} flagged item(s)`. Counts derive from `items`, so they respect the active
   workstream filter. **Each pill is a button that scrolls to its group**
   (`scrollToGroup` → `groupAnchor(h)`; anchors carry `scrollMarginTop:90px` for
   the sticky nav). Each row: a left **"Flagged" (date-joined) column**, then
   health pill · workstream · description · due date · owner · Open task, then a
   **Reason log** (persists to sheet column K). Click a row → opens that task in the
   Workstream Tasks tab (expanded, scrolled, highlighted). Can be filtered to one
   workstream. Because the review stepper's queue is built from `items`, Prev/Next
   walks the grouped order too.
   - **Reason log (dated, strike-through history).** The Reason is an
     **append-only log of dated entries**, not a single blob. Type in the
     "Add the reason… / Add another note…" input + Enter → a new entry stamped
     with **today's ET date** (`todayET()`, e.g. "Jul 20, 2026"). Each entry
     renders as a checklist row (☐/☑); **click to toggle resolved**
     (strike-through + muted) — entries are never edited or deleted, so the risk
     history stays visible. Stored **in column K as human-readable lines**, one
     per entry, so the two-way Sheet sync is untouched and the cell stays legible
     in the Sheet: `[ ] Jul 20, 2026 — text` (open) / `[x] … — text` (resolved).
     Helpers `parseReasonLog` / `serializeReasonLog` (module scope); legacy
     plain-text reasons parse as one undated open entry (nothing lost). Handlers
     in `NeedsActionView`: `addReasonEntry`, `toggleReasonEntry`, `persistReason`
     (POST `/api/update-field`, field `reason`); draft state `reasonDraft`.
     Striking an entry is annotation only — it does **not** un-flag the task
     (flagged status is Status-driven via `calcTaskHealth`).
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

6. **Not Started** — the same grouped, fully-editable card layout as Workstream
   Tasks, but filtered to tasks whose current status is **Not Started**. Only
   workstreams that have ≥1 Not Started task render (cards auto-expand); grouped
   by workstream is the sort. Has its own keyword search (`nsSearch`). Every
   field is editable inline exactly as in Workstream Tasks (ranking, work item,
   subtasks, due date, RACI, status, notes) because it **reuses `HundredDayCard`**
   via a new `filterStatus?: Status100` prop — no duplicated edit handlers, and
   all writes go through the existing `/api/update-*` routes, so the two-way sync
   is untouched. Changing a task's status off "Not Started" live-removes it from
   the list (the card re-filters; empty cards return `null`), mirroring how
   resolving a flag drops a row from Needs Action. Empty state: "Every task has
   been started." Implementation: `filterStatus` on `HundredDayCard` (also seeds
   `expanded=true` and filters `sortedTasks`); tab wired in `HundredDayDashboard`
   (`activeTab` union + tab button after Needs Action + a cards block that
   pre-filters `nsWorkstreams`). Below the intro paragraph (before the search box)
   is a **quick count** pill — `{N} item(s) not started`, styled with
   `STATUS_BG["Not Started"]` / `STATUS_COLOR["Not Started"]` — computed as the
   overall total (not affected by the keyword search).

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

## Jul 20, 2026 session

- **Duplicate scheduled-task DMs fixed (once-per-day guard).** Ben was getting
  the daily sync-check DM twice (e.g. 8:12 AM + 8:33 AM ET). Root cause: the
  task is registered exactly once, but multiple concurrent Claude Code sessions
  each run their own scheduler with no cross-session lock, so more than one
  session fires the same task on a given day (erratic times, not clean cron).
  Added the same idempotency guard `weekly-reminder.mjs` already uses to the two
  scripts that lacked it:
  - `scripts/sync-check.mjs` → state file `~/.mhs_sync_check_state.json`
  - `scripts/digest.ts` → state file `~/.mhs_daily_digest_state.json`
  Updated both SKILL.md files (`mhs-integration-sync-check`,
  `mhs-integration-daily-digest`) to treat `SILENT` as "already posted today —
  do nothing." `--force` bypasses (manual testing).
  - **Upgraded to an atomic per-day claim** (same session) after the digest
    still double-posted once. Timing data showed two *different* sessions
    spawning ~1s apart, so a date-marker written at the *end* of the run (after
    the multi-second sheet fetch) leaves a real race window. Now each script
    claims today's slot up front with `writeFileSync(CLAIM, ..., {flag:"wx"})`
    (O_EXCL): the winner proceeds, any same-day loser gets `EEXIST` → `SILENT`.
    Claim files are `~/.mhs_sync_check.<YYYY-MM-DD>.claim` and
    `~/.mhs_daily_digest.<YYYY-MM-DD>.claim`; the winning run sweeps older-dated
    claims. `digest.ts` releases its claim in `main().catch` so a failed fetch
    can retry instead of eating the day. Verified: two processes launched
    simultaneously → exactly one emits, one `SILENT`.
  - `weekly-reminder.mjs` upgraded to the same atomic claim
    (`~/.mhs_weekly_reminder.<date>.claim`, skipped on `--dry-run`); its
    existing state file still drives the sunset/congrats logic. All three
    scheduled scripts now use the atomic per-day claim.
  - Deleted the duplicate 9:06 AM digest post from the Roam Integration Team
    channel; kept the 8:12 AM copy.
  - Note: today's two double-sends were transient, not the guard failing — the
    8:12 fires predated the guard, and the 9:06 digest re-posted because the
    marker had been manually cleared mid-test. The atomic claim is the durable
    fix going forward.
- **Overview: Need attention & Off track tiles are clickable → Needs Action**
  (commit `394339f`). Pointer cursor + hover shadow + keyboard-accessible;
  `openNeedsAction()` resets `naFilter`/`review`. Overall completion and On
  track stay non-interactive. See Tabs → Overview item 2.
- **"Not Started" report generator** — `scripts/not-started-report.mjs` (one-off,
  untracked in repo). Reuses the app's exact read logic (Dashboard-tab canonical
  names + per-tab header-detected columns; **Owner = Accountable/col E**, since
  Responsible is blank sheet-wide) so output is 1:1 with live `/hundredday`.
  Modes: `--dry-run` (JSON), `--csv` (CSV to stdout), `--by-person` (splits the
  compound Accountable on `/ , & and` → per-person counts; shared tasks count for
  each named owner so totals exceed the task count). As of Jul 20: 54 Not-Started
  tasks across 10 workstreams.
- **Gotcha — service account can't create Drive files.** `sheets.spreadsheets.create`
  with the `radial-mhs-integration@…` SA returns 403 PERMISSION_DENIED (SAs have
  no Drive storage quota). To produce a real Google Sheet deliverable, generate
  CSV and create it via the **Google Drive connector (Ben's OAuth)** —
  `create_file` with `contentMimeType: text/csv` converts to a native
  `application/vnd.google-apps.spreadsheet` owned by ben@meetradial.com. (The SA
  can still read/write the *existing* shared source Sheet fine.)
- **Deep-linking to a task is currently unreliable — two blockers** (surfaced
  while scoping Sheet→tracker hyperlinks; work NOT done, Ben declined):
  1. **No stable Task ID.** Workstream tabs have no "Task ID" column, so the app
     derives `task.id` by matching `desc.slice(0,40)` to bundled static data
     (`lib/hundredday.ts`), else falls back to positional `<wsId>-row<i>`. Live
     sheet text has drifted from the static snapshot, so many tasks resolve to
     the positional id — which shifts when rows are added/reordered. The app
     already *prefers* a "Task ID" column (`idCol`) if one is added.
  2. **Cold-load deep links don't fire.** The `#ws-<id>~<taskId>` handler lives
     in `HundredDayCard`, which only mounts on the Workstream Tasks tab. A link
     opened fresh lands on the default Overview tab, so nothing scrolls/expands.
     Any linking feature needs a top-level mount effect that reads the hash and
     switches to `workstreams` when it starts with `#ws-`.
- **Needs Action Reason → dated strike-through log.** Replaced the single-blob
  Reason field with an append-only, ET-dated log; click an entry to toggle
  resolved (strike-through) while keeping history. Stored as readable lines in
  column K (sync untouched). See Tabs → Needs Action → "Reason log".
  - **Dates only stamp on creation** (`todayET()`); there's no in-UI way to edit
    an entry's date. To backdate/bulk-fix, edit column K directly in the Sheet
    (format `[ ] Mon DD, YYYY — text`) or use the one-off
    `scripts/backdate-reasons.mjs` (untracked): it stamps every **undated** entry
    with a fixed `STAMP` date, preserves resolved state, and skips already-dated
    entries; `--dry-run` previews. Used Jul 20 to backdate the 7 pre-existing
    reasons to "Jul 17, 2026" (the Friday they were written).
- **Subtasks are now editable in place** (Workstream Tasks tab, `HundredDayCard`).
  Subtasks already supported add / check / delete; added **click-the-text-to-rename**:
  click a subtask → inline input; Enter (or blur) saves, Escape cancels, empty or
  unchanged text is a no-op (no write). Persists via the existing
  `/api/update-subtasks` (whole `subtasks[]` rewritten to sheet column C). New
  state `editingSubtask` (`{taskId, idx}`) + `subtaskEditDraft`; handler
  `saveSubtaskText`.
- **Task Work Item text is now editable in place** (Workstream Tasks tab). Click
  a task's description → inline textarea; Enter (no Shift) or blur saves, Escape
  cancels, empty/unchanged is a no-op. Persists to **sheet column B** via
  `/api/update-field` with a new field `"description"` (added to `writeField`'s
  union + `fieldHeader` → header "work item"). The row is located by the **old**
  description (passed as `taskDescription`), so the edit lands on the right row
  even as the text changes. State `editingDesc` + `descDraft`; handler
  `saveDescription`. (Note: since task IDs are description-derived when there's no
  Task ID column, editing a description can change that task's derived id on the
  next reload — see the deep-linking blockers above.)
- **Verifying UI changes / "it's not working" triage.** Production `/hundredday`
  is behind **Netlify access-protection (401)** and the claude-in-chrome
  extension is often disconnected, so a session usually **cannot see the live
  site directly**. Local `preview` runs on the **cached-data fallback** (no
  creds), which still exercises all client-side behavior — but writes 500 (that's
  expected, not a bug) and edits don't persist to the Sheet locally. When a
  just-shipped UI change "isn't showing," the first suspect is a **stale Netlify
  bundle in the user's browser → hard-refresh (Cmd+Shift+R)**, then confirm the
  right tab/affordance, before touching code. `npm run build` locally is the
  quickest way to rule out a deploy-blocking build error.

## Jul 21, 2026 session

- **New "Not Started" tab** (see Tabs → item 6). Grouped by workstream, fully
  editable, filtered to current-status = Not Started. Built by adding a
  `filterStatus?: Status100` prop to `HundredDayCard` (reuse — no duplicated edit
  logic; all writes still go through `/api/update-*`, sync untouched) and wiring
  a new tab in `HundredDayDashboard` (`activeTab` union, tab button after Needs
  Action, `nsSearch` state, a cards block that pre-filters `nsWorkstreams`).
  Verified locally on the cached-data fallback: 13 workstream cards render, all
  83 shown task rows are Not Started (0 others), and bumping a task off Not
  Started live-removes it. `npm run build` clean. **Shipped to `main`** in two
  commits: `1c5bf5d` (the tab) and `ec67811` (an unrelated follow-up committing
  the Jul 20 atomic per-day-claim changes to `digest.ts`/`sync-check.mjs`/
  `weekly-reminder.mjs`, which had been sitting uncommitted). The two one-off
  scripts (`backdate-reasons.mjs`, `not-started-report.mjs`) remain intentionally
  untracked.
- **Tab color.** The tab switcher's old `red: boolean` flag was generalized to a
  `tone` ("red" | "yellow"); Needs Action = red (active `#b91c1c` / inactive
  `#e06060`), Not Started = amber (active `#a16207` / inactive `#ca8a04`), all
  others default green-active / gray-inactive. Committed `3deba03`.
- **Gotcha — this repo had no git identity set.** `git commit` failed with
  "Author identity unknown"; set it locally (not `--global`):
  `git config user.name "Benjamin Greenzweig"` + `git config user.email
  "ben@meetradial.com"`.
- **Gotcha — can't confirm a live Netlify deploy from a Claude Code session.**
  After pushing, none of the usual checks work here: `curl` the site → **401**
  (Netlify access-protection), no `netlify` or `gh` CLI installed, the
  `claude-in-chrome` connector reported **no connected browser**, and the
  `Control_Chrome` connector could `reload_tab`/`list_tabs`/`switch_to_tab` but
  its page-read/eval bridge (`get_page_content`, `execute_javascript`) failed
  every time with "Google Chrome is not running." So the honest verification is:
  (1) confirm the commit is on `origin/main` (that's what triggers the build),
  and (2) ask Ben to eyeball the reloaded `/hundredday` tab or the Netlify
  dashboard (`app.netlify.com/projects/mhsintegration`). Don't claim a deploy is
  live from this session without one of those.

## Jul 22, 2026 session

- **Quick-count summaries at the top of Needs Action and Not Started.**
  - Needs Action: a pill row (below the shared "…one team, one mission." headline,
    before the sortable header) showing counts per non-zero health bucket in ORDER
    — `{n} At Risk` / `Blocked` / `Off Track`, each styled from `HEALTH_META` —
    then `· {N} flagged item(s)`. Derived from `items`, so it respects the active
    workstream filter. See Tabs → Needs Action.
  - Not Started: a single pill under the intro paragraph, `{N} item(s) not
    started` (`STATUS_BG`/`STATUS_COLOR["Not Started"]`), the overall total,
    unaffected by the keyword search. See Tabs → item 6.
  - Verified locally on the cached-data fallback: Needs Action shows
    "12 Off Track · 12 flagged items" (0 At Risk / 0 Blocked correctly omitted);
    Not Started shows "83 items not started". `tsc --noEmit` clean.
- **Needs Action grouped by health + clickable count pills.** The flat list is
  now **grouped At Risk → Blocked → Off Track** with a small labeled separator
  (`{HEALTH} {count}` + thin rule) before each group; the top count pills are
  buttons that scroll to their group. Sort groups by `ORDER.indexOf(health)` then
  join date within group; separators keyed by `firstOfGroup`; anchors via
  `groupAnchor(h)` with `scrollMarginTop:90px`. Stepper queue (built from `items`)
  follows the grouped order. Diagnostic `scripts/status-audit.mjs` (untracked)
  confirmed the live sheet has 3 At Risk (all future-dated → compute to At Risk)
  + 2 Blocked, and that `toStatus` was NOT dropping them — the At Risk path was
  already correct; the earlier "not appearing" report was traced to the cached
  fallback (snapshot has 0 At Risk/Blocked), not a code bug. `npm run build`
  clean; local verify limited to the single Off Track group (cached snapshot has
  no At Risk/Blocked).
- **Overview KPI tiles reworked (Needs Action + Not Started).** Renamed the
  "Need attention" tile to **Needs Action** and made its count all flagged
  (At Risk + Blocked + Off Track) so it matches the Needs Action tab; replaced
  the "Off track" tile with **Not Started** (count = status Not Started, matches
  the Not Started tab). Both tiles now link to their **respective tabs** via a
  generic `openTab()` (the old `openNeedsAction` / `linksToNeedsAction`, where
  both tiles went to Needs Action unfiltered, are removed). Verified on the cached
  fallback: Needs Action 9% "12 of 139" (→ Needs Action tab), Not Started 60%
  "83 of 139" (→ Not Started tab); both clickable with correct titles, no new
  console errors, `npm run build` clean. Trade-off (intentional): tiles no longer
  sum to 100% since Not Started overlaps On Track. See Tabs → Overview item 2.
- **KPI tile %-alignment fix.** Only On track has a subtitle
  ("(In Progress/Not Started)"), which pushed its % down a line vs. the other
  three. Now that subtitle `<div>` renders on **every** tile — real text for On
  track, a non-breaking space (`" "`) spacer for the rest — so all four %
  values sit on the same baseline. Verified at 1440px: all four % values share
  `getBoundingClientRect().top`.
