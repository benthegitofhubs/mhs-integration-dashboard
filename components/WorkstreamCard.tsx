"use client";

import { useState } from "react";
import { Workstream, Task, Status, Priority } from "@/lib/workstreams";

const STATUS_COLOR: Record<Status, string> = {
  "Not Started": "#9ca3af",
  "In Progress": "#1d4ed8",
  "Blocked":     "#b91c1c",
  "Complete":    "#1a5c3a",
};

const STATUS_BG: Record<Status, string> = {
  "Not Started": "#f3f4f6",
  "In Progress": "#dbeafe",
  "Blocked":     "#fee2e2",
  "Complete":    "#dcfce7",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: "#b91c1c",
  HIGH:     "#c2410c",
  MEDIUM:   "#a16207",
  LOW:      "#9ca3af",
};

const STATUSES: Status[] = ["Not Started", "In Progress", "Blocked", "Complete"];

export default function WorkstreamCard({ workstream, index }: { workstream: Workstream; index: number }) {
  const [tasks, setTasks] = useState<Task[]>(workstream.tasks);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(workstream.tasks.map((t) => [t.id, t.notes]))
  );

  const total = tasks.length;
  const complete = tasks.filter((t) => t.status === "Complete").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const blocked = tasks.filter((t) => t.status === "Blocked").length;
  const notStarted = tasks.filter((t) => t.status === "Not Started").length;
  const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    setSaving(taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
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

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.phase]) acc[task.phase] = [];
    acc[task.phase].push(task);
    return acc;
  }, {});

  return (
    <div style={{ backgroundColor: "white", border: "1px solid #e5e3de", borderRadius: "6px", overflow: "hidden" }}>

      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left transition-colors"
        style={{
          padding: "16px 24px",
          backgroundColor: expanded ? "#fafaf8" : "white",
        }}
      >
        <div className="flex items-start justify-between gap-6">

          {/* Left: index + name + objective */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs font-bold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)", minWidth: "16px" }}>
                {index}
              </span>
              <span style={{ color: "#d1cfc9" }}>·</span>
              <h2 className="text-sm font-bold" style={{ color: "#111" }}>{workstream.name}</h2>
              <span style={{ color: "#d1cfc9" }}>·</span>
              <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                {workstream.monthTarget}
              </span>
              {blocked > 0 && (
                <span className="text-xs font-semibold" style={{ color: "#b91c1c", fontFamily: "var(--font-geist-mono)" }}>
                  · {blocked} BLOCKED
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#78716c", paddingLeft: "22px" }}>
              {workstream.objective}
            </p>
          </div>

          {/* Right: stats + segmented bar */}
          <div className="flex items-center gap-8 shrink-0">

            {/* Mini counts */}
            <div className="hidden sm:flex items-center gap-5 text-xs" style={{ fontFamily: "var(--font-geist-mono)" }}>
              <span style={{ color: "#1a5c3a" }}>{complete}<span style={{ color: "#9ca3af" }}> done</span></span>
              <span style={{ color: "#1d4ed8" }}>{inProgress}<span style={{ color: "#9ca3af" }}> active</span></span>
              {blocked > 0 && <span style={{ color: "#b91c1c" }}>{blocked}<span style={{ color: "#9ca3af" }}> blocked</span></span>}
            </div>

            {/* Segmented bar */}
            <div style={{ width: "140px" }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                  {pct}%
                </span>
              </div>
              <div className="flex overflow-hidden" style={{ height: "4px", borderRadius: "2px", backgroundColor: "#e5e3de" }}>
                {complete > 0 && (
                  <div style={{ width: `${(complete / total) * 100}%`, backgroundColor: "#1a5c3a" }} />
                )}
                {inProgress > 0 && (
                  <div style={{ width: `${(inProgress / total) * 100}%`, backgroundColor: "#1d4ed8" }} />
                )}
                {blocked > 0 && (
                  <div style={{ width: `${(blocked / total) * 100}%`, backgroundColor: "#b91c1c" }} />
                )}
                {notStarted > 0 && (
                  <div style={{ width: `${(notStarted / total) * 100}%`, backgroundColor: "#d1d5db" }} />
                )}
              </div>
            </div>

            <span className="text-xs" style={{ color: "#c8c5be" }}>{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {/* Task table */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e5e3de" }}>

          {/* Column headers */}
          <div
            className="grid text-xs uppercase tracking-widest font-semibold px-6 py-2.5"
            style={{
              gridTemplateColumns: "1fr 80px 100px 120px",
              backgroundColor: "#f7f6f3",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
              borderBottom: "1px solid #e5e3de",
            }}
          >
            <span>Task</span>
            <span>Priority</span>
            <span>Owner</span>
            <span>Status</span>
          </div>

          {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
            <div key={phase}>
              {/* Phase label */}
              <div
                className="px-6 py-1.5 text-xs uppercase tracking-widest"
                style={{
                  color: "#b8b5ae",
                  fontFamily: "var(--font-geist-mono)",
                  backgroundColor: "#fafaf8",
                  borderBottom: "1px solid #f0efe9",
                }}
              >
                {phase}
              </div>

              {phaseTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className="grid px-6 py-4 hover:bg-stone-50 transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 80px 100px 120px",
                    borderBottom: idx < phaseTasks.length - 1 ? "1px solid #f0efe9" : "1px solid #e5e3de",
                    alignItems: "start",
                    gap: "12px",
                  }}
                >
                  {/* Description + notes */}
                  <div>
                    <p className="text-sm leading-relaxed" style={{ color: "#1a1a1a" }}>{task.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                      {task.monthTarget}
                    </p>
                    {/* Editable note */}
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
                        style={{
                          border: "1px solid #d1cfc9",
                          backgroundColor: "#fafaf8",
                          color: "#57534e",
                        }}
                      />
                    ) : (
                      <p
                        className="text-xs mt-2 leading-relaxed cursor-pointer rounded px-1 -mx-1 hover:bg-stone-100 transition-colors"
                        style={{
                          color: noteValues[task.id] ? "#78716c" : "#c0bdb8",
                          fontStyle: "italic",
                        }}
                        onClick={() => setEditingNote(task.id)}
                      >
                        {noteValues[task.id] || "Add a note…"}
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="pt-0.5">
                    <span
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: PRIORITY_COLORS[task.priority], fontFamily: "var(--font-geist-mono)" }}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="pt-0.5">
                    <span className="text-xs" style={{ color: "#78716c" }}>{task.owner}</span>
                  </div>

                  {/* Status selector */}
                  <div className="pt-0.5">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
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
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
