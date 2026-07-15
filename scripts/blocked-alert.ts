import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { WORKSTREAMS_100 } from "../lib/hundredday";

// Emits JSON describing every task currently marked "Blocked" across all
// workstream tabs, with its RACI assignment and workstream owner. Powers the
// blocked-task Roam alert (test = DM to Ben; live = Integration Team channel).
//
// Modes:
//   (default)    print every currently-blocked task; touches no state.
//   --new-only   print only tasks that became Blocked since the last run,
//                using a state file of previously-seen blocked tasks. Used by
//                the daily 5pm ET scheduled task so lingering blockers aren't
//                re-announced every evening. A task that unblocks then blocks
//                again will re-alert.

const NEW_ONLY = process.argv.includes("--new-only");
const STATE_FILE = `${homedir()}/.mhs_blocked_seen.json`;

const SPREADSHEET_ID = "1FzP8ePYCDHoBxx8bW0Ft2mbLEqfzYNmf2zobBF8pbvA";
const WS_TAB_MAP: Record<string, string> = {
  "ai-brain-medicine":  "AI-native Brain Medicine Model",
  "dtc":                "Growth - DTC",
  "b2b":                "Growth - B2B Referral Developme",
  "ltc":                "Growth - Lead to Consult Conver",
  "ops-excellence":     "Growth - Operational Excellence",
  "product-data":       "Product-Data-Innovation",
  "clinical-perf":      "Clinical Excellence",
  "brain-medicine":     "Brain Medicine Brand",
  "payer":              "Payer Strategy",
  "finance":            "Finance & Accounting",
  "it-security":        "IT & Security",
  "people":             "People Services",
  "legal":              "Legal & Regulatory",
  "comms":              "Communications",
  "misc":               "Service Experience",
};

type BlockedTask = {
  workstream: string;
  owner: string;        // workstream leader
  workItem: string;
  accountable: string;
  responsible: string;
  consulted: string;
  informed: string;
  dueDate: string;
  notes: string;
};

async function main() {
  const sa = JSON.parse(readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const asOf = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const blocked: BlockedTask[] = [];

  for (const ws of WORKSTREAMS_100) {
    const tab = WS_TAB_MAP[ws.id];
    if (!tab) continue;

    let rows: string[][] = [];
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${tab}'!A:N`,
      });
      rows = (res.data.values ?? []) as string[][];
    } catch {
      continue; // Office file / permission error — skip (matches digest behaviour)
    }

    const headerIdx = rows.findIndex(r =>
      r.some(c => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "status")
    );
    if (headerIdx === -1) continue;

    // Leader from the "Leader: X | Supporting: ..." row above the header
    const leaderRow = rows.slice(0, headerIdx).find(r => r[0]?.toLowerCase().startsWith("leader:"));
    const owner = leaderRow
      ? (leaderRow[0].match(/^Leader:\s*([^|]+)/i)?.[1]?.trim() || ws.leader || "")
      : (ws.leader || "");

    const header = rows[headerIdx].map(c => c?.toLowerCase().trim() ?? "");
    const col = {
      workItem:    header.findIndex(h => h.includes("work item")),
      accountable: header.findIndex(h => h === "accountable"),
      responsible: header.findIndex(h => h === "responsible"),
      consulted:   header.findIndex(h => h === "consulted"),
      informed:    header.findIndex(h => h === "informed"),
      status:      header.findIndex(h => h === "status"),
      dueDate:     header.findIndex(h => h.includes("due date")),
      notes:       header.findIndex(h => h.includes("notes")),
    };
    if (col.workItem === -1 || col.status === -1) continue;

    const at = (r: string[], i: number) => (i !== -1 ? (r[i]?.trim() || "") : "");

    for (const r of rows.slice(headerIdx + 1)) {
      const workItem = at(r, col.workItem);
      if (!workItem) continue;
      if (at(r, col.status) !== "Blocked") continue;
      blocked.push({
        workstream:  ws.name,
        owner,
        workItem,
        accountable: at(r, col.accountable),
        responsible: at(r, col.responsible),
        consulted:   at(r, col.consulted),
        informed:    at(r, col.informed),
        dueDate:     at(r, col.dueDate),
        notes:       at(r, col.notes),
      });
    }
  }

  const keyOf = (b: BlockedTask) => `${b.workstream}||${b.workItem}`;
  let toReport = blocked;

  if (NEW_ONLY) {
    let seen: string[] = [];
    if (existsSync(STATE_FILE)) {
      try { seen = JSON.parse(readFileSync(STATE_FILE, "utf8")); } catch { seen = []; }
    }
    const seenSet = new Set(seen);
    toReport = blocked.filter(b => !seenSet.has(keyOf(b)));
    // Reset state to the CURRENT blocked set so unblocked tasks drop out and
    // can re-alert if they return; write only after computing new items.
    writeFileSync(STATE_FILE, JSON.stringify(blocked.map(keyOf)));
  }

  process.stdout.write(JSON.stringify({ asOf, count: toReport.length, blocked: toReport }, null, 2) + "\n");
}

main().catch(e => { process.stderr.write(String(e) + "\n"); process.exit(1); });
