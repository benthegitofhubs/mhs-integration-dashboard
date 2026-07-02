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
  const notStartedTasks = totalTasks - completedTasks - inProgressTasks - blockedTasks;

  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f7f6f3", color: "#1a1a1a" }}>

      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">

        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          Mindful Health Solutions · Integration Plan
        </p>

        {/* Headline */}
        <h1 className="text-3xl font-bold leading-snug mb-10" style={{ letterSpacing: "-0.02em", color: "#111" }}>
          Integration progress across 8 workstreams.
        </h1>

        {/* Stats row — large numbers like the WBR dashboard */}
        <div className="grid grid-cols-4 gap-0 mb-2" style={{ borderTop: "1px solid #e5e3de" }}>
          <StatCell value={completedTasks} label="Complete" color="#1a5c3a" />
          <StatCell value={inProgressTasks} label="In Progress" color="#1d4ed8" />
          <StatCell value={blockedTasks} label="Blocked" color="#b91c1c" />
          <StatCell value={notStartedTasks} label="Not Started" color="#6b7280" />
        </div>

        {/* Segmented progress bar */}
        <div className="h-1 overflow-hidden flex mb-1" style={{ backgroundColor: "#e5e3de" }}>
          {completedTasks > 0 && (
            <div style={{ width: `${(completedTasks / totalTasks) * 100}%`, backgroundColor: "#1a5c3a" }} />
          )}
          {inProgressTasks > 0 && (
            <div style={{ width: `${(inProgressTasks / totalTasks) * 100}%`, backgroundColor: "#1d4ed8" }} />
          )}
          {blockedTasks > 0 && (
            <div style={{ width: `${(blockedTasks / totalTasks) * 100}%`, backgroundColor: "#b91c1c" }} />
          )}
          {notStartedTasks > 0 && (
            <div style={{ width: `${(notStartedTasks / totalTasks) * 100}%`, backgroundColor: "#d1d5db" }} />
          )}
        </div>
        <div className="flex items-center justify-between mb-12">
          <p className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
            {overallPct}% COMPLETE · {totalTasks} TOTAL TASKS
          </p>
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
          Workstreams
        </p>
      </div>

      {/* Workstream list */}
      <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
        {WORKSTREAMS.map((ws, i) => (
          <WorkstreamCard key={ws.id} workstream={ws} index={i + 1} />
        ))}
      </div>
    </main>
  );
}

function StatCell({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="pt-6 pb-5 pr-8" style={{ borderBottom: "1px solid #e5e3de" }}>
      <p className="text-4xl font-bold mb-1" style={{ color, letterSpacing: "-0.03em" }}>{value}</p>
      <p className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        {label}
      </p>
    </div>
  );
}
