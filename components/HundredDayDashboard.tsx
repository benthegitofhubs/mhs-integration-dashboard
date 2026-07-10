"use client";

import { useState } from "react";
import { Workstream100, KEY_DATES, Status100 } from "@/lib/hundredday";
import HundredDayCard from "./HundredDayCard";
import { calcTaskHealth, rollupWorkstreamHealth, HEALTH_META, TaskHealth } from "@/lib/taskHealth";

export const STATUS_BG: Record<Status100, string> = {
  "Not Started": "#f3f4f6",
  "In Progress": "#dbeafe",
  "At Risk":     "#fef9c3",
  "Blocked":     "#fee2e2",
  "Complete":    "#dcfce7",
};

export const STATUS_COLOR: Record<Status100, string> = {
  "Not Started": "#374151",
  "In Progress": "#1d4ed8",
  "At Risk":     "#854d0e",
  "Blocked":     "#b91c1c",
  "Complete":    "#15803d",
};

// Derives workstream status from its tasks: worst task status wins
function deriveWorkstreamStatus(ws: Workstream100): Status100 | null {
  const tasks = ws.tasks;
  if (tasks.length === 0) return null;
  if (tasks.every((t) => t.status === "Complete"))  return "Complete";
  if (tasks.some((t) => t.status === "Blocked"))    return "Blocked";
  if (tasks.some((t) => t.status === "At Risk"))    return "At Risk";
  if (tasks.some((t) => t.status === "In Progress")) return "In Progress";
  return "Not Started";
}

export default function HundredDayDashboard({ workstreams }: { workstreams: Workstream100[] }) {
  const allTasks   = workstreams.flatMap((ws) => ws.tasks);
  const total      = allTasks.length;
  const complete   = allTasks.filter((t) => t.status === "Complete").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = allTasks.filter((t) => t.status === "At Risk").length;
  const blocked    = allTasks.filter((t) => t.status === "Blocked").length;

  // Derived workstream statuses (no manual input needed)
  const wsDerived = Object.fromEntries(
    workstreams.map((ws) => [ws.id, deriveWorkstreamStatus(ws)])
  ) as Record<string, Status100 | null>;

  const wsCounts: Record<Status100, number> = {
    "Not Started": workstreams.filter((ws) => wsDerived[ws.id] === "Not Started").length,
    "In Progress": workstreams.filter((ws) => wsDerived[ws.id] === "In Progress").length,
    "At Risk":     workstreams.filter((ws) => wsDerived[ws.id] === "At Risk").length,
    "Blocked":     workstreams.filter((ws) => wsDerived[ws.id] === "Blocked").length,
    "Complete":    workstreams.filter((ws) => wsDerived[ws.id] === "Complete").length,
  };

  // Pace-gap health rollup (separate from status)
  const autoHealth = Object.fromEntries(
    workstreams.map((ws) => [
      ws.id,
      rollupWorkstreamHealth(ws.tasks.map((t) => calcTaskHealth(t))),
    ])
  ) as Record<string, TaskHealth | null>;

  const autoHealthCounts: Record<TaskHealth, number> = {
    "On Track":  workstreams.filter((ws) => autoHealth[ws.id] === "On Track").length,
    "At Risk":   workstreams.filter((ws) => autoHealth[ws.id] === "At Risk").length,
    "Off Track": workstreams.filter((ws) => autoHealth[ws.id] === "Off Track").length,
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f7f6f3", color: "#1a1a1a" }}>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">

        {/* Eyebrow + headline */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          Mindful Health Solutions · 100-Day Integration Plan
        </p>
        <h1 className="text-3xl font-bold leading-snug mb-6" style={{ letterSpacing: "-0.02em", color: "#111" }}>
          100 days to one team, one mission.
        </h1>

        {/* Progress timeline */}
        {(() => {
          const start    = new Date("Jun 23, 2026").getTime();
          const end      = new Date("Oct 1, 2026").getTime();
          const now      = new Date().getTime();
          const pct      = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
          const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
          return (
            <div className="mb-2">
              <div className="relative" style={{ height: "28px" }}>
                <div className="absolute flex flex-col items-center" style={{ left: `${pct}%`, transform: "translateX(-50%)", top: 0 }}>
                  <span className="text-xs font-semibold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
                    Today · {daysLeft}d left
                  </span>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M5 8L0 0H10L5 8Z" fill="#1a5c3a" />
                  </svg>
                </div>
              </div>
              <div className="relative w-full" style={{ height: "4px", backgroundColor: "#e5e3de", borderRadius: "2px" }}>
                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#1a5c3a", borderRadius: "2px" }} />
                <div className="absolute" style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#1a5c3a", border: "2px solid white", boxShadow: "0 0 0 1px #1a5c3a" }} />
              </div>
            </div>
          );
        })()}

        {/* Key dates */}
        <div className="flex flex-wrap items-center mb-10 overflow-hidden"
          style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
          {KEY_DATES.map((kd, i) => (
            <div key={kd.label} className="px-5 py-3 flex flex-col gap-0.5"
              style={{ borderRight: i < KEY_DATES.length - 1 ? "1px solid #e5e3de" : "none" }}>
              <span className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                {kd.label}
              </span>
              <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{kd.date}</span>
            </div>
          ))}
        </div>

        {/* TL;DR */}
        <TldrSummary
          workstreams={workstreams}
          wsCounts={wsCounts}
          complete={complete}
          inProgress={inProgress}
          blocked={blocked}
          atRisk={atRisk}
          total={total}
        />

        {/* Disclaimer */}
        <div className="mb-6 px-4 py-3 rounded" style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
            <span className="font-semibold" style={{ color: "#57534e" }}>Source of record: the Google Sheet.</span>{" "}
            This dashboard reflects the latest manual sync — edits made here are session-only and will not persist. All data updates must be made in the source file.
          </p>
        </div>

        {/* Workstream Health */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
            <p className="text-sm font-semibold uppercase tracking-widest shrink-0"
              style={{ color: "#111111", fontFamily: "var(--font-geist-mono)" }}>
              Workstream Health
            </p>
            <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
          </div>

          {/* Summary counts: operational state + pace health */}
          <div className="grid grid-cols-5 gap-0 mb-3" style={{ borderTop: "1px solid #e5e3de" }}>
            <StatCell value={wsCounts["Not Started"]}              label="Not Started" color="#374151" />
            <StatCell value={wsCounts["In Progress"]}              label="In Progress" color="#1d4ed8" />
            <StatCell value={autoHealthCounts["On Track"]}         label="On Track"    color="#15803d" />
            <StatCell value={autoHealthCounts["Off Track"]}        label="Off Track"   color="#b91c1c" />
            <StatCell value={autoHealthCounts["At Risk"]}          label="At Risk"     color="#eab308" />
          </div>
          <div className="h-1 overflow-hidden flex mb-4" style={{ backgroundColor: "#e5e3de" }}>
            {autoHealthCounts["On Track"]  > 0 && <div style={{ width: `${(autoHealthCounts["On Track"]  / workstreams.length) * 100}%`, backgroundColor: "#15803d" }} />}
            {autoHealthCounts["At Risk"]   > 0 && <div style={{ width: `${(autoHealthCounts["At Risk"]   / workstreams.length) * 100}%`, backgroundColor: "#eab308" }} />}
            {autoHealthCounts["Off Track"] > 0 && <div style={{ width: `${(autoHealthCounts["Off Track"] / workstreams.length) * 100}%`, backgroundColor: "#b91c1c" }} />}
            {wsCounts["Not Started"]       > 0 && <div style={{ width: `${(wsCounts["Not Started"]       / workstreams.length) * 100}%`, backgroundColor: "#374151" }} />}
          </div>

          {/* Per-workstream table */}
          <div className="overflow-x-auto" style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
            <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2.5"
              style={{
                gridTemplateColumns: "28px 1fr 130px 160px 100px 110px 80px 44px",
                backgroundColor: "#f7f6f3",
                color: "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
                borderBottom: "1px solid #e5e3de",
              }}>
              <span style={{ whiteSpace: "nowrap" }}>#</span>
              <span style={{ whiteSpace: "nowrap" }}>Workstream</span>
              <span style={{ whiteSpace: "nowrap" }}>Flagship Goal</span>
              <span style={{ whiteSpace: "nowrap" }}>Leader</span>
              <span style={{ whiteSpace: "nowrap" }}>Status</span>
              <span style={{ whiteSpace: "nowrap" }}>Pace Health</span>
              <span style={{ whiteSpace: "nowrap" }}>Tasks</span>
              <span className="text-right" style={{ whiteSpace: "nowrap" }}>%</span>
            </div>

            {workstreams.map((ws, i) => {
              const t   = ws.tasks.length;
              const c   = ws.tasks.filter((x) => x.status === "Complete").length;
              const pct = t > 0 ? Math.round((c / t) * 100) : 0;
              const st  = wsDerived[ws.id];
              const ah  = autoHealth[ws.id];
              const ahMeta = ah ? HEALTH_META[ah] : null;

              return (
                <div key={ws.id} className="grid px-5 py-2.5 hover:bg-stone-50 transition-colors"
                  style={{
                    gridTemplateColumns: "28px 1fr 130px 160px 100px 110px 80px 44px",
                    borderBottom: i < workstreams.length - 1 ? "1px solid #f0efe9" : "none",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  <span className="text-xs font-bold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>{i + 1}</span>
                  <span className="text-xs font-semibold" title={ws.goal} style={{ color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "help" }}>{ws.name}</span>
                  <span className="text-xs" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.flagshipGoal.replace(/^\d+\s*·\s*/, "")}</span>
                  <span className="text-xs" style={{ color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.leader}</span>
                  {/* Derived status from task statuses */}
                  <div>
                    {st ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: STATUS_BG[st], color: STATUS_COLOR[st], fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
                        {st}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#d1d5db", fontFamily: "var(--font-geist-mono)" }}>—</span>
                    )}
                  </div>
                  {/* Pace-gap health */}
                  <div>
                    {ahMeta ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: ahMeta.bg, color: ahMeta.color, fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
                        {ah}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#d1d5db", fontFamily: "var(--font-geist-mono)" }}>—</span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                    {c}/{t} done
                  </span>
                  <span className="text-xs font-semibold text-right"
                    style={{ color: pct > 0 ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          <HealthLegend />
        </div>

        {/* Status color legend */}
        <div className="flex items-center gap-5 mb-4 mt-8">
          {([
            ["Not Started", "#374151"],
            ["In Progress", "#1d4ed8"],
            ["At Risk",     "#eab308"],
            ["Blocked",     "#b91c1c"],
            ["Complete",    "#15803d"],
          ] as [string, string][]).map(([label, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <span className="text-xs" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>{label}</span>
            </div>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
          <p className="text-sm font-semibold uppercase tracking-widest shrink-0"
            style={{ color: "#111111", fontFamily: "var(--font-geist-mono)" }}>
            Workstream Tasks
          </p>
          <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
        </div>
      </div>

      {/* Workstream cards */}
      <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
        {workstreams.map((ws, i) => (
          <HundredDayCard
            key={ws.id}
            workstream={ws}
            index={i + 1}
            derivedStatus={wsDerived[ws.id]}
          />
        ))}
      </div>
    </main>
  );
}


function TldrSummary({
  workstreams, wsCounts, complete, inProgress, blocked, atRisk, total,
}: {
  workstreams: Workstream100[];
  wsCounts: Record<Status100, number>;
  complete: number;
  inProgress: number;
  blocked: number;
  atRisk: number;
  total: number;
}) {
  const active = inProgress + atRisk;

  let healthLine = "";
  if (wsCounts["Blocked"] > 0) {
    healthLine = `${wsCounts["Blocked"]} workstream${wsCounts["Blocked"] > 1 ? "s" : ""} blocked${wsCounts["At Risk"] > 0 ? `, ${wsCounts["At Risk"]} at risk` : ""}${wsCounts["In Progress"] > 0 ? `, ${wsCounts["In Progress"]} in progress` : ""}${wsCounts["Complete"] > 0 ? `, ${wsCounts["Complete"]} complete` : ""}.`;
  } else if (wsCounts["At Risk"] > 0) {
    healthLine = `${wsCounts["At Risk"]} workstream${wsCounts["At Risk"] > 1 ? "s" : ""} at risk${wsCounts["In Progress"] > 0 ? `, ${wsCounts["In Progress"]} in progress` : ""}${wsCounts["Complete"] > 0 ? `, ${wsCounts["Complete"]} complete` : ""}.`;
  } else {
    const parts: string[] = [];
    if (wsCounts["Complete"]    > 0) parts.push(`${wsCounts["Complete"]} complete`);
    if (wsCounts["In Progress"] > 0) parts.push(`${wsCounts["In Progress"]} in progress`);
    if (wsCounts["Not Started"] > 0) parts.push(`${wsCounts["Not Started"]} not started`);
    healthLine = (parts.join(", ") || `${workstreams.length} workstreams tracked`) + ".";
  }

  let taskLine = "";
  if (complete === 0 && active === 0) {
    taskLine = `${total} tasks defined — none started yet.`;
  } else {
    const parts = [];
    if (complete > 0) parts.push(`${complete} complete`);
    if (active > 0)   parts.push(`${active} active`);
    if (blocked > 0)  parts.push(`${blocked} blocked`);
    taskLine = `${parts.join(", ")} out of ${total} total tasks.`;
    if (blocked > 0) taskLine += " Blocked items need attention.";
  }

  return (
    <div className="mb-8 px-5 py-4 rounded-lg" style={{ backgroundColor: "white", border: "1px solid #e5e3de" }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        TL;DR
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "#1a1a1a" }}>
        {healthLine}{" "}
        <span style={{ color: "#78716c" }}>{taskLine}</span>
      </p>
    </div>
  );
}

function HealthLegend() {
  const rows: { status: string; dot: string; what: string; plain: string }[] = [
    {
      status: "On Track",
      dot: "#15803d",
      what: "Progress is keeping pace with time elapsed — no blockers",
      plain: "Moving as expected. No action needed.",
    },
    {
      status: "At Risk",
      dot: "#eab308",
      what: "Progress is behind pace, but still recoverable without escalation",
      plain: "Falling behind. Owner has flagged a plan to catch up.",
    },
    {
      status: "Off Track",
      dot: "#b91c1c",
      what: "Progress is significantly behind pace, actively blocked, or the deadline cannot be met without intervention",
      plain: "Needs leadership attention now.",
    },
  ];

  return (
    <div className="mt-6 rounded-lg overflow-hidden" style={{ border: "1px solid #e5e3de" }}>
      <div className="px-5 py-3" style={{ backgroundColor: "#f7f6f3", borderBottom: "1px solid #e5e3de" }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          Status Legend — How Task Health Is Calculated
        </p>
      </div>
      <div style={{ backgroundColor: "white" }}>
        <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2"
          style={{ gridTemplateColumns: "100px 1fr 1fr", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #f0efe9" }}>
          <span>Status</span>
          <span>What It Means</span>
          <span>Plain English</span>
        </div>
        {rows.map((r) => (
          <div key={r.status} className="grid px-5 py-3 items-start"
            style={{ gridTemplateColumns: "100px 1fr 1fr", borderBottom: "1px solid #f0efe9", gap: "12px" }}>
            <div className="flex items-center gap-2">
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: r.dot, flexShrink: 0 }} />
              <span className="text-xs font-semibold" style={{ color: "#1a1a1a", whiteSpace: "nowrap" }}>{r.status}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{r.what}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{r.plain}</p>
          </div>
        ))}
        <div className="px-5 py-3" style={{ backgroundColor: "#f7f6f3" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#9ca3af", fontStyle: "italic" }}>
            Each task&apos;s percent complete is compared to how much of its timeline has already elapsed. If completion is falling meaningfully behind the clock, or if the task is blocked, the status downgrades automatically — rather than relying on a manual guess. Workstream health rolls up from its tasks: the worst task health determines the workstream score.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCell({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="pt-5 pb-4 pr-6" style={{ borderBottom: "1px solid #e5e3de" }}>
      <p className="text-3xl font-bold mb-0.5" style={{ color, letterSpacing: "-0.03em" }}>{value}</p>
      <p className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        {label}
      </p>
    </div>
  );
}
