import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../lib/api";

const API_URL = API_BASE_URL;

interface SimilarCity {
  id: number;
  name: string;
  district_name: string;
  state_name: string;
  similarity: number;
}

export default function SimilarPlaces({ cityId }: { cityId: number }) {
  const [places, setPlaces] = useState<SimilarCity[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    setStatus("loading");
    fetch(`${API_URL}/places/cities/${cityId}/similar?limit=4`)
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data: { similar: SimilarCity[] }) => {
        setPlaces(data.similar || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [cityId]);

  // Quietly render nothing if there's not enough data to compare, or the
  // request fails — this is a bonus feature, not core page content.
  if (status === "error") return null;
  if (status === "ready" && (!places || places.length === 0)) return null;

  return (
    <div className="bg-white border border-gold/20 rounded-xl p-5 mb-6">
      <h3 className="font-semibold mb-1 flex items-center gap-2">
        <span>🔗</span> Similar Places
      </h3>
      <p className="text-xs text-ink/40 mb-4">
        Nearest neighbors by cosine similarity across population, economy, education, healthcare,
        infrastructure, environment, safety, and employment data.
      </p>

      {status === "loading" ? (
        <p className="text-sm text-ink/40">Finding similar places...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {places!.map((p) => (
            <Link
              key={p.id}
              to={`/cities/${p.id}`}
              className="border border-gold/20 rounded-lg px-4 py-3 hover:border-gold hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-ink">{p.name}</div>
                <div className="text-xs text-ink/40">
                  {p.district_name}, {p.state_name}
                </div>
              </div>
              <div className="text-xs font-medium text-maroon">
                {Math.round(p.similarity * 100)}% match
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
