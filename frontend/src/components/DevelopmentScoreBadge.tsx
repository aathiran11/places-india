import { useEffect, useState } from "react";

const ML_SERVICE_URL = "http://localhost:8000";

// Matches the "population" category shape used across city/district/village
// profiles (see lib/api.ts's CategoryData). Only the fields actually needed
// by the model are declared here; everything else on the object is ignored.
interface PopulationData {
  total?: number;
  growth_rate_10yr?: number;
  density_per_sqkm?: number;
  area_sqkm?: number;
  sc_pop_pct?: number;
  st_pop_pct?: number;
  pop_0_6_pct?: number;
  [key: string]: unknown;
}

interface Props {
  population?: PopulationData | null;
  schools?: number; // from the "education" category's `schools` field
}

interface PredictResponse {
  development_score: number;
  model_confidence_note: string;
}

function scoreColor(score: number) {
  if (score >= 60) return "#0F6E67";
  if (score >= 35) return "#C99A3B";
  return "#7A1F2B";
}

export default function DevelopmentScoreBadge({ population, schools }: Props) {
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "insufficient">("idle");

  const hasRequiredData =
    !!population &&
    typeof population.total === "number" &&
    typeof population.growth_rate_10yr === "number" &&
    typeof population.area_sqkm === "number" &&
    typeof population.sc_pop_pct === "number" &&
    typeof population.st_pop_pct === "number" &&
    typeof population.pop_0_6_pct === "number" &&
    typeof schools === "number";

  useEffect(() => {
    if (!hasRequiredData || !population) {
      setStatus("insufficient");
      return;
    }

    setStatus("loading");
    const density = population.total! / population.area_sqkm!;

    fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        population: population.total,
        growth_rate: population.growth_rate_10yr,
        area_sqkm: population.area_sqkm,
        sc_pop: population.sc_pop_pct,
        st_pop: population.st_pop_pct,
        pop_0_6: population.pop_0_6_pct,
        schools: schools,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("prediction failed");
        return res.json();
      })
      .then((data: PredictResponse) => {
        setResult(data);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [hasRequiredData, population, schools]);

  // Silently render nothing if this place doesn't have the data the model
  // needs yet, or if the ML service isn't reachable — this is a bonus
  // feature, not something that should ever break a profile page.
  if (status === "insufficient" || status === "error") return null;

  if (status === "loading") {
    return (
      <div className="bg-white border border-gold/20 rounded-xl p-4 mb-6 text-sm text-ink/40">
        Computing Development Score...
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="bg-white border border-gold/20 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-4">
        <div
          className="text-3xl font-display font-semibold"
          style={{ color: scoreColor(result.development_score) }}
        >
          {result.development_score}
          <span className="text-base text-ink/40"> / 100</span>
        </div>
        <div className="flex-1">
          <div className="text-xs text-ink/50 uppercase tracking-wide mb-1">
            Predicted Development Score (ML)
          </div>
          <div className="h-2.5 bg-sandstone rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${result.development_score}%`,
                backgroundColor: scoreColor(result.development_score),
              }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-ink/40 mt-3">{result.model_confidence_note}</p>
    </div>
  );
}
