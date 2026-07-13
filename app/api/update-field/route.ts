import { NextRequest, NextResponse } from "next/server";
import { writeField } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const { taskId, taskDescription, workstreamId, field, value } = await req.json();

  if (!workstreamId || !field || value === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await writeField(workstreamId, taskId ?? "", taskDescription ?? "", field, value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("update-field failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
