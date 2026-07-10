"use client";

import { useState } from "react";
import { Workstream100, FLAGSHIP_GOALS, KEY_DATES } from "@/lib/hundredday";
import HundredDayCard from "./HundredDayCard";

export type RYG = "Green" | "Yellow" | "Red" | "";

export const RYG_META: Record<RYG, { bg: string; color: string; label: string; dot: string }> = {
  Green:  { bg: "#dcfce7", color: "#15803d", label: "On Track",  dot: "#15803d" },
  Yellow: { bg: "#fef9c3", color: "#854d0e", label: "At Risk",   dot: "#eab308" },
  Red:    { bg: "#fee2e2", color: "#b91c1c", label: "Off Track", dot: "#b91c1c" },
  "":     { bg: "#f3f4f6", color: "#9ca3af", label: "No Status", dot: "#d1d5db" },
};

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
    Green:  workstreams.filter((ws) => rygMap[ws.id]?.ryg === "Green").length,
    Yellow: workstreams.filter((ws) => rygMap[ws.id]?.ryg === "Yellow").length,
    Red:    workstreams.filter((ws) => rygMap[ws.id]?.ryg === "Red").length,
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
            Workstream Health
          </p>

          {/* RYG summary counts */}
          <div className="grid grid-cols-3 gap-0 mb-3" style={{ borderTop: "1px solid #e5e3de" }}>
            <StatCell value={rygCounts.Green}  label="On Track"  color="#15803d" />
            <StatCell value={rygCounts.Yellow} label="At Risk"   color="#854d0e" />
            <StatCell value={rygCounts.Red}    label="Off Track" color="#b91c1c" />
          </div>
          <div className="h-1 overflow-hidden flex mb-1" style={{ backgroundColor: "#e5e3de" }}>
            {rygCounts.Green  > 0 && <div style={{ width: `${(rygCounts.Green  / workstreams.length) * 100}%`, backgroundColor: "#15803d" }} />}
            {rygCounts.Yellow > 0 && <div style={{ width: `${(rygCounts.Yellow / workstreams.length) * 100}%`, backgroundColor: "#eab308" }} />}
            {rygCounts.Red    > 0 && <div style={{ width: `${(rygCounts.Red    / workstreams.length) * 100}%`, backgroundColor: "#b91c1c" }} />}
            <div style={{ width: `${((workstreams.length - rygCounts.Green - rygCounts.Yellow - rygCounts.Red) / workstreams.length) * 100}%`, backgroundColor: "#d1d5db" }} />
          </div>
          <p className="text-xs mb-4" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
            {workstreams.length - rygCounts.Green - rygCounts.Yellow - rygCounts.Red} OF {workstreams.length} WORKSTREAMS AWAITING STATUS
          </p>

          {/* Per-workstream breakdown table */}
          <div className="overflow-hidden" style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
            <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2.5"
              style={{
                gridTemplateColumns: "32px 1fr 130px 110px 90px 90px 48px",
                backgroundColor: "#f7f6f3",
                color: "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
                borderBottom: "1px solid #e5e3de",
              }}>
              <span>#</span>
              <span>Workstream</span>
              <span>Flagship Goal</span>
              <span>Leader</span>
              <span>Status</span>
              <span>Tasks</span>
              <span className="text-right">%</span>
            </div>

            {workstreams.map((ws, i) => {
              const t    = ws.tasks.length;
              const c    = ws.tasks.filter((x) => x.status === "Complete").length;
              const ip   = ws.tasks.filter((x) => x.status === "In Progress").length;
              const pct  = t > 0 ? Math.round((c / t) * 100) : 0;
              const { ryg } = rygMap[ws.id] ?? { ryg: "" as RYG };
              const meta = RYG_META[ryg];

              return (
                <div key={ws.id} className="grid px-5 py-2.5 hover:bg-stone-50 transition-colors"
                  style={{
                    gridTemplateColumns: "32px 1fr 130px 110px 90px 90px 48px",
                    borderBottom: i < workstreams.length - 1 ? "1px solid #f0efe9" : "none",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  <span className="text-xs font-bold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>{i + 1}</span>
                  <span className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>{ws.name}</span>
                  <span className="text-xs" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>{ws.flagshipGoal}</span>
                  <span className="text-xs" style={{ color: "#6b7280" }}>{ws.leader}</span>
                  <div>
                    {ryg ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "var(--font-geist-mono)" }}>
                        {meta.label}
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
        </div>

        {/* Workstream Overview table */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
          Workstream Overview
        </p>
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

        <div className="mt-14 mb-6 flex items-center gap-4">
          <div className="flex-1" style={{ height: "1px", backgroundColor: "#d1cfc9" }} />
          <p className="text-xs font-semibold uppercase tracking-widest shrink-0"
            style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>
            Workstream Tasks
          </p>
          <div className="flex-1" style={{ height: "1px", backgroundColor: "#d1cfc9" }} />
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
        const meta = RYG_META[ryg];

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
  meta: typeof RYG_META[RYG];
  onRygChange: (r: RYG) => void;
  onNoteChange: (n: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(note);
  const RYGS: RYG[] = ["Green", "Yellow", "Red"];

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

      {/* RYG toggle */}
      <div className="flex items-center gap-1 pt-0.5">
        {RYGS.map((r) => {
          const m = RYG_META[r];
          const active = ryg === r;
          return (
            <button
              key={r}
              onClick={() => onRygChange(active ? "" : r)}
              title={m.label}
              className="w-5 h-5 rounded-full transition-all border-2 flex-shrink-0"
              style={{
                backgroundColor: active ? m.dot : "transparent",
                borderColor: active ? m.dot : "#d1d5db",
              }}
            />
          );
        })}
        {ryg && (
          <span className="text-xs ml-1" style={{ color: meta.color, fontFamily: "var(--font-geist-mono)" }}>
            {meta.label}
          </span>
        )}
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
  rygCounts: { Green: number; Yellow: number; Red: number };
}) {
  const noStatus = workstreams.length - rygCounts.Green - rygCounts.Yellow - rygCounts.Red;
  const active   = inProgress + atRisk;

  let healthLine = "";
  if (noStatus === workstreams.length) {
    healthLine = `${workstreams.length} workstreams tracked — no health status set yet.`;
  } else if (rygCounts.Red > 0) {
    healthLine = `${rygCounts.Red} workstream${rygCounts.Red > 1 ? "s are" : " is"} off track${rygCounts.Yellow > 0 ? `, ${rygCounts.Yellow} at risk` : ""}${rygCounts.Green > 0 ? `, ${rygCounts.Green} on track` : ""}.`;
  } else if (rygCounts.Yellow > 0) {
    healthLine = `${rygCounts.Yellow} workstream${rygCounts.Yellow > 1 ? "s are" : " is"} at risk${rygCounts.Green > 0 ? `, ${rygCounts.Green} on track` : ""}${noStatus > 0 ? `, ${noStatus} awaiting status` : ""}.`;
  } else {
    healthLine = `All ${rygCounts.Green} rated workstream${rygCounts.Green > 1 ? "s are" : " is"} on track${noStatus > 0 ? ` — ${noStatus} still awaiting status` : ""}.`;
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
