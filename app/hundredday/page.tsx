import { fetchWorkstreams } from "@/lib/sheets";
import HundredDayDashboard from "@/components/HundredDayDashboard";

export const revalidate = 300; // re-fetch from sheet every 5 minutes

export default async function HundredDayPage() {
  const workstreams = await fetchWorkstreams();
  return <HundredDayDashboard workstreams={workstreams} />;
}
