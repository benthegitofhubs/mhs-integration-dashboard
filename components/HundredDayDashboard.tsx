"use client";

import { useState } from "react";
import { Workstream100, FLAGSHIP_GOALS, KEY_DATES, Status100 } from "@/lib/hundredday";
import HundredDayCard from "./HundredDayCard";
import { calcTaskHealth, rollupWorkstreamHealth, HEALTH_META, TaskHealth } from "@/lib/taskHealth";

export type RYG = Status100 | "";

export const RYG_META: Record<Status100, { bg: string; color: string; label: string; dot: string }> = {
  "Not Started": { bg: "#f3f4f6", color: "#111111", label: "Not Started", dot: "#374151" },
  "In Progress": { bg: "#dbeafe", color: "#1d4ed8", label: "In Progress", dot: "#1d4ed8" },
  "At Risk":     { bg: "#fef9c3", color: "#854d0e", label: "At Risk",     dot: "#eab308" },
  "Blocked":     { bg: "#fee2e2", color: "#b91c1c", label: "Blocked",     dot: "#b91c1c" },
  "Complete":    { bg: "#dcfce7", color: "#15803d", label: "Complete",    dot: "#15803d" },
};

const STATUSES: Status100[] = ["Not Started", "In Progress", "At Risk", "Blocked", "Complete"];

type RygMap = Record<string, { ryg: RYG; note: string }>;

function initRygMap(workstreams: Workstream100[]): RygMap {
  return Object.fromEntries(workstreams.map((ws) => [ws.id, { ryg: "" as RYG, note: "" }]));
}

export default function HundredDayDashboard({ workstreams }: { workstreams: Workstream100[] }) {
  const [rygMap, setRygMap] = useState<RygMap>(() => initRygMap(workstreams));

  const updateRyg  = (id: string, ryg: RYG) =>
    setRygMap((prev) => ({ ...prev, [id]: { ...prev[id], ryg } }));
  const updateNote = (id: string, note: string) =>
    setRygMap((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  const allTasks   = workstreams.flatMap((ws) => ws.tasks);
  const total      = allTasks.length;
  const complete   = allTasks.filter((t) => t.status === "Complete").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = allTasks.filter((t) => t.status === "At Risk").length;
  const blocked    = allTasks.filter((t) => t.status === "Blocked").length;

  const rygCounts = {
    "Not Started": workstreams.filter((ws) => rygMap[ws.id]?.ryg === "Not Started").length,
    "In Progress": workstreams.filter((ws) => rygMap[ws.id]?.ryg === "In Progress").length,
    "At Risk":     workstreams.filter((ws) => rygMap[ws.id]?.ryg === "At Risk").length,
    "Blocked":     workstreams.filter((ws) => rygMap[ws.id]?.ryg === "Blocked").length,
    "Complete":    workstreams.filter((ws) => rygMap[ws.id]?.ryg === "Complete").length,
  };

  // Auto-calculated health rollup per workstream (from task pace data)
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

        {/* TL;DR summary */}
        <TldrSummary
          workstreams={workstreams}
          rygMap={rygMap}
          complete={complete}
          inProgress={inProgress}
          blocked={blocked}
          atRisk={atRisk}
          total={total}
          rygCounts={rygCounts}
        />

        {/* Workstream Health */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
            <p className="text-xs font-semibold uppercase tracking-widest shrink-0"
              style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>
              Workstream Health
            </p>
            <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
          </div>

          {/* Status summary counts */}
          <div className="grid grid-cols-5 gap-0 mb-3" style={{ borderTop: "1px solid #e5e3de" }}>
            <StatCell value={rygCounts["Not Started"]} label="Not Started" color="#374151" />
            <StatCell value={rygCounts["In Progress"]} label="In Progress" color="#1d4ed8" />
            <StatCell value={rygCounts["At Risk"]}     label="At Risk"     color="#854d0e" />
            <StatCell value={rygCounts["Blocked"]}     label="Blocked"     color="#b91c1c" />
            <StatCell value={rygCounts["Complete"]}    label="Complete"    color="#15803d" />
          </div>
          <div className="h-1 overflow-hidden flex mb-1" style={{ backgroundColor: "#e5e3de" }}>
            {rygCounts["Complete"]    > 0 && <div style={{ width: `${(rygCounts["Complete"]    / workstreams.length) * 100}%`, backgroundColor: "#15803d" }} />}
            {rygCounts["In Progress"] > 0 && <div style={{ width: `${(rygCounts["In Progress"] / workstreams.length) * 100}%`, backgroundColor: "#1d4ed8" }} />}
            {rygCounts["At Risk"]     > 0 && <div style={{ width: `${(rygCounts["At Risk"]     / workstreams.length) * 100}%`, backgroundColor: "#eab308" }} />}
            {rygCounts["Blocked"]     > 0 && <div style={{ width: `${(rygCounts["Blocked"]     / workstreams.length) * 100}%`, backgroundColor: "#b91c1c" }} />}
            {rygCounts["Not Started"] > 0 && <div style={{ width: `${(rygCounts["Not Started"] / workstreams.length) * 100}%`, backgroundColor: "#374151" }} />}
            <div style={{ width: `${((workstreams.length - rygCounts["Not Started"] - rygCounts["In Progress"] - rygCounts["At Risk"] - rygCounts["Blocked"] - rygCounts["Complete"]) / workstreams.length) * 100}%`, backgroundColor: "#d1d5db" }} />
          </div>
          <p className="text-xs mb-4" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
            {workstreams.length - rygCounts["Not Started"] - rygCounts["In Progress"] - rygCounts["At Risk"] - rygCounts["Blocked"] - rygCounts["Complete"]} OF {workstreams.length} WORKSTREAMS AWAITING STATUS
          </p>

          {/* Per-workstream breakdown table */}
          <div className="overflow-hidden" style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
            <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2.5"
              style={{
                gridTemplateColumns: "28px 1fr 130px 160px 90px 90px 110px 44px",
                backgroundColor: "#f7f6f3",
                color: "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
                borderBottom: "1px solid #e5e3de",
              }}>
              <span style={{ whiteSpace: "nowrap" }}>#</span>
              <span style={{ whiteSpace: "nowrap" }}>Workstream</span>
              <span style={{ whiteSpace: "nowrap" }}>Flagship Goal</span>
              <span style={{ whiteSpace: "nowrap" }}>Leader</span>
              <span style={{ whiteSpace: "nowrap" }}>Auto Health</span>
              <span style={{ whiteSpace: "nowrap" }}>Status</span>
              <span style={{ whiteSpace: "nowrap" }}>Tasks</span>
              <span className="text-right" style={{ whiteSpace: "nowrap" }}>%</span>
            </div>

            {workstreams.map((ws, i) => {
              const t    = ws.tasks.length;
              const c    = ws.tasks.filter((x) => x.status === "Complete").length;
              const ip   = ws.tasks.filter((x) => x.status === "In Progress").length;
              const pct  = t > 0 ? Math.round((c / t) * 100) : 0;
              const { ryg } = rygMap[ws.id] ?? { ryg: "" as RYG };
              const ah    = autoHealth[ws.id];
              const ahMeta = ah ? HEALTH_META[ah] : null;

              return (
                <div key={ws.id} className="grid px-5 py-2.5 hover:bg-stone-50 transition-colors"
                  style={{
                    gridTemplateColumns: "28px 1fr 130px 160px 90px 90px 110px 44px",
                    borderBottom: i < workstreams.length - 1 ? "1px solid #f0efe9" : "none",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  <span className="text-xs font-bold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>{i + 1}</span>
                  <span className="text-xs font-semibold" style={{ color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.name}</span>
                  <span className="text-xs" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.flagshipGoal.replace(/^\d+\s*·\s*/, "")}</span>
                  <span className="text-xs" style={{ color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.leader}</span>
                  {/* Auto health — computed from task pace */}
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
                  {/* Manual status override */}
                  <div>
                    {ryg ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: RYG_META[ryg as Status100].bg, color: RYG_META[ryg as Status100].color, fontFamily: "var(--font-geist-mono)" }}>
                        {ryg}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#d1d5db", fontFamily: "var(--font-geist-mono)" }}>—</span>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                    {c}/{t} done{ip > 0 ? ` · ${ip} active` : ""}
                  </span>
                  <span className="text-xs font-semibold text-right"
                    style={{ color: pct > 0 ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Health legend */}
          <HealthLegend />
        </div>

        {/* Workstream Work Items table */}
        <div className="mt-10 mb-6 flex items-center gap-4">
          <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
          <p className="text-xs font-semibold uppercase tracking-widest shrink-0"
            style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>
            Workstream Work Items
          </p>
          <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
        </div>
        <div className="mb-12 overflow-hidden" style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
          <div className="grid text-xs uppercase tracking-widest font-semibold px-6 py-2.5"
            style={{
              gridTemplateColumns: "180px 1fr 100px 160px 70px",
              backgroundColor: "#f7f6f3",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
              borderBottom: "1px solid #e5e3de",
            }}>
            <span>Workstream</span>
            <span>Success Metric</span>
            <span>RYG</span>
            <span>Weekly Note</span>
            <span className="text-right">% Done</span>
          </div>

          {FLAGSHIP_GOALS.map((fg) => {
            const wss = workstreams.filter((w) => w.flagshipGoal === fg.label);
            return (
              <FlagshipGroup
                key={fg.id}
                label={fg.label}
                workstreams={wss}
                rygMap={rygMap}
                onRygChange={updateRyg}
                onNoteChange={updateNote}
              />
            );
          })}
        </div>

        {/* Status color legend */}
        <div className="flex items-center gap-5 mb-4 mt-10">
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
          <p className="text-xs font-semibold uppercase tracking-widest shrink-0"
            style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>
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
            ryg={rygMap[ws.id]?.ryg ?? ""}
            rygNote={rygMap[ws.id]?.note ?? ""}
            onRygChange={(ryg) => updateRyg(ws.id, ryg)}
            onRygNoteChange={(note) => updateNote(ws.id, note)}
          />
        ))}
      </div>
    </main>
  );
}

function FlagshipGroup({
  label, workstreams, rygMap, onRygChange, onNoteChange,
}: {
  label: string;
  workstreams: Workstream100[];
  rygMap: RygMap;
  onRygChange: (id: string, ryg: RYG) => void;
  onNoteChange: (id: string, note: string) => void;
}) {
  return (
    <>
      <div className="px-6 py-1.5 text-xs uppercase tracking-widest"
        style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)", fontWeight: 600, backgroundColor: "#f7faf8", borderBottom: "1px solid #f0efe9" }}>
        {label}
      </div>
      {workstreams.map((ws) => {
        const t = ws.tasks.length;
        const c = ws.tasks.filter((x) => x.status === "Complete").length;
        const pct = t > 0 ? Math.round((c / t) * 100) : 0;
        const { ryg, note } = rygMap[ws.id] ?? { ryg: "" as RYG, note: "" };
        const meta = ryg ? RYG_META[ryg as Status100] : null;

        return (
          <OverviewRow
            key={ws.id}
            ws={ws}
            ryg={ryg}
            note={note}
            pct={pct}
            meta={meta}
            onRygChange={(r) => onRygChange(ws.id, r)}
            onNoteChange={(n) => onNoteChange(ws.id, n)}
          />
        );
      })}
    </>
  );
}

function OverviewRow({
  ws, ryg, note, pct, meta, onRygChange, onNoteChange,
}: {
  ws: Workstream100;
  ryg: RYG;
  note: string;
  pct: number;
  meta: typeof RYG_META[Status100] | null;
  onRygChange: (r: RYG) => void;
  onNoteChange: (n: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(note);

  return (
    <div className="grid px-6 py-3 hover:bg-stone-50 transition-colors"
      style={{
        gridTemplateColumns: "180px 1fr 100px 160px 70px",
        borderBottom: "1px solid #f0efe9",
        alignItems: "start",
        gap: "12px",
      }}>
      <div>
        <p className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>{ws.name}</p>
        <p className="text-xs" style={{ color: "#6b7280" }}>{ws.leader}</p>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: "#374151" }}>{ws.goal}</p>

      {/* Status select */}
      <div className="pt-0.5">
        <select
          value={ryg}
          onChange={(e) => onRygChange(e.target.value as RYG)}
          className="text-xs font-semibold cursor-pointer focus:outline-none rounded px-2 py-1"
          style={{
            backgroundColor: ryg ? RYG_META[ryg as Status100].bg : "#f3f4f6",
            color: ryg ? RYG_META[ryg as Status100].color : "#9ca3af",
            border: "none",
            fontFamily: "var(--font-geist-mono)",
            letterSpacing: "0.03em",
          }}
        >
          <option value="">— No Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Weekly note */}
      <div>
        {editingNote ? (
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => { onNoteChange(draft); setEditingNote(false); }}
            onKeyDown={(e) => { if (e.key === "Escape") { setDraft(note); setEditingNote(false); } }}
            rows={2}
            placeholder="Add weekly note…"
            className="w-full text-xs leading-relaxed rounded px-2 py-1 resize-none focus:outline-none"
            style={{ border: "1px solid #d1cfc9", backgroundColor: "#fafaf8", color: "#57534e" }}
          />
        ) : (
          <p
            className="text-xs leading-relaxed cursor-pointer rounded px-1 -mx-1 hover:bg-stone-100 transition-colors"
            style={{ color: note ? "#57534e" : "#c0bdb8", fontStyle: note ? "normal" : "italic" }}
            onClick={() => { setDraft(note); setEditingNote(true); }}
          >
            {note || "Add note…"}
          </p>
        )}
      </div>

      <p className="text-xs font-semibold text-right pt-0.5"
        style={{ color: pct > 0 ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        {pct}%
      </p>
    </div>
  );
}

function TldrSummary({
  workstreams, rygMap, complete, inProgress, blocked, atRisk, total, rygCounts,
}: {
  workstreams: Workstream100[];
  rygMap: RygMap;
  complete: number;
  inProgress: number;
  blocked: number;
  atRisk: number;
  total: number;
  rygCounts: Record<Status100, number>;
}) {
  const rated    = rygCounts["Not Started"] + rygCounts["In Progress"] + rygCounts["At Risk"] + rygCounts["Blocked"] + rygCounts["Complete"];
  const noStatus = workstreams.length - rated;
  const active   = inProgress + atRisk;

  let healthLine = "";
  if (rated === 0) {
    healthLine = `${workstreams.length} workstreams tracked — no health status set yet.`;
  } else if (rygCounts["Blocked"] > 0) {
    healthLine = `${rygCounts["Blocked"]} workstream${rygCounts["Blocked"] > 1 ? "s" : ""} blocked${rygCounts["At Risk"] > 0 ? `, ${rygCounts["At Risk"]} at risk` : ""}${rygCounts["In Progress"] > 0 ? `, ${rygCounts["In Progress"]} in progress` : ""}${rygCounts["Complete"] > 0 ? `, ${rygCounts["Complete"]} complete` : ""}.`;
  } else if (rygCounts["At Risk"] > 0) {
    healthLine = `${rygCounts["At Risk"]} workstream${rygCounts["At Risk"] > 1 ? "s" : ""} at risk${rygCounts["In Progress"] > 0 ? `, ${rygCounts["In Progress"]} in progress` : ""}${rygCounts["Complete"] > 0 ? `, ${rygCounts["Complete"]} complete` : ""}${noStatus > 0 ? `, ${noStatus} awaiting status` : ""}.`;
  } else {
    const parts: string[] = [];
    if (rygCounts["Complete"]    > 0) parts.push(`${rygCounts["Complete"]} complete`);
    if (rygCounts["In Progress"] > 0) parts.push(`${rygCounts["In Progress"]} in progress`);
    if (rygCounts["Not Started"] > 0) parts.push(`${rygCounts["Not Started"]} not started`);
    if (noStatus > 0)                  parts.push(`${noStatus} awaiting status`);
    healthLine = parts.join(", ") + ".";
  }

  let taskLine = "";
  if (complete === 0 && active === 0) {
    taskLine = `${total} tasks defined across all workstreams — none started yet.`;
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
      <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: "#f7f6f3", borderBottom: "1px solid #e5e3de" }}>
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
