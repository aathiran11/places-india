import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api");
const ML_URL = (import.meta.env.VITE_ML_URL ?? "http://localhost:8000");

interface SearchResult {
  id: number;
  name: string;
  place_type: "state" | "district" | "city" | "village";
  state_name?: string;
  district_name?: string;
}

type CategoryData = Record<string, number | string | string[]>;

interface PlaceProfile {
  population?: CategoryData;
  economy?: CategoryData;
  education?: CategoryData;
  healthcare?: CategoryData;
  infrastructure?: CategoryData;
  environment?: CategoryData;
  safety?: CategoryData;
  employment?: CategoryData;
  lifestyle?: CategoryData;
  tourism?: CategoryData;
  climate?: CategoryData;
}

interface PlaceDetail {
  id: number;
  name: string;
  place_type: "city" | "district";
  district_name?: string;
  state_name?: string;
  population?: number | null;
  profile?: PlaceProfile | null;
}

const RADAR_CATEGORIES: { key: keyof PlaceProfile; label: string }[] = [
  { key: "population", label: "Demographics" },
  { key: "economy", label: "Economy" },
  { key: "education", label: "Education" },
  { key: "healthcare", label: "Healthcare" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "environment", label: "Environment" },
  { key: "safety", label: "Safety" },
  { key: "employment", label: "Employment" },
];

const TABLE_CATEGORIES: { key: keyof PlaceProfile; label: string }[] = [
  ...RADAR_CATEGORIES,
  { key: "lifestyle", label: "Lifestyle" },
  { key: "tourism", label: "Tourism" },
  { key: "climate", label: "Climate" },
];

// Fields where a LOWER number is the better outcome — inverted before
// averaging into the radar's per-category "relative strength" score.
const LOWER_IS_BETTER = new Set([
  "crime_rate_index",
  "aqi_avg",
  "cost_of_living_index",
  "pupil_teacher_ratio",
  "student_teacher_ratio",
]);

// Purely descriptive/scale facts — a bigger number here isn't a "win", just
// a fact about the place (e.g. Chennai isn't "better" than Coimbatore for
// having more total population or a smaller area). Raw facility counts
// (schools, hospitals, etc.) are included too since they scale with a
// place's population/size rather than reflecting quality of access — that's
// what the *_score and *_pct rate fields are for, and those stay highlighted.
const NEUTRAL_FIELDS = new Set([
  "total",
  "area_sqkm",
  "density_per_sqkm",
  "sc_pop_pct",
  "st_pop_pct",
  "pop_0_6_pct",
  "schools",
  "colleges",
  "hospitals",
  "clinics",
  "restaurants",
  "malls",
  "parks",
  "rainfall_mm_yearly",
  "avg_temp_c",
]);

function fieldLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function PlacePicker({
  label,
  onSelect,
  selected,
}: {
  label: string;
  onSelect: (r: SearchResult) => void;
  selected: SearchResult | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API_URL}/places/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data: SearchResult[]) => {
          setResults(data.filter((d) => d.place_type === "city" || d.place_type === "district"));
          setOpen(true);
        })
        .catch(() => setResults([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <label className="block text-xs text-ink/50 uppercase tracking-wide mb-1">{label}</label>
      {selected ? (
        <div className="flex items-center justify-between border border-gold/30 rounded-lg px-3 py-2 bg-sandstone-light">
          <div>
            <div className="font-medium">{selected.name}</div>
            <div className="text-xs text-ink/40">
              {selected.place_type} · {selected.district_name || selected.state_name}
            </div>
          </div>
          <button
            onClick={() => onSelect(null as unknown as SearchResult)}
            className="text-xs text-maroon hover:underline"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search a city or district..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          {open && results.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gold/30 rounded-lg shadow-lg overflow-hidden">
              {results.map((r) => (
                <li
                  key={`${r.place_type}-${r.id}`}
                  onMouseDown={() => {
                    onSelect(r);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="px-3 py-2 hover:bg-sandstone-light cursor-pointer text-sm flex justify-between"
                >
                  <span>{r.name}</span>
                  <span className="text-xs text-ink/40">{r.place_type}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

async function fetchPlaceDetail(r: SearchResult): Promise<PlaceDetail> {
  const path = r.place_type === "city" ? "cities" : "districts";
  const res = await fetch(`${API_URL}/places/${path}/${r.id}`);
  const data = await res.json();
  return { ...data, place_type: r.place_type };
}

function buildRadarData(a: PlaceDetail, b: PlaceDetail) {
  return RADAR_CATEGORIES.map(({ key, label }) => {
    const dataA = a.profile?.[key] || {};
    const dataB = b.profile?.[key] || {};
    const fields = new Set([
      ...Object.keys(dataA).filter((k) => typeof dataA[k] === "number"),
      ...Object.keys(dataB).filter((k) => typeof dataB[k] === "number"),
    ]);

    let scoreA = 0, scoreB = 0, count = 0;
    for (const field of fields) {
      if (NEUTRAL_FIELDS.has(field)) continue;
      const valA = dataA[field] as number | undefined;
      const valB = dataB[field] as number | undefined;
      if (typeof valA !== "number" || typeof valB !== "number") continue;

      const min = Math.min(valA, valB);
      const max = Math.max(valA, valB);
      let normA = max === min ? 0.5 : (valA - min) / (max - min);
      let normB = max === min ? 0.5 : (valB - min) / (max - min);
      if (LOWER_IS_BETTER.has(field)) {
        normA = 1 - normA;
        normB = 1 - normB;
      }
      scoreA += normA;
      scoreB += normB;
      count++;
    }

    return {
      category: label,
      [a.name]: count ? Math.round((scoreA / count) * 100) : 0,
      [b.name]: count ? Math.round((scoreB / count) * 100) : 0,
    };
  });
}

export default function ComparePage() {
  const [selA, setSelA] = useState<SearchResult | null>(null);
  const [selB, setSelB] = useState<SearchResult | null>(null);
  const [placeA, setPlaceA] = useState<PlaceDetail | null>(null);
  const [placeB, setPlaceB] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selA || !selB) return;
    setLoading(true);
    Promise.all([fetchPlaceDetail(selA), fetchPlaceDetail(selB)])
      .then(([a, b]) => {
        setPlaceA(a);
        setPlaceB(b);
      })
      .finally(() => setLoading(false));
  }, [selA, selB]);

  const radarData = placeA && placeB ? buildRadarData(placeA, placeB) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-maroon font-semibold mb-1">Compare Places</h1>
      <p className="text-ink/60 text-sm mb-6">
        Pick any two cities or districts to see how they stack up side by side.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <PlacePicker label="Place A" selected={selA} onSelect={setSelA} />
        <PlacePicker label="Place B" selected={selB} onSelect={setSelB} />
      </div>

      {loading && <p className="text-center text-ink/40">Loading comparison...</p>}

      {placeA && placeB && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[placeA, placeB].map((p) => (
              <div key={p.id} className="bg-white border border-gold/20 rounded-xl p-5">
                <div className="font-display text-xl text-maroon font-semibold">{p.name}</div>
                <div className="text-xs text-ink/40 mb-2 capitalize">{p.place_type}</div>
                <div className="text-sm text-ink/60">
                  {p.district_name && <>{p.district_name}, </>}
                  {p.state_name}
                </div>
                {p.population && (
                  <div className="text-sm text-ink/60 mt-1">
                    Population: {p.population.toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {radarData.some((d) => Object.values(d).some((v) => typeof v === "number" && v > 0)) && (
            <div className="bg-white border border-gold/20 rounded-xl p-5 mb-8">
              <h2 className="font-semibold mb-1">Relative Strength by Category</h2>
              <p className="text-xs text-ink/40 mb-4">
                Each axis shows the two places' scores relative to EACH OTHER (not an absolute
                scale) — e.g. 70/30 means Place A leads on that category's combined indicators,
                not that it scores 70 out of 100 nationally.
              </p>
              <div style={{ width: "100%", height: 360 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e6d3b0" />
                    <PolarAngleAxis dataKey="category" tick={{ fontSize: 12, fill: "#2B1B12" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name={placeA.name}
                      dataKey={placeA.name}
                      stroke="#7A1F2B"
                      fill="#7A1F2B"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name={placeB.name}
                      dataKey={placeB.name}
                      stroke="#0F6E67"
                      fill="#0F6E67"
                      fillOpacity={0.35}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="space-y-5">
            {TABLE_CATEGORIES.map(({ key, label }) => {
              const dataA = placeA.profile?.[key];
              const dataB = placeB.profile?.[key];
              if (!dataA && !dataB) return null;

              const fields = new Set([
                ...Object.keys(dataA || {}),
                ...Object.keys(dataB || {}),
              ]);

              return (
                <div key={key} className="bg-white border border-gold/20 rounded-xl p-5">
                  <h3 className="font-semibold mb-3">{label}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-ink/40 uppercase">
                        <th className="text-left py-1">Field</th>
                        <th className="text-right py-1">{placeA.name}</th>
                        <th className="text-right py-1">{placeB.name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...fields].map((field) => {
                        const valA = dataA?.[field];
                        const valB = dataB?.[field];
                        const isNumeric = typeof valA === "number" && typeof valB === "number";
                        const isNeutral = NEUTRAL_FIELDS.has(field);
                        const lowerBetter = LOWER_IS_BETTER.has(field);
                        const aWins =
                          isNumeric &&
                          !isNeutral &&
                          (lowerBetter ? (valA as number) < (valB as number) : (valA as number) > (valB as number));
                        const bWins =
                          isNumeric &&
                          !isNeutral &&
                          (lowerBetter ? (valB as number) < (valA as number) : (valB as number) > (valA as number));

                        return (
                          <tr key={field} className="border-t border-sandstone">
                            <td className="py-1.5 text-ink/60">{fieldLabel(field)}</td>
                            <td className={`py-1.5 text-right ${aWins ? "font-semibold text-peacock" : ""}`}>
                              {Array.isArray(valA) ? valA.join(", ") : valA ?? "—"}
                            </td>
                            <td className={`py-1.5 text-right ${bWins ? "font-semibold text-peacock" : ""}`}>
                              {Array.isArray(valB) ? valB.join(", ") : valB ?? "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
