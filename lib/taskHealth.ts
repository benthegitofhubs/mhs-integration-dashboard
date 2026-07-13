export type TaskHealth = "On Track" | "At Risk" | "Off Track";

export interface TaskHealthResult {
  status: TaskHealth;
  paceGap: number | null;
  reason: string;
}

export function calcTaskHealth(
  task: { status: string; dueDate?: string },
  today: Date = new Date()
): TaskHealthResult {
  if (task.status === "Complete") {
    return { status: "On Track", paceGap: null, reason: "Task is complete" };
  }

  const due = task.dueDate ? new Date(task.dueDate) : null;

  if (due && !isNaN(due.getTime()) && due < today) {
    return { status: "Off Track", paceGap: null, reason: "Past due date" };
  }

  if (task.status === "At Risk" || task.status === "Blocked") {
    return { status: "At Risk", paceGap: null, reason: "Manually flagged as " + task.status };
  }

  return { status: "On Track", paceGap: null, reason: "Due date not passed" };
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
