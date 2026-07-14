import { NextRequest, NextResponse } from "next/server";
import { writeSubtasks } from "@/lib/sheets";
import { Subtask } from "@/lib/hundredday";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { taskId, taskDescription, workstreamId, subtasks } = body;

  if (!workstreamId || !Array.isArray(subtasks)) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    await writeSubtasks(workstreamId, taskDescription ?? "", subtasks as Subtask[], taskId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("writeSubtasks failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
