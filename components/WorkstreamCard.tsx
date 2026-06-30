"use client";

import { useState } from "react";
import { Workstream, Task, Status, Priority } from "@/lib/workstreams";

const STATUS_STYLES: Record<Status, { bg: string; text: string; border: string }> = {
  "Not Started": { bg: "white",    text: "#6b7280", border: "#d1d5db" },
  "In Progress": { bg: "#dbeafe",  text: "#1d4ed8", border: "#93c5fd" },
  "Blocked":     { bg: "#fee2e2",  text: "#b91c1c", border: "#fca5a5" },
  "Complete":    { bg: "#dcfce7",  text: "#15803d", border: "#86efac" },
};

const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: "#b91c1c",
  HIGH:     "#c2410c",
  MEDIUM:   "#a16207",
  LOW:      "#6b7280",
};

const STATUSES: Status[] = ["Not Started", "In Progress", "Blocked", "Complete"];

export default function WorkstreamCard({ workstream, index }: { workstream: Workstream; index: number }) {
  const [tasks, setTasks] = useState<Task[]>(workstream.tasks);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const total = tasks.length;
  const complete = tasks.filter((t) => t.status === "Complete").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const blocked = tasks.filter((t) => t.status === "Blocked").length;
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
    <div className="bg-white rounded-lg overflow-hidden" style={{ border: "1px solid #e5e3de" }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-5 transition-colors"
        style={{ backgroundColor: expanded ? "#fafaf8" : "white" }}
      >
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            {/* Number + name */}
            <div className="flex items-baseline gap-3">
              <span className="text-lg font-bold" style={{ color: "#1a5c3a" }}>{index}</span>
              <span className="text-stone-300 font-light">·</span>
              <h2 className="text-base font-bold text-stone-900">{workstream.name}</h2>
              <span className="text-xs text-stone-400 hidden sm:inline">{workstream.monthTarget}</span>
              {blocked > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
                  {blocked} blocked
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed pr-8">{workstream.objective}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            {/* Mini stats */}
            <div className="hidden sm:flex items-center gap-5 text-xs">
              <span style={{ color: "#15803d" }} className="font-medium">{complete} done</span>
              <span style={{ color: "#1d4ed8" }}>{inProgress} active</span>
              <span className="text-stone-400">{total} total</span>
            </div>

            {/* Progress */}
            <div className="w-20">
              <div className="flex justify-between text-xs text-stone-400 mb-1">
                <span>{pct}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e3de" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#15803d" : "#1a5c3a" }}
                />
              </div>
            </div>

            <span className="text-stone-300 text-xs">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {/* Task table */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e5e3de" }}>
          {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
            <div key={phase}>
              {/* Phase header */}
              <div
                className="px-6 py-2"
                style={{ backgroundColor: "#f7f6f3", borderBottom: "1px solid #e5e3de" }}
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-stone-400 font-mono">
                  {phase}
                </span>
              </div>

              {phaseTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-4 flex items-start gap-4 hover:bg-stone-50 transition-colors"
                  style={{ borderBottom: "1px solid #f0efe9" }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 leading-relaxed">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: PRIORITY_COLORS[task.priority] }}
                      >
                        {task.priority}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-400">{task.monthTarget}</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-400">{task.owner}</span>
                    </div>
                    {task.notes && (
                      <p className="text-xs text-stone-400 mt-1.5 italic leading-relaxed">{task.notes}</p>
                    )}
                  </div>

                  {/* Status pill selector */}
                  <div className="shrink-0 mt-0.5">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                      disabled={saving === task.id}
                      className="text-xs px-3 py-1 rounded-full cursor-pointer focus:outline-none font-medium"
                      style={{
                        backgroundColor: STATUS_STYLES[task.status].bg,
                        color: STATUS_STYLES[task.status].text,
                        border: `1px solid ${STATUS_STYLES[task.status].border}`,
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
