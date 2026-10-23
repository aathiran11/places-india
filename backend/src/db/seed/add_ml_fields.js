import "dotenv/config";
import pool from "../../db.js";

// Illustrative demographic fields needed by the Development Score ML model
// (area, % SC population, % ST population, % population age 0-6) — same
// "illustrative data" disclaimer as the rest of Phase 2's demo data applies.
// Merged into the existing `population` JSONB rather than replacing it.

const CITY_ML_FIELDS = {
  Coimbatore: { area_sqkm: 246, sc_pop_pct: 16.2, st_pop_pct: 1.8, pop_0_6_pct: 10.1 },
  Chennai: { area_sqkm: 426, sc_pop_pct: 14.8, st_pop_pct: 0.9, pop_0_6_pct: 9.4 },
  Madurai: { area_sqkm: 148, sc_pop_pct: 17.9, st_pop_pct: 0.6, pop_0_6_pct: 10.8 },
  Pollachi: { area_sqkm: 52, sc_pop_pct: 15.4, st_pop_pct: 2.1, pop_0_6_pct: 11.2 },
  Dindigul: { area_sqkm: 63, sc_pop_pct: 19.1, st_pop_pct: 1.2, pop_0_6_pct: 10.6 },
  Palani: { area_sqkm: 41, sc_pop_pct: 18.3, st_pop_pct: 3.4, pop_0_6_pct: 11.5 },
  Bengaluru: { area_sqkm: 741, sc_pop_pct: 12.6, st_pop_pct: 2.4, pop_0_6_pct: 9.9 },
  Mysuru: { area_sqkm: 128, sc_pop_pct: 18.7, st_pop_pct: 4.2, pop_0_6_pct: 10.3 },
  Mumbai: { area_sqkm: 603, sc_pop_pct: 5.8, st_pop_pct: 1.1, pop_0_6_pct: 8.6 },
  Pune: { area_sqkm: 331, sc_pop_pct: 11.4, st_pop_pct: 2.8, pop_0_6_pct: 9.7 },
  "New Delhi": { area_sqkm: 43, sc_pop_pct: 16.9, st_pop_pct: 0.4, pop_0_6_pct: 8.9 },
};

const DISTRICT_ML_FIELDS = {
  "Coimbatore|Tamil Nadu": { area_sqkm: 4732, sc_pop_pct: 17.8, st_pop_pct: 2.6, pop_0_6_pct: 10.4 },
  "Chennai|Tamil Nadu": { area_sqkm: 175, sc_pop_pct: 15.1, st_pop_pct: 1.0, pop_0_6_pct: 9.2 },
  "Madurai|Tamil Nadu": { area_sqkm: 3741, sc_pop_pct: 20.4, st_pop_pct: 0.8, pop_0_6_pct: 11.0 },
  "Dindigul|Tamil Nadu": { area_sqkm: 6058, sc_pop_pct: 21.6, st_pop_pct: 2.9, pop_0_6_pct: 11.3 },
  "Bengaluru Urban|Karnataka": { area_sqkm: 2196, sc_pop_pct: 13.9, st_pop_pct: 2.7, pop_0_6_pct: 9.6 },
  "Mysuru|Karnataka": { area_sqkm: 6854, sc_pop_pct: 20.1, st_pop_pct: 5.8, pop_0_6_pct: 10.9 },
  "Mumbai City|Maharashtra": { area_sqkm: 157, sc_pop_pct: 6.2, st_pop_pct: 1.3, pop_0_6_pct: 8.4 },
  "Pune|Maharashtra": { area_sqkm: 15643, sc_pop_pct: 12.8, st_pop_pct: 6.1, pop_0_6_pct: 10.2 },
  "New Delhi|Delhi": { area_sqkm: 43, sc_pop_pct: 16.9, st_pop_pct: 0.4, pop_0_6_pct: 8.9 },
};

async function mergePopulationFields(client, placeType, placeId, fields) {
  await client.query(
    `UPDATE place_data
     SET population = COALESCE(population, '{}'::jsonb) || $3::jsonb,
         updated_at = now()
     WHERE place_type = $1 AND place_id = $2`,
    [placeType, placeId, JSON.stringify(fields)]
  );
}

export async function addMlFields(client = pool) {
  console.log("Adding ML demographic fields to cities...");
  for (const [name, fields] of Object.entries(CITY_ML_FIELDS)) {
    const { rows } = await client.query("SELECT id FROM cities WHERE name = $1", [name]);
    if (!rows.length) {
      console.warn(`City not found: ${name} — skipping.`);
      continue;
    }
    await mergePopulationFields(client, "city", rows[0].id, fields);
  }

  console.log("Adding ML demographic fields to districts...");
  for (const [key, fields] of Object.entries(DISTRICT_ML_FIELDS)) {
    const [districtName, stateName] = key.split("|");
    const { rows } = await client.query(
      `SELECT d.id FROM districts d JOIN states s ON s.id = d.state_id
       WHERE d.name = $1 AND s.name = $2`,
      [districtName, stateName]
    );
    if (!rows.length) {
      console.warn(`District not found: ${districtName}, ${stateName} — skipping.`);
      continue;
    }
    await mergePopulationFields(client, "district", rows[0].id, fields);
  }

  console.log("Done adding ML demographic fields.");
}

import { fileURLToPath } from "url";
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  addMlFields().then(() => pool.end()).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

