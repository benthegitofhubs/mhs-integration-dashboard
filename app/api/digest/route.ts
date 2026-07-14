import { NextResponse } from "next/server";
import { fetchWorkstreams } from "@/lib/sheets";
import { calcTaskHealth, rollupWorkstreamHealth } from "@/lib/taskHealth";

export const dynamic = "force-dynamic";

export async function GET() {
  const workstreams = await fetchWorkstreams();

  const today = new Date();
  const start = new Date("2026-07-02");
  const end = new Date("2026-10-09");
  const dayElapsed = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const dayRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const summary = workstreams.map((ws) => {
    const healthResults = ws.tasks.map((t) => calcTaskHealth(t, today));
    const health = rollupWorkstreamHealth(healthResults) ?? "On Track";
    return {
      id: ws.id,
      name: ws.name,
      leader: ws.leader,
      health,
    };
  });

  const counts = {
    onTrack:  summary.filter((w) => w.health === "On Track").length,
    atRisk:   summary.filter((w) => w.health === "At Risk").length,
    blocked:  summary.filter((w) => w.health === "Blocked").length,
    offTrack: summary.filter((w) => w.health === "Off Track").length,
  };

  const needsAttention = summary.filter((w) =>
    ["Off Track", "At Risk", "Blocked"].includes(w.health)
  );

  return NextResponse.json({ dayElapsed, dayRemaining, counts, needsAttention, workstreams: summary });
}
