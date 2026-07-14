import { NextRequest, NextResponse } from "next/server";
import { writeStatusOverride } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  const { workstreamId, status } = await req.json();
  if (!workstreamId) {
    return NextResponse.json({ error: "Missing workstreamId" }, { status: 400 });
  }
  try {
    await writeStatusOverride(workstreamId, status ?? null);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("writeStatusOverride failed:", err);
    return NextResponse.json({ error: "Sheet write failed" }, { status: 500 });
  }
}
