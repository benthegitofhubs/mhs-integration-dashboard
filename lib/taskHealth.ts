export type TaskHealth = "On Track" | "At Risk" | "Off Track";

export interface TaskHealthResult {
  status: TaskHealth;
  paceGap: number | null;
  reason: string;
}

export function calcTaskHealth(
  task: {
    status: string;
    dueDate?: string;
    startDate?: string;
    percentComplete?: number;
    lastUpdatedPercent?: number;
  },
  today: Date = new Date()
): TaskHealthResult {
  const pct = task.percentComplete ?? 0;

  if (task.status === "Complete") {
    return { status: "On Track", paceGap: null, reason: "Task is complete" };
  }

  const due   = task.dueDate   ? new Date(task.dueDate)   : null;
  const start = task.startDate ? new Date(task.startDate) : null;

  // Past due and incomplete — always Off Track
  if (due && !isNaN(due.getTime()) && due < today && pct < 100) {
    return { status: "Off Track", paceGap: 100, reason: "Past due date and not complete" };
  }

  let baseStatus: TaskHealth = "On Track";
  let paceGap: number | null = null;
  let reason = "No timeline data — using status only";

  if (start && !isNaN(start.getTime()) && due && !isNaN(due.getTime())) {
    const totalDays   = (due.getTime() - start.getTime()) / 86400000;
    const elapsedDays = (today.getTime() - start.getTime()) / 86400000;
    const expectedPct = totalDays === 0
      ? 100
      : Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    paceGap = expectedPct - pct;

    if (paceGap <= 10) {
      baseStatus = "On Track";
      reason = paceGap <= 0
        ? "Ahead of pace"
        : `${Math.round(paceGap)}% behind pace — within threshold`;
    } else if (paceGap <= 30) {
      baseStatus = "At Risk";
      reason = `${Math.round(paceGap)}% behind pace`;
    } else {
      baseStatus = "Off Track";
      reason = `${Math.round(paceGap)}% behind pace`;
    }
  }

  // Trend override: no forward progress since last check-in
  if (
    task.lastUpdatedPercent !== undefined &&
    pct <= task.lastUpdatedPercent &&
    baseStatus === "On Track"
  ) {
    baseStatus = "At Risk";
    reason = `No progress since last check-in (${task.lastUpdatedPercent}% → ${pct}%)`;
  }

  // Override: Blocked can never show On Track
  if (task.status === "Blocked") {
    if (baseStatus === "On Track") {
      baseStatus = "At Risk";
      reason = "Blocked dependency";
    } else {
      reason = `${reason}; blocked`;
    }
  }

  // Override: Not Started but timeline has begun
  if (task.status === "Not Started" && start && today > start) {
    if (baseStatus === "On Track") {
      baseStatus = "At Risk";
      reason = "Not started but timeline has begun";
    }
  }

  return { status: baseStatus, paceGap, reason };
}

export function rollupWorkstreamHealth(results: TaskHealthResult[]): TaskHealth | null {
  if (results.length === 0) return null;
  if (results.some((r) => r.status === "Off Track")) return "Off Track";
  if (results.some((r) => r.status === "At Risk"))   return "At Risk";
  return "On Track";
}

export const HEALTH_META: Record<TaskHealth, { bg: string; color: string; dot: string }> = {
  "On Track":  { bg: "#dcfce7", color: "#15803d", dot: "#15803d" },
  "At Risk":   { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  "Off Track": { bg: "#fee2e2", color: "#b91c1c", dot: "#b91c1c" },
};
