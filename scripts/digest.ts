import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import { homedir } from "os";

// fetchWorkstreams reads the service account from this env var
process.env.GOOGLE_SERVICE_ACCOUNT_JSON = readFileSync(`${homedir()}/.mhs_service_account.json`, "utf8");

import { fetchWorkstreams } from "../lib/sheets";
import { calcTaskHealth } from "../lib/taskHealth";

// Idempotency: only emit the digest once per ET day, even when several Claude
// Code sessions are open and each fires this scheduled task independently. We
// claim today's slot ATOMICALLY up front (O_EXCL create) — the first session to
// run wins and emits the JSON; any other session the same day gets EEXIST and
// prints the literal "SILENT" token so the scheduled task posts nothing.
// Claiming BEFORE the slow sheet fetch closes the race where two sessions spawn
// ~1s apart. Old claim files are swept; a failed run releases its claim (see
// main().catch) so it can retry. Pass --force to bypass (e.g. manual testing).
const FORCE = process.argv.includes("--force");
const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD ET
const CLAIM_FILE = `${homedir()}/.mhs_daily_digest.${todayISO}.claim`;
const CLAIM_RE = /^\.mhs_daily_digest\.\d{4}-\d{2}-\d{2}\.claim$/;

async function main() {
  if (!FORCE) {
    try {
      writeFileSync(CLAIM_FILE, new Date().toISOString() + "\n", { flag: "wx" });
    } catch (e: any) {
      if (e?.code === "EEXIST") { process.stdout.write("SILENT\n"); return; }
      // any other fs error: fail open and post rather than go dark
    }
    try {
      for (const f of readdirSync(homedir()))
        if (CLAIM_RE.test(f) && f !== `.mhs_daily_digest.${todayISO}.claim`)
          try { unlinkSync(`${homedir()}/${f}`); } catch {}
    } catch {}
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date("2026-06-23");
  const end   = new Date("2026-10-01");
  const dayElapsed   = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const dayRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));

  const wss = await fetchWorkstreams();

  const workstreams = wss.map((ws) => {
    const c = { complete: 0, onTrack: 0, notStarted: 0, atRisk: 0, blocked: 0, offTrack: 0 };
    ws.tasks.forEach((t) => {
      if (t.status === "Complete") { c.complete++; return; }
      const h = calcTaskHealth(t, today).status;
      if (h === "At Risk") c.atRisk++;
      else if (h === "Blocked") c.blocked++;
      else if (h === "Off Track") c.offTrack++;
      else if (t.status === "Not Started") c.notStarted++;
      else c.onTrack++;
    });
    return { name: ws.name, leader: ws.leader || "", total: ws.tasks.length, ...c };
  });

  const totals = workstreams.reduce(
    (a, w) => ({
      tasks: a.tasks + w.total,
      complete: a.complete + w.complete,
      onTrack: a.onTrack + w.onTrack,
      notStarted: a.notStarted + w.notStarted,
      atRisk: a.atRisk + w.atRisk,
      blocked: a.blocked + w.blocked,
      offTrack: a.offTrack + w.offTrack,
    }),
    { tasks: 0, complete: 0, onTrack: 0, notStarted: 0, atRisk: 0, blocked: 0, offTrack: 0 }
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

main().catch((e) => {
  // We claimed today's slot but never emitted — release it so a later run can
  // retry, rather than eating the whole day on a transient sheet error.
  if (!FORCE) { try { unlinkSync(CLAIM_FILE); } catch {} }
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
