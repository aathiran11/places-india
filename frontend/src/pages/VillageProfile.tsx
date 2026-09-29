import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, VillageItem } from "../lib/api";
import { CATEGORIES } from "../lib/categories";
import CategoryCard from "../components/CategoryCard";

export default function VillageProfile() {
  const { id } = useParams();
  const [village, setVillage] = useState<VillageItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<VillageItem>(`/places/villages/${id}`)
      .then(setVillage)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!village) return <p className="text-center mt-10 text-gray-400">Place not found.</p>;

  const profile = village.profile;
  const availableCategories = CATEGORIES.filter((c) => profile && profile[c.key]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="text-maroon hover:underline">
          India
        </Link>{" "}
        / {village.state_name} / {village.district_name}
      </div>
      <h1 className="font-display text-3xl text-maroon font-semibold">{village.name}</h1>
      <p className="text-ink/50 mb-6">Village</p>

      <div className="bg-white border border-gold/20 rounded-xl p-6 grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
        <Stat label="Population" value={village.population?.toLocaleString("en-IN") ?? "—"} />
        <Stat label="District" value={village.district_name ?? "—"} />
        <Stat label="State" value={village.state_name ?? "—"} />
      </div>

      {!profile || availableCategories.length === 0 ? (
        <div className="bg-sandstone border border-gold/30 rounded-xl p-6 text-sm text-maroon-dark">
          <p className="font-medium mb-1">Detailed analysis not available yet for this village</p>
          <p>
            Only a few demo villages have Phase 2 data loaded so far. Full nationwide village
            coverage is the hardest data-availability gap and arrives incrementally in Phase 3.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 mb-6">
            <strong>Illustrative data.</strong> The figures below are placeholder values used to
            demonstrate the profile layout. Phase 3 replaces these with verified government and
            public datasets.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {availableCategories.map((c) => (
              <CategoryCard
                key={c.key}
                title={c.title}
                emoji={c.emoji}
                accent={c.accent}
                data={profile![c.key]!}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink/40 uppercase tracking-wide">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
