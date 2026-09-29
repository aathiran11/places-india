import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, CityItem } from "../lib/api";
import { CATEGORIES } from "../lib/categories";
import CategoryCard from "../components/CategoryCard";
import DevelopmentScoreBadge from "../components/DevelopmentScoreBadge";
import SimilarPlaces from "../components/SimilarPlaces";
import { getStateTheme } from "../lib/stateThemes";
import GrowthOutlookBadge from "../components/GrowthOutlookBadge";

export default function CityProfile() {
  const { id } = useParams();
  const [city, setCity] = useState<CityItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<CityItem>(`/places/cities/${id}`)
      .then(setCity)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!city) return <p className="text-center mt-10 text-gray-400">Place not found.</p>;

  const profile = city.profile;
  const availableCategories = CATEGORIES.filter((c) => profile && profile[c.key]);
  const theme = getStateTheme(city.state_name);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="text-maroon hover:underline">
          India
        </Link>{" "}
        / {city.state_name} / {city.district_name}
      </div>
      <h1 className="font-display text-3xl text-maroon font-semibold">{city.name}</h1>
      <p className="text-ink/50 capitalize">{city.type}</p>
      <div className="h-1 w-16 rounded-full my-3" style={{ backgroundColor: theme.accent }} />

      <div className="bg-white border border-gold/20 rounded-xl p-6 grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
        <Stat label="Population" value={city.population?.toLocaleString("en-IN") ?? "—"} />
        <Stat label="District" value={city.district_name ?? "—"} />
        <Stat label="State" value={city.state_name ?? "—"} />
      </div>

      {!profile ? (
        <div className="bg-sandstone border border-gold/30 rounded-xl p-6 text-sm text-maroon-dark">
          <p className="font-medium mb-1">Detailed analysis not available yet for this place</p>
          <p>
            Only a handful of demo cities have Phase 2 data loaded so far (run{" "}
            <code className="bg-white px-1 rounded">npm run seed:phase2</code> in the backend).
            Full nationwide coverage arrives with Phase 3's data pipeline.
          </p>
        </div>
      ) : (
        <>
          <DevelopmentScoreBadge population={profile.population} schools={Number(profile.education?.schools) || undefined} />
	  <SimilarPlaces cityId={city.id} />
	  <GrowthOutlookBadge population={profile.population} schools={Number(profile.education?.schools) || undefined} />
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
