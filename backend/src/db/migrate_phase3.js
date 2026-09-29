import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log("Applying Phase 3 schema (imports, scheduled_jobs tables)...");
  const sql = fs.readFileSync(path.join(__dirname, "schema_phase3.sql"), "utf-8");
  await pool.query(sql);
  console.log("Phase 3 schema applied.");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
