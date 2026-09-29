import { parse as parseCsv } from "csv-parse/sync";
import pool from "../db.js";
import { CATEGORY_COLUMNS } from "../constants.js";

// ---------- Parsing ----------

export function parseFile(buffer, format) {
  const text = buffer.toString("utf-8");
  if (format === "json") {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      throw new Error("JSON file must contain an array of row objects");
    }
    return data;
  }
  // CSV
  return parseCsv(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

// ---------- Data cleaning ----------

function cleanRow(row) {
  const cleaned = {};
  for (const [key, value] of Object.entries(row)) {
    if (value === undefined || value === null) continue;
    const cleanKey = String(key).trim().toLowerCase();
    const cleanValue = typeof value === "string" ? value.trim() : value;
    if (cleanValue === "") continue;
    cleaned[cleanKey] = cleanValue;
  }
  return cleaned;
}

function isRowEmpty(row) {
  return Object.keys(row).length === 0;
}

// Coerces a raw CSV/JSON cell into number | string | string[]
function coerceValue(raw) {
  if (typeof raw === "number") return raw;
  const str = String(raw);
  const num = Number(str);
  if (str !== "" && !Number.isNaN(num)) return num;
  if (str.includes(",")) {
    return str.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return str;
}

// ---------- Places hierarchy import ----------
// Expected columns: level (district|city|town|village), name, state_name,
// district_name (required for city/town/village), type (city|town, only for
// level=city/town), population (optional)

export async function processHierarchyRows(rows) {
  const errors = [];
  let success = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // +1 for 0-index, +1 for header row
    const row = cleanRow(rows[i]);
    if (isRowEmpty(row)) continue;

    try {
      const level = String(row.level || "").toLowerCase();

      if (level === "district") {
        if (!row.name || !row.state_name) {
          throw new Error("district rows require 'name' and 'state_name'");
        }
        const stateRes = await pool.query("SELECT id FROM states WHERE name ILIKE $1", [
          row.state_name,
        ]);
        if (!stateRes.rows.length) throw new Error(`State not found: "${row.state_name}"`);

        await pool.query(
          `INSERT INTO districts (name, state_id, headquarters)
           VALUES ($1, $2, $3)
           ON CONFLICT (name, state_id) DO UPDATE SET
             headquarters = COALESCE(EXCLUDED.headquarters, districts.headquarters)`,
          [row.name, stateRes.rows[0].id, row.headquarters || null]
        );
      } else if (level === "city" || level === "town") {
        if (!row.name || !row.state_name || !row.district_name) {
          throw new Error("city/town rows require 'name', 'state_name', and 'district_name'");
        }
        const districtRes = await pool.query(
          `SELECT d.id FROM districts d JOIN states s ON s.id = d.state_id
           WHERE d.name ILIKE $1 AND s.name ILIKE $2`,
          [row.district_name, row.state_name]
        );
        if (!districtRes.rows.length) {
          throw new Error(`District not found: "${row.district_name}", "${row.state_name}"`);
        }
        const population = row.population ? parseInt(row.population, 10) : null;
        if (row.population && Number.isNaN(population)) {
          throw new Error(`Invalid population value: "${row.population}"`);
        }

        await pool.query(
          `INSERT INTO cities (name, district_id, type, population)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (name, district_id) DO UPDATE SET
             type = EXCLUDED.type,
             population = COALESCE(EXCLUDED.population, cities.population)`,
          [row.name, districtRes.rows[0].id, level, population]
        );
      } else if (level === "village") {
        if (!row.name || !row.state_name || !row.district_name) {
          throw new Error("village rows require 'name', 'state_name', and 'district_name'");
        }
        const districtRes = await pool.query(
          `SELECT d.id FROM districts d JOIN states s ON s.id = d.state_id
           WHERE d.name ILIKE $1 AND s.name ILIKE $2`,
          [row.district_name, row.state_name]
        );
        if (!districtRes.rows.length) {
          throw new Error(`District not found: "${row.district_name}", "${row.state_name}"`);
        }
        const population = row.population ? parseInt(row.population, 10) : null;
        if (row.population && Number.isNaN(population)) {
          throw new Error(`Invalid population value: "${row.population}"`);
        }

        await pool.query(
          `INSERT INTO villages (name, district_id, population)
           VALUES ($1, $2, $3)
           ON CONFLICT (name, district_id) DO UPDATE SET
             population = COALESCE(EXCLUDED.population, villages.population)`,
          [row.name, districtRes.rows[0].id, population]
        );
      } else {
        throw new Error(`Unknown or missing 'level' (expected district/city/town/village): "${row.level}"`);
      }

      success++;
    } catch (err) {
      errors.push({ row: rowNum, message: err.message });
    }
  }

  return { total: rows.length, success, failed: errors.length, errors };
}

// ---------- Place data import (long/tidy format) ----------
// Expected columns: place_type (city|district|village), name, state_name,
// district_name (required unless place_type=district, in which case it's the
// district's own name — leave district_name blank), category, field, value

async function resolvePlaceId(placeType, name, stateName, districtName) {
  if (placeType === "district") {
    const res = await pool.query(
      `SELECT d.id FROM districts d JOIN states s ON s.id = d.state_id
       WHERE d.name ILIKE $1 AND s.name ILIKE $2`,
      [name, stateName]
    );
    return res.rows[0]?.id || null;
  }
  if (placeType === "city") {
    const res = await pool.query(
      `SELECT c.id FROM cities c
       JOIN districts d ON d.id = c.district_id
       JOIN states s ON s.id = d.state_id
       WHERE c.name ILIKE $1 AND s.name ILIKE $2 AND ($3::text IS NULL OR d.name ILIKE $3)`,
      [name, stateName, districtName || null]
    );
    return res.rows[0]?.id || null;
  }
  if (placeType === "village") {
    const res = await pool.query(
      `SELECT v.id FROM villages v
       JOIN districts d ON d.id = v.district_id
       JOIN states s ON s.id = d.state_id
       WHERE v.name ILIKE $1 AND s.name ILIKE $2 AND ($3::text IS NULL OR d.name ILIKE $3)`,
      [name, stateName, districtName || null]
    );
    return res.rows[0]?.id || null;
  }
  return null;
}

export async function processPlaceDataRows(rows) {
  const errors = [];
  // Group rows by (place_type, place_id, category) so multiple field/value
  // rows for the same place+category merge into one JSON object per group.
  const groups = new Map();
  let success = 0;

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2;
    const row = cleanRow(rows[i]);
    if (isRowEmpty(row)) continue;

    try {
      const placeType = String(row.place_type || "").toLowerCase();
      if (!["city", "district", "village"].includes(placeType)) {
        throw new Error(`Invalid place_type (expected city/district/village): "${row.place_type}"`);
      }
      if (!row.name || !row.state_name) {
        throw new Error("rows require 'name' and 'state_name'");
      }
      const category = String(row.category || "").toLowerCase();
      if (!CATEGORY_COLUMNS.includes(category)) {
        throw new Error(
          `Invalid category "${row.category}" — must be one of: ${CATEGORY_COLUMNS.join(", ")}`
        );
      }
      if (!row.field) throw new Error("'field' is required");
      if (row.value === undefined) throw new Error("'value' is required");

      const placeId = await resolvePlaceId(placeType, row.name, row.state_name, row.district_name);
      if (!placeId) {
        throw new Error(
          `Place not found: ${placeType} "${row.name}" in "${row.district_name || ""}", "${row.state_name}"`
        );
      }

      const groupKey = `${placeType}:${placeId}:${category}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { placeType, placeId, category, fields: {}, rowNums: [] });
      }
      const group = groups.get(groupKey);
      group.fields[row.field] = coerceValue(row.value);
      group.rowNums.push(rowNum);

      success++;
    } catch (err) {
      errors.push({ row: rowNum, message: err.message });
    }
  }

  // Write each group: merge new fields into any existing JSONB for that category
  for (const group of groups.values()) {
    try {
      await pool.query(
        `INSERT INTO place_data (place_type, place_id, ${group.category})
         VALUES ($1, $2, $3::jsonb)
         ON CONFLICT (place_type, place_id) DO UPDATE SET
           ${group.category} = COALESCE(place_data.${group.category}, '{}'::jsonb) || EXCLUDED.${group.category},
           updated_at = now()`,
        [group.placeType, group.placeId, JSON.stringify(group.fields)]
      );
    } catch (err) {
      for (const rowNum of group.rowNums) {
        errors.push({ row: rowNum, message: `Write failed: ${err.message}` });
      }
      success -= group.rowNums.length;
    }
  }

  return { total: rows.length, success, failed: errors.length, errors };
}
