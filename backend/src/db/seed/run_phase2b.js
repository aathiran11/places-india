import "dotenv/config";
import pool from "../../db.js";
import { districtProfiles, villageProfiles } from "./phase2b_data.js";

const CATEGORY_COLUMNS = [
  "population",
  "economy",
  "education",
  "healthcare",
  "infrastructure",
  "environment",
  "safety",
  "employment",
  "lifestyle",
  "tourism",
  "climate",
];

async function upsertPlaceData(placeType, placeId, data) {
  const values = CATEGORY_COLUMNS.map((col) => (data[col] ? JSON.stringify(data[col]) : null));
  await pool.query(
    `INSERT INTO place_data
       (place_type, place_id, population, economy, education, healthcare,
        infrastructure, environment, safety, employment, lifestyle, tourism, climate)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
    [placeType, placeId, ...values]
  );
}

async function run() {
  console.log("Seeding district-level place_data...");
  for (const [key, data] of Object.entries(districtProfiles)) {
    const [districtName, stateName] = key.split("|");
    const { rows } = await pool.query(
      `SELECT d.id FROM districts d
       JOIN states s ON s.id = d.state_id
       WHERE d.name = $1 AND s.name = $2`,
      [districtName, stateName]
    );
    if (!rows.length) {
      console.warn(`District not found: ${districtName}, ${stateName} — skipping.`);
      continue;
    }
    await upsertPlaceData("district", rows[0].id, data);
  }

  console.log("Seeding village-level place_data...");
  for (const [key, data] of Object.entries(villageProfiles)) {
    const [villageName, districtName] = key.split("|");
    const { rows } = await pool.query(
      `SELECT v.id FROM villages v
       JOIN districts d ON d.id = v.district_id
       WHERE v.name = $1 AND d.name = $2`,
      [villageName, districtName]
    );
    if (!rows.length) {
      console.warn(`Village not found: ${villageName}, ${districtName} — skipping.`);
      continue;
    }
    await upsertPlaceData("village", rows[0].id, data);
  }

  console.log("Phase 2b seed complete.");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
