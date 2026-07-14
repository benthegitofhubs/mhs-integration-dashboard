import { google } from "googleapis";
import { readFileSync } from "fs";
import { homedir } from "os";

const sa = JSON.parse(readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8"));
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1Gm5NDC6wpi2TlejZ5Om3065QeXVHevZ7";
const WS_TAB_MAP = {
  "AI-native Brain Medicine Model": "AI-native Brain Medicine Model",
  "Growth - DTC":                   "Growth - DTC",
  "Growth - B2B Referral":          "Growth - B2B Referral Developme",
  "Growth - Lead to Consult":       "Growth - Lead to Consult Conver",
  "Growth - Operational Excellence":"Growth - Operational Excellence",
  "Product-Data-Innovation":        "Product-Data-Innovation",
  "Clinical Excellence":            "Clinical Excellence",
  "Brain Medicine Brand":           "Brain Medicine Brand",
  "Payer Strategy":                 "Payer Strategy",
  "Finance & Accounting":           "Finance & Accounting",
  "IT & Security":                  "IT & Security",
  "People Services":                "People Services",
  "Legal & Regulatory":             "Legal & Regulatory",
  "Communications":                 "Communications",
  "Service Experience":             "Service Experience",
};

const today = new Date();
today.setHours(0, 0, 0, 0);
const start = new Date("2026-07-02");
const end   = new Date("2026-10-09");
const dayElapsed  = Math.floor((today - start) / 86400000);
const dayRemaining = Math.max(0, Math.ceil((end - today) / 86400000));

function toStatus(raw) {
  const valid = ["Not Started","In Progress","At Risk","Blocked","Complete"];
  return valid.includes(raw) ? raw : "Not Started";
}

function calcHealth(tasks) {
  let health = "On Track";
  for (const t of tasks) {
    if (t.status === "Complete") continue;
    const due = t.dueDate ? new Date(t.dueDate) : null;
    if (due && !isNaN(due) && due < today) { health = "Off Track"; break; }
    if (t.status === "Blocked" && health !== "Off Track") health = "Blocked";
    else if (t.status === "At Risk" && !["Off Track","Blocked"].includes(health)) health = "At Risk";
  }
  return health;
}

const results = [];
for (const [wsName, tab] of Object.entries(WS_TAB_MAP)) {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${tab}'!A:N`,
    });
    const rows = (res.data.values ?? []);
    const headerIdx = rows.findIndex(r => r.some(c => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "status"));
    if (headerIdx === -1) { results.push({ name: wsName, health: "On Track", leader: "" }); continue; }
    const header = rows[headerIdx].map(c => c?.toLowerCase().trim());
    const descCol   = header.findIndex(h => h.includes("work item"));
    const statusCol = header.findIndex(h => h === "status");
    const ownerCol  = header.findIndex(h => h === "owner");
    const dueCol    = header.findIndex(h => h.includes("due date"));
    const dataRows  = rows.slice(headerIdx + 1).filter(r => r[descCol]?.trim());
    const tasks = dataRows.map(r => ({
      status:  toStatus(r[statusCol]?.trim()),
      dueDate: r[dueCol]?.trim() || "",
    }));
    const leader = dataRows.map(r => r[ownerCol]?.trim()).find(Boolean) || "";
    results.push({ name: wsName, health: calcHealth(tasks), leader });
  } catch {
    results.push({ name: wsName, health: "On Track", leader: "" });
  }
}

const needsAttention = results.filter(r => r.health !== "On Track");
const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

console.log(JSON.stringify({
  date: dateStr,
  dayElapsed,
  dayRemaining,
  onTrack:  results.filter(r => r.health === "On Track").length,
  atRisk:   results.filter(r => r.health === "At Risk").length,
  blocked:  results.filter(r => r.health === "Blocked").length,
  offTrack: results.filter(r => r.health === "Off Track").length,
  needsAttention,
}));
