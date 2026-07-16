import { readFileSync } from "fs";
import { homedir } from "os";

// fetchWorkstreams reads the service account from this env var
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8");

import { fetchWorkstreams } from "../lib/sheets";
import { calcTaskHealth } from "../lib/taskHealth";

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date("2026-06-23");
  const end   = new Date("2026-10-01");
  const dayElapsed   = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const dayRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));

  const wss = await fetchWorkstreams();

  const workstreams = wss.map((ws) => {
    const c = { complete: 0, onTrack: 0, atRisk: 0, blocked: 0, offTrack: 0 };
    ws.tasks.forEach((t) => {
      if (t.status === "Complete") { c.complete++; return; }
      const h = calcTaskHealth(t, today).status;
      if (h === "At Risk") c.atRisk++;
      else if (h === "Blocked") c.blocked++;
      else if (h === "Off Track") c.offTrack++;
      else c.onTrack++;
    });
    return { name: ws.name, leader: ws.leader || "", total: ws.tasks.length, ...c };
  });

  const totals = workstreams.reduce(
    (a, w) => ({
      tasks: a.tasks + w.total,
      complete: a.complete + w.complete,
      onTrack: a.onTrack + w.onTrack,
      atRisk: a.atRisk + w.atRisk,
      blocked: a.blocked + w.blocked,
      offTrack: a.offTrack + w.offTrack,
    }),
    { tasks: 0, complete: 0, onTrack: 0, atRisk: 0, blocked: 0, offTrack: 0 }
  );

  const out = {
    date: today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    dayElapsed,
    dayRemaining,
    totals,
    workstreams,
  };
  process.stdout.write(JSON.stringify(out) + "\n");
}

main().catch((e) => { process.stderr.write(String(e) + "\n"); process.exit(1); });
