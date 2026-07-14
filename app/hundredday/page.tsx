import { fetchWorkstreams } from "@/lib/sheets";
import HundredDayDashboard from "@/components/HundredDayDashboard";

export const dynamic = "force-dynamic"; // always fetch fresh data from sheet

export default async function HundredDayPage() {
  const workstreams = await fetchWorkstreams();
  return <HundredDayDashboard workstreams={workstreams} />;
}
