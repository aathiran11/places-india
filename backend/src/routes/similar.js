import { Router } from "express";
import pool from "../db.js";

const router = Router();

// Categories whose numeric fields feed the similarity comparison. Deliberately
// excludes "lifestyle" and "tourism" — those are more about visiting a place
// than living/developing there, and mixing them in tended to match cities on
// "has a lot of restaurants" rather than genuine structural similarity.
const CATEGORIES = [
  "population",
  "economy",
  "education",
  "healthcare",
  "infrastructure",
  "environment",
  "safety",
  "employment",
];

/**
 * Fetches every city with profile data and flattens each one into a single
 * feature vector, e.g. { "population.total": 1601000, "economy.avg_monthly_income_inr": 32000, ... }.
 * Using "category.field" as the key avoids collisions between categories
 * that happen to share a field name.
 */
async function loadCityVectors() {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, d.name AS district_name, s.name AS state_name,
            pd.population, pd.economy, pd.education, pd.healthcare,
            pd.infrastructure, pd.environment, pd.safety, pd.employment
     FROM place_data pd
     JOIN cities c ON c.id = pd.place_id
     JOIN districts d ON d.id = c.district_id
     JOIN states s ON s.id = d.state_id
     WHERE pd.place_type = 'city'`
  );

  return rows.map((row) => {
    const vector = {};
    for (const cat of CATEGORIES) {
      const data = row[cat];
      if (!data) continue;
      for (const [field, value] of Object.entries(data)) {
        if (typeof value === "number") {
          vector[`${cat}.${field}`] = value;
        }
      }
    }
    return { id: row.id, name: row.name, district_name: row.district_name, state_name: row.state_name, vector };
  });
}

/** Z-score normalizes each feature across the whole set, filling missing values with that feature's mean. */
function normalizeVectors(cities) {
  const allKeys = new Set();
  cities.forEach((c) => Object.keys(c.vector).forEach((k) => allKeys.add(k)));

  const stats = {};
  for (const key of allKeys) {
    const values = cities.map((c) => c.vector[key]).filter((v) => typeof v === "number");
    const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
    const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / (values.length || 1);
    const std = Math.sqrt(variance) || 1; // avoid divide-by-zero for constant columns
    stats[key] = { mean, std };
  }

  return cities.map((c) => {
    const normalized = {};
    for (const key of allKeys) {
      const raw = typeof c.vector[key] === "number" ? c.vector[key] : stats[key].mean; // impute missing with mean
      normalized[key] = (raw - stats[key].mean) / stats[key].std;
    }
    return { ...c, normalized };
  });
}

function cosineSimilarity(a, b, keys) {
  let dot = 0, normA = 0, normB = 0;
  for (const k of keys) {
    dot += a[k] * b[k];
    normA += a[k] * a[k];
    normB += b[k] * b[k];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// GET /api/places/cities/:id/similar?limit=4
router.get("/cities/:id/similar", async (req, res) => {
  const targetId = Number(req.params.id);
  const limit = Math.min(Number(req.query.limit) || 4, 10);

  try {
    const cities = await loadCityVectors();
    if (cities.length < 2) {
      return res.json({ similar: [], note: "Not enough cities with profile data yet to compare." });
    }

    const normalized = normalizeVectors(cities);
    const target = normalized.find((c) => c.id === targetId);
    if (!target) {
      return res.status(404).json({ error: "This city doesn't have enough profile data for comparison yet." });
    }

    const keys = Object.keys(target.normalized);
    const ranked = normalized
      .filter((c) => c.id !== targetId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        district_name: c.district_name,
        state_name: c.state_name,
        similarity: cosineSimilarity(target.normalized, c.normalized, keys),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    res.json({ similar: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to compute similar places" });
  }
});

export default router;
