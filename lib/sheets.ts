import { google } from "googleapis";
import { Workstream100, Task100, Status100, WORKSTREAMS_100 } from "./hundredday";

// Map workstream id → sheet tab name
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

const SPREADSHEET_ID = "1FzP8ePYCDHoBxx8bW0Ft2mbLEqfzYNmf2zobBF8pbvA";

const VALID_STATUSES = new Set<Status100>([
  "Not Started", "In Progress", "At Risk", "Blocked", "Complete",
]);

function toStatus(raw: string | undefined): Status100 {
  if (raw && VALID_STATUSES.has(raw as Status100)) return raw as Status100;
  return "Not Started";
}

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var not set");
  const creds = JSON.parse(json);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// Fetch all workstreams live from the sheet.
// Falls back to static data if the sheet is unreachable.
export async function fetchWorkstreams(): Promise<Workstream100[]> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const results = await Promise.all(
      WORKSTREAMS_100.map(async (ws) => {
        const tab = WS_TAB_MAP[ws.id];
        if (!tab) return ws; // no tab mapping — return static

        let rows: string[][];
        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${tab}'!A:N`,
          });
          rows = (res.data.values ?? []) as string[][];
        } catch {
          return ws; // tab not found — return static
        }

        // Find the header row (contains "Work Item" or "Status")
        const headerIdx = rows.findIndex((r) =>
          r.some((c) => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "status")
        );
        if (headerIdx === -1) return ws;

        // Detect column positions from header
        const header = rows[headerIdx].map((c) => c?.toLowerCase().trim());
        const descCol   = header.findIndex((h) => h.includes("work item"));
        const dateCol   = header.findIndex((h) => h.includes("due date"));
        const ownerCol  = header.findIndex((h) => h === "owner");
        const statusCol = header.findIndex((h) => h === "status");
        const notesCol  = header.findIndex((h) => h.includes("notes"));
        const idCol     = header.findIndex((h) => h === "task id");

        if (descCol === -1) return ws;

        // Parse leader from "Leader: X | Supporting: ..." header row above the column headers
        const leaderRow = rows.slice(0, headerIdx).find(r =>
          r[0]?.toLowerCase().startsWith("leader:")
        );
        const leaderFromSheet = leaderRow
          ? (leaderRow[0].match(/^Leader:\s*([^|]+)/i)?.[1]?.trim() || "")
          : "";

        const dataRows = rows.slice(headerIdx + 1);

        // Build lookup: taskId → static task (for stable id/description)
        const staticById: Record<string, Task100> = {};
        const staticByDesc: Record<string, Task100> = {};
        ws.tasks.forEach((t) => {
          staticById[t.id] = t;
          staticByDesc[t.description.slice(0, 40)] = t;
        });

        // Drive task list from sheet rows — rows deleted from sheet disappear from app
        const updatedTasks: Task100[] = dataRows
          .filter((r) => r[descCol]?.trim())
          .map((r, i) => {
            const sheetId = idCol !== -1 ? r[idCol]?.trim() : "";
            const desc = r[descCol].trim();
            const staticTask =
              (sheetId ? staticById[sheetId] : null) ??
              staticByDesc[desc.slice(0, 40)] ??
              null;
            return {
              id:          sheetId || staticTask?.id || `${ws.id}-row${i}`,
              description: desc,
              dueDate:     r[dateCol]?.trim() || staticTask?.dueDate || "",
              owner:       r[ownerCol]?.trim() || staticTask?.owner || "",
              status:      toStatus(r[statusCol]?.trim()),
              notes:       r[notesCol]?.trim() || staticTask?.notes || "",
            };
          });

        return { ...ws, tasks: updatedTasks, leader: leaderFromSheet || ws.leader };
      })
    );

    return results;
  } catch (err) {
    console.error("Sheet fetch failed, using static data:", err);
    return WORKSTREAMS_100;
  }
}

// Write any single field back to the sheet by task ID.
export async function writeField(
  workstreamId: string,
  taskId: string,
  taskDescription: string,
  field: "status" | "dueDate" | "owner",
  value: string
): Promise<void> {
  const fieldHeader: Record<string, string> = {
    status:  "status",
    dueDate: "due date",
    owner:   "owner",
  };

  const tab = WS_TAB_MAP[workstreamId];
  if (!tab) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A:N`,
  });
  const rows = (res.data.values ?? []) as string[][];

  const headerIdx = rows.findIndex((r) =>
    r.some((c) => c?.toLowerCase().includes("work item"))
  );
  if (headerIdx === -1) return;

  const header = rows[headerIdx].map((c) => c?.toLowerCase().trim());
  const targetCol = header.findIndex((h) => h.includes(fieldHeader[field]));
  const descCol   = header.findIndex((h) => h.includes("work item"));
  const idCol     = header.findIndex((h) => h === "task id");
  if (targetCol === -1) return;

  let rowIdx = -1;
  if (idCol !== -1) {
    rowIdx = rows.findIndex((r, i) => i > headerIdx && r[idCol]?.trim() === taskId);
  }
  if (rowIdx === -1) {
    rowIdx = rows.findIndex(
      (r, i) => i > headerIdx && r[descCol]?.trim().slice(0, 40) === taskDescription.slice(0, 40)
    );
  }
  if (rowIdx === -1) return;

  const colLetter = String.fromCharCode(65 + targetCol);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!${colLetter}${rowIdx + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[value]] },
  });
}

// Write a status change back to the sheet.
// Matches by task ID in column N first; falls back to description match.
export async function writeStatus(
  workstreamId: string,
  taskDescription: string,
  newStatus: Status100,
  taskId?: string
): Promise<void> {
  const tab = WS_TAB_MAP[workstreamId];
  if (!tab) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A:N`,
  });
  const rows = (res.data.values ?? []) as string[][];

  const headerIdx = rows.findIndex((r) =>
    r.some((c) => c?.toLowerCase().includes("work item"))
  );
  if (headerIdx === -1) return;

  const header = rows[headerIdx].map((c) => c?.toLowerCase().trim());
  const descCol   = header.findIndex((h) => h.includes("work item"));
  const statusCol = header.findIndex((h) => h === "status");
  const idCol     = header.findIndex((h) => h === "task id");
  if (descCol === -1 || statusCol === -1) return;

  // Find matching row: prefer ID column, fall back to description
  let rowIdx = -1;
  if (taskId && idCol !== -1) {
    rowIdx = rows.findIndex((r, i) => i > headerIdx && r[idCol]?.trim() === taskId);
  }
  if (rowIdx === -1) {
    rowIdx = rows.findIndex(
      (r, i) =>
        i > headerIdx &&
        r[descCol]?.trim().slice(0, 40) === taskDescription.slice(0, 40)
    );
  }
  if (rowIdx === -1) return;

  const colLetter = String.fromCharCode(65 + statusCol);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!${colLetter}${rowIdx + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[newStatus]] },
  });
}
