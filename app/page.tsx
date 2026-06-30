import { WORKSTREAMS } from "@/lib/workstreams";
import WorkstreamCard from "@/components/WorkstreamCard";

export default function Home() {
  const totalTasks = WORKSTREAMS.reduce((acc, ws) => acc + ws.tasks.length, 0);
  const completedTasks = WORKSTREAMS.reduce(
    (acc, ws) => acc + ws.tasks.filter((t) => t.status === "Complete").length,
    0
  );
  const inProgressTasks = WORKSTREAMS.reduce(
    (acc, ws) => acc + ws.tasks.filter((t) => t.status === "In Progress").length,
    0
  );
  const blockedTasks = WORKSTREAMS.reduce(
    (acc, ws) => acc + ws.tasks.filter((t) => t.status === "Blocked").length,
    0
  );

  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f7f6f3", color: "#1a1a1a" }}>

      {/* Top bar */}
      <div className="border-b border-stone-200 bg-white px-8 py-3 flex items-center justify-between">
        <div>
          <span className="text-base font-bold tracking-tight">Radial</span>
          <span className="text-stone-400 text-sm ml-3">MHS Integration Tracker · for Ben + integration leads</span>
        </div>
        <span className="text-xs text-stone-400">Close date: TBD · 21 locations · CA / TX / WA</span>
      </div>

      <div className="max-w-6xl mx-auto px-8 pt-10 pb-4">
        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
          Mindful Health Solutions · 6-month integration plan
        </p>

        {/* Headline */}
        <h1 className="text-4xl font-bold leading-tight mb-4" style={{ letterSpacing: "-0.02em" }}>
          Track integration progress across all 8 workstreams.
        </h1>

        {/* Stats row */}
        <div className="flex items-center gap-8 mt-6 mb-2">
          <Stat label="Total tasks" value={totalTasks} />
          <div className="w-px h-8 bg-stone-200" />
          <Stat label="Complete" value={completedTasks} green />
          <Stat label="In progress" value={inProgressTasks} blue />
          <Stat label="Blocked" value={blockedTasks} red />
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Overall</p>
            <p className="text-2xl font-bold">{overallPct}%</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mt-3 mb-10" style={{ backgroundColor: "#e5e3de" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${overallPct}%`, backgroundColor: "#1a5c3a" }}
          />
        </div>
      </div>

      {/* Workstream list */}
      <div className="max-w-6xl mx-auto px-8 pb-16 space-y-3">
        {WORKSTREAMS.map((ws, i) => (
          <WorkstreamCard key={ws.id} workstream={ws} index={i + 1} />
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value, green, blue, red }: { label: string; value: number; green?: boolean; blue?: boolean; red?: boolean }) {
  const color = green ? "#1a5c3a" : blue ? "#1d4ed8" : red ? "#b91c1c" : "#1a1a1a";
  return (
    <div>
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
