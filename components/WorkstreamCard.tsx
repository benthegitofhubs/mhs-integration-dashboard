"use client";

import { useState } from "react";
import { Workstream, Task, Status, Priority } from "@/lib/workstreams";

const STATUS_COLORS: Record<Status, string> = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-700",
  "Blocked":     "bg-red-100 text-red-700",
  "Complete":    "bg-green-100 text-green-700",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  CRITICAL: "text-red-400",
  HIGH:     "text-orange-400",
  MEDIUM:   "text-yellow-400",
  LOW:      "text-gray-400",
};

const STATUSES: Status[] = ["Not Started", "In Progress", "Blocked", "Complete"];

export default function WorkstreamCard({ workstream }: { workstream: Workstream }) {
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-gray-900 text-base">{workstream.name}</h2>
              {blocked > 0 && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                  {blocked} blocked
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{workstream.objective}</p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="hidden sm:flex items-center gap-4 text-xs">
              <span className="text-green-600 font-medium">{complete} done</span>
              <span className="text-blue-600">{inProgress} active</span>
              <span className="text-gray-400">{total} total</span>
            </div>

            <div className="w-24">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct === 100 ? "#16a34a" : "#3b82f6",
                  }}
                />
              </div>
            </div>

            <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {/* Task table */}
      {expanded && (
        <div className="border-t border-gray-200">
          {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
            <div key={phase}>
              <div className="px-6 py-2 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {phase}
              </div>
              {phaseTasks.map((task) => (
                <div
                  key={task.id}
                  className="px-6 py-3 border-t border-gray-100 hover:bg-gray-50 flex items-start gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">{task.description}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-xs font-semibold ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-400">{task.monthTarget}</span>
                      <span className="text-xs text-gray-400">{task.owner}</span>
                    </div>
                    {task.notes && (
                      <p className="text-xs text-gray-400 mt-1 italic">{task.notes}</p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Status)}
                      disabled={saving === task.id}
                      className={`text-xs px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${STATUS_COLORS[task.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
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
