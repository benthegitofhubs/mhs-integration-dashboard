import { WORKSTREAMS_100, FLAGSHIP_GOALS, KEY_DATES, Workstream100 } from "@/lib/hundredday";
import HundredDayCard from "@/components/HundredDayCard";

export default function HundredDayPage() {
  const allTasks = WORKSTREAMS_100.flatMap((ws) => ws.tasks);
  const total      = allTasks.length;
  const complete   = allTasks.filter((t) => t.status === "Complete").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = allTasks.filter((t) => t.status === "At Risk").length;
  const blocked    = allTasks.filter((t) => t.status === "Blocked").length;
  const notStarted = allTasks.filter((t) => t.status === "Not Started").length;
  const overallPct = total > 0 ? Math.round((complete / total) * 100) : 0;

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f7f6f3", color: "#1a1a1a" }}>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">

        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          Mindful Health Solutions · 100-Day Integration Plan
        </p>
        <h1 className="text-3xl font-bold leading-snug mb-6" style={{ letterSpacing: "-0.02em", color: "#111" }}>
          100 days to one team, one mission.
        </h1>

        {/* Key dates */}
        <div className="flex flex-wrap items-center gap-0 mb-10 overflow-hidden"
          style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
          {KEY_DATES.map((kd, i) => (
            <div
              key={kd.label}
              className="px-5 py-3 flex flex-col gap-0.5"
              style={{ borderRight: i < KEY_DATES.length - 1 ? "1px solid #e5e3de" : "none" }}
            >
              <span className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                {kd.label}
              </span>
              <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{kd.date}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-0 mb-2" style={{ borderTop: "1px solid #e5e3de" }}>
          <StatCell value={complete}   label="Complete"    color="#1a5c3a" />
          <StatCell value={inProgress} label="In Progress" color="#1d4ed8" />
          <StatCell value={atRisk}     label="At Risk"     color="#c2410c" />
          <StatCell value={blocked}    label="Blocked"     color="#b91c1c" />
          <StatCell value={notStarted} label="Not Started" color="#6b7280" />
        </div>

        {/* Segmented progress bar */}
        <div className="h-1 overflow-hidden flex mb-1" style={{ backgroundColor: "#e5e3de" }}>
          {complete > 0    && <div style={{ width: `${(complete / total) * 100}%`,   backgroundColor: "#1a5c3a" }} />}
          {inProgress > 0  && <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: "#1d4ed8" }} />}
          {atRisk > 0      && <div style={{ width: `${(atRisk / total) * 100}%`,     backgroundColor: "#c2410c" }} />}
          {blocked > 0     && <div style={{ width: `${(blocked / total) * 100}%`,    backgroundColor: "#b91c1c" }} />}
          {notStarted > 0  && <div style={{ width: `${(notStarted / total) * 100}%`, backgroundColor: "#d1d5db" }} />}
        </div>
        <p className="text-xs mb-10" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          {overallPct}% COMPLETE · {total} TOTAL TASKS
        </p>

        {/* Flagship goals overview table */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
          Flagship Goals
        </p>
        <div className="mb-12 overflow-hidden" style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
          {/* Table header */}
          <div
            className="grid text-xs uppercase tracking-widest font-semibold px-6 py-2.5"
            style={{
              gridTemplateColumns: "160px 1fr 80px 80px 80px 80px",
              backgroundColor: "#f7f6f3",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
              borderBottom: "1px solid #e5e3de",
            }}
          >
            <span>Workstream</span>
            <span>100-Day Goal</span>
            <span className="text-right">Done</span>
            <span className="text-right">Active</span>
            <span className="text-right">Total</span>
            <span className="text-right">% Done</span>
          </div>
          {FLAGSHIP_GOALS.map((fg) => {
            const wss = WORKSTREAMS_100.filter((w) => w.flagshipGoal === fg.label);
            return (
              <FlagshipGroup key={fg.id} label={fg.label} workstreams={wss} />
            );
          })}
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
          Workstreams
        </p>
      </div>

      {/* Workstream cards */}
      <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
        {WORKSTREAMS_100.map((ws, i) => (
          <HundredDayCard key={ws.id} workstream={ws} index={i + 1} />
        ))}
      </div>
    </main>
  );
}

function FlagshipGroup({ label, workstreams }: { label: string; workstreams: Workstream100[] }) {
  return (
    <>
      {/* Flagship label row */}
      <div className="px-6 py-1.5 text-xs uppercase tracking-widest"
        style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)", fontWeight: 600, backgroundColor: "#f7faf8", borderBottom: "1px solid #f0efe9" }}>
        {label}
      </div>
      {workstreams.map((ws, idx) => {
        const t = ws.tasks.length;
        const c = ws.tasks.filter((x) => x.status === "Complete").length;
        const p = ws.tasks.filter((x) => x.status === "In Progress").length;
        const pct = t > 0 ? Math.round((c / t) * 100) : 0;
        return (
          <div
            key={ws.id}
            className="grid px-6 py-3 hover:bg-stone-50"
            style={{
              gridTemplateColumns: "160px 1fr 80px 80px 80px 80px",
              borderBottom: "1px solid #f0efe9",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div>
              <p className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>{ws.name}</p>
              <p className="text-xs" style={{ color: "#9ca3af" }}>{ws.leader}</p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#78716c" }}>{ws.goal}</p>
            <p className="text-xs font-semibold text-right" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>{c}</p>
            <p className="text-xs text-right" style={{ color: "#1d4ed8", fontFamily: "var(--font-geist-mono)" }}>{p}</p>
            <p className="text-xs text-right" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{t}</p>
            <p className="text-xs font-semibold text-right" style={{ color: pct > 0 ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{pct}%</p>
          </div>
        );
      })}
    </>
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
