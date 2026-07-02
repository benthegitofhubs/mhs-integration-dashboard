"use client";

import { useState } from "react";
import { Workstream100, Task100, Status100 } from "@/lib/hundredday";
import { RAG, RAG_META } from "./HundredDayDashboard";

const STATUS_COLOR: Record<Status100, string> = {
  "Not Started": "#9ca3af",
  "In Progress": "#1d4ed8",
  "At Risk":     "#c2410c",
  "Blocked":     "#b91c1c",
  "Complete":    "#1a5c3a",
};

const STATUS_BG: Record<Status100, string> = {
  "Not Started": "#f3f4f6",
  "In Progress": "#dbeafe",
  "At Risk":     "#ffedd5",
  "Blocked":     "#fee2e2",
  "Complete":    "#dcfce7",
};

const STATUSES: Status100[] = ["Not Started", "In Progress", "At Risk", "Blocked", "Complete"];
const RAGS: RAG[] = ["Green", "Amber", "Red"];

interface Props {
  workstream: Workstream100;
  index: number;
  rag: RAG;
  ragNote: string;
  onRagChange: (rag: RAG) => void;
  onRagNoteChange: (note: string) => void;
}

export default function HundredDayCard({ workstream, index, rag, ragNote, onRagChange, onRagNoteChange }: Props) {
  const [tasks, setTasks] = useState<Task100[]>(workstream.tasks);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(workstream.tasks.map((t) => [t.id, t.notes]))
  );
  const [editingRagNote, setEditingRagNote] = useState(false);
  const [ragNoteDraft, setRagNoteDraft] = useState(ragNote);

  const total      = tasks.length;
  const complete   = tasks.filter((t) => t.status === "Complete").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = tasks.filter((t) => t.status === "At Risk").length;
  const blocked    = tasks.filter((t) => t.status === "Blocked").length;
  const notStarted = tasks.filter((t) => t.status === "Not Started").length;
  const pct        = total > 0 ? Math.round((complete / total) * 100) : 0;

  const ragMeta = RAG_META[rag];

  const handleStatusChange = async (taskId: string, newStatus: Status100) => {
    setSaving(taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus, workstreamId: workstream.id }),
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div style={{ backgroundColor: "white", border: "1px solid #e5e3de", borderRadius: "6px", overflow: "hidden" }}>

      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left transition-colors"
        style={{ padding: "16px 24px", backgroundColor: expanded ? "#fafaf8" : "white", outline: "none" }}
      >
        <div className="flex items-start justify-between gap-6">

          {/* Left: index · name · leader + RAG row */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)", minWidth: "16px" }}>
                {index}
              </span>
              <span style={{ color: "#d1cfc9" }}>·</span>
              <h2 className="text-sm font-bold" style={{ color: "#111" }}>{workstream.name}</h2>
              <span style={{ color: "#d1cfc9" }}>·</span>
              <span className="text-xs" style={{ color: "#9ca3af" }}>{workstream.leader}</span>

              {/* RAG toggle — stop propagation so clicking doesn't collapse card */}
              <span style={{ color: "#d1cfc9" }}>·</span>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {RAGS.map((r) => {
                  const m = RAG_META[r];
                  const active = rag === r;
                  return (
                    <button
                      key={r}
                      onClick={() => onRagChange(active ? "" : r)}
                      title={m.label}
                      className="w-4 h-4 rounded-full transition-all border-2 flex-shrink-0"
                      style={{
                        backgroundColor: active ? m.dot : "transparent",
                        borderColor: active ? m.dot : "#d1d5db",
                      }}
                    />
                  );
                })}
                {rag && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: ragMeta.bg, color: ragMeta.color, fontFamily: "var(--font-geist-mono)" }}>
                    {ragMeta.label}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "#78716c", paddingLeft: "22px" }}>
              {workstream.goal}
            </p>

            {/* Weekly RAG note */}
            <div className="mt-1.5" style={{ paddingLeft: "22px" }} onClick={(e) => e.stopPropagation()}>
              {editingRagNote ? (
                <textarea
                  autoFocus
                  value={ragNoteDraft}
                  onChange={(e) => setRagNoteDraft(e.target.value)}
                  onBlur={() => { onRagNoteChange(ragNoteDraft); setEditingRagNote(false); }}
                  onKeyDown={(e) => { if (e.key === "Escape") setEditingRagNote(false); }}
                  rows={2}
                  placeholder="Add weekly status note…"
                  className="w-full text-xs leading-relaxed rounded px-2 py-1.5 resize-none focus:outline-none"
                  style={{ border: "1px solid #d1cfc9", backgroundColor: "#fafaf8", color: "#57534e", maxWidth: "480px" }}
                />
              ) : (
                <p
                  className="text-xs leading-relaxed cursor-pointer inline-block rounded px-1 -mx-1 hover:bg-stone-100 transition-colors"
                  style={{ color: ragNote ? "#57534e" : "#c0bdb8", fontStyle: ragNote ? "normal" : "italic" }}
                  onClick={() => { setRagNoteDraft(ragNote); setEditingRagNote(true); }}
                >
                  {ragNote || "Add weekly status note…"}
                </p>
              )}
            </div>
          </div>

          {/* Right: mini counts + segmented bar */}
          <div className="flex items-center gap-8 shrink-0">
            <div className="hidden sm:flex items-center gap-5 text-xs" style={{ fontFamily: "var(--font-geist-mono)" }}>
              <span style={{ color: "#1a5c3a" }}>{complete}<span style={{ color: "#9ca3af" }}> done</span></span>
              <span style={{ color: "#1d4ed8" }}>{inProgress}<span style={{ color: "#9ca3af" }}> active</span></span>
              {atRisk > 0  && <span style={{ color: "#c2410c" }}>{atRisk}<span style={{ color: "#9ca3af" }}> at risk</span></span>}
              {blocked > 0 && <span style={{ color: "#b91c1c" }}>{blocked}<span style={{ color: "#9ca3af" }}> blocked</span></span>}
            </div>

            <div style={{ width: "140px" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{pct}%</span>
              </div>
              <div className="flex overflow-hidden" style={{ height: "4px", borderRadius: "2px", backgroundColor: "#e5e3de" }}>
                {complete > 0   && <div style={{ width: `${(complete / total) * 100}%`,   backgroundColor: "#1a5c3a" }} />}
                {inProgress > 0 && <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: "#1d4ed8" }} />}
                {atRisk > 0     && <div style={{ width: `${(atRisk / total) * 100}%`,     backgroundColor: "#c2410c" }} />}
                {blocked > 0    && <div style={{ width: `${(blocked / total) * 100}%`,    backgroundColor: "#b91c1c" }} />}
                {notStarted > 0 && <div style={{ width: `${(notStarted / total) * 100}%`, backgroundColor: "#d1d5db" }} />}
              </div>
            </div>

            <span className="text-xs" style={{ color: "#c8c5be" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {/* Task table */}
      {expanded && tasks.length > 0 && (
        <div style={{ borderTop: "1px solid #e5e3de" }}>
          <div className="grid text-xs uppercase tracking-widest font-semibold px-6 py-2.5"
            style={{
              gridTemplateColumns: "1fr 110px 110px 120px",
              backgroundColor: "#f7f6f3",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
              borderBottom: "1px solid #e5e3de",
            }}>
            <span>Task</span>
            <span>Due Date</span>
            <span>Owner</span>
            <span>Status</span>
          </div>

          {tasks.map((task, idx) => (
            <div key={task.id} className="grid px-6 py-4 hover:bg-stone-50 transition-colors"
              style={{
                gridTemplateColumns: "1fr 110px 110px 120px",
                borderBottom: idx < tasks.length - 1 ? "1px solid #f0efe9" : "none",
                alignItems: "start",
                gap: "12px",
              }}>
              <div>
                <p className="text-sm leading-relaxed" style={{ color: "#1a1a1a" }}>{task.description}</p>
                {editingNote === task.id ? (
                  <textarea
                    autoFocus
                    value={noteValues[task.id]}
                    onChange={(e) => setNoteValues((prev) => ({ ...prev, [task.id]: e.target.value }))}
                    onBlur={() => {
                      setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, notes: noteValues[task.id] } : t));
                      setEditingNote(null);
                    }}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingNote(null); }}
                    rows={2}
                    placeholder="Add a note..."
                    className="mt-2 w-full text-xs leading-relaxed rounded px-2 py-1.5 resize-none focus:outline-none"
                    style={{ border: "1px solid #d1cfc9", backgroundColor: "#fafaf8", color: "#57534e" }}
                  />
                ) : (
                  <p
                    className="text-xs mt-2 leading-relaxed cursor-pointer rounded px-1 -mx-1 hover:bg-stone-100 transition-colors"
                    style={{ color: noteValues[task.id] ? "#78716c" : "#c0bdb8", fontStyle: "italic" }}
                    onClick={() => setEditingNote(task.id)}
                  >
                    {noteValues[task.id] || "Add a note…"}
                  </p>
                )}
              </div>

              <div className="pt-0.5">
                <span className="text-xs" style={{ color: task.dueDate ? "#57534e" : "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>
                  {task.dueDate || "—"}
                </span>
              </div>

              <div className="pt-0.5">
                <span className="text-xs" style={{ color: task.owner ? "#78716c" : "#c0bdb8" }}>
                  {task.owner || "—"}
                </span>
              </div>

              <div className="pt-0.5">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as Status100)}
                  disabled={saving === task.id}
                  className="text-xs font-semibold cursor-pointer focus:outline-none rounded px-2 py-1"
                  style={{
                    backgroundColor: STATUS_BG[task.status],
                    color: STATUS_COLOR[task.status],
                    border: "none",
                    fontFamily: "var(--font-geist-mono)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && tasks.length === 0 && (
        <div style={{ borderTop: "1px solid #e5e3de", padding: "24px", color: "#c0bdb8", fontSize: "13px", fontStyle: "italic" }}>
          Tasks to be added.
        </div>
      )}
    </div>
  );
}
