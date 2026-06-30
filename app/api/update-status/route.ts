import { NextRequest, NextResponse } from "next/server";

// POC: logs the update. Wire to Google Sheets API or a DB here.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { taskId, status, workstreamId } = body;

  if (!taskId || !status || !workstreamId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  console.log(`Status update: [${workstreamId}] ${taskId} → ${status}`);

  // TODO: write back to Google Sheets via service account
  // const sheets = google.sheets({ version: "v4", auth });
  // await sheets.spreadsheets.values.update(...)

  return NextResponse.json({ ok: true });
}
