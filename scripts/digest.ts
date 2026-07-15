import { google } from "googleapis";
import { readFileSync } from "fs";
import { homedir } from "os";
import { WORKSTREAMS_100, Status100 } from "../lib/hundredday";
import { calcTaskHealth, rollupWorkstreamHealth } from "../lib/taskHealth";

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

function toStatus(raw: string | undefined): Status100 {
  const valid: Status100[] = ["Not Started","In Progress","At Risk","Blocked","Complete"];
  return valid.includes(raw as Status100) ? (raw as Status100) : "Not Started";
}

async function main() {
  const sa = JSON.parse(readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8"));
  const auth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date("2026-06-23");
  const end   = new Date("2026-10-01");
  const dayElapsed   = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const dayRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));

  const results: Array<{ name: string; health: string; leader: string }> = [];

  for (const ws of WORKSTREAMS_100) {
    const tab = WS_TAB_MAP[ws.id];
    const staticHealth = () => {
      const h = rollupWorkstreamHealth(ws.tasks.map(t => calcTaskHealth(t, today)));
      return h ?? "On Track";
    };

    if (!tab) {
      results.push({ name: ws.name, health: staticHealth(), leader: ws.leader || "" });
      continue;
    }

    let sheetRows: string[][] = [];
    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${tab}'!A:N`,
      });
      sheetRows = (res.data.values ?? []) as string[][];
    } catch {
      // Office file or permission error — fall back to static data (matches app behaviour)
      results.push({ name: ws.name, health: staticHealth(), leader: ws.leader || "" });
      continue;
    }

    const headerIdx = sheetRows.findIndex(r =>
      r.some(c => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "status")
    );
    if (headerIdx === -1) {
      results.push({ name: ws.name, health: staticHealth(), leader: ws.leader || "" });
      continue;
    }

    // Parse leader from the "Leader: X | Supporting: ..." header row
    const leaderRow = sheetRows.slice(0, headerIdx).find(r =>
      r[0]?.toLowerCase().startsWith("leader:")
    );
    const leaderFromSheet = leaderRow
      ? (leaderRow[0].match(/^Leader:\s*([^|]+)/i)?.[1]?.trim() || "")
      : "";

    const header = sheetRows[headerIdx].map(c => c?.toLowerCase().trim());
    const descCol   = header.findIndex(h => h.includes("work item"));
    const statusCol = header.findIndex(h => h === "status");
    const dueCol    = header.findIndex(h => h.includes("due date"));
    const notesCol  = header.findIndex(h => h.includes("notes"));

    if (descCol === -1) {
      results.push({ name: ws.name, health: staticHealth(), leader: leaderFromSheet || ws.leader || "" });
      continue;
    }

    const dataRows = sheetRows.slice(headerIdx + 1).filter(r => r[descCol]?.trim());
    if (dataRows.length === 0) {
      results.push({ name: ws.name, health: staticHealth(), leader: leaderFromSheet || ws.leader || "" });
      continue;
    }

    const tasks = dataRows.map((r, i) => ({
      id:          `${ws.id}-row${i}`,
      description: r[descCol]?.trim() ?? "",
      status:      toStatus(r[statusCol]?.trim()),
      dueDate:     dueCol !== -1 ? (r[dueCol]?.trim() || "") : "",
      owner:       "",
      notes:       notesCol !== -1 ? (r[notesCol]?.trim() || "") : "",
    }));

    const leader = leaderFromSheet || ws.leader || "";
    const health = rollupWorkstreamHealth(tasks.map(t => calcTaskHealth(t, today))) ?? "On Track";
    results.push({ name: ws.name, health, leader });
  }

  const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const out = {
    date: dateStr,
    dayElapsed,
    dayRemaining,
    onTrack:  results.filter(r => r.health === "On Track").length,
    atRisk:   results.filter(r => r.health === "At Risk").length,
    blocked:  results.filter(r => r.health === "Blocked").length,
    offTrack: results.filter(r => r.health === "Off Track").length,
    needsAttention: results.filter(r => r.health !== "On Track"),
  };
  process.stdout.write(JSON.stringify(out) + "\n");
}

main().catch(e => { process.stderr.write(String(e) + "\n"); process.exit(1); });
