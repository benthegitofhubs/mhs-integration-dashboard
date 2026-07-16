"use client";

import { useState, useEffect } from "react";
import { Workstream100, Task100, Status100, Subtask } from "@/lib/hundredday";
import { STATUS_BG, STATUS_COLOR } from "./HundredDayDashboard";
import { calcTaskHealth, HEALTH_META, TaskHealth } from "@/lib/taskHealth";

interface IMNote {
  timestamp: string;
  note: string;
}

// "Aug 15, 2026" → "2026-08-15" (for date input value)
function toInputDate(display: string): string {
  const d = new Date(display);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// "2026-08-15" → "Aug 15, 2026" (to keep sheet format consistent)
function toDisplayDate(input: string): string {
  const d = new Date(input + "T12:00:00");
  if (isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const STATUS_DOT: Record<Status100, string> = {
  "Not Started": "#374151",
  "In Progress": "#1d4ed8",
  "At Risk":     "#eab308",
  "Blocked":     "#b91c1c",
  "Complete":    "#15803d",
};

const STATUSES: Status100[] = ["Not Started", "In Progress", "At Risk", "Blocked", "Complete"];

type RaciField = "dueDate" | "accountable" | "responsible" | "consulted" | "informed";

// RACI roles rendered below each task
const RACI: { key: "accountable" | "responsible" | "consulted" | "informed"; label: string }[] = [
  { key: "accountable", label: "A" },
  { key: "responsible", label: "R" },
  { key: "consulted",   label: "C" },
  { key: "informed",    label: "I" },
];

interface Props {
  workstream: Workstream100;
  index: number;
  derivedStatus: Status100 | null;
}

export default function HundredDayCard({ workstream, index, derivedStatus }: Props) {
  const [tasks, setTasks] = useState<Task100[]>(workstream.tasks);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [sortByDate, setSortByDate] = useState<"asc" | "desc" | null>(null);
  const [sortByRank, setSortByRank] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>(
    Object.fromEntries(workstream.tasks.map((t) => [t.id, t.notes]))
  );
  const [editingField, setEditingField] = useState<{ taskId: string; field: RaciField } | null>(null);
  const [fieldDraft, setFieldDraft] = useState("");
  const [editingRank, setEditingRank] = useState<string | null>(null);
  const [rankDraft, setRankDraft] = useState("");
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const [subtasksOpen, setSubtasksOpen] = useState<Record<string, boolean>>({});
  const [newSubtaskDraft, setNewSubtaskDraft] = useState<Record<string, string>>({});
  const [leader, setLeader] = useState(workstream.leader);
  const [editingLeader, setEditingLeader] = useState(false);
  const [leaderDraft, setLeaderDraft] = useState(workstream.leader);
  const [statusOverride, setStatusOverride] = useState<string | null>(workstream.statusOverride);
  const [imNotes, setImNotes] = useState<IMNote[]>([]);
  const [imDraft, setImDraft] = useState("");
  const [imHistoryOpen, setImHistoryOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/im-notes?workstreamId=${workstream.id}`)
      .then((r) => r.json())
      .then((data) => setImNotes(data.notes ?? []))
      .catch(() => {});
  }, [workstream.id]);

  // Auto-expand + scroll (and highlight a task) when targeted via
  // #ws-<id> or #ws-<id>~<taskId> (e.g. from Needs Action)
  useEffect(() => {
    const focus = () => {
      const prefix = `#ws-${workstream.id}`;
      const h = window.location.hash;
      if (h !== prefix && !h.startsWith(`${prefix}~`)) return;
      setExpanded(true);
      const taskId = h.startsWith(`${prefix}~`) ? h.slice(prefix.length + 1) : null;
      setTimeout(() => {
        const el = taskId
          ? document.getElementById(`task-${taskId}`)
          : document.getElementById(`ws-${workstream.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: taskId ? "center" : "start" });
        if (taskId) {
          setHighlightTaskId(taskId);
          setTimeout(() => setHighlightTaskId(null), 2200);
        }
      }, 80);
    };
    focus();
    window.addEventListener("hashchange", focus);
    return () => window.removeEventListener("hashchange", focus);
  }, [workstream.id]);

  const saveImNote = async () => {
    if (!imDraft.trim()) return;
    const entry: IMNote = { timestamp: new Date().toISOString(), note: imDraft.trim() };
    setImNotes((prev) => [...prev, entry]);
    setImDraft("");
    await fetch("/api/im-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workstreamId: workstream.id, ...entry }),
    });
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


  const startEditField = (taskId: string, field: RaciField) => {
    const task = tasks.find((t) => t.id === taskId);
    const raw = field === "dueDate" ? (task?.dueDate || "") : ((task?.[field] as string) || "");
    setFieldDraft(field === "dueDate" ? toInputDate(raw) : raw);
    setEditingField({ taskId, field });
  };

  const saveField = async (taskId: string, field: RaciField) => {
    setEditingField(null);
    const value = field === "dueDate" && fieldDraft ? toDisplayDate(fieldDraft) : fieldDraft.trim();
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, [field]: value } : t));
    const task = tasks.find((t) => t.id === taskId);
    await fetch("/api/update-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, taskDescription: task?.description, workstreamId: workstream.id, field, value }),
    });
  };

  const saveRanking = async (taskId: string) => {
    const raw = rankDraft.trim();
    setEditingRank(null);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Empty clears the ranking
    const num = raw === "" ? null : parseInt(raw, 10);
    if (raw !== "" && (num === null || isNaN(num) || num < 1)) {
      alert("Ranking must be a whole number (1 or higher).");
      return;
    }
    if (num === task.ranking) return; // no change

    // Enforce uniqueness within this workstream
    if (num !== null && tasks.some((t) => t.id !== taskId && t.ranking === num)) {
      alert(`Rank ${num} is already assigned to another task in this workstream. Each task must have a unique rank.`);
      return;
    }

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ranking: num } : t)));
    await fetch("/api/update-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, taskDescription: task.description, workstreamId: workstream.id, field: "ranking", value: num === null ? "" : String(num) }),
    });
  };

  const toggleSubtask = async (taskId: string, subtaskIdx: number, done: boolean) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated = task.subtasks.map((s, i) => i === subtaskIdx ? { ...s, done } : s);
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, subtasks: updated } : t));
    await fetch("/api/update-subtasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, taskDescription: task.description, workstreamId: workstream.id, subtasks: updated }),
    });
  };

  const addSubtask = async (taskId: string) => {
    const text = (newSubtaskDraft[taskId] || "").trim();
    if (!text) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated: Subtask[] = [...task.subtasks, { text, done: false }];
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, subtasks: updated } : t));
    setNewSubtaskDraft((prev) => ({ ...prev, [taskId]: "" }));
    await fetch("/api/update-subtasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, taskDescription: task.description, workstreamId: workstream.id, subtasks: updated }),
    });
  };

  const sortedTasks = (() => {
    if (sortByRank) {
      return [...tasks].sort((a, b) => {
        if (a.ranking == null && b.ranking == null) return 0;
        if (a.ranking == null) return 1;
        if (b.ranking == null) return -1;
        return a.ranking - b.ranking;
      });
    }
    if (sortByDate) {
      return [...tasks].sort((a, b) => {
        const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return sortByDate === "asc" ? da - db : db - da;
      });
    }
    return tasks;
  })();

  const handleStatusChange = async (taskId: string, newStatus: Status100) => {
    setSaving(taskId);
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, taskDescription: task?.description, status: newStatus, workstreamId: workstream.id }),
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
              {editingLeader ? (
                <input
                  autoFocus
                  type="text"
                  value={leaderDraft}
                  onChange={(e) => setLeaderDraft(e.target.value)}
                  onBlur={async () => {
                    setEditingLeader(false);
                    const trimmed = leaderDraft.trim();
                    if (!trimmed || trimmed === leader) return;
                    setLeader(trimmed);
                    await fetch("/api/update-leader", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ workstreamId: workstream.id, leader: trimmed }),
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") { setLeaderDraft(leader); setEditingLeader(false); }
                  }}
                  className="text-xs rounded px-1 py-0.5 focus:outline-none"
                  style={{ border: "1px solid #1a5c3a", color: "#374151", width: "160px" }}
                />
              ) : (
                <span
                  className="text-xs cursor-pointer hover:underline"
                  style={{ color: "#9ca3af" }}
                  onClick={(e) => { e.stopPropagation(); setLeaderDraft(leader); setEditingLeader(true); }}
                  title="Click to edit leader"
                >
                  {leader || "—"}
                </span>
              )}

              {/* Workstream health — shows override if set, otherwise derived; click to override */}
              {(() => {
                const OVERRIDE_OPTIONS = ["On Track", "In Progress", "At Risk", "Blocked", "Off Track", "Complete"];
                // A value may be a health (HEALTH_META) or a status (STATUS_BG) — try both.
                const bgOf = (v: string) => HEALTH_META[v as TaskHealth]?.bg ?? STATUS_BG[v as Status100] ?? "#f3f4f6";
                const colorOf = (v: string) => HEALTH_META[v as TaskHealth]?.color ?? STATUS_COLOR[v as Status100] ?? "#374151";
                const isOverride = statusOverride != null && statusOverride !== "";
                const display = isOverride ? statusOverride : derivedStatus;
                if (!display) return null;
                const bg = bgOf(display);
                const color = colorOf(display);
                return (
                  <>
                    <span style={{ color: "#d1cfc9" }}>·</span>
                    <select
                      value={statusOverride ?? ""}
                      onChange={async (e) => {
                        const val = e.target.value || null;
                        setStatusOverride(val);
                        await fetch("/api/update-workstream-status", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ workstreamId: workstream.id, status: val }),
                        });
                      }}
                      className="text-xs font-semibold px-2 py-0.5 rounded cursor-pointer focus:outline-none"
                      style={{ backgroundColor: bg, color, border: "none", fontFamily: "var(--font-geist-mono)" }}
                      title={isOverride ? "Manual override — select Auto to clear" : "Auto-computed — select to override"}
                    >
                      <option value="">{derivedStatus ?? "—"}</option>
                      {OVERRIDE_OPTIONS.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    {isOverride && (
                      <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }} title="Manual override active">⚙</span>
                    )}
                  </>
                );
              })()}
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
              {atRisk > 0      && <span style={{ color: "#c2410c" }}>{atRisk}<span style={{ color: "#9ca3af" }}> at risk</span></span>}
              {blocked > 0     && <span style={{ color: "#ea580c" }}>{blocked}<span style={{ color: "#9ca3af" }}> blocked</span></span>}
              {overdueCount > 0 && <span style={{ color: "#b91c1c" }}>{overdueCount}<span style={{ color: "#9ca3af" }}> off track</span></span>}
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
              gridTemplateColumns: "36px 1fr 110px 90px 120px",
              backgroundColor: "#f7f6f3",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
              borderBottom: "1px solid #e5e3de",
            }}>
            <button
              onClick={() => {
                setSortByRank((r) => !r);
                if (!sortByRank) setSortByDate(null);
              }}
              className="text-left flex items-center"
              style={{ background: "none", border: "none", cursor: "pointer", color: sortByRank ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}
              title="Sort by ranking"
            >
              #{sortByRank ? " ↑" : ""}
            </button>
            <span>Task</span>
            <button
              onClick={() => setSortByDate((s) => s === "asc" ? "desc" : s === "desc" ? null : "asc")}
              className="text-left flex items-center gap-1"
              style={{ background: "none", border: "none", cursor: "pointer", color: sortByDate ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}
            >
              Due Date {sortByDate === "asc" ? "↑" : sortByDate === "desc" ? "↓" : "↕"}
            </button>
            <span>Health</span>
            <span>Status</span>
          </div>

          {sortedTasks.map((task, idx) => {
            const health = calcTaskHealth(task);
            const hMeta  = HEALTH_META[health.status];
            const hasSubtasks = task.subtasks.length > 0;
            const subtaskOpen = !!subtasksOpen[task.id];
            const doneCount = task.subtasks.filter((s) => s.done).length;
            return (
            <div key={task.id} id={`task-${task.id}`}
              style={{
                borderBottom: idx < tasks.length - 1 ? "1px solid #f0efe9" : "none",
                backgroundColor: highlightTaskId === task.id ? "#fef9c3" : undefined,
                transition: "background-color 0.6s ease",
              }}>
            <div className="grid px-6 py-4 hover:bg-stone-50 transition-colors"
              style={{
                gridTemplateColumns: "36px 1fr 110px 90px 120px",
                alignItems: "start",
                gap: "12px",
              }}>

              {/* Ranking — click to edit, unique per workstream */}
              <div className="pt-0.5 flex items-center justify-center">
                {editingRank === task.id ? (
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    value={rankDraft}
                    onChange={(e) => setRankDraft(e.target.value)}
                    onBlur={() => saveRanking(task.id)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveRanking(task.id); if (e.key === "Escape") setEditingRank(null); }}
                    className="text-xs font-bold rounded w-10 text-center focus:outline-none"
                    style={{ border: "1px solid #1a5c3a", color: "#374151", fontFamily: "var(--font-geist-mono)" }}
                  />
                ) : task.ranking != null ? (
                  <span
                    onClick={() => { setRankDraft(String(task.ranking)); setEditingRank(task.id); }}
                    className="text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-stone-300"
                    style={{ backgroundColor: "#f0efe9", color: "#78716c", fontFamily: "var(--font-geist-mono)" }}
                    title="Click to edit rank"
                  >
                    {task.ranking}
                  </span>
                ) : (
                  <span
                    onClick={() => { setRankDraft(""); setEditingRank(task.id); }}
                    className="cursor-pointer hover:underline"
                    style={{ color: "#d6d3cd", fontFamily: "var(--font-geist-mono)", fontSize: "11px" }}
                    title="Click to set rank"
                  >
                    —
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-start gap-2">
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#1a1a1a" }}>{task.description}</p>
                  <button
                    onClick={() => setSubtasksOpen((prev) => ({ ...prev, [task.id]: !prev[task.id] }))}
                    className="flex-shrink-0 flex items-center gap-1 text-xs rounded px-1.5 py-0.5 mt-0.5 transition-colors"
                    style={{
                      border: "1px solid #e5e3de",
                      color: hasSubtasks ? "#57534e" : "#c0bdb8",
                      backgroundColor: subtaskOpen ? "#f0efe9" : "transparent",
                      cursor: "pointer",
                      fontFamily: "var(--font-geist-mono)",
                    }}
                    title={subtaskOpen ? "Hide subtasks" : "Show subtasks"}
                  >
                    {hasSubtasks ? `${doneCount}/${task.subtasks.length}` : "+"} ☰
                  </button>
                </div>

                {/* RACI — Accountable / Responsible / Consulted / Informed */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {RACI.map(({ key, label }) => (
                    <span key={key} className="inline-flex items-center gap-1 text-xs">
                      <span
                        className="font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "#f0efe9", color: "#78716c", fontFamily: "var(--font-geist-mono)", fontSize: "10px" }}
                        title={key.charAt(0).toUpperCase() + key.slice(1)}
                      >
                        {label}
                      </span>
                      {editingField?.taskId === task.id && editingField.field === key ? (
                        <input
                          autoFocus
                          type="text"
                          value={fieldDraft}
                          onChange={(e) => setFieldDraft(e.target.value)}
                          onBlur={() => saveField(task.id, key)}
                          onKeyDown={(e) => { if (e.key === "Enter") saveField(task.id, key); if (e.key === "Escape") setEditingField(null); }}
                          placeholder="Name"
                          className="text-xs rounded px-1 py-0.5 focus:outline-none"
                          style={{ border: "1px solid #1a5c3a", color: "#374151", width: "120px" }}
                        />
                      ) : (
                        <span
                          onClick={() => startEditField(task.id, key)}
                          className="cursor-pointer hover:underline"
                          style={{ color: (task[key] as string) ? "#57534e" : "#c0bdb8" }}
                          title="Click to edit"
                        >
                          {(task[key] as string) || "—"}
                        </span>
                      )}
                    </span>
                  ))}
                </div>

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
                {editingField?.taskId === task.id && editingField.field === "dueDate" ? (
                  <input
                    autoFocus
                    type="date"
                    value={fieldDraft}
                    onChange={(e) => setFieldDraft(e.target.value)}
                    onBlur={() => saveField(task.id, "dueDate")}
                    onKeyDown={(e) => { if (e.key === "Enter") saveField(task.id, "dueDate"); if (e.key === "Escape") setEditingField(null); }}
                    className="text-xs rounded px-1 py-0.5 focus:outline-none w-full"
                    style={{ border: "1px solid #1a5c3a", fontFamily: "var(--font-geist-mono)", color: "#374151" }}
                  />
                ) : (
                  <span
                    onClick={() => startEditField(task.id, "dueDate")}
                    className="text-xs cursor-pointer hover:underline"
                    style={{ color: isOverdue(task) ? "#b91c1c" : task.dueDate ? "#57534e" : "#c0bdb8", fontFamily: "var(--font-geist-mono)", fontWeight: isOverdue(task) ? 600 : undefined }}
                    title="Click to edit"
                  >
                    {task.dueDate || "—"}
                  </span>
                )}
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

            {/* Subtasks panel */}
            {subtaskOpen && (
              <div className="px-6 pb-4" style={{ backgroundColor: "#fafaf8", borderTop: "1px solid #f0efe9" }}>
                <div className="pt-3 space-y-1">
                  {task.subtasks.length === 0 && (
                    <p className="text-xs italic" style={{ color: "#c0bdb8" }}>No subtasks yet — add one below.</p>
                  )}
                  {task.subtasks.map((sub, si) => (
                    <div key={si} className="flex items-center gap-2 group">
                      <input
                        type="checkbox"
                        checked={sub.done}
                        onChange={(e) => toggleSubtask(task.id, si, e.target.checked)}
                        className="rounded"
                        style={{ accentColor: "#1a5c3a", width: "14px", height: "14px", flexShrink: 0, cursor: "pointer" }}
                      />
                      <span className="text-xs leading-relaxed flex-1" style={{
                        color: sub.done ? "#c0bdb8" : "#57534e",
                        textDecoration: sub.done ? "line-through" : "none",
                      }}>
                        {sub.text}
                      </span>
                      <button
                        onClick={async () => {
                          const t = tasks.find((t) => t.id === task.id);
                          if (!t) return;
                          const updated = t.subtasks.filter((_, i) => i !== si);
                          setTasks((prev) => prev.map((t) => t.id === task.id ? { ...t, subtasks: updated } : t));
                          await fetch("/api/update-subtasks", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ taskId: task.id, taskDescription: task.description, workstreamId: workstream.id, subtasks: updated }),
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs rounded px-1"
                        style={{ border: "none", background: "none", color: "#b91c1c", cursor: "pointer", flexShrink: 0 }}
                        title="Delete subtask"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={newSubtaskDraft[task.id] || ""}
                    onChange={(e) => setNewSubtaskDraft((prev) => ({ ...prev, [task.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") addSubtask(task.id); }}
                    placeholder="Add subtask…"
                    className="flex-1 text-xs rounded px-2 py-1 focus:outline-none"
                    style={{ border: "1px solid #d1cfc9", backgroundColor: "white", color: "#374151" }}
                  />
                  <button
                    onClick={() => addSubtask(task.id)}
                    className="text-xs rounded px-3 py-1 font-semibold"
                    style={{ backgroundColor: "#1a5c3a", color: "white", border: "none", cursor: "pointer" }}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
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
