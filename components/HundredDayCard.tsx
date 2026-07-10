"use client";

import { useState, useEffect } from "react";
import { Workstream100, Task100, Status100 } from "@/lib/hundredday";
import { STATUS_BG, STATUS_COLOR } from "./HundredDayDashboard";
import { calcTaskHealth, HEALTH_META } from "@/lib/taskHealth";

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

const STATUS_DOT: Record<Status100, string> = {
  "Not Started": "#374151",
  "In Progress": "#1d4ed8",
  "At Risk":     "#eab308",
  "Blocked":     "#b91c1c",
  "Complete":    "#15803d",
};

const STATUSES: Status100[] = ["Not Started", "In Progress", "At Risk", "Blocked", "Complete"];

interface Props {
  workstream: Workstream100;
  index: number;
  derivedStatus: Status100 | null;
}

export default function HundredDayCard({ workstream, index, derivedStatus }: Props) {
  const [tasks, setTasks] = useState<Task100[]>(workstream.tasks);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(workstream.tasks.map((t) => [t.id, t.notes]))
  );
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
    <div id={`ws-${workstream.id}`} style={{ backgroundColor: "white", border: "1px solid #e5e3de", borderRadius: "6px", overflow: "hidden" }}>

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
                  style={{ backgroundColor: "#fef9c3", color: "#854d0e", fontFamily: "var(--font-geist-mono)" }}
                  title="Blocked or at-risk tasks">
                  {stuckCount} stuck
                </span>
              )}

              {/* Derived status badge */}
              {derivedStatus && (
                <>
                  <span style={{ color: "#d1cfc9" }}>·</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: STATUS_BG[derivedStatus], color: STATUS_COLOR[derivedStatus], fontFamily: "var(--font-geist-mono)" }}>
                    {derivedStatus}
                  </span>
                </>
              )}
            </div>

            <p className="text-xs leading-relaxed" style={{ color: "#78716c", paddingLeft: "22px" }}>
              {workstream.goal}
            </p>

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
                {complete > 0   && <div style={{ width: `${(complete / total) * 100}%`,   backgroundColor: STATUS_DOT["Complete"] }} />}
                {inProgress > 0 && <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: STATUS_DOT["In Progress"] }} />}
                {atRisk > 0     && <div style={{ width: `${(atRisk / total) * 100}%`,     backgroundColor: STATUS_DOT["At Risk"] }} />}
                {blocked > 0    && <div style={{ width: `${(blocked / total) * 100}%`,    backgroundColor: STATUS_DOT["Blocked"] }} />}
                {notStarted > 0 && <div style={{ width: `${(notStarted / total) * 100}%`, backgroundColor: STATUS_DOT["Not Started"] }} />}
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
              gridTemplateColumns: "1fr 110px 110px 90px 120px",
              backgroundColor: "#f7f6f3",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
              borderBottom: "1px solid #e5e3de",
            }}>
            <span>Task</span>
            <span>Due Date</span>
            <span>Owner</span>
            <span>Health</span>
            <span>Status</span>
          </div>

          {tasks.map((task, idx) => {
            const health = calcTaskHealth(task);
            const hMeta  = HEALTH_META[health.status];
            return (
            <div key={task.id} className="grid px-6 py-4 hover:bg-stone-50 transition-colors"
              style={{
                gridTemplateColumns: "1fr 110px 110px 90px 120px",
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
                <span className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: hMeta.bg, color: hMeta.color, fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
                  {health.status}
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
            );
          })}
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
