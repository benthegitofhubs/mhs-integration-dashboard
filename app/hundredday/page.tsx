import { fetchWorkstreamsResult } from "@/lib/sheets";
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
  return <HundredDayDashboard workstreams={workstreams} loadedAt={loadedAt} nowMs={nowMs} live={live} />;
}
