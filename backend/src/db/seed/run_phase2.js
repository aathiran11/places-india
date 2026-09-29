import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../../db.js";
import { cityProfiles } from "./phase2_data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log("Applying Phase 2 schema (place_data table)...");
  const schemaSql = fs.readFileSync(
    path.join(__dirname, "../schema_phase2.sql"),
    "utf-8"
  );
  await pool.query(schemaSql);

  console.log("Seeding place_data for demo cities...");
  for (const [cityName, data] of Object.entries(cityProfiles)) {
    const { rows } = await pool.query("SELECT id FROM cities WHERE name = $1", [cityName]);
    if (!rows.length) {
      console.warn(`City not found: ${cityName}, skipping.`);
      continue;
    }
    const cityId = rows[0].id;

    await pool.query(
      `INSERT INTO place_data
         (place_type, place_id, population, economy, education, healthcare,
          infrastructure, environment, safety, employment, lifestyle, tourism, climate)
       VALUES ('city', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (place_type, place_id) DO UPDATE SET
         population = EXCLUDED.population,
         economy = EXCLUDED.economy,
         education = EXCLUDED.education,
         healthcare = EXCLUDED.healthcare,
         infrastructure = EXCLUDED.infrastructure,
         environment = EXCLUDED.environment,
         safety = EXCLUDED.safety,
         employment = EXCLUDED.employment,
         lifestyle = EXCLUDED.lifestyle,
         tourism = EXCLUDED.tourism,
         climate = EXCLUDED.climate,
         updated_at = now()`,
      [
        cityId,
        data.population,
        data.economy,
        data.education,
        data.healthcare,
        data.infrastructure,
        data.environment,
        data.safety,
        data.employment,
        data.lifestyle,
        data.tourism,
        data.climate,
      ].map((v, i) => (i === 0 ? v : JSON.stringify(v)))
    );
  }

  console.log("Phase 2 seed complete.");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
