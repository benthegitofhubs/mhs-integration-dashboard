import { google } from "googleapis";
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { homedir } from "os";

// Daily two-way sync health check for the Integration app <-> Google Sheet.
// Exercises the SAME service account the deployed app uses, in both directions:
//   • READ  — pulls real task data from a workstream tab (the app's read source)
//   • WRITE — write -> read-back a canary cell in a dedicated "Sync Canary" tab
//             (zero risk to task data; proves the app's write credential works)
// Also confirms the live site is reachable (401 = up-but-access-protected).
//
// Prints a Roam-ready status message to stdout. Exits 0 when healthy, 1 when not,
// so the scheduled task can flag failures. Best-effort and fully self-contained.

const SPREADSHEET_ID = "1FzP8ePYCDHoBxx8bW0Ft2mbLEqfzYNmf2zobBF8pbvA";
const SITE = "https://mhsintegration.netlify.app/hundredday";
const READ_TAB = "Service Experience";      // any real workstream tab
const CANARY_TAB = "Sync Canary";
const at = (r, i) => (i !== -1 ? (r[i]?.trim() || "") : "");

const nowET = new Date().toLocaleString("en-US", {
  timeZone: "America/New_York", month: "short", day: "numeric",
  hour: "numeric", minute: "2-digit", hour12: true,
}) + " ET";

// Idempotency: only post once per ET day, even when several Claude Code
// sessions are open and each fires this scheduled task independently. We claim
// today's slot ATOMICALLY up front (O_EXCL create) — the first session to run
// wins and proceeds; any other session the same day gets EEXIST and prints the
// literal "SILENT" token so the scheduled task relays nothing. Claiming BEFORE
// the slow sheet round-trip closes the race where two sessions spawn ~1s apart.
// Old claim files are swept. Pass --force to bypass (e.g. manual testing).
const FORCE = process.argv.includes("--force");
const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD ET
const CLAIM_FILE = `${homedir()}/.mhs_sync_check.${todayISO}.claim`;
const CLAIM_RE = /^\.mhs_sync_check\.\d{4}-\d{2}-\d{2}\.claim$/;
if (!FORCE) {
  try {
    writeFileSync(CLAIM_FILE, new Date().toISOString() + "\n", { flag: "wx" });
  } catch (e) {
    if (e?.code === "EEXIST") { process.stdout.write("SILENT\n"); process.exit(0); }
    // any other fs error: fail open and post rather than go dark
  }
  try {
    for (const f of readdirSync(homedir()))
      if (CLAIM_RE.test(f) && f !== `.mhs_sync_check.${todayISO}.claim`)
        try { unlinkSync(`${homedir()}/${f}`); } catch {}
  } catch {}
}

const checks = { site: "", read: "", write: "" };
let healthy = true;
const fail = (k, msg) => { checks[k] = `FAIL — ${msg}`; healthy = false; };

// 1. Site reachable? (401 = deployed & protected, which is expected)
try {
  const r = await fetch(SITE, { method: "HEAD" });
  checks.site = (r.status === 200 || r.status === 401) ? "reachable" : `unexpected HTTP ${r.status}`;
  if (!(r.status === 200 || r.status === 401)) healthy = false;
} catch (e) {
  fail("site", `unreachable (${e.message || e})`);
}

// 2 + 3. Read real task data, then write -> read-back a canary.
try {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8")),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  // READ side — count real tasks in a workstream tab.
  try {
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${READ_TAB}'!A:N` });
    const rows = res.data.values ?? [];
    const hi = rows.findIndex((r) => r.some((c) => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "status"));
    const descCol = hi !== -1 ? rows[hi].findIndex((c) => c?.toLowerCase().includes("work item")) : -1;
    const taskCount = hi !== -1 && descCol !== -1 ? rows.slice(hi + 1).filter((r) => at(r, descCol)).length : 0;
    if (taskCount > 0) checks.read = `OK (${taskCount} tasks read from “${READ_TAB}”)`;
    else fail("read", `no tasks parsed from “${READ_TAB}”`);
  } catch (e) {
    fail("read", `sheet read failed (${e.message || e})`);
  }

  // WRITE side — canary round-trip in a dedicated tab.
  try {
    try {
      await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${CANARY_TAB}'!A1` });
    } catch {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests: [{ addSheet: { properties: { title: CANARY_TAB } } }] },
      });
    }
    const canary = `sync-check ${new Date().toISOString()}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID, range: `'${CANARY_TAB}'!A1`,
      valueInputOption: "RAW", requestBody: { values: [[canary]] },
    });
    const back = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `'${CANARY_TAB}'!A1` });
    if (back.data.values?.[0]?.[0] === canary) checks.write = "OK (write → read-back verified)";
    else fail("write", "read-back did not match the written value");
  } catch (e) {
    fail("write", `sheet write failed (${e.message || e})`);
  }
} catch (e) {
  fail("read", `auth failed (${e.message || e})`);
  fail("write", `auth failed (${e.message || e})`);
}

const line = (label, val) => `• ${label}: ${val}`;
const out = [];
if (healthy) {
  out.push(`✅  **Integration app ↔ Google Sheet — sync healthy** (${nowET})`);
  out.push("");
  out.push(line("Live site reachable", checks.site));
  out.push(line("Reads from the Sheet", checks.read));
  out.push(line("Writes back to the Sheet", checks.write));
  out.push("");
  out.push("App and Sheet are in two-way sync.");
} else {
  out.push(`⚠️  **Integration app ↔ Google Sheet — sync problem** (${nowET})`);
  out.push("");
  out.push(line("Live site reachable", checks.site || "not checked"));
  out.push(line("Reads from the Sheet", checks.read || "not checked"));
  out.push(line("Writes back to the Sheet", checks.write || "not checked"));
  out.push("");
  out.push("Two-way sync needs a look. 🔗 https://mhsintegration.netlify.app/hundredday");
}
process.stdout.write(out.join("\n") + "\n");
process.exit(healthy ? 0 : 1);
