import { NextRequest, NextResponse } from "next/server";
import { writeLeader } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const { workstreamId, leader } = await req.json();
  if (!workstreamId || !leader) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  try {
    await writeLeader(workstreamId, leader);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("writeLeader failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
