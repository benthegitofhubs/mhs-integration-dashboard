import { NextResponse } from "next/server";
import { google } from "googleapis";
import { WORKSTREAMS_100 } from "@/lib/hundredday";

const SPREADSHEET_ID = "1Gm5NDC6wpi2TlejZ5Om3065QeXVHevZ7";
const ID_COL = "N"; // column to write task IDs into

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

export async function POST() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) return NextResponse.json({ error: "No credentials" }, { status: 500 });

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(json),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  const results: Record<string, string> = {};

  for (const ws of WORKSTREAMS_100) {
    const tab = WS_TAB_MAP[ws.id];
    if (!tab || ws.tasks.length === 0) continue;

    try {
      // Read the tab to find the header row and task rows
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${tab}'!A:F`,
      });
      const rows = (res.data.values ?? []) as string[][];

      const headerIdx = rows.findIndex((r) =>
        r.some((c) => c?.toLowerCase().includes("work item"))
      );
      if (headerIdx === -1) { results[ws.id] = "no header found"; continue; }

      const descCol = rows[headerIdx].findIndex((h) =>
        h?.toLowerCase().includes("work item")
      );

      // Build updates: [row number (1-based), value]
      const updates: Array<{ range: string; value: string }> = [];

      // Write "Task ID" header in column N of the header row
      updates.push({
        range: `'${tab}'!${ID_COL}${headerIdx + 1}`,
        value: "Task ID",
      });

      // Match each task to its sheet row by description, write the ID
      const dataRows = rows.slice(headerIdx + 1);
      for (const task of ws.tasks) {
        const rowIdx = dataRows.findIndex(
          (r) => r[descCol]?.trim().slice(0, 40) === task.description.slice(0, 40)
        );
        if (rowIdx === -1) continue;
        const sheetRow = headerIdx + 2 + rowIdx;
        updates.push({ range: `'${tab}'!${ID_COL}${sheetRow}`, value: task.id });
      }

      // Batch write
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: "RAW",
          data: updates.map((u) => ({ range: u.range, values: [[u.value]] })),
        },
      });

      results[ws.id] = `wrote ${updates.length - 1} IDs`;
    } catch (err) {
      results[ws.id] = `error: ${err}`;
    }
  }

  return NextResponse.json({ ok: true, results });
}
