import { google } from "googleapis";
import { Workstream100, Task100, Status100, Subtask, WORKSTREAMS_100 } from "./hundredday";

function parseSubtasks(raw: string | undefined): Subtask[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const done = /^\[x\]/i.test(line);
      const text = line.replace(/^\[[x ]\]\s*/i, "").trim();
      return { text, done };
    });
}

function serializeSubtasks(subtasks: Subtask[]): string {
  return subtasks.map((s) => `${s.done ? "[x]" : "[ ]"} ${s.text}`).join("\n");
}

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

// Order of workstreams as they appear (top to bottom) in the "Dashboard" tab,
// which is the source of truth for workstream display names (column B).
// Workstreams not listed here (e.g. Service Experience) keep their static name.
const DASHBOARD_ID_ORDER = [
  "ai-brain-medicine", "dtc", "b2b", "ltc", "ops-excellence", "product-data",
  "finance", "it-security", "people", "legal", "comms", "clinical-perf",
  "payer", "brain-medicine", "misc",
];

// Read canonical workstream names from Dashboard!B (source of truth).
// Returns id → name. Positional match anchored to the "Workstream" header row.
async function fetchDashboardNames(
  sheets: ReturnType<typeof google.sheets>
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'Dashboard'!A1:B40",
    });
    const rows = (res.data.values ?? []) as string[][];
    const headerIdx = rows.findIndex((r) => r[1]?.toLowerCase().trim() === "workstream");
    if (headerIdx === -1) return map;
    const dataRows = rows
      .slice(headerIdx + 1)
      .map((r) => r[1]?.trim() || "")
      .filter((name) => name && name.toUpperCase() !== "TOTAL");
    dataRows.forEach((name, i) => {
      const id = DASHBOARD_ID_ORDER[i];
      if (id) map[id] = name;
    });
  } catch {
    // Dashboard unreadable — fall back to static names
  }
  return map;
}

// Fetch all workstreams live from the sheet.
// Falls back to static data if the sheet is unreachable.
export async function fetchWorkstreams(): Promise<Workstream100[]> {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const dashboardNames = await fetchDashboardNames(sheets);

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
        const rankCol    = header.findIndex((h) => h.includes("ranking"));
        const descCol    = header.findIndex((h) => h.includes("work item"));
        const subtaskCol = header.findIndex((h) => h.includes("subtask"));
        const dateCol    = header.findIndex((h) => h.includes("due date"));
        const acctCol    = header.findIndex((h) => h === "accountable" || h === "owner");
        const respCol    = header.findIndex((h) => h === "responsible");
        const consCol    = header.findIndex((h) => h === "consulted");
        const infoCol    = header.findIndex((h) => h === "informed");
        const statusCol  = header.findIndex((h) => h === "status");
        const notesCol   = header.findIndex((h) => h.includes("notes"));
        const idCol      = header.findIndex((h) => h === "task id");

        if (descCol === -1) return ws;

        // Parse leader and status override from header rows above the column headers
        const headerRows = rows.slice(0, headerIdx);
        const leaderRow = headerRows.find(r => r[0]?.toLowerCase().startsWith("leader:"));
        const leaderFromSheet = leaderRow
          ? (leaderRow[0].match(/^Leader:\s*([^|]+)/i)?.[1]?.trim() || "")
          : "";
        const statusRow = headerRows.find(r => r[0]?.toLowerCase().startsWith("status:"));
        const statusOverride = statusRow
          ? (statusRow[0].match(/^Status:\s*(.+)/i)?.[1]?.trim() || null)
          : null;

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
            const rankRaw = rankCol !== -1 ? r[rankCol]?.trim() : "";
            const rankNum = rankRaw ? parseInt(rankRaw, 10) : NaN;
            return {
              id:          sheetId || staticTask?.id || `${ws.id}-row${i}`,
              description: desc,
              ranking:     isNaN(rankNum) ? null : rankNum,
              subtasks:    parseSubtasks(subtaskCol !== -1 ? r[subtaskCol] : ""),
              dueDate:     r[dateCol]?.trim() || staticTask?.dueDate || "",
              accountable: (acctCol !== -1 ? r[acctCol]?.trim() : "") || staticTask?.accountable || "",
              responsible: (respCol !== -1 ? r[respCol]?.trim() : "") || staticTask?.responsible || "",
              consulted:   (consCol !== -1 ? r[consCol]?.trim() : "") || staticTask?.consulted || "",
              informed:    (infoCol !== -1 ? r[infoCol]?.trim() : "") || staticTask?.informed || "",
              status:      toStatus(r[statusCol]?.trim()),
              notes:       r[notesCol]?.trim() || staticTask?.notes || "",
            };
          });

        return { ...ws, tasks: updatedTasks, leader: leaderFromSheet || ws.leader, statusOverride: statusOverride ?? ws.statusOverride };
      })
    );

    // Apply canonical workstream names from the Dashboard tab (source of truth)
    return results.map((ws) => ({ ...ws, name: dashboardNames[ws.id] || ws.name }));
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
  field: "status" | "dueDate" | "accountable" | "responsible" | "consulted" | "informed",
  value: string
): Promise<void> {
  const fieldHeader: Record<string, string> = {
    status:      "status",
    dueDate:     "due date",
    accountable: "accountable",
    responsible: "responsible",
    consulted:   "consulted",
    informed:    "informed",
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

// Update the Leader name in the "Leader: X | Supporting: ..." header row.
export async function writeLeader(workstreamId: string, newLeader: string): Promise<void> {
  const tab = WS_TAB_MAP[workstreamId];
  if (!tab) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A1:A10`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const leaderRowIdx = rows.findIndex((r) => r[0]?.toLowerCase().startsWith("leader:"));
  if (leaderRowIdx === -1) return;

  const current = rows[leaderRowIdx][0];
  const supporting = current.match(/\|(.*)$/)?.[1]?.trim() || "";
  const updated = supporting ? `Leader: ${newLeader}  |  ${supporting}` : `Leader: ${newLeader}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A${leaderRowIdx + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[updated]] },
  });
}

// Write or clear the manual status override in the sheet header.
export async function writeStatusOverride(workstreamId: string, status: string | null): Promise<void> {
  const tab = WS_TAB_MAP[workstreamId];
  if (!tab) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A1:A10`,
  });
  const rows = (res.data.values ?? []) as string[][];
  const headerIdx = rows.findIndex((r) =>
    r.some((c) => c?.toLowerCase().includes("work item") || c?.toLowerCase() === "ranking #")
  );
  const statusRowIdx = rows.findIndex((r) => r[0]?.toLowerCase().startsWith("status:"));

  if (status === null) {
    // Clear the override — blank the cell
    if (statusRowIdx !== -1) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${tab}'!A${statusRowIdx + 1}`,
        valueInputOption: "RAW",
        requestBody: { values: [[""]] },
      });
    }
    return;
  }

  // Find where to write: existing Status row, or first empty row before header
  let targetRow = statusRowIdx !== -1
    ? statusRowIdx + 1
    : (headerIdx > 1 ? headerIdx : 5); // fallback to row 5 if no empty slot found

  if (statusRowIdx === -1 && headerIdx !== -1) {
    // Find first empty row before the header
    for (let i = headerIdx - 1; i >= 0; i--) {
      if (!rows[i]?.[0]?.trim()) { targetRow = i + 1; break; }
    }
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A${targetRow}`,
    valueInputOption: "RAW",
    requestBody: { values: [[`Status: ${status}`]] },
  });
}

// Write subtasks back to the sheet for a given task.
export async function writeSubtasks(
  workstreamId: string,
  taskDescription: string,
  subtasks: Subtask[],
  taskId?: string
): Promise<void> {
  const tab = WS_TAB_MAP[workstreamId];
  if (!tab) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A:P`,
  });
  const rows = (res.data.values ?? []) as string[][];

  const headerIdx = rows.findIndex((r) =>
    r.some((c) => c?.toLowerCase().includes("work item"))
  );
  if (headerIdx === -1) return;

  const header = rows[headerIdx].map((c) => c?.toLowerCase().trim());
  const descCol     = header.findIndex((h) => h.includes("work item"));
  const subtaskCol  = header.findIndex((h) => h.includes("subtask"));
  const idCol       = header.findIndex((h) => h === "task id");
  if (descCol === -1 || subtaskCol === -1) return;

  let rowIdx = -1;
  if (taskId && idCol !== -1) {
    rowIdx = rows.findIndex((r, i) => i > headerIdx && r[idCol]?.trim() === taskId);
  }
  if (rowIdx === -1) {
    rowIdx = rows.findIndex(
      (r, i) => i > headerIdx && r[descCol]?.trim().slice(0, 40) === taskDescription.slice(0, 40)
    );
  }
  if (rowIdx === -1) return;

  const colLetter = String.fromCharCode(65 + subtaskCol);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!${colLetter}${rowIdx + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [[serializeSubtasks(subtasks)]] },
  });
}
