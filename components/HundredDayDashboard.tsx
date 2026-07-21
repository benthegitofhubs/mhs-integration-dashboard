"use client";

import { useState, useEffect, Fragment } from "react";
import { Workstream100, Task100, KEY_DATES, Status100, LAST_SYNCED } from "@/lib/hundredday";
import HundredDayCard from "./HundredDayCard";
import NavBar from "./NavBar";
import { calcTaskHealth, HEALTH_META, TaskHealth } from "@/lib/taskHealth";

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

export default function HundredDayDashboard({ workstreams, loadedAt, nowMs, live = true, joinDates = {} }: { workstreams: Workstream100[]; loadedAt?: string; nowMs: number; live?: boolean; joinDates?: Record<string, string> }) {
  const [activeTab, setActiveTab] = useState<"overview" | "workstreams" | "by-owner" | "ai-automations" | "needs-action" | "not-started">("overview");
  const [leaders, setLeaders] = useState<Record<string, string>>(
    Object.fromEntries(workstreams.map((ws) => [ws.id, ws.leader]))
  );
  const [editingLeader, setEditingLeader] = useState<string | null>(null);
  const [leaderDraft, setLeaderDraft] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [nsSearch, setNsSearch] = useState("");
  const [naFilter, setNaFilter] = useState<string | null>(null);
  // Needs Action "review mode": ordered queue of flagged tasks + current
  // position, set when a task is opened from Needs Action. Drives the
  // floating Prev/Next/Back stepper so the whole queue can be worked in order.
  const [review, setReview] = useState<{ queue: { wsId: string; taskId: string }[]; index: number } | null>(null);
  // Task to scroll back to when returning to the Needs Action tab.
  const [naReturnTaskId, setNaReturnTaskId] = useState<string | null>(null);
  // Overview workstream-list sort. Default (and the sort that prevails on load)
  // is completion % descending.
  const [ovSort, setOvSort] = useState<{ col: "leader" | "completion"; dir: "asc" | "desc" }>({ col: "completion", dir: "desc" });
  const allTasks   = workstreams.flatMap((ws) => ws.tasks);
  const total      = allTasks.length;
  const complete   = allTasks.filter((t) => t.status === "Complete").length;
  const inProgress = allTasks.filter((t) => t.status === "In Progress").length;
  const atRisk     = allTasks.filter((t) => t.status === "At Risk").length;
  const blocked    = allTasks.filter((t) => t.status === "Blocked").length;

  // Open a flagged task in the Workstreams tab and enter review mode at its
  // position in the queue. The queue is supplied by Needs Action in its exact
  // current display order (sorted by join date, respecting any filter), so the
  // Prev/Next stepper always walks the list top-to-bottom as shown.
  const openFromNeedsAction = (wsId: string, taskId: string, queue: { wsId: string; taskId: string }[]) => {
    const index = queue.findIndex((q) => q.wsId === wsId && q.taskId === taskId);
    setReview({ queue, index: index < 0 ? 0 : index });
    window.location.hash = `ws-${wsId}~${taskId}`;
    setActiveTab("workstreams");
  };

  // Jump to a position in the review queue (Prev/Next stepper).
  const goToReviewIndex = (i: number) => {
    if (!review || i < 0 || i >= review.queue.length) return;
    const { wsId, taskId } = review.queue[i];
    window.location.hash = `ws-${wsId}~${taskId}`;
    setReview({ queue: review.queue, index: i });
  };

  // Leave review mode and return to the Needs Action tab, scrolled to the
  // task you were last on.
  const backToNeedsAction = () => {
    if (review) setNaReturnTaskId(review.queue[review.index]?.taskId ?? null);
    setReview(null);
    setActiveTab("needs-action");
  };

  return (
    <>
    <NavBar />
    <main className="min-h-screen" style={{ backgroundColor: "#f7f6f3", color: "#1a1a1a" }}>
      <div className="max-w-6xl mx-auto px-8 pt-12 pb-8">

        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ backgroundColor: "#eeede9", width: "fit-content" }}>
          {([
            { id: "overview",       label: "Overview",        red: false },
            { id: "workstreams",    label: "Workstream Tasks", red: false },
            { id: "needs-action",   label: "Needs Action",    red: true  },
            { id: "not-started",    label: "Not Started",     red: false },
            { id: "by-owner",       label: "By Accountable",  red: false },
            { id: "ai-automations", label: "AI Automations",  red: false },
          ] as const).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setNaFilter(null); setReview(null); }}
                className="text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-md transition-all"
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  color: isActive ? (tab.red ? "#b91c1c" : "#1a5c3a") : (tab.red ? "#e06060" : "#9ca3af"),
                  backgroundColor: isActive ? "white" : "transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
                  border: "none", cursor: "pointer", letterSpacing: "0.07em", whiteSpace: "nowrap",
                }}>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Eyebrow + headline — shown on every tab, below the tabs */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
          100-Day Integration Plan
        </p>
        <h1 className="text-3xl font-bold leading-snug mb-6" style={{ letterSpacing: "-0.02em", color: "#111" }}>
          100 days to one team, one mission.
        </h1>

        {/* TAB: Overview — top info + workstream health */}
        {activeTab === "overview" && (
        <>
        {/* Progress timeline */}
        {(() => {
          const start    = Date.parse("2026-06-23T00:00:00-04:00");
          const end      = Date.parse("2026-10-01T00:00:00-04:00");
          const now      = nowMs;
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
            <Fragment key={kd.label}>
              {kd.label === "Next Board Meeting" ? (
                <BoardMeetingCell defaultDate={kd.date} />
              ) : (
                <div className="px-5 py-3 flex flex-col gap-0.5"
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
                    {new Date(nowMs).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              )}
            </Fragment>
          ))}
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <img src="/RadialMHS.png" alt="Radial × MHS" style={{ height: "56px", width: "auto", opacity: 0.85 }} />
          </div>
        </div>


        </>
        )}

        {activeTab === "ai-automations" && <AIAutomationsView />}

        {activeTab === "by-owner" && (
          <ByOwnerView workstreams={workstreams} />
        )}

        {activeTab === "needs-action" && (
          <NeedsActionView
            workstreams={workstreams}
            filterWsId={naFilter}
            onClearFilter={() => setNaFilter(null)}
            onOpenTask={openFromNeedsAction}
            joinDates={joinDates}
            scrollToTaskId={naReturnTaskId}
            onScrolled={() => setNaReturnTaskId(null)}
          />
        )}

        {/* Executive summary (Overview tab) */}
        {activeTab === "overview" && (() => {
          const totalTasks  = allTasks.length;
          const doneTasks   = allTasks.filter((t) => t.status === "Complete").length;
          const overallPct  = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

          // Task-level health counts (Complete handled separately; the four
          // buckets partition all tasks, so their percentages sum to 100%).
          const tc = { complete: 0, onTrack: 0, atRisk: 0, blocked: 0, offTrack: 0 };
          allTasks.forEach((t) => {
            if (t.status === "Complete") { tc.complete++; return; }
            const h = calcTaskHealth(t).status;
            if (h === "At Risk") tc.atRisk++;
            else if (h === "Blocked") tc.blocked++;
            else if (h === "Off Track") tc.offTrack++;
            else tc.onTrack++;
          });
          const needAttention = tc.atRisk + tc.blocked;
          const pctOf = (n: number) => (totalTasks > 0 ? Math.round((n / totalTasks) * 100) : 0);

          const tiles = [
            { label: "Overall completion", value: `${overallPct}%`,           sub: `${doneTasks} of ${totalTasks} tasks`,     color: "#1a1a1a" },
            { label: "On track",           value: `${pctOf(tc.onTrack)}%`,    sub: `${tc.onTrack} of ${totalTasks} tasks`,    color: "#15803d" },
            { label: "Need attention",     value: `${pctOf(needAttention)}%`, sub: `${needAttention} of ${totalTasks} tasks`, color: needAttention > 0 ? "#b45309" : "#9ca3af", linksToNeedsAction: true },
            { label: "Off track",          value: `${pctOf(tc.offTrack)}%`,   sub: `${tc.offTrack} of ${totalTasks} tasks`,   color: tc.offTrack > 0 ? "#b91c1c" : "#9ca3af", linksToNeedsAction: true },
          ];
          const openNeedsAction = () => { setActiveTab("needs-action"); setNaFilter(null); setReview(null); };

          // One flat list of workstreams. Default sort is completion % desc;
          // the Leader and Completion headers toggle the sort (see ovSort).
          const mul = ovSort.dir === "asc" ? 1 : -1;
          const rows = workstreams
            .map((ws) => {
              const total = ws.tasks.length;
              const done  = ws.tasks.filter((tk) => tk.status === "Complete").length;
              const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
              return { ws, total, pct };
            })
            .sort((a, b) => {
              if (ovSort.col === "leader") {
                const la = (leaders[a.ws.id] || "").trim();
                const lb = (leaders[b.ws.id] || "").trim();
                // Blank leaders always sink to the bottom, regardless of dir.
                if (!la && lb) return 1;
                if (la && !lb) return -1;
                const cmp = la.localeCompare(lb, undefined, { sensitivity: "base" });
                return cmp !== 0 ? cmp * mul : b.pct - a.pct; // tie → completion desc
              }
              // completion
              const cmp = a.pct - b.pct;
              return cmp !== 0 ? cmp * mul : a.ws.name.localeCompare(b.ws.name); // tie → name A→Z
            });

          // Header click: toggle direction on the active column, otherwise
          // switch to the column at its natural default (completion→desc,
          // leader→asc).
          const sortBy = (col: "leader" | "completion") =>
            setOvSort((prev) =>
              prev.col === col
                ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { col, dir: col === "completion" ? "desc" : "asc" }
            );
          const arrow = (col: "leader" | "completion") =>
            ovSort.col === col ? (ovSort.dir === "asc" ? " ↑" : " ↓") : "";

          // Shared column template so the header row and data rows line up.
          const COLS = "minmax(0, 1fr) 220px 100px";

          return (
          <>
          {/* KPI tiles */}
          <div className="grid gap-3 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            {tiles.map((t) => {
              const clickable = "linksToNeedsAction" in t && t.linksToNeedsAction;
              return (
              <div key={t.label}
                onClick={clickable ? openNeedsAction : undefined}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNeedsAction(); } } : undefined}
                className={clickable ? "transition-shadow hover:shadow-md" : undefined}
                title={clickable ? "View in Needs Action" : undefined}
                style={{ backgroundColor: "white", border: "1px solid #e5e3de", borderRadius: "6px", padding: "14px 16px", cursor: clickable ? "pointer" : undefined }}>
                <div className="text-xs uppercase tracking-widest" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>{t.label}</div>
                {t.label === "On track" && (
                  <div className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>(In Progress/Not Started)</div>
                )}
                <div className="mt-1.5" style={{ fontSize: "24px", fontWeight: 700, color: t.color, lineHeight: 1.1 }}>{t.value}</div>
                <div className="text-xs mt-1" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{t.sub}</div>
              </div>
              );
            })}
          </div>

          {/* Column headers — align to the row grid; Leader + Completion sort */}
          <div className="grid px-5 mb-1.5 text-xs uppercase tracking-widest font-semibold"
            style={{ gridTemplateColumns: COLS, gap: "16px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}>
            <span>Workstream</span>
            <button
              onClick={() => sortBy("leader")}
              className="text-left uppercase tracking-widest font-semibold transition-colors hover:text-stone-700"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: ovSort.col === "leader" ? "#57534e" : "#9ca3af", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
              title="Sort by leader">
              Leader{arrow("leader")}
            </button>
            <button
              onClick={() => sortBy("completion")}
              className="text-right uppercase tracking-widest font-semibold transition-colors hover:text-stone-700"
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: ovSort.col === "completion" ? "#57534e" : "#9ca3af", fontFamily: "var(--font-geist-mono)", letterSpacing: "0.05em" }}
              title="Sort by completion">
              Completion %{arrow("completion")}
            </button>
          </div>

          {/* Workstream list — one row each: name · leader · completion %, sorted by completion desc */}
          <div style={{ border: "1px solid #e5e3de", borderRadius: "6px", backgroundColor: "white", overflow: "hidden" }}>
            {rows.map(({ ws, total, pct }, i) => (
              <div key={ws.id} className="grid px-5 py-2.5 hover:bg-stone-50 transition-colors"
                style={{ gridTemplateColumns: COLS, gap: "16px", alignItems: "center", borderTop: i > 0 ? "1px solid #f0efe9" : "none" }}>
                <span
                  onClick={() => { window.location.hash = `ws-${ws.id}`; setActiveTab("workstreams"); }}
                  className="relative group text-xs font-semibold cursor-pointer hover:underline"
                  style={{ color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  title="Open tasks">
                  {ws.name}
                  <span className="absolute left-0 top-full mt-1.5 z-50 hidden group-hover:block w-64 rounded px-3 py-2 text-xs leading-relaxed shadow-lg pointer-events-none"
                    style={{ backgroundColor: "#1a1a1a", color: "#f5f5f4", fontWeight: 400, whiteSpace: "normal" }}>
                    {ws.goal}
                  </span>
                </span>
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
                    style={{ border: "1px solid #1a5c3a", color: "#374151", width: "180px" }}
                  />
                ) : (
                  <span
                    className="text-xs cursor-pointer hover:underline"
                    style={{ color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    onClick={() => { setLeaderDraft(leaders[ws.id] || ""); setEditingLeader(ws.id); }}
                    title="Click to edit leader">
                    {leaders[ws.id] || "—"}
                  </span>
                )}
                <span className="text-xs font-semibold text-right" style={{ color: pct > 0 ? "#15803d" : "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                  {total > 0 ? `${pct}%` : "—"}
                </span>
              </div>
            ))}
          </div>

          {/* Sync status — bottom of the page */}
          {live ? (
            <div className="mt-8 mb-4 px-4 py-3 rounded" style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
                <span className="font-semibold" style={{ color: "#15803d" }}>Live sync with the Google Sheet.</span>{" "}
                Status, due date, and ARCI (Accountable / Responsible / Consulted / Informed) changes made here write back to the sheet immediately. Data refreshes every 5 minutes.{" "}
                <span className="font-semibold" style={{ color: "#57534e" }}>Last loaded: {loadedAt ?? LAST_SYNCED}.</span>
              </p>
            </div>
          ) : (
            <div className="mt-8 mb-4 px-4 py-3 rounded" style={{ backgroundColor: "#fffbeb", border: "1px solid #fcd34d" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
                <span className="font-semibold" style={{ color: "#b45309" }}>⚠ Live sync unavailable — showing cached data.</span>{" "}
                The Google Sheet couldn&apos;t be reached, so these figures are the last bundled snapshot and may be out of date. Edits made here will <span className="font-semibold">not</span> save until sync is restored.{" "}
                <span className="font-semibold" style={{ color: "#57534e" }}>Page loaded: {loadedAt ?? LAST_SYNCED}.</span>
              </p>
            </div>
          )}

          </>
          );
        })()}

        {/* TAB: Workstream Tasks — search + tasks */}
        {activeTab === "workstreams" && (
        <>
        <div className="relative mb-6">
          <input
            type="text"
            value={taskSearch}
            onChange={(e) => setTaskSearch(e.target.value)}
            placeholder="Search tasks by keyword…"
            className="w-full text-sm rounded-lg focus:outline-none"
            style={{ border: "1px solid #e5e3de", backgroundColor: "white", color: "#1a1a1a", padding: "10px 32px 10px 12px" }}
          />
          {taskSearch && (
            <button onClick={() => setTaskSearch("")} aria-label="Clear search"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "14px", lineHeight: 1 }}>
              ✕
            </button>
          )}
        </div>

        {/* RACI legend */}
        <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs" style={{ color: "#9ca3af" }}>
          {[
            { l: "A", t: "Accountable", d: "owns the outcome" },
            { l: "R", t: "Responsible", d: "does the work" },
            { l: "C", t: "Consulted",   d: "gives input" },
            { l: "I", t: "Informed",    d: "kept in the loop" },
          ].map(({ l, t, d }) => (
            <span key={l} className="inline-flex items-center gap-1.5">
              <span className="font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#f0efe9", color: "#78716c", fontFamily: "var(--font-geist-mono)", fontSize: "10px" }}>
                {l}
              </span>
              <span><strong style={{ color: "#6b7280" }}>{t}</strong> — {d}</span>
            </span>
          ))}
        </div>

        </>
        )}

        {/* TAB: Not Started — intro + search (grouped cards render below) */}
        {activeTab === "not-started" && (
        <>
        <p className="text-xs leading-relaxed mb-4" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
          Every task still <strong>Not Started</strong>, grouped by workstream. Edit any field inline — changes save to the sheet immediately.
        </p>
        <div className="relative mb-6">
          <input
            type="text"
            value={nsSearch}
            onChange={(e) => setNsSearch(e.target.value)}
            placeholder="Search not-started tasks by keyword…"
            className="w-full text-sm rounded-lg focus:outline-none"
            style={{ border: "1px solid #e5e3de", backgroundColor: "white", color: "#1a1a1a", padding: "10px 32px 10px 12px" }}
          />
          {nsSearch && (
            <button onClick={() => setNsSearch("")} aria-label="Clear search"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "14px", lineHeight: 1 }}>
              ✕
            </button>
          )}
        </div>
        </>
        )}
      </div>

      {/* Workstream cards — only on workstreams tab */}
      {activeTab === "workstreams" && (
        <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
          {/* Task-health bar legend */}
          <div
            className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mx-auto mb-2 px-5 py-3 rounded-lg"
            style={{
              color: "#6b7280",
              fontFamily: "var(--font-geist-mono)",
              backgroundColor: "white",
              border: "1px solid #e5e3de",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              width: "fit-content",
            }}
          >
            {[
              { l: "Complete", c: "#15803d" },
              { l: "On Track (In Progress/Not Started)", c: "#86efac" },
              { l: "At risk", c: "#eab308" },
              { l: "Blocked", c: "#ea580c" },
              { l: "Off track", c: "#b91c1c" },
            ].map(({ l, c }) => (
              <span key={l} className="inline-flex items-center gap-1.5">
                <span style={{ width: "11px", height: "11px", borderRadius: "2px", backgroundColor: c, display: "inline-block" }} />
                {l}
              </span>
            ))}
          </div>

          {/* Column headers — mirror the Overview row so the card numbers are labeled */}
          <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2 items-center"
            style={{
              gridTemplateColumns: "28px 1fr 120px 150px 52px 90px 1.6fr",
              gap: "8px",
              border: "1px solid transparent",
              color: "#9ca3af",
              fontFamily: "var(--font-geist-mono)",
            }}>
            <span>#</span>
            <span>Workstream</span>
            <span>Flagship Goal</span>
            <span>Leader</span>
            <span>Tasks</span>
            <span>Completion</span>
            <span>Task Health</span>
          </div>

          {workstreams.map((ws, i) => (
            <HundredDayCard
              key={ws.id}
              workstream={ws}
              index={i + 1}
              search={taskSearch}
            />
          ))}

          {taskSearch.trim() && !workstreams.some((ws) =>
            ws.tasks.some((t) =>
              [t.description, t.accountable, t.responsible, t.consulted, t.informed, t.notes, t.reason, ...t.subtasks.map((s) => s.text)]
                .some((v) => (v || "").toLowerCase().includes(taskSearch.trim().toLowerCase()))
            )
          ) && (
            <p className="text-sm text-center py-10" style={{ color: "#9ca3af" }}>
              No tasks match “{taskSearch}”.
            </p>
          )}
        </div>
      )}

      {/* Not Started cards — grouped by workstream, fully editable, filtered to Not Started */}
      {activeTab === "not-started" && (() => {
        const nsWorkstreams = workstreams.filter((ws) => ws.tasks.some((t) => t.status === "Not Started"));
        if (nsWorkstreams.length === 0) {
          return (
            <div className="max-w-6xl mx-auto px-8 pb-20">
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-2xl mb-2">✓</p>
                <p className="text-sm font-semibold" style={{ color: "#15803d" }}>Every task has been started.</p>
                <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>Nothing is sitting in Not Started right now.</p>
              </div>
            </div>
          );
        }
        return (
          <div className="max-w-6xl mx-auto px-8 pb-20 space-y-2">
            {/* Column headers — mirror the Workstream Tasks tab */}
            <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2 items-center"
              style={{
                gridTemplateColumns: "28px 1fr 120px 150px 52px 90px 1.6fr",
                gap: "8px",
                border: "1px solid transparent",
                color: "#9ca3af",
                fontFamily: "var(--font-geist-mono)",
              }}>
              <span>#</span>
              <span>Workstream</span>
              <span>Flagship Goal</span>
              <span>Leader</span>
              <span>Tasks</span>
              <span>Completion</span>
              <span>Task Health</span>
            </div>

            {nsWorkstreams.map((ws, i) => (
              <HundredDayCard
                key={ws.id}
                workstream={ws}
                index={i + 1}
                search={nsSearch}
                filterStatus="Not Started"
              />
            ))}

            {nsSearch.trim() && !nsWorkstreams.some((ws) =>
              ws.tasks.some((t) =>
                t.status === "Not Started" &&
                [t.description, t.accountable, t.responsible, t.consulted, t.informed, t.notes, t.reason, ...t.subtasks.map((s) => s.text)]
                  .some((v) => (v || "").toLowerCase().includes(nsSearch.trim().toLowerCase()))
              )
            ) && (
              <p className="text-sm text-center py-10" style={{ color: "#9ca3af" }}>
                No not-started tasks match “{nsSearch}”.
              </p>
            )}
          </div>
        );
      })()}
    </main>

    {/* Needs Action review stepper — floats while working the flagged queue */}
    {review && activeTab === "workstreams" && (
      <div
        className="fixed left-1/2 bottom-6 z-50 flex items-center gap-1 px-2 py-1.5 rounded-full"
        style={{
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
          fontFamily: "var(--font-geist-mono)",
        }}
      >
        <button
          onClick={backToNeedsAction}
          className="text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors"
          style={{ color: "#e06060", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.07em" }}
        >
          ← Needs Action
        </button>
        <span style={{ width: "1px", height: "18px", backgroundColor: "#3a3a3a" }} />
        <button
          onClick={() => goToReviewIndex(review.index - 1)}
          disabled={review.index <= 0}
          className="text-sm px-3 py-1.5 rounded-full"
          style={{ color: review.index <= 0 ? "#5a5a5a" : "#e5e3de", background: "none", border: "none", cursor: review.index <= 0 ? "default" : "pointer" }}
        >
          ← Prev
        </button>
        <span className="text-xs px-1" style={{ color: "#c0bdb8", whiteSpace: "nowrap" }}>
          {review.index + 1} of {review.queue.length} flagged
        </span>
        <button
          onClick={() => goToReviewIndex(review.index + 1)}
          disabled={review.index >= review.queue.length - 1}
          className="text-sm px-3 py-1.5 rounded-full"
          style={{ color: review.index >= review.queue.length - 1 ? "#5a5a5a" : "#e5e3de", background: "none", border: "none", cursor: review.index >= review.queue.length - 1 ? "default" : "pointer" }}
        >
          Next →
        </button>
      </div>
    )}
    </>
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
      const owners = t.accountable ? t.accountable.split(/[/,]/).map((o) => o.trim()).filter(Boolean) : ["Unassigned Tasks"];
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
    category: "Team Digest",
    title: "Daily integration digest",
    description: "Posts overall task health (complete / on track / not started / at risk / blocked / off track) plus a needs-attention rundown to the Integration Team channel each morning.",
    trigger: "Daily 9:00 AM ET",
    channel: "Roam — Integration Team",
    status: "Active",
  },
  {
    category: "Reminders",
    title: "Weekly not-started & no-due-date reminder",
    description: "Gentle weekly reminder listing, by workstream + leader, how many tasks haven't started and how many lack a due date. Self-sunsets with a congrats once each metric hits zero.",
    trigger: "Fridays 12:00 PM ET",
    channel: "Roam — Integration Team",
    status: "Active",
  },
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

  const statusOf = (a: typeof AUTOMATION_IDEAS[number]) => statuses[a.title] ?? a.status;
  const active     = AUTOMATION_IDEAS.filter((a) => statusOf(a) === "Active");
  const parkingLot = AUTOMATION_IDEAS.filter((a) => statusOf(a) !== "Active");

  const renderRow = (a: typeof AUTOMATION_IDEAS[number], i: number, arr: typeof AUTOMATION_IDEAS) => {
    const currentStatus = statusOf(a);
    const meta = AUTOMATION_STATUS_META[currentStatus];
    return (
      <div key={a.title} className="grid px-5 py-4 hover:bg-stone-50 transition-colors"
        style={{ gridTemplateColumns: "1fr 200px 180px 110px", borderBottom: i < arr.length - 1 ? "1px solid #f0efe9" : "none", alignItems: "start", gap: "12px" }}>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{a.title}</p>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "#f0efe9", color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{a.category}</span>
          </div>
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
  };

  const sectionTable = (rows: typeof AUTOMATION_IDEAS, emptyText: string) => (
    <div style={{ border: "1px solid #e5e3de", borderRadius: "6px", overflow: "hidden", backgroundColor: "white" }}>
      <div className="grid text-xs uppercase tracking-widest font-semibold px-5 py-2"
        style={{ gridTemplateColumns: "1fr 200px 180px 110px", gap: "12px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)", borderBottom: "1px solid #e5e3de", backgroundColor: "#f7f6f3" }}>
        <span>Automation</span>
        <span>Trigger</span>
        <span>Channel</span>
        <span>Status</span>
      </div>
      {rows.length > 0
        ? rows.map((a, i) => renderRow(a, i, rows))
        : <p className="text-xs px-5 py-6" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{emptyText}</p>}
    </div>
  );

  return (
    <div className="pb-20">
      <p className="text-xs leading-relaxed mb-6" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
        Claude-managed automations for this dashboard. <strong>Active</strong>{" "}ones are live; the <strong>Parking Lot</strong>{" "}holds ideas we haven&apos;t built yet. Change a status to move an item between the two. Status persists in your browser.
      </p>

      {/* Active */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#15803d", fontFamily: "var(--font-geist-mono)" }}>Active</span>
          <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{active.length}</span>
        </div>
        {sectionTable(active, "Nothing active yet — promote an idea below to Active once it's built.")}
      </div>

      {/* Parking Lot */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>Parking Lot</span>
          <span className="text-xs" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>{parkingLot.length}</span>
        </div>
        {sectionTable(parkingLot, "Parking lot is empty.")}
      </div>
    </div>
  );
}

// ---- Reason log: dated, strike-through-able entries stored in sheet column K ----
// One entry per line, human-readable in the Sheet:
//   [ ] Jul 20, 2026 — John is actively following up   (open)
//   [x] Jul 18, 2026 — Waiting on vendor quote          (resolved / struck)
// Legacy plain-text reasons (no [ ]/[x] marker) parse as a single undated,
// open entry, so nothing already in column K is lost.
type ReasonEntry = { date: string; text: string; resolved: boolean };

function parseReasonLog(raw: string): ReasonEntry[] {
  if (!raw || !raw.trim()) return [];
  return raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const m = line.match(/^\[([ xX])\]\s?(.*)$/);
    if (!m) return { date: "", text: line, resolved: false }; // legacy plain text
    const resolved = m[1].toLowerCase() === "x";
    const rest = m[2];
    const sep = rest.indexOf(" — ");
    return sep !== -1
      ? { date: rest.slice(0, sep).trim(), text: rest.slice(sep + 3).trim(), resolved }
      : { date: "", text: rest.trim(), resolved };
  });
}

function serializeReasonLog(entries: ReasonEntry[]): string {
  return entries
    .map((e) => `[${e.resolved ? "x" : " "}] ${e.date ? `${e.date} — ` : ""}${e.text}`)
    .join("\n");
}

// Today's date in ET, e.g. "Jul 20, 2026". Only ever called from event
// handlers (never during render), so no hydration concern.
function todayET(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric",
  }).format(new Date());
}

function NeedsActionView({ workstreams, onOpenTask, filterWsId, onClearFilter, joinDates = {}, scrollToTaskId, onScrolled }: { workstreams: Workstream100[]; onOpenTask: (wsId: string, taskId: string, queue: { wsId: string; taskId: string }[]) => void; filterWsId?: string | null; onClearFilter?: () => void; joinDates?: Record<string, string>; scrollToTaskId?: string | null; onScrolled?: () => void }) {
  const ORDER: TaskHealth[] = ["At Risk", "Blocked", "Off Track"];
  // Sort by join date; newest on top by default.
  const [dateSort, setDateSort] = useState<"desc" | "asc">("desc");

  // When returning from review mode, scroll back to the task you left off on.
  const [flash, setFlash] = useState<string | null>(null);
  useEffect(() => {
    if (!scrollToTaskId) return;
    const id = scrollToTaskId;
    const t = setTimeout(() => {
      const el = document.getElementById(`na-${id}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlash(id);
      onScrolled?.();
      setTimeout(() => setFlash(null), 2200);
    }, 80);
    return () => clearTimeout(t);
  }, [scrollToTaskId, onScrolled]);
  const filtered = filterWsId ? workstreams.filter((ws) => ws.id === filterWsId) : workstreams;
  const filterName = filterWsId ? workstreams.find((ws) => ws.id === filterWsId)?.name : null;

  const [reasons, setReasons] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    workstreams.forEach((ws) => ws.tasks.forEach((t) => { m[t.id] = t.reason || ""; }));
    return m;
  });
  // Draft text for the "add a note" input, per task.
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});

  // Persist the serialized reason log to the sheet (column K) + local state.
  const persistReason = async (wsId: string, taskId: string, description: string, serialized: string) => {
    setReasons((prev) => ({ ...prev, [taskId]: serialized }));
    await fetch("/api/update-field", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, taskDescription: description, workstreamId: wsId, field: "reason", value: serialized }),
    });
  };

  // Append a new dated entry from the draft input.
  const addReasonEntry = (wsId: string, taskId: string, description: string) => {
    const text = (reasonDraft[taskId] ?? "").trim();
    if (!text) return;
    const entries = parseReasonLog(reasons[taskId] ?? "");
    entries.push({ date: todayET(), text, resolved: false });
    setReasonDraft((prev) => ({ ...prev, [taskId]: "" }));
    persistReason(wsId, taskId, description, serializeReasonLog(entries));
  };

  // Toggle an entry's resolved (strike-through) state — never deletes it.
  const toggleReasonEntry = (wsId: string, taskId: string, description: string, index: number) => {
    const entries = parseReasonLog(reasons[taskId] ?? "");
    if (!entries[index]) return;
    entries[index] = { ...entries[index], resolved: !entries[index].resolved };
    persistReason(wsId, taskId, description, serializeReasonLog(entries));
  };

  // Flatten to individual flagged tasks with their health + join date, then
  // sort by join date (newest first by default). Tasks with no recorded join
  // date sort to the bottom regardless of direction.
  const items = filtered
    .flatMap((ws) =>
      ws.tasks
        .map((t) => ({ ws, t, health: calcTaskHealth(t).status, joined: joinDates[t.id] || "" }))
        .filter((x) => ORDER.includes(x.health))
    )
    .sort((a, b) => {
      if (a.joined && !b.joined) return -1;
      if (!a.joined && b.joined) return 1;
      if (a.joined === b.joined) return a.ws.name.localeCompare(b.ws.name);
      return dateSort === "desc" ? b.joined.localeCompare(a.joined) : a.joined.localeCompare(b.joined);
    });

  // Queue passed to the stepper — the exact displayed order.
  const queue = items.map(({ ws, t }) => ({ wsId: ws.id, taskId: t.id }));

  // "2026-07-17" → "Jul 17"
  const fmtJoined = (iso: string) => {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
  };

  const filterBanner = filterName ? (
    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded" style={{ backgroundColor: "#f0efe9" }}>
      <span className="text-xs" style={{ color: "#57534e", fontFamily: "var(--font-geist-mono)" }}>
        Filtered to <strong>{filterName}</strong>
      </span>
      <button onClick={onClearFilter} className="text-xs underline" style={{ color: "#1a5c3a", background: "none", border: "none", cursor: "pointer" }}>
        Show all
      </button>
    </div>
  ) : null;

  if (items.length === 0) {
    return (
      <div className="pb-20">
        {filterBanner}
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-2xl mb-2">✓</p>
          <p className="text-sm font-semibold" style={{ color: "#15803d" }}>
            {filterName ? `${filterName} is on track.` : "Everything is on track."}
          </p>
          <p className="text-xs mt-1" style={{ color: "#9ca3af" }}>No tasks are At Risk, Blocked, or Off Track right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl mx-auto">
      {filterBanner}

      {/* Sortable header — Flagged (join date) + Item */}
      <div className="grid px-1 mb-2 text-xs uppercase tracking-widest font-semibold"
        style={{ gridTemplateColumns: "84px 1fr", gap: "12px", color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
        <button
          onClick={() => setDateSort((s) => (s === "desc" ? "asc" : "desc"))}
          className="text-left flex items-center gap-1"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontFamily: "inherit", fontSize: "inherit", fontWeight: "inherit", letterSpacing: "inherit", textTransform: "inherit", padding: 0 }}
          title="Sort by date joined">
          Flagged {dateSort === "desc" ? "↓" : "↑"}
        </button>
        <span>Item</span>
      </div>

      <div className="space-y-2">
        {items.map(({ ws, t, health, joined }) => {
          const meta = HEALTH_META[health];
          const overdue = t.status !== "Complete" && t.dueDate && new Date(t.dueDate) < new Date();
          return (
            <div
              key={t.id}
              id={`na-${t.id}`}
              style={{
                backgroundColor: flash === t.id ? "#fffbe6" : "white",
                border: "0.5px solid #e5e3de",
                borderLeft: `3px solid ${meta.dot}`,
                transition: "background-color 0.4s ease",
                scrollMarginTop: "90px",
              }}
            >
              <div className="grid" style={{ gridTemplateColumns: "84px 1fr", gap: "12px", alignItems: "start", padding: "12px 14px" }}>
                {/* Left: date joined the list */}
                <div className="text-xs pt-0.5" style={{ color: joined ? "#57534e" : "#c0bdb8", fontFamily: "var(--font-geist-mono)", whiteSpace: "nowrap" }}
                  title={joined ? `Joined Needs Action ${joined}` : "Join date not yet recorded"}>
                  {fmtJoined(joined)}
                </div>

                {/* Right: the flagged item */}
                <div>
                  <div onClick={() => onOpenTask(ws.id, t.id, queue)} className="cursor-pointer rounded -mx-1 px-1 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: meta.bg, color: meta.color, fontFamily: "var(--font-geist-mono)" }}>
                        {health}
                      </span>
                      <span className="text-xs uppercase tracking-widest" style={{ color: "#c0bdb8", fontFamily: "var(--font-geist-mono)" }}>{ws.name}</span>
                    </div>
                    <div className="text-sm leading-snug mb-2" style={{ color: "#1a1a1a" }}>{t.description}</div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "#78716c", fontFamily: "var(--font-geist-mono)" }}>
                      <span style={{ color: overdue ? "#b91c1c" : undefined, fontWeight: overdue ? 600 : undefined }}>
                        {t.dueDate || "—"}
                      </span>
                      <span>{t.accountable || "—"}</span>
                      <span style={{ marginLeft: "auto", color: "#1a5c3a" }}>Open task →</span>
                    </div>
                  </div>

                  {/* Reason log — dated entries, click to strike resolved; persists to sheet col K */}
                  {(() => {
                    const entries = parseReasonLog(reasons[t.id] ?? "");
                    return (
                  <div style={{ marginTop: "10px", borderTop: "1px solid #f0efe9", paddingTop: "8px" }}>
                    <div className="text-xs uppercase tracking-widest mb-1.5" style={{ color: "#9ca3af", fontFamily: "var(--font-geist-mono)" }}>
                      Reason for Risk / Off Track / Block
                    </div>
                    {entries.length > 0 && (
                      <div className="mb-2" style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {entries.map((e, idx) => (
                          <div
                            key={idx}
                            onClick={() => toggleReasonEntry(ws.id, t.id, t.description, idx)}
                            className="flex items-start gap-2 text-xs leading-relaxed cursor-pointer rounded px-1 -mx-1 hover:bg-stone-100 transition-colors"
                            title={e.resolved ? "Mark as still an issue" : "Mark resolved"}
                          >
                            <span aria-hidden style={{ fontFamily: "var(--font-geist-mono)", color: e.resolved ? "#9ca3af" : "#1a5c3a", lineHeight: "1.4" }}>
                              {e.resolved ? "☑" : "☐"}
                            </span>
                            <span style={{ flex: 1, color: e.resolved ? "#c0bdb8" : "#57534e", textDecoration: e.resolved ? "line-through" : "none" }}>
                              {e.date && (
                                <span style={{ fontFamily: "var(--font-geist-mono)", color: "#c0bdb8", marginRight: "6px" }}>{e.date}</span>
                              )}
                              {e.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={reasonDraft[t.id] ?? ""}
                      onChange={(ev) => setReasonDraft((prev) => ({ ...prev, [t.id]: ev.target.value }))}
                      onKeyDown={(ev) => { if (ev.key === "Enter") { ev.preventDefault(); addReasonEntry(ws.id, t.id, t.description); } }}
                      placeholder={entries.length ? "Add another note…" : "Add the reason…"}
                      className="w-full text-xs leading-relaxed rounded px-2 py-1.5 focus:outline-none"
                      style={{ border: "1px solid #d1cfc9", backgroundColor: "#fafaf8", color: "#57534e" }}
                    />
                  </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
