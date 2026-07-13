import { NextRequest, NextResponse } from "next/server";
import { writeStatus } from "@/lib/sheets";
import { Status100 } from "@/lib/hundredday";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { taskId, taskDescription, status, workstreamId } = body;

  if (!taskId || !status || !workstreamId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    if (taskDescription || taskId) {
      await writeStatus(workstreamId, taskDescription ?? "", status as Status100, taskId);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("writeStatus failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
