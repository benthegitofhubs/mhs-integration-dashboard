import { NextRequest, NextResponse } from "next/server";
import { writeGoalStatus, GoalRYG } from "@/lib/sheets";

const VALID = new Set(["Red", "Yellow", "Green", ""]);

export async function POST(req: NextRequest) {
  const { workstreamId, workstream, ryg } = await req.json();
  if (!workstreamId || typeof ryg !== "string" || !VALID.has(ryg)) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }
  try {
    await writeGoalStatus(workstreamId, workstream ?? "", ryg as GoalRYG | "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("writeGoalStatus failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
