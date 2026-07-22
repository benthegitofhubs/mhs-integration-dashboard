import { fetchWorkstreamsResult, reconcileNeedsActionLog, fetchGoalStatus } from "@/lib/sheets";
import { calcTaskHealth } from "@/lib/taskHealth";
import HundredDayDashboard from "@/components/HundredDayDashboard";

export const dynamic = "force-dynamic"; // always fetch fresh data from sheet

export default async function HundredDayPage() {
  const { workstreams, live } = await fetchWorkstreamsResult();
  const nowMs = Date.now();
  const loadedAt = new Date(nowMs).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }) + " ET";

  // Reconcile the Needs Action join-date log against what's currently flagged,
  // and pass the taskId → join-date map to the client for display + sorting.
  const flaggedNow = ["At Risk", "Blocked", "Off Track"];
  const flagged = workstreams.flatMap((ws) =>
    ws.tasks
      .filter((t) => flaggedNow.includes(calcTaskHealth(t).status))
      .map((t) => ({ taskId: t.id, workstream: ws.name, description: t.description }))
  );
  const joinDates = await reconcileNeedsActionLog(flagged);

  // Leader-attested Red/Yellow/Green on each workstream's 100-day goal.
  const goalStatus = await fetchGoalStatus();

  return <HundredDayDashboard workstreams={workstreams} loadedAt={loadedAt} nowMs={nowMs} live={live} joinDates={joinDates} goalStatus={goalStatus} />;
}
