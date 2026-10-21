import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api");

interface RankingResult {
  id: number;
  name: string;
  district_name?: string;
  state_name: string;
  value: number;
}

interface Metric {
  category: string;
  field: string;
  label: string;
  unit?: string;
  order: "asc" | "desc"; // desc = "higher is better" leaderboard direction
}

const METRICS: Metric[] = [
  { category: "safety", field: "night_safety_score", label: "Safest at Night", order: "desc" },
  { category: "safety", field: "women_safety_score", label: "Best Women's Safety", order: "desc" },
  { category: "safety", field: "crime_rate_index", label: "Lowest Crime Rate", order: "asc" },
  { category: "population", field: "literacy_rate", label: "Highest Literacy", unit: "%", order: "desc" },
  { category: "economy", field: "avg_monthly_income_inr", label: "Highest Average Income", unit: "₹/mo", order: "desc" },
  { category: "economy", field: "cost_of_living_index", label: "Most Affordable (Cost of Living)", order: "asc" },
  { category: "environment", field: "aqi_avg", label: "Best Air Quality (Lowest AQI)", order: "asc" },
  { category: "environment", field: "green_cover_pct", label: "Most Green Cover", unit: "%", order: "desc" },
  { category: "education", field: "higher_ed_access_score", label: "Best Higher Education Access", order: "desc" },
  { category: "healthcare", field: "accessibility_score", label: "Best Healthcare Access", order: "desc" },
  { category: "infrastructure", field: "internet_penetration", label: "Best Internet Penetration", unit: "%", order: "desc" },
  { category: "employment", field: "job_openings_index", label: "Most Job Openings", order: "desc" },
  { category: "tourism", field: "tourism_score", label: "Best for Tourism", order: "desc" },
  { category: "climate", field: "climate_comfort_index", label: "Most Comfortable Climate", order: "desc" },
];

export default function RankingsPage() {
  const [placeType, setPlaceType] = useState<"city" | "district">("city");
  const [metric, setMetric] = useState<Metric>(METRICS[0]);
  const [results, setResults] = useState<RankingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      place_type: placeType,
      category: metric.category,
      field: metric.field,
      order: metric.order,
      limit: "10",
    });
    fetch(`${API_URL}/places/rankings?${params}`)
      .then((r) => r.json())
      .then((data) => setResults(data.results || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [placeType, metric]);

  const maxValue = results.length ? Math.max(...results.map((r) => r.value)) : 1;
  const minValue = results.length ? Math.min(...results.map((r) => r.value)) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-maroon font-semibold mb-1">Rankings</h1>
      <p className="text-ink/60 text-sm mb-6">
        See how your seeded places compare on a specific metric.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={placeType}
          onChange={(e) => setPlaceType(e.target.value as "city" | "district")}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="city">Cities</option>
          <option value="district">Districts</option>
        </select>

        <select
          value={metric.label}
          onChange={(e) => setMetric(METRICS.find((m) => m.label === e.target.value) || METRICS[0])}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[220px]"
        >
          {METRICS.map((m) => (
            <option key={m.label} value={m.label}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gold/20 rounded-xl p-5">
        <h2 className="font-semibold mb-1">{metric.label}</h2>
        <p className="text-xs text-ink/40 mb-4">
          {placeType === "city" ? "Cities" : "Districts"} ranked by {metric.field.replace(/_/g, " ")}
          {metric.order === "asc" ? " (lower is better)" : " (higher is better)"}.
        </p>

        {loading ? (
          <p className="text-sm text-ink/40">Loading rankings...</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-ink/40">
            No places have this metric yet. Only your ML-patched cities/districts have the full
            data set — try a different metric or place type.
          </p>
        ) : (
          <div className="space-y-2">
            {results.map((r, i) => {
              const range = maxValue - minValue || 1;
              const barPct = ((r.value - minValue) / range) * 100;
              return (
                <Link
                  key={r.id}
                  to={placeType === "city" ? `/cities/${r.id}` : `/districts/${r.id}`}
                  className="flex items-center gap-3 hover:bg-sandstone-light rounded-lg px-2 py-2 transition-colors"
                >
                  <div className="w-6 text-right text-sm font-display font-semibold text-maroon">
                    {i + 1}
                  </div>
                  <div className="w-32 sm:w-40 truncate">
                    <div className="text-sm font-medium text-ink">{r.name}</div>
                    <div className="text-xs text-ink/40 truncate">
                      {r.district_name ? `${r.district_name}, ` : ""}
                      {r.state_name}
                    </div>
                  </div>
                  <div className="flex-1 h-2.5 bg-sandstone rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-maroon"
                      style={{ width: `${Math.max(barPct, 4)}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-ink/70">
                    {r.value}
                    {metric.unit || ""}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
