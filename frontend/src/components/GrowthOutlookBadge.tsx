import { useEffect, useState } from "react";

const ML_SERVICE_URL = (import.meta.env.VITE_ML_URL ?? "http://localhost:8000");

interface PopulationData {
  total?: number;
  area_sqkm?: number;
  sc_pop_pct?: number;
  st_pop_pct?: number;
  pop_0_6_pct?: number;
  literacy_rate?: number;
  [key: string]: unknown;
}

interface Props {
  population?: PopulationData | null;
  schools?: number;
}

interface GrowthClassResponse {
  growth_class: string;
  class_probabilities: Record<string, number>;
  model_confidence_note: string;
}

const CLASS_STYLES: Record<string, { color: string; emoji: string }> = {
  "Rapid Growth": { color: "#0F6E67", emoji: "📈" },
  Stable: { color: "#C99A3B", emoji: "➡️" },
  "Slow / Declining": { color: "#7A1F2B", emoji: "📉" },
};

export default function GrowthOutlookBadge({ population, schools }: Props) {
  const [result, setResult] = useState<GrowthClassResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "insufficient">("idle");

  const hasRequiredData =
    !!population &&
    typeof population.total === "number" &&
    typeof population.area_sqkm === "number" &&
    typeof population.sc_pop_pct === "number" &&
    typeof population.st_pop_pct === "number" &&
    typeof population.pop_0_6_pct === "number" &&
    typeof population.literacy_rate === "number" &&
    typeof schools === "number";

  useEffect(() => {
    if (!hasRequiredData || !population) {
      setStatus("insufficient");
      return;
    }

    setStatus("loading");

    fetch(`${ML_SERVICE_URL}/predict-growth-class`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        population: population.total,
        area_sqkm: population.area_sqkm,
        sc_pop: population.sc_pop_pct,
        st_pop: population.st_pop_pct,
        pop_0_6: population.pop_0_6_pct,
        schools: schools,
        literacy_rate: population.literacy_rate,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("prediction failed");
        return res.json();
      })
      .then((data: GrowthClassResponse) => {
        setResult(data);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [hasRequiredData, population, schools]);

  if (status === "insufficient" || status === "error") return null;

  if (status === "loading") {
    return (
      <div className="bg-white border border-gold/20 rounded-xl p-4 mb-6 text-sm text-ink/40">
        Predicting growth outlook...
      </div>
    );
  }

  if (!result) return null;

  const style = CLASS_STYLES[result.growth_class] || { color: "#C99A3B", emoji: "❓" };
  const topProb = result.class_probabilities[result.growth_class];

  return (
    <div className="bg-white border border-gold/20 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{style.emoji}</span>
        <div>
          <div className="text-xs text-ink/50 uppercase tracking-wide">Predicted Growth Outlook (ML)</div>
          <div className="text-xl font-display font-semibold" style={{ color: style.color }}>
            {result.growth_class}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {Object.entries(result.class_probabilities)
          .sort((a, b) => b[1] - a[1])
          .map(([cls, prob]) => (
            <div key={cls} className="flex items-center gap-2 text-xs">
              <span className="w-32 text-ink/50 truncate">{cls}</span>
              <div className="flex-1 h-1.5 bg-sandstone rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${prob * 100}%`,
                    backgroundColor: CLASS_STYLES[cls]?.color || "#C99A3B",
                  }}
                />
              </div>
              <span className="w-10 text-right text-ink/40">{Math.round(prob * 100)}%</span>
            </div>
          ))}
      </div>

      <p className="text-xs text-ink/40 mt-3">{result.model_confidence_note}</p>
      {topProb < 0.45 && (
        <p className="text-xs text-amber-700 mt-1">
          Note: the top prediction only narrowly beat the alternatives — treat this call as
          uncertain.
        </p>
      )}
    </div>
  );
}
