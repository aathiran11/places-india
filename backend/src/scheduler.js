import pool from "./db.js";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

// This is intentionally a stub: Phase 3's brief calls for "scheduled updates",
// but there's no live external data source wired up yet (that depends on
// which government/public datasets get integrated). This job proves the
// scheduling mechanism works end-to-end — swap the body of runCheck() for a
// real fetch-and-import once a data source is chosen.
async function runCheck() {
  try {
    await pool.query(
      `UPDATE scheduled_jobs
       SET last_run_at = now(), last_status = 'ok', run_count = run_count + 1
       WHERE job_name = 'data_freshness_check'`
    );
    console.log(`[scheduler] data_freshness_check ran at ${new Date().toISOString()}`);
  } catch (err) {
    console.error("[scheduler] check failed:", err.message);
  }
}

export function startScheduler() {
  // Run once shortly after boot, then on the interval.
  setTimeout(runCheck, 10_000);
  setInterval(runCheck, CHECK_INTERVAL_MS);
  console.log(`[scheduler] started — checking every ${CHECK_INTERVAL_MS / 60000} minutes`);
}
