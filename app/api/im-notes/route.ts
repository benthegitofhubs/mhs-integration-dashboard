import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const SPREADSHEET_ID = "1Gm5NDC6wpi2TlejZ5Om3065QeXVHevZ7";
const NOTES_TAB = "IM Notes - do not delete";

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  return new google.auth.GoogleAuth({
    credentials: JSON.parse(json),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

// GET /api/im-notes?workstreamId=dtc
export async function GET(req: NextRequest) {
  const workstreamId = req.nextUrl.searchParams.get("workstreamId");
  if (!workstreamId) return NextResponse.json({ notes: [] });

  try {
    const sheets = google.sheets({ version: "v4", auth: getAuth() });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${NOTES_TAB}'!A:C`,
    });
    const rows = (res.data.values ?? []) as string[][];

    const notes = rows
      .filter((r) => r[0]?.trim() === workstreamId && r[1] && r[2])
      .map((r) => ({ timestamp: r[1].trim(), note: r[2].trim() }));

    return NextResponse.json({ notes });
  } catch (err) {
    console.error("im-notes GET failed:", err);
    return NextResponse.json({ notes: [] });
  }
}

// POST /api/im-notes  body: { workstreamId, timestamp, note }
export async function POST(req: NextRequest) {
  const { workstreamId, timestamp, note } = await req.json();
  if (!workstreamId || !note) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const sheets = google.sheets({ version: "v4", auth: getAuth() });
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${NOTES_TAB}'!A:C`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[workstreamId, timestamp ?? new Date().toISOString(), note]],
      },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("im-notes POST failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
