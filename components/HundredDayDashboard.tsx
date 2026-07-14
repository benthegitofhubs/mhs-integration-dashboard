"use client";

import { useState } from "react";
import { Workstream100, KEY_DATES, Status100, LAST_SYNCED } from "@/lib/hundredday";
import HundredDayCard from "./HundredDayCard";
import { calcTaskHealth, rollupWorkstreamHealth, HEALTH_META, TaskHealth } from "@/lib/taskHealth";

export const STATUS_BG: Record<Status100, string> = {
  "Not Started": "#f3f4f6",
  "In Progress": "#dbeafe",
  "At Risk":     "#fef9c3",
  "Blocked":     "#fee2e2",
  "Complete":    "#dcfce7",
};

export const STATUS_COLOR: Record<Status100, string> = {
  "Not Started": "#374151",
  "In Progress": "#1d4ed8",
  "At Risk":     "#854d0e",
  "Blocked":     "#b91c1c",
  "Complete":    "#15803d",
};

// Derives workstream status from its tasks: worst task status wins
function deriveWorkstreamStatus(ws: Workstream100): Status100 | null {
  const tasks = ws.tasks;
  if (tasks.length === 0) return null;
  if (tasks.every((t) => t.status === "Complete"))  return "Complete";
  if (tasks.some((t) => t.status === "Blocked"))    return "Blocked";
  if (tasks.some((t) => t.status === "At Risk"))    return "At Risk";
  if (tasks.some((t) => t.status === "In Progress")) return "In Progress";
  return "Not Started";
}

export default function HundredDayDashboard({ workstreams, loadedAt }: { workstreams: Workstream100[]; loadedAt?: string }) {
  const [activeTab, setActiveTab] = useState<"workstreams" | "by-owner" | "ai-automations" | "needs-action">("workstreams");
  const [leaders, setLeaders] = useState<Record<string, string>>(
    Object.fromEntries(workstreams.map((ws) => [ws.id, ws.leader]))
  );
  const [editingLeader, setEditingLeader] = useState<string | null>(null);
  const [leaderDraft, setLeaderDraft] = useState("");
  const allTasks   = workstreams.flatMap((ws) => ws.tasks);
  const total      = allTasks.length;
  const complete   = allTasks.filter((t) => t.status === "Complete").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = allTasks.filter((t) => t.status === "At Risk").length;
  const blocked    = allTasks.filter((t) => t.status === "Blocked").length;

  // Derived workstream statuses (no manual input needed)
  const wsDerived = Object.fromEntries(
    workstreams.map((ws) => [ws.id, deriveWorkstreamStatus(ws)])
  ) as Record<string, Status100 | null>;

  const wsCounts: Record<Status100, number> = {
    "Not Started": workstreams.filter((ws) => wsDerived[ws.id] === "Not Started").length,
    "In Progress": workstreams.filter((ws) => wsDerived[ws.id] === "In Progress").length,
    "At Risk":     workstreams.filter((ws) => wsDerived[ws.id] === "At Risk").length,
    "Blocked":     workstreams.filter((ws) => wsDerived[ws.id] === "Blocked").length,
    "Complete":    workstreams.filter((ws) => wsDerived[ws.id] === "Complete").length,
  };

  // Pace-gap health rollup (separate from status)
  const autoHealth = Object.fromEntries(
    workstreams.map((ws) => [
      ws.id,
      rollupWorkstreamHealth(ws.tasks.map((t) => calcTaskHealth(t))),
    ])
  ) as Record<string, TaskHealth | null>;

  const autoHealthCounts: Record<TaskHealth, number> = {
    "On Track":  workstreams.filter((ws) => autoHealth[ws.id] === "On Track").length,
    "At Risk":   workstreams.filter((ws) => autoHealth[ws.id] === "At Risk").length,
    "Blocked":   workstreams.filter((ws) => autoHealth[ws.id] === "Blocked").length,
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
          const daysLeft    = Math.max(0, Math.ceil((end - now) / 86400000));
          const daysElapsed = Math.max(0, Math.floor((now - start) / 86400000));
          return (
            <div className="mb-2" style={{ position: "relative" }}>
              <div className="relative" style={{ height: "28px" }}>
                <div className="absolute flex flex-col items-center" style={{ left: `${pct}%`, transform: "translateX(-50%)", top: 0 }}>
                  <span className="text-xs font-semibold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
                    {daysElapsed}d elapsed · Today · {daysLeft}d left
                  </span>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M5 8L0 0H10L5 8Z" fill="#1a5c3a" />
                  </svg>
                </div>
              </div>
              <div className="relative w-full" style={{ height: "4px", backgroundColor: "#e5e3de", borderRadius: "2px" }}>
                {/* Filled progress */}
                <div style={{ width: `${pct}%`, height: "100%", backgroundColor: "#1a5c3a", borderRadius: "2px" }} />
                {/* 100 day tick marks */}
                {Array.from({ length: 99 }, (_, i) => (
                  <div key={i} className="absolute" style={{
                    left: `${((i + 1) / 100) * 100}%`,
                    top: "-3px",
                    width: "1px",
                    height: "10px",
                    backgroundColor: (i + 1) / 100 * 100 <= pct ? "#0f4f2e" : "#c8c5be",
                    opacity: 0.5,
                  }} />
                ))}
                {/* Today marker */}
                <div className="absolute" style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#1a5c3a", border: "2px solid white", boxShadow: "0 0 0 1px #1a5c3a" }} />
                {/* Finish line */}
                <div className="absolute" style={{ right: 0, top: "-6px", width: "2px", height: "16px", backgroundColor: "#9ca3af" }} />
              </div>
            </div>
          );
        })()}

        {/* Key dates */}
        <div className="flex flex-wrap items-center mb-10 overflow-hidden"
          style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
          {KEY_DATES.map((kd, i) => (
            <>
              {kd.label === "Next Board Meeting" ? (
                <BoardMeetingCell key={kd.label} defaultDate={kd.date} />
              ) : (
                <div key={kd.label} className="px-5 py-3 flex flex-col gap-0.5"
                  style={{ borderRight: "1px solid #e5e3de" }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                    {kd.label}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{kd.date}</span>
                </div>
              )}
              {i === 0 && (
                <div key="today" className="px-5 py-3 flex flex-col gap-0.5"
                  style={{ borderRight: "1px solid #e5e3de", backgroundColor: "#f7faf8" }}>
                  <span className="text-xs uppercase tracking-widest" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>
                    Today
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#1a5c3a" }}>
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
            </>
          ))}
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <img src="/RadialMHS.png" alt="Radial × MHS" style={{ height: "56px", width: "auto", opacity: 0.85 }} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-6 px-4 py-3 rounded" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
            <span className="font-semibold" style={{ color: "#15803d" }}>Live sync with the Google Sheet.</span>{" "}
            Status, due date, and owner changes made here write back to the sheet immediately. Data refreshes every 5 minutes.{" "}
            <span className="font-semibold" style={{ color: "#57534e" }}>Last loaded: {loadedAt ?? LAST_SYNCED}.</span>
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ backgroundColor: "#eeede9", width: "fit-content" }}>
          {([
            { id: "workstreams",    label: "Workstreams",   red: false },
            { id: "needs-action",   label: "Needs Action",  red: true  },
            { id: "by-owner",       label: "By Owner",      red: false },
            { id: "ai-automations", label: "AI Automations",red: false },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-md transition-all"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  color: isActive
                    ? (tab.red ? "#b91c1c" : "#1a5c3a")
                    : (tab.red ? "#e06060" : "#9ca3af"),
                  backgroundColor: isActive ? "white" : "transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.07em",
                  whiteSpace: "nowrap",
                }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "ai-automations" && <AIAutomationsView />}

        {activeTab === "by-owner" && (
          <ByOwnerView workstreams={workstreams} />
        )}

        {activeTab === "needs-action" && (
          <NeedsActionView workstreams={workstreams} autoHealth={autoHealth} />
        )}

        {activeTab === "workstreams" && (
        <>
        {/* Workstream Health */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
            <p className="text-sm font-semibold uppercase tracking-widest shrink-0"
              style={{ color: "#111111", fontFamily: "var(--font-geist-mono)" }}>
              Workstream Health
            </p>
            <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
          </div>

          {/* Summary counts: operational state + pace health */}
          <div className="flex mb-3" style={{ borderTop: "1px solid #e5e3de" }}>
            {/* Progress group — 2 cols */}
            <div style={{ flex: "2" }}>
              <div className="text-xs font-semibold uppercase tracking-widest px-5 pt-2 pb-1" style={{ color: "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>Progress</div>
              <div className="grid grid-cols-2">
                <StatCell value={wsCounts["Not Started"]} label="Not Started" color="#374151" />
                <StatCell value={wsCounts["In Progress"]} label="In Progress" color="#1d4ed8" />
              </div>
            </div>
            {/* Vertical separator */}
            <div style={{ width: "1px", backgroundColor: "#e5e3de", margin: "8px 0" }} />
            {/* Health group — pill badges */}
            <div style={{ flex: "4" }}>
              <div className="text-xs font-semibold uppercase tracking-widest px-5 pt-2 pb-1" style={{ color: "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>Health</div>
              <div className="grid grid-cols-2 gap-2 px-5 pb-4">
                {(["On Track", "At Risk", "Blocked", "Off Track"] as TaskHealth[]).map((h) => (
                  <div key={h} className="flex items-center justify-between px-3 py-1.5 rounded"
                    style={{ backgroundColor: HEALTH_META[h].bg }}>
                    <span className="text-xs font-semibold" style={{ color: HEALTH_META[h].color, fontFamily: "var(--font-geist-mono)" }}>{h}</span>
                    <span className="text-xs font-bold" style={{ color: HEALTH_META[h].color, fontFamily: "var(--font-geist-mono)" }}>{autoHealthCounts[h]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          {/* Health legend */}
          <div className="mb-6 rounded-lg overflow-hidden" style={{ border: "1px solid #e5e3de" }}>
            <div style={{ backgroundColor: "white" }}>
              {(([
                { label: "On Track"  as TaskHealth, desc: "Due date has not passed and no manual flag — progressing normally." },
                { label: "At Risk"   as TaskHealth, desc: "Manually flagged At Risk — falling behind but not yet stopped." },
                { label: "Blocked"   as TaskHealth, desc: "Manually flagged Blocked — stopped, needs external action to proceed." },
                { label: "Off Track" as TaskHealth, desc: "Due date has passed and the task is not yet complete." },
              ]).map((row) => ({ ...row, ...HEALTH_META[row.label] }))).map((row, i, arr) => (
                <div key={row.label} className="grid px-5 py-2.5 items-center gap-4"
                  style={{ gridTemplateColumns: "110px 1fr", borderBottom: i < arr.length - 1 ? "1px solid #f0efe9" : "none" }}>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: row.bg, color: row.color, fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", display: "inline-block" }}>
                    {row.label}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{row.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Per-workstream table */}
          <div className="overflow-x-auto" style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white" }}>
            <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2.5"
              style={{
                gridTemplateColumns: "28px 1fr 130px 160px 100px 110px 80px 44px",
                backgroundColor: "#f7f6f3",
                color: "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
                borderBottom: "1px solid #e5e3de",
              }}>
              <span style={{ whiteSpace: "nowrap" }}>#</span>
              <span style={{ whiteSpace: "nowrap" }}>Workstream</span>
              <span style={{ whiteSpace: "nowrap" }}>Flagship Goal</span>
              <span style={{ whiteSpace: "nowrap" }}>Leader</span>
              <span style={{ whiteSpace: "nowrap" }}>Status</span>
              <span style={{ whiteSpace: "nowrap" }}>Pace Health</span>
              <span style={{ whiteSpace: "nowrap" }}>Tasks</span>
              <span className="text-right" style={{ whiteSpace: "nowrap" }}>%</span>
            </div>

            {workstreams.map((ws, i) => {
              const t   = ws.tasks.length;
              const c   = ws.tasks.filter((x) => x.status === "Complete").length;
              const pct = t > 0 ? Math.round((c / t) * 100) : 0;
              const st  = wsDerived[ws.id];
              const ah  = autoHealth[ws.id];
              const ahMeta = ah ? HEALTH_META[ah] : null;

              return (
                <div key={ws.id} className="grid px-5 py-2.5 hover:bg-stone-50 transition-colors"
                  style={{
                    gridTemplateColumns: "28px 1fr 130px 160px 100px 110px 80px 44px",
                    borderBottom: i < workstreams.length - 1 ? "1px solid #f0efe9" : "none",
                    alignItems: "center",
                    gap: "8px",
                  }}>
                  <span className="text-xs font-bold" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>{i + 1}</span>
                  <a href={`#ws-${ws.id}`} className="relative group text-xs font-semibold"
                    style={{ color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: "none" }}>
                    {ws.name}
                    <span className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block w-64 rounded px-3 py-2 text-xs leading-relaxed shadow-lg pointer-events-none"
                      style={{ backgroundColor: "#1a1a1a", color: "#f5f5f4", fontWeight: 400, whiteSpace: "normal" }}>
                      {ws.goal}
                    </span>
                  </a>
                  <span className="text-xs" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.flagshipGoal.replace(/^\d+\s*·\s*/, "")}</span>
                  {editingLeader === ws.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={leaderDraft}
                      onChange={(e) => setLeaderDraft(e.target.value)}
                      onBlur={async () => {
                        setEditingLeader(null);
                        const trimmed = leaderDraft.trim();
                        if (!trimmed || trimmed === leaders[ws.id]) return;
                        setLeaders((prev) => ({ ...prev, [ws.id]: trimmed }));
                        await fetch("/api/update-leader", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ workstreamId: ws.id, leader: trimmed }),
                        });
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") setEditingLeader(null);
                      }}
                      className="text-xs rounded px-1 py-0.5 focus:outline-none"
                      style={{ border: "1px solid #1a5c3a", color: "#374151", width: "140px" }}
                    />
                  ) : (
                    <span
                      className="text-xs cursor-pointer hover:underline"
                      style={{ color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      onClick={() => { setLeaderDraft(leaders[ws.id] || ""); setEditingLeader(ws.id); }}
                      title="Click to edit leader"
                    >
                      {leaders[ws.id] || "—"}
                    </span>
                  )}
                  {/* Derived status from task statuses */}
                  <div>
                    {st ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: STATUS_BG[st], color: STATUS_COLOR[st], fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
                        {st}
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#d1d5db", fontFamily: "var(--font-geist-mono)" }}>—</span>
                    )}
                  </div>
                  {/* Pace-gap health */}
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
                  <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                    {c}/{t} done
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

        <div className="mb-3 flex items-center gap-4">
          <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
          <p className="text-sm font-semibold uppercase tracking-widest shrink-0"
            style={{ color: "#111111", fontFamily: "var(--font-geist-mono)" }}>
            Workstream Tasks
          </p>
          <div className="flex-1" style={{ height: "2px", backgroundColor: "#e5e3de" }} />
        </div>

        </>
        )}
      </div>

      {/* Workstream cards — only on workstreams tab */}
      {activeTab === "workstreams" && (
        <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
          {workstreams.map((ws, i) => (
            <HundredDayCard
              key={ws.id}
              workstream={ws}
              index={i + 1}
              derivedStatus={wsDerived[ws.id]}
            />
          ))}
        </div>
      )}
    </main>
  );
}




function BoardMeetingCell({ defaultDate }: { defaultDate: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultDate;
    return localStorage.getItem("next-board-meeting") ?? defaultDate;
  });
  const [draft, setDraft] = useState(value);

  const save = () => {
    const trimmed = draft.trim() || defaultDate;
    setValue(trimmed);
    localStorage.setItem("next-board-meeting", trimmed);
    setEditing(false);
  };

  return (
    <div className="px-5 py-3 flex flex-col gap-0.5" style={{ borderRight: "1px solid #e5e3de" }}>
      <span className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        Next Board Meeting
      </span>
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
          className="text-sm font-semibold focus:outline-none bg-transparent border-b"
          style={{ color: "#1a1a1a", borderColor: "#1a5c3a", width: "120px" }}
        />
      ) : (
        <span
          className="text-sm font-semibold cursor-pointer hover:text-green-800 transition-colors"
          style={{ color: "#1a1a1a" }}
          onClick={() => { setDraft(value); setEditing(true); }}
          title="Click to edit"
        >
          {value}
        </span>
      )}
    </div>
  );
}

function ByOwnerView({ workstreams }: { workstreams: Workstream100[] }) {
  const [search, setSearch] = useState("");
  const [sortByDate, setSortByDate] = useState<"asc" | "desc" | null>(null);
  type OwnerTask = { owner: string; workstream: string; description: string; dueDate: string; status: Status100 };

  const rows: OwnerTask[] = workstreams.flatMap((ws) =>
    ws.tasks.flatMap((t) => {
      const owners = t.owner ? t.owner.split(/[/,]/).map((o) => o.trim()).filter(Boolean) : ["Unassigned Tasks"];
      return owners.map((owner) => ({
        owner,
        workstream: ws.name,
        description: t.description,
        dueDate: t.dueDate || "—",
        status: t.status,
      }));
    })
  );

  const grouped = rows.reduce<Record<string, OwnerTask[]>>((acc, row) => {
    if (!acc[row.owner]) acc[row.owner] = [];
    acc[row.owner].push(row);
    return acc;
  }, {});

  const sortedOwners = Object.keys(grouped).sort((a, b) => {
    if (a === "Unassigned Tasks") return 1;
    if (b === "Unassigned Tasks") return -1;
    return a.localeCompare(b);
  });

  const filteredOwners = search.trim()
    ? sortedOwners.filter((o) => o.toLowerCase().includes(search.trim().toLowerCase()))
    : sortedOwners;

  return (
    <div className="pb-20 space-y-6">
      <div className="relative mb-2" style={{ maxWidth: "320px" }}>
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm rounded px-4 py-2.5 focus:outline-none"
          style={{
            border: "1px solid #e5e3de",
            backgroundColor: "white",
            color: "#1a1a1a",
            fontFamily: "var(--font-geist-mono)",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "#9ca3af" }}
          >
            ✕
          </button>
        )}
      </div>
      {filteredOwners.length === 0 && (
        <p className="text-sm" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          No owners match &ldquo;{search}&rdquo;
        </p>
      )}
      {filteredOwners.map((owner) => (
        <div key={owner} style={{ border: "1px solid #e5e3de", borderRadius: "6px", overflow: "hidden", backgroundColor: "white" }}>
          <div className="px-5 py-3" style={{ backgroundColor: "#f7f6f3", borderBottom: "1px solid #e5e3de" }}>
            <span className="text-sm font-semibold" style={{ color: "#111" }}>{owner}</span>
            <span className="ml-2 text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
              {grouped[owner].length} item{grouped[owner].length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2"
            style={{ gridTemplateColumns: "32px 1fr 180px 110px 100px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de" }}>
            <span>#</span>
            <span>Work Item</span>
            <span>Workstream</span>
            <button
              onClick={() => setSortByDate((s) => s === "asc" ? "desc" : s === "desc" ? null : "asc")}
              className="text-left flex items-center gap-1"
              style={{ background: "none", border: "none", cursor: "pointer", color: sortByDate ? "#1a5c3a" : "#9ca3af", fontFamily: "var(--font-geist-mono)", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}
            >
              Due Date {sortByDate === "asc" ? "↑" : sortByDate === "desc" ? "↓" : "↕"}
            </button>
            <span>Status</span>
          </div>
          {(sortByDate
            ? [...grouped[owner]].sort((a, b) => {
                const da = a.dueDate && a.dueDate !== "—" ? new Date(a.dueDate).getTime() : Infinity;
                const db = b.dueDate && b.dueDate !== "—" ? new Date(b.dueDate).getTime() : Infinity;
                return sortByDate === "asc" ? da - db : db - da;
              })
            : grouped[owner]
          ).map((row, i) => (
            <div key={i} className="grid px-5 py-3 hover:bg-stone-50 transition-colors"
              style={{
                gridTemplateColumns: "32px 1fr 180px 110px 100px",
                borderBottom: i < grouped[owner].length - 1 ? "1px solid #f0efe9" : "none",
                alignItems: "start",
                gap: "12px",
              }}>
              <span className="text-xs font-bold pt-0.5" style={{ color: "#1a5c3a", fontFamily: "var(--font-geist-mono)" }}>{i + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: "#1a1a1a" }}>{row.description}</p>
              <span className="text-xs" style={{ color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.workstream}</span>
              <span className="text-xs" style={{ color: "#57534e", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>{row.dueDate}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ backgroundColor: STATUS_BG[row.status], color: STATUS_COLOR[row.status], fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", display: "inline-block" }}>
                {row.status}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

type AutomationStatus = "Parked" | "In Review" | "Active";

const AUTOMATION_IDEAS: { category: string; title: string; description: string; trigger: string; channel: string; status: AutomationStatus }[] = [
  {
    category: "Due Date Alerts",
    title: "Task due in 3 days",
    description: "Warn the task owner when a non-complete task is 3 days from its due date.",
    trigger: "Daily check — 3 days before due date",
    channel: "Roam DM to owner",
    status: "Parked",
  },
  {
    category: "Due Date Alerts",
    title: "Task is now past due",
    description: "Alert when a task passes its due date and is still not Complete. Repeats daily until resolved.",
    trigger: "Daily — fires the morning after due date passes",
    channel: "Roam DM to owner",
    status: "Parked",
  },
  {
    category: "Due Date Alerts",
    title: "Weekly overdue rollup",
    description: "Monday morning summary of all tasks past due across every workstream.",
    trigger: "Monday 8am ET",
    channel: "Roam — TBD group",
    status: "Parked",
  },
  {
    category: "Status Change Alerts",
    title: "Task flips to Blocked",
    description: "Immediate alert when any task status changes to Blocked.",
    trigger: "On status change (daily sheet read)",
    channel: "Roam — TBD group",
    status: "Parked",
  },
  {
    category: "Status Change Alerts",
    title: "Task flips to At Risk",
    description: "Alert when a task moves to At Risk, giving the team a chance to course-correct before it becomes Blocked.",
    trigger: "On status change (daily sheet read)",
    channel: "Roam DM to owner",
    status: "Parked",
  },
  {
    category: "Status Change Alerts",
    title: "Workstream status degrades",
    description: "Alert when a workstream rolls up to a worse status than the prior day (e.g. In Progress → Blocked).",
    trigger: "Daily comparison",
    channel: "Roam — TBD group",
    status: "Parked",
  },
  {
    category: "Progress Alerts",
    title: "Workstream stalled with <30 days left",
    description: "Flag any workstream at 0% complete with fewer than 30 days remaining in the 100-day window.",
    trigger: "Daily check",
    channel: "Roam — TBD group",
    status: "Parked",
  },
  {
    category: "Progress Alerts",
    title: "Overall plan behind pace",
    description: "Alert if overall % complete is meaningfully behind the % of the 100-day window elapsed.",
    trigger: "Weekly — Monday 8am ET",
    channel: "Roam — TBD group",
    status: "Parked",
  },
  {
    category: "Owner Digest",
    title: "Monday morning owner digest",
    description: "Each owner receives a personal list of their tasks due that week, with statuses and any overdue items highlighted.",
    trigger: "Monday 8am ET",
    channel: "Roam DM to each owner",
    status: "Parked",
  },
  {
    category: "Milestone Alerts",
    title: "Day 30 / 60 / 90 approaching",
    description: "7 days before each milestone, send a workstream completion summary so leaders can prepare.",
    trigger: "7 days before Day 30, 60, 90",
    channel: "Roam — TBD group",
    status: "Parked",
  },
  {
    category: "Milestone Alerts",
    title: "Board Meeting approaching",
    description: "7 days before the Next Board Meeting, surface all open and at-risk items across workstreams.",
    trigger: "7 days before board meeting date",
    channel: "Roam — TBD group",
    status: "Parked",
  },
];

const AUTOMATION_STATUS_META: Record<AutomationStatus, { bg: string; color: string }> = {
  "Parked":    { bg: "#f3f4f6", color: "#374151" },
  "In Review": { bg: "#fef9c3", color: "#854d0e" },
  "Active":    { bg: "#dcfce7", color: "#15803d" },
};

const AUTOMATION_STATUSES: AutomationStatus[] = ["Parked", "In Review", "Active"];

function AIAutomationsView() {
  const [statuses, setStatuses] = useState<Record<string, AutomationStatus>>(() => {
    try {
      return JSON.parse(localStorage.getItem("ai-automation-statuses") ?? "{}");
    } catch { return {}; }
  });

  const setStatus = (title: string, status: AutomationStatus) => {
    const updated = { ...statuses, [title]: status };
    setStatuses(updated);
    localStorage.setItem("ai-automation-statuses", JSON.stringify(updated));
  };

  const categories = Array.from(new Set(AUTOMATION_IDEAS.map((a) => a.category)));

  const counts: Record<AutomationStatus, number> = { Parked: 0, "In Review": 0, Active: 0 };
  AUTOMATION_IDEAS.forEach((a) => {
    const s = statuses[a.title] ?? a.status;
    counts[s]++;
  });

  return (
    <div className="pb-20">
      <div className="mb-6">
        <p className="text-xs leading-relaxed mb-4" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
          A running list of Claude-managed automations for this dashboard. Change a status to <strong>In Review</strong> to discuss, or <strong>Active</strong> once built. Status persists in your browser.
        </p>
        <div className="flex gap-6">
          {AUTOMATION_STATUSES.map((s) => {
            const meta = AUTOMATION_STATUS_META[s];
            return (
              <div key={s} className="flex items-center gap-2">
                <span className="text-2xl font-bold" style={{ color: meta.color, letterSpacing: "-0.03em" }}>{counts[s]}</span>
                <span className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-8">
        {categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{cat}</p>
            <div style={{ border: "1px solid #e5e3de", borderRadius: "6px", overflow: "hidden", backgroundColor: "white" }}>
              <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2"
                style={{ gridTemplateColumns: "1fr 200px 180px 110px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", backgroundColor: "#f7f6f3" }}>
                <span>Automation</span>
                <span>Trigger</span>
                <span>Channel</span>
                <span>Status</span>
              </div>
              {AUTOMATION_IDEAS.filter((a) => a.category === cat).map((a, i, arr) => {
                const currentStatus = statuses[a.title] ?? a.status;
                const meta = AUTOMATION_STATUS_META[currentStatus];
                return (
                  <div key={a.title} className="grid px-5 py-4 hover:bg-stone-50 transition-colors"
                    style={{ gridTemplateColumns: "1fr 200px 180px 110px", borderBottom: i < arr.length - 1 ? "1px solid #f0efe9" : "none", alignItems: "start", gap: "12px" }}>
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: "#1a1a1a" }}>{a.title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "#78716c" }}>{a.description}</p>
                    </div>
                    <span className="text-xs leading-relaxed pt-0.5" style={{ color: "#6b7280", fontFamily: "var(--font-geist-mono)" }}>{a.trigger}</span>
                    <span className="text-xs leading-relaxed pt-0.5" style={{ color: "#6b7280" }}>{a.channel}</span>
                    <div className="pt-0.5">
                      <select
                        value={currentStatus}
                        onChange={(e) => setStatus(a.title, e.target.value as AutomationStatus)}
                        className="text-xs font-semibold cursor-pointer focus:outline-none rounded px-2 py-1"
                        style={{ backgroundColor: meta.bg, color: meta.color, border: "none", fontFamily: "var(--font-geist-mono)" }}>
                        {AUTOMATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCell({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="pt-5 pb-4 px-5" style={{ borderBottom: "1px solid #e5e3de", minWidth: 0 }}>
      <p className="text-3xl font-bold mb-0.5" style={{ color, letterSpacing: "-0.03em" }}>{value}</p>
      <p className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}>
        {label}
      </p>
    </div>
  );
}

function NeedsActionView({ workstreams, autoHealth }: { workstreams: Workstream100[]; autoHealth: Record<string, TaskHealth | null> }) {
  const FLAGGED_STATUSES = new Set(["Not Started", "At Risk", "Blocked"]);

  const flaggedWorkstreams = workstreams
    .map((ws) => {
      const wsHealth = autoHealth[ws.id];
      const flaggedTasks = ws.tasks.filter(
        (t) => t.status !== "Complete" && (FLAGGED_STATUSES.has(t.status) || calcTaskHealth(t).status !== "On Track")
      );
      return { ws, wsHealth, flaggedTasks };
    })
    .filter(({ wsHealth, flaggedTasks }) => wsHealth !== "On Track" || flaggedTasks.length > 0);

  if (flaggedWorkstreams.length === 0) {
    return (
      <div className="pb-20 flex flex-col items-center justify-center py-20">
        <p className="text-2xl mb-2">✓</p>
        <p className="text-sm font-semibold" style={{ color: "#15803d" }}>Everything is on track.</p>
        <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>No workstreams or tasks need attention right now.</p>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-4">

      {/* At-a-glance summary table */}
      <div className="rounded-lg overflow-hidden mb-6" style={{ border: "1px solid #fecaca", backgroundColor: "white" }}>
        <div className="px-5 py-3" style={{ backgroundColor: "#fff5f5", borderBottom: "1px solid #fecaca" }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#b91c1c", fontFamily: "var(--font-geist-mono)" }}>
            Needs Action — At a Glance
          </p>
        </div>
        <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2"
          style={{ gridTemplateColumns: "2fr 1fr 80px 80px 80px 108px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #fecaca", backgroundColor: "#fafafa" }}>
          <span>Workstream</span>
          <span>Owner</span>
          <span style={{ color: HEALTH_META["At Risk"].color }}>At Risk</span>
          <span style={{ color: HEALTH_META["Blocked"].color }}>Blocked</span>
          <span style={{ color: HEALTH_META["Off Track"].color }}>Off Track</span>
          <span style={{ color: "#374151" }}>Not Started</span>
        </div>
        {flaggedWorkstreams.map(({ ws, flaggedTasks }, i) => {
          const atRisk     = flaggedTasks.filter((t) => calcTaskHealth(t).status === "At Risk").length;
          const blocked    = flaggedTasks.filter((t) => calcTaskHealth(t).status === "Blocked").length;
          const offTrack   = flaggedTasks.filter((t) => calcTaskHealth(t).status === "Off Track").length;
          const notStarted = flaggedTasks.filter((t) => t.status === "Not Started").length;
          return (
            <div key={ws.id} className="grid px-5 py-2.5 hover:bg-red-50 transition-colors"
              style={{
                gridTemplateColumns: "2fr 1fr 80px 80px 80px 108px",
                borderBottom: i < flaggedWorkstreams.length - 1 ? "1px solid #fef2f2" : "none",
                alignItems: "center",
              }}>
              <a href={`#na-${ws.id}`} className="text-xs font-semibold hover:underline" style={{ color: "#1a1a1a", textDecoration: "none" }}>{ws.name}</a>
              <span className="text-xs" style={{ color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ws.leader}</span>
              <span className="text-xs font-semibold" style={{ color: atRisk > 0 ? HEALTH_META["At Risk"].color : "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>{atRisk > 0 ? atRisk : "—"}</span>
              <span className="text-xs font-semibold" style={{ color: blocked > 0 ? HEALTH_META["Blocked"].color : "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>{blocked > 0 ? blocked : "—"}</span>
              <span className="text-xs font-semibold" style={{ color: offTrack > 0 ? HEALTH_META["Off Track"].color : "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>{offTrack > 0 ? offTrack : "—"}</span>
              <span className="text-xs font-semibold" style={{ color: notStarted > 0 ? "#374151" : "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>{notStarted > 0 ? notStarted : "—"}</span>
            </div>
          );
        })}
      </div>

      {flaggedWorkstreams.map(({ ws, wsHealth, flaggedTasks }) => {
        const hMeta = wsHealth ? HEALTH_META[wsHealth] : null;
        return (
          <div key={ws.id} id={`na-${ws.id}`} style={{ border: "1px solid #fecaca", borderRadius: "6px", overflow: "hidden", backgroundColor: "white" }}>
            {/* Workstream header */}
            <div className="px-5 py-3 flex items-center justify-between gap-4"
              style={{ backgroundColor: "#fff5f5", borderBottom: "1px solid #fecaca" }}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-semibold" style={{ color: "#111" }}>{ws.name}</span>
                <span className="text-xs" style={{ color: "#9ca3af" }}>{ws.leader}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hMeta && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: hMeta.bg, color: hMeta.color, fontFamily: "var(--font-geist-mono)" }}>
                    {wsHealth}
                  </span>
                )}
                <span className="text-xs" style={{ color: "#b91c1c", fontFamily: "var(--font-geist-mono)" }}>
                  {flaggedTasks.length} task{flaggedTasks.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Task rows */}
            <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2"
              style={{ gridTemplateColumns: "1fr 110px 110px 90px 120px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #fecaca", backgroundColor: "#fafafa" }}>
              <span>Task</span>
              <span>Due Date</span>
              <span>Owner</span>
              <span>Health</span>
              <span>Status</span>
            </div>

            {flaggedTasks.map((task, idx) => {
              const health = calcTaskHealth(task);
              const hm = HEALTH_META[health.status];
              const overdue = task.status !== "Complete" && task.dueDate && new Date(task.dueDate) < new Date();
              return (
                <div key={task.id} className="grid px-5 py-3 hover:bg-red-50 transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 110px 110px 90px 120px",
                    borderBottom: idx < flaggedTasks.length - 1 ? "1px solid #fef2f2" : "none",
                    alignItems: "start",
                    gap: "12px",
                  }}>
                  <p className="text-xs leading-relaxed" style={{ color: "#1a1a1a" }}>{task.description}</p>
                  <span className="text-xs pt-0.5" style={{ color: overdue ? "#b91c1c" : task.dueDate ? "#57534e" : "#c0bdb8", fontFamily: "var(--font-geist-mono)", fontWeight: overdue ? 600 : undefined }}>
                    {task.dueDate || "—"}
                  </span>
                  <span className="text-xs pt-0.5" style={{ color: task.owner ? "#78716c" : "#c0bdb8" }}>
                    {task.owner || "—"}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded pt-0.5"
                    style={{ backgroundColor: hm.bg, color: hm.color, fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", display: "inline-block" }}>
                    {health.status}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ backgroundColor: STATUS_BG[task.status], color: STATUS_COLOR[task.status], fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap", display: "inline-block" }}>
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
