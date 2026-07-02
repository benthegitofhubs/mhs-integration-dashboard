"use client";

import { useState } from "react";
import { Workstream100, FLAGSHIP_GOALS, KEY_DATES } from "@/lib/hundredday";
import HundredDayCard from "./HundredDayCard";

export type RAG = "Green" | "Amber" | "Red" | "";

export const RAG_META: Record<RAG, { bg: string; color: string; label: string; dot: string }> = {
  Green: { bg: "#dcfce7", color: "#15803d", label: "On Track",  dot: "#15803d" },
  Amber: { bg: "#fef3c7", color: "#b45309", label: "At Risk",   dot: "#f59e0b" },
  Red:   { bg: "#fee2e2", color: "#b91c1c", label: "Off Track", dot: "#b91c1c" },
  "":    { bg: "#f3f4f6", color: "#9ca3af", label: "No Status", dot: "#d1d5db" },
};

type RagMap = Record<string, { rag: RAG; note: string }>;

function initRagMap(workstreams: Workstream100[]): RagMap {
  return Object.fromEntries(workstreams.map((ws) => [ws.id, { rag: "" as RAG, note: "" }]));
}

export default function HundredDayDashboard({ workstreams }: { workstreams: Workstream100[] }) {
  const [ragMap, setRagMap] = useState<RagMap>(() => initRagMap(workstreams));

  const updateRag = (id: string, rag: RAG) =>
    setRagMap((prev) => ({ ...prev, [id]: { ...prev[id], rag } }));

  const updateNote = (id: string, note: string) =>
    setRagMap((prev) => ({ ...prev, [id]: { ...prev[id], note } }));

  const allTasks    = workstreams.flatMap((ws) => ws.tasks);
  const total       = allTasks.length;
  const complete    = allTasks.filter((t) => t.status === "Complete").length;
  const inProgress  = allTasks.filter((t) => t.status === "In Progress").length;
  const atRisk      = allTasks.filter((t) => t.status === "At Risk").length;
  const blocked     = allTasks.filter((t) => t.status === "Blocked").length;
  const notStarted  = allTasks.filter((t) => t.status === "Not Started").length;
  const overallPct  = total > 0 ? Math.round((complete / total) * 100) : 0;

  const ragCounts = {
    Green: workstreams.filter((ws) => ragMap[ws.id]?.rag === "Green").length,
    Amber: workstreams.filter((ws) => ragMap[ws.id]?.rag === "Amber").length,
    Red:   workstreams.filter((ws) => ragMap[ws.id]?.rag === "Red").length,
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

        {/* Task stats + RAG summary side by side */}
        <div className="grid grid-cols-2 gap-6 mb-10">

          {/* Task progress */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
              Task Progress
            </p>
            <div className="grid grid-cols-3 gap-0" style={{ borderTop: "1px solid #e5e3de" }}>
              <StatCell value={complete}   label="Complete"    color="#1a5c3a" />
              <StatCell value={inProgress} label="In Progress" color="#1d4ed8" />
              <StatCell value={blocked}    label="Blocked"     color="#b91c1c" />
            </div>
            <div className="h-1 overflow-hidden flex mt-3" style={{ backgroundColor: "#e5e3de" }}>
              {complete > 0   && <div style={{ width: `${(complete / total) * 100}%`,   backgroundColor: "#1a5c3a" }} />}
              {inProgress > 0 && <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: "#1d4ed8" }} />}
              {atRisk > 0     && <div style={{ width: `${(atRisk / total) * 100}%`,     backgroundColor: "#c2410c" }} />}
              {blocked > 0    && <div style={{ width: `${(blocked / total) * 100}%`,    backgroundColor: "#b91c1c" }} />}
              {notStarted > 0 && <div style={{ width: `${(notStarted / total) * 100}%`, backgroundColor: "#d1d5db" }} />}
            </div>
            <p className="text-xs mt-1" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
              {overallPct}% COMPLETE · {total} TOTAL TASKS
            </p>
          </div>

          {/* RAG health */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
              Workstream Health
            </p>
            <div className="grid grid-cols-3 gap-0" style={{ borderTop: "1px solid #e5e3de" }}>
              <StatCell value={ragCounts.Green} label="On Track"  color="#15803d" />
              <StatCell value={ragCounts.Amber} label="At Risk"   color="#b45309" />
              <StatCell value={ragCounts.Red}   label="Off Track" color="#b91c1c" />
            </div>
            <div className="h-1 overflow-hidden flex mt-3" style={{ backgroundColor: "#e5e3de" }}>
              {ragCounts.Green > 0 && <div style={{ width: `${(ragCounts.Green / workstreams.length) * 100}%`, backgroundColor: "#15803d" }} />}
              {ragCounts.Amber > 0 && <div style={{ width: `${(ragCounts.Amber / workstreams.length) * 100}%`, backgroundColor: "#f59e0b" }} />}
              {ragCounts.Red > 0   && <div style={{ width: `${(ragCounts.Red / workstreams.length) * 100}%`,   backgroundColor: "#b91c1c" }} />}
              <div style={{ width: `${((workstreams.length - ragCounts.Green - ragCounts.Amber - ragCounts.Red) / workstreams.length) * 100}%`, backgroundColor: "#d1d5db" }} />
            </div>
            <p className="text-xs mt-1" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
              {workstreams.length - ragCounts.Green - ragCounts.Amber - ragCounts.Red} WORKSTREAMS AWAITING STATUS
            </p>
          </div>
        </div>

        {/* Flagship goals / RAG overview table */}
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
            <span>RAG</span>
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
                ragMap={ragMap}
                onRagChange={updateRag}
                onNoteChange={updateNote}
              />
            );
          })}
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", paddingBottom: "8px" }}>
          Workstreams
        </p>
      </div>

      {/* Workstream cards */}
      <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
        {workstreams.map((ws, i) => (
          <HundredDayCard
            key={ws.id}
            workstream={ws}
            index={i + 1}
            rag={ragMap[ws.id]?.rag ?? ""}
            ragNote={ragMap[ws.id]?.note ?? ""}
            onRagChange={(rag) => updateRag(ws.id, rag)}
            onRagNoteChange={(note) => updateNote(ws.id, note)}
          />
        ))}
      </div>
    </main>
  );
}

function FlagshipGroup({
  label, workstreams, ragMap, onRagChange, onNoteChange,
}: {
  label: string;
  workstreams: Workstream100[];
  ragMap: RagMap;
  onRagChange: (id: string, rag: RAG) => void;
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
        const { rag, note } = ragMap[ws.id] ?? { rag: "" as RAG, note: "" };
        const meta = RAG_META[rag];

        return (
          <OverviewRow
            key={ws.id}
            ws={ws}
            rag={rag}
            note={note}
            pct={pct}
            meta={meta}
            onRagChange={(r) => onRagChange(ws.id, r)}
            onNoteChange={(n) => onNoteChange(ws.id, n)}
          />
        );
      })}
    </>
  );
}

function OverviewRow({
  ws, rag, note, pct, meta, onRagChange, onNoteChange,
}: {
  ws: Workstream100;
  rag: RAG;
  note: string;
  pct: number;
  meta: typeof RAG_META[RAG];
  onRagChange: (r: RAG) => void;
  onNoteChange: (n: string) => void;
}) {
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState(note);

  const RAGS: RAG[] = ["Green", "Amber", "Red"];

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
        <p className="text-xs" style={{ color: "#9ca3af" }}>{ws.leader}</p>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: "#78716c" }}>{ws.goal}</p>

      {/* RAG toggle */}
      <div className="flex items-center gap-1 pt-0.5">
        {RAGS.map((r) => {
          const m = RAG_META[r];
          const active = rag === r;
          return (
            <button
              key={r}
              onClick={() => onRagChange(active ? "" : r)}
              title={m.label}
              className="w-5 h-5 rounded-full transition-all border-2 flex-shrink-0"
              style={{
                backgroundColor: active ? m.dot : "transparent",
                borderColor: active ? m.dot : "#d1d5db",
              }}
            />
          );
        })}
        {rag && (
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
