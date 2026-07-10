"use client";

import { useState, useEffect } from "react";
import { Workstream100, Task100, Status100 } from "@/lib/hundredday";
import { RYG, RYG_META } from "./HundredDayDashboard";

interface IMNote {
  timestamp: string;
  note: string;
}

function loadIMNotes(workstreamId: string): IMNote[] {
  try {
    return JSON.parse(localStorage.getItem(`im-notes-${workstreamId}`) ?? "[]");
  } catch { return []; }
}

function saveIMNotes(workstreamId: string, notes: IMNote[]) {
  localStorage.setItem(`im-notes-${workstreamId}`, JSON.stringify(notes));
}

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
const RYGS: RYG[] = ["Green", "Yellow", "Red"];

interface Props {
  workstream: Workstream100;
  index: number;
  ryg: RYG;
  rygNote: string;
  onRygChange: (ryg: RYG) => void;
  onRygNoteChange: (note: string) => void;
}

export default function HundredDayCard({ workstream, index, ryg, rygNote, onRygChange, onRygNoteChange }: Props) {
  const [tasks, setTasks] = useState<Task100[]>(workstream.tasks);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(workstream.tasks.map((t) => [t.id, t.notes]))
  );
  const [editingRygNote, setEditingRygNote] = useState(false);
  const [rygNoteDraft, setRygNoteDraft] = useState(rygNote);
  const [imNotes, setImNotes] = useState<IMNote[]>([]);
  const [imDraft, setImDraft] = useState("");
  const [imHistoryOpen, setImHistoryOpen] = useState(false);

  useEffect(() => {
    setImNotes(loadIMNotes(workstream.id));
  }, [workstream.id]);

  const saveImNote = () => {
    if (!imDraft.trim()) return;
    const updated = [...imNotes, { timestamp: new Date().toISOString(), note: imDraft.trim() }];
    setImNotes(updated);
    saveIMNotes(workstream.id, updated);
    setImDraft("");
  };

  const total      = tasks.length;
  const complete   = tasks.filter((t) => t.status === "Complete").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = tasks.filter((t) => t.status === "At Risk").length;
  const blocked    = tasks.filter((t) => t.status === "Blocked").length;
  const notStarted = tasks.filter((t) => t.status === "Not Started").length;
  const pct        = total > 0 ? Math.round((complete / total) * 100) : 0;

  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const isOverdue = (t: Task100) => {
    if (t.status === "Complete") return false;
    const d = new Date(t.dueDate);
    return !isNaN(d.getTime()) && d < yesterday;
  };
  const overdueCount = tasks.filter(isOverdue).length;
  const stuckCount   = tasks.filter((t) => t.status === "Blocked" || t.status === "At Risk").length;

  const rygMeta = RYG_META[ryg];

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

              {/* Warning badges */}
              {overdueCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#fee2e2", color: "#b91c1c", fontFamily: "var(--font-geist-mono)" }}
                  title="Tasks past due date">
                  {overdueCount} overdue
                </span>
              )}
              {stuckCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: "#ffedd5", color: "#c2410c", fontFamily: "var(--font-geist-mono)" }}
                  title="Blocked or at-risk tasks">
                  {stuckCount} stuck
                </span>
              )}

              {/* RYG toggle — stop propagation so clicking doesn't collapse card */}
              <span style={{ color: "#d1cfc9" }}>·</span>
              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                {RYGS.map((r) => {
                  const m = RYG_META[r];
                  const active = ryg === r;
                  return (
                    <button
                      key={r}
                      onClick={() => onRygChange(active ? "" : r)}
                      title={m.label}
                      className="w-4 h-4 rounded-full transition-all border-2 flex-shrink-0"
                      style={{
                        backgroundColor: active ? m.dot : "transparent",
                        borderColor: active ? m.dot : "#d1d5db",
                      }}
                    />
                  );
                })}
                {ryg && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: rygMeta.bg, color: rygMeta.color, fontFamily: "var(--font-geist-mono)" }}>
                    {rygMeta.label}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "#78716c", paddingLeft: "22px" }}>
              {workstream.goal}
            </p>

            {/* Weekly RYG note */}
            <div className="mt-1.5" style={{ paddingLeft: "22px" }} onClick={(e) => e.stopPropagation()}>
              {editingRygNote ? (
                <textarea
                  autoFocus
                  value={rygNoteDraft}
                  onChange={(e) => setRygNoteDraft(e.target.value)}
                  onBlur={() => { onRygNoteChange(rygNoteDraft); setEditingRygNote(false); }}
                  onKeyDown={(e) => { if (e.key === "Escape") setEditingRygNote(false); }}
                  rows={2}
                  placeholder="Add weekly status note…"
                  className="w-full text-xs leading-relaxed rounded px-2 py-1.5 resize-none focus:outline-none"
                  style={{ border: "1px solid #d1cfc9", backgroundColor: "#fafaf8", color: "#57534e", maxWidth: "480px" }}
                />
              ) : (
                <p
                  className="text-xs leading-relaxed cursor-pointer inline-block rounded px-1 -mx-1 hover:bg-stone-100 transition-colors"
                  style={{ color: rygNote ? "#57534e" : "#c0bdb8", fontStyle: rygNote ? "normal" : "italic" }}
                  onClick={() => { setRygNoteDraft(rygNote); setEditingRygNote(true); }}
                >
                  {rygNote || "Add weekly status note…"}
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
                <span className="text-xs" style={{ color: isOverdue(task) ? "#b91c1c" : task.dueDate ? "#57534e" : "#c0bdb8", fontFamily: "var(--font-geist-mono)", fontWeight: isOverdue(task) ? 600 : undefined }}>
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

      {/* IM Notes log — always visible when expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e5e3de", backgroundColor: "#fafaf8", padding: "16px 24px" }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>
              Integration Manager Notes
            </span>
            {imNotes.length > 1 && (
              <button
                onClick={() => setImHistoryOpen(!imHistoryOpen)}
                className="text-xs underline"
                style={{ color: "#9ca3af" }}
              >
                {imHistoryOpen ? "hide history" : `view history (${imNotes.length - 1})`}
              </button>
            )}
          </div>

          {/* Latest note */}
          {imNotes.length > 0 && (
            <div className="mb-3 text-xs leading-relaxed" style={{ color: "#374151" }}>
              <span style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", marginRight: "8px" }}>
                {new Date(imNotes[imNotes.length - 1].timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {imNotes[imNotes.length - 1].note}
            </div>
          )}

          {/* History */}
          {imHistoryOpen && imNotes.length > 1 && (
            <div className="mb-3 space-y-2" style={{ borderLeft: "2px solid #e5e3de", paddingLeft: "12px" }}>
              {[...imNotes].slice(0, -1).reverse().map((n, i) => (
                <div key={i} className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>
                  <span style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", marginRight: "8px" }}>
                    {new Date(n.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  {n.note}
                </div>
              ))}
            </div>
          )}

          {/* New note input */}
          <div className="flex gap-2 items-end">
            <textarea
              value={imDraft}
              onChange={(e) => setImDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) saveImNote(); }}
              rows={2}
              placeholder="Add a note… (⌘↵ to save)"
              className="flex-1 text-xs leading-relaxed rounded px-3 py-2 resize-none focus:outline-none"
              style={{ border: "1px solid #d1cfc9", backgroundColor: "white", color: "#374151" }}
            />
            <button
              onClick={saveImNote}
              disabled={!imDraft.trim()}
              className="text-xs font-semibold px-3 py-2 rounded transition-colors"
              style={{
                backgroundColor: imDraft.trim() ? "#1a5c3a" : "#e5e3de",
                color: imDraft.trim() ? "white" : "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
                whiteSpace: "nowrap",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
