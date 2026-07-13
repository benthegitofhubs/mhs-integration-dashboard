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
  "misc":               "Miscellaneous",
};

const SPREADSHEET_ID = "1Gm5NDC6wpi2TlejZ5Om3065QeXVHevZ7";

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
            range: `'${tab}'!A:F`,
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

        if (descCol === -1) return ws;

        // Build a map of description → sheet row index (1-based for API)
        const descToRow: Record<string, number> = {};
        const dataRows = rows.slice(headerIdx + 1);
        dataRows.forEach((r, i) => {
          const desc = r[descCol]?.trim();
          if (desc) descToRow[desc] = headerIdx + 2 + i; // 1-based sheet row
        });

        // Merge sheet data into static task definitions (preserving id, description)
        const updatedTasks: Task100[] = ws.tasks.map((task) => {
          // Find matching row by description substring match
          const matchDesc = Object.keys(descToRow).find(
            (d) => d.slice(0, 40) === task.description.slice(0, 40)
          );
          if (!matchDesc) return task;

          const rowIdx = descToRow[matchDesc] - headerIdx - 2;
          const row = dataRows[rowIdx] ?? [];

          return {
            ...task,
            dueDate: row[dateCol]?.trim() || task.dueDate,
            owner:   row[ownerCol]?.trim() || task.owner,
            status:  toStatus(row[statusCol]?.trim()),
            notes:   row[notesCol]?.trim() || task.notes,
          };
        });

        return { ...ws, tasks: updatedTasks };
      })
    );

    return results;
  } catch (err) {
    console.error("Sheet fetch failed, using static data:", err);
    return WORKSTREAMS_100;
  }
}

// Write a status change back to the sheet.
export async function writeStatus(
  workstreamId: string,
  taskDescription: string,
  newStatus: Status100
): Promise<void> {
  const tab = WS_TAB_MAP[workstreamId];
  if (!tab) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Read the tab to find the row
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab}'!A:F`,
  });
  const rows = (res.data.values ?? []) as string[][];

  const headerIdx = rows.findIndex((r) =>
    r.some((c) => c?.toLowerCase().includes("work item"))
  );
  if (headerIdx === -1) return;

  const header = rows[headerIdx].map((c) => c?.toLowerCase().trim());
  const descCol   = header.findIndex((h) => h.includes("work item"));
  const statusCol = header.findIndex((h) => h === "status");
  if (descCol === -1 || statusCol === -1) return;

  // Find the matching row
  const rowIdx = rows.findIndex(
    (r, i) =>
      i > headerIdx &&
      r[descCol]?.trim().slice(0, 40) === taskDescription.slice(0, 40)
  );
  if (rowIdx === -1) return;

  // Convert column index to letter (A=0, B=1, ...)
  const colLetter = String.fromCharCode(65 + statusCol);
  const range = `'${tab}'!${colLetter}${rowIdx + 1}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [[newStatus]] },
  });
}
