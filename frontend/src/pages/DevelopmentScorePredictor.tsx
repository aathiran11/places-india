import { FormEvent, useState } from "react";

const ML_SERVICE_URL = (import.meta.env.VITE_ML_URL ?? "http://localhost:8000");

interface PredictResponse {
  development_score: number;
  model_confidence_note: string;
}

const FIELDS: {
  key: keyof FormState;
  label: string;
  placeholder: string;
  hint?: string;
}[] = [
  { key: "population", label: "Total Population", placeholder: "e.g. 875564" },
  { key: "growth_rate", label: "Population Growth Rate (%)", placeholder: "e.g. 34.62", hint: "Decade-over-decade, Census" },
  { key: "area_sqkm", label: "Area (sq. km)", placeholder: "e.g. 2379" },
  { key: "sc_pop", label: "% Scheduled Caste Population", placeholder: "e.g. 8.1" },
  { key: "st_pop", label: "% Scheduled Tribe Population", placeholder: "e.g. 4.9" },
  { key: "pop_0_6", label: "% Population Age 0-6", placeholder: "e.g. 13.2" },
  { key: "schools", label: "Total Number of Schools", placeholder: "e.g. 2076" },
];

interface FormState {
  population: string;
  growth_rate: string;
  area_sqkm: string;
  sc_pop: string;
  st_pop: string;
  pop_0_6: string;
  schools: string;
}

const EMPTY_FORM: FormState = {
  population: "",
  growth_rate: "",
  area_sqkm: "",
  sc_pop: "",
  st_pop: "",
  pop_0_6: "",
  schools: "",
};

// Kupwara district (J&K) — real 2011 Census values, used as a one-click example.
const EXAMPLE: FormState = {
  population: "875564",
  growth_rate: "34.62",
  area_sqkm: "2379",
  sc_pop: "8.1",
  st_pop: "4.9",
  pop_0_6: "13.2",
  schools: "2076",
};

export default function DevelopmentScorePredictor() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${ML_SERVICE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          population: Number(form.population),
          growth_rate: Number(form.growth_rate),
          area_sqkm: Number(form.area_sqkm),
          sc_pop: Number(form.sc_pop),
          st_pop: Number(form.st_pop),
          pop_0_6: Number(form.pop_0_6),
          schools: Number(form.schools),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Prediction failed: ${res.status}`);
      }
      setResult(await res.json());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the ML service. Is it running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-maroon font-semibold mb-1">
        Development Score Predictor
      </h1>
      <p className="text-ink/60 text-sm mb-6">
        A Random Forest model trained on real Census 2011 + DISE 2015-16 data across 680 Indian
        districts. Enter a district's demographic profile to get a predicted score.
      </p>

      <div className="bg-sandstone border border-gold/30 rounded-xl px-4 py-3 text-xs text-maroon-dark mb-6">
        <strong>Methodology note:</strong> this model was deliberately trained on demographic/scale
        data only (population, growth, area, social composition) — <em>not</em> on literacy or
        infrastructure data — so its test accuracy (R²=0.52) reflects a genuinely harder, more
        honest question than a model that could see the same data used to build the score.
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gold/20 rounded-xl p-6 space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setForm(EXAMPLE)}
            className="text-xs text-maroon hover:underline"
          >
            Fill with example (Kupwara district)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-ink/60 mb-1">
                {f.label}
                {f.hint && <span className="text-ink/30"> — {f.hint}</span>}
              </label>
              <input
                required
                type="number"
                step="any"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-600 text-sm">
            {error}{" "}
            {error.includes("reach") && (
              <span className="block text-ink/50 mt-1">
                Start it with: <code className="bg-gray-100 px-1 rounded">cd ml-service &&
                uvicorn app:app --port 8000</code>
              </span>
            )}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-maroon text-white rounded-lg py-2.5 hover:bg-maroon-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Predicting..." : "Predict Development Score"}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-white border border-gold/20 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="text-4xl font-display font-semibold text-maroon"
              style={{ color: result.development_score >= 60 ? "#0F6E67" : result.development_score >= 35 ? "#C99A3B" : "#7A1F2B" }}
            >
              {result.development_score}
              <span className="text-lg text-ink/40"> / 100</span>
            </div>
            <div className="flex-1 h-3 bg-sandstone rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${result.development_score}%`,
                  backgroundColor:
                    result.development_score >= 60
                      ? "#0F6E67"
                      : result.development_score >= 35
                      ? "#C99A3B"
                      : "#7A1F2B",
                }}
              />
            </div>
          </div>
          <p className="text-xs text-ink/50">{result.model_confidence_note}</p>
        </div>
      )}
    </div>
  );
}
