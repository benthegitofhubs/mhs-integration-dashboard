import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";

// Weekly "gentle reminder" for the MHS integration tracker. Posts to the Roam
// Integration Team channel every Friday at 12pm ET (via the scheduled task
// `mhs-integration-weekly-reminder`, which relays this script's stdout).
//
// It tracks two independent housekeeping metrics across all workstreams:
//   • tasks still Not Started
//   • tasks with no Due Date
// Each metric's section appears only while its count is > 0, so the reminder
// SUNSETS on its own: when a metric first reaches 0 it prints a one-time
// "congrats" line (state remembered in ~/.mhs_weekly_reminder_state.json), and
// once BOTH are 0 it prints a final sign-off and then stays SILENT thereafter.
// If a metric regresses above 0 later, its section (and future congrats) resume.
//
// Output contract: prints the exact Roam message to stdout, or the literal
// token "SILENT" when there is nothing to post. Pass --dry-run to compute and
// print without writing the state file (used for previews/testing).

const DRY_RUN = process.argv.includes("--dry-run");
const STATE_FILE = `${homedir()}/.mhs_weekly_reminder_state.json`;
const TRACKER_URL = "https://mhsintegration.netlify.app/hundredday";
const GROUP_HINT = "Roam Integration Team channel";

const sa = JSON.parse(readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8"));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1FzP8ePYCDHoBxx8bW0Ft2mbLEqfzYNmf2zobBF8pbvA";

// tab -> display name
const TABS = {
  "AI-native Brain Medicine Model":       "AI-native Brain Medicine Model",
  "Growth - DTC":                         "Growth — DTC",
  "Growth - B2B Referral Development":    "Growth — B2B Referral",
  "Growth - Lead to Consult Conversion":  "Growth — Lead to Consult",
  "Growth - Operational Excellence":      "Growth — Operational Excellence",
  "Product-Data-Innovation":              "Product, Data & Innovation",
  "Clinical Excellence":                  "Clinical Excellence",
  "Brain Medicine Brand":                 "Brain Medicine Brand",
  "Payer Strategy":                       "Payer Strategy",
  "Finance & Accounting":                 "Finance & Accounting",
  "IT & Security":                        "IT & Security",
  "People Services":                      "People Services",
  "Legal & Regulatory":                   "Legal & Regulatory",
  "Communications":                       "Communications",
  "Service Experience":                   "Service Experience",
};

const at = (r, i) => (i !== -1 ? (r[i]?.trim() || "") : "");
// Tidy sheet leader strings: normalize spacing around / and , separators.
const cleanLeader = (s) =>
  (s || "").replace(/\s*\/\s*/g, " / ").replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim();

const workstreams = [];
for (const [tab, name] of Object.entries(TABS)) {
  let rows = [];
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${tab}'!A:N` });
    rows = res.data.values ?? [];
  } catch (e) {
    process.stderr.write(`skip ${tab}: ${e}\n`);
    continue;
  }
  const headerIdx = rows.findIndex((r) => r.some((c) => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "status"));
  if (headerIdx === -1) continue;
  const leaderRow = rows.slice(0, headerIdx).find((r) => r[0]?.toLowerCase().startsWith("leader:"));
  const leader = cleanLeader(leaderRow ? (leaderRow[0].match(/^Leader:\s*([^|]+)/i)?.[1] || "") : "");
  const header = rows[headerIdx].map((c) => c?.toLowerCase().trim() ?? "");
  const col = {
    workItem: header.findIndex((h) => h.includes("work item")),
    status:   header.findIndex((h) => h === "status"),
    dueDate:  header.findIndex((h) => h.includes("due date")),
  };
  if (col.workItem === -1 || col.status === -1) continue;

  let total = 0, notStarted = 0, missingDue = 0;
  for (const r of rows.slice(headerIdx + 1)) {
    if (!at(r, col.workItem)) continue;
    total++;
    if (at(r, col.status) === "Not Started") notStarted++;
    if (!at(r, col.dueDate)) missingDue++;
  }
  workstreams.push({ name, leader, total, notStarted, missingDue });
}

const cur = workstreams.reduce(
  (a, w) => ({ notStarted: a.notStarted + w.notStarted, missingDue: a.missingDue + w.missingDue }),
  { notStarted: 0, missingDue: 0 }
);

// Test hook: --test-ns=N / --test-md=M override the grand totals so the
// sunset/congrats states can be exercised without touching the sheet. No
// effect in normal runs. (Always combine with --dry-run.)
for (const a of process.argv) {
  const m = a.match(/^--test-(ns|md)=(\d+)$/);
  if (m) cur[m[1] === "ns" ? "notStarted" : "missingDue"] = Number(m[2]);
}

// Prior counts for one-time congrats detection.
let prev = null;
if (existsSync(STATE_FILE)) {
  try { prev = JSON.parse(readFileSync(STATE_FILE, "utf8")); } catch { prev = null; }
}
const crossedToZero = (key) => prev && prev[key] > 0 && cur[key] === 0;
const congratsStarted = crossedToZero("notStarted");
const congratsDated   = crossedToZero("missingDue");

// Persist current counts for next week (unless dry-run).
if (!DRY_RUN) writeFileSync(STATE_FILE, JSON.stringify({ notStarted: cur.notStarted, missingDue: cur.missingDue }));

const dateStr = new Date().toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });

const section = (key, emoji, count, label) => {
  const lines = [`${emoji}  **${count} ${label}** — by workstream:`, ""];
  workstreams
    .filter((w) => w[key] > 0)
    .sort((a, b) => b[key] - a[key] || a.name.localeCompare(b.name))
    .forEach((w) => { lines.push(`• ${w.name} · ${w.leader} — **${w[key]}**`); lines.push(""); });
  return lines;
};

// Nothing outstanding and nothing to celebrate → stay quiet.
if (cur.notStarted === 0 && cur.missingDue === 0 && !congratsStarted && !congratsDated) {
  process.stdout.write("SILENT\n");
  process.exit(0);
}

const out = [];
const bothClear = cur.notStarted === 0 && cur.missingDue === 0;

if (bothClear && (congratsStarted || congratsDated)) {
  // Final sign-off: the last remaining metric just reached zero.
  out.push("🎉  **Weekly reminder — signing off.**");
  out.push("");
  out.push("Every task across all 15 workstreams is now **started** and has a **due date**. This reminder has done its job and will stop here. Onward. 🚀");
  process.stdout.write(out.join("\n") + "\n");
  process.exit(0);
}

out.push(`🌱  **Weekly reminder — ${dateStr}**`);
out.push("");
out.push("A gentle check-in on two housekeeping items. No action needed beyond a look when you have a minute.");
out.push("");

if (congratsStarted) {
  out.push("🎉  **Congrats team — every task is now started.** Nothing left in “Not Started” across all 15 workstreams.");
  out.push("");
}
if (congratsDated) {
  out.push("🎉  **Congrats team — every task now has a due date.**");
  out.push("");
}

if (cur.notStarted > 0) out.push(...section("notStarted", "⏳", cur.notStarted, "tasks haven’t started yet"));
// Space + horizontal rule between the two sections when both are shown.
if (cur.notStarted > 0 && cur.missingDue > 0) {
  out.push("─────────────────────");
  out.push("");
}
if (cur.missingDue > 0) out.push(...section("missingDue", "📅", cur.missingDue, "tasks don’t have a due date yet"));

out.push(`🔗  [View full tracker](${TRACKER_URL})`);
process.stdout.write(out.join("\n") + "\n");
