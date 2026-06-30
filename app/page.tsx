import { WORKSTREAMS } from "@/lib/workstreams";
import WorkstreamCard from "@/components/WorkstreamCard";

export default function Home() {
  const totalTasks = WORKSTREAMS.reduce((acc, ws) => acc + ws.tasks.length, 0);
  const completedTasks = WORKSTREAMS.reduce(
    (acc, ws) => acc + ws.tasks.filter((t) => t.status === "Complete").length,
    0
  );
  const inProgressTasks = WORKSTREAMS.reduce(
    (acc, ws) => acc + ws.tasks.filter((t) => t.status === "In Progress").length,
    0
  );
  const blockedTasks = WORKSTREAMS.reduce(
    (acc, ws) => acc + ws.tasks.filter((t) => t.status === "Blocked").length,
    0
  );

  const overallPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">Radial Health</p>
              <h1 className="text-2xl font-bold text-white">MHS Integration Tracker</h1>
              <p className="text-sm text-gray-400 mt-1">Mindful Health Solutions · 21 locations · CA / TX / WA · 6-month integration</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Close date</p>
              <p className="text-sm font-medium text-gray-300">TBD</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBox label="Total Tasks" value={totalTasks} color="text-white" />
            <StatBox label="Complete" value={completedTasks} color="text-green-400" />
            <StatBox label="In Progress" value={inProgressTasks} color="text-blue-400" />
            <StatBox label="Blocked" value={blockedTasks} color="text-red-400" />
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Overall progress</span>
              <span>{overallPct}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        {WORKSTREAMS.map((ws) => (
          <WorkstreamCard key={ws.id} workstream={ws} />
        ))}
      </div>
    </main>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-gray-800 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}
