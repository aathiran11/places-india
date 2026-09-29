import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, CityItem, VillageItem, DistrictItem } from "../lib/api";
import { CATEGORIES } from "../lib/categories";
import CategoryCard from "../components/CategoryCard";
 import DevelopmentScoreBadge from "../components/DevelopmentScoreBadge";
import { getStateTheme } from "../lib/stateThemes";

interface DistrictDetail extends DistrictItem {
  state_id: number;
  cities: CityItem[];
  villages: VillageItem[];
}

export default function DistrictPage() {
  const { id } = useParams();
  const [district, setDistrict] = useState<DistrictDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<DistrictDetail>(`/places/districts/${id}`)
      .then(setDistrict)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  if (!district) return <p className="text-center mt-10 text-gray-400">District not found.</p>;

  const profile = district.profile;
  const availableCategories = CATEGORIES.filter((c) => profile && profile[c.key]);
  const theme = getStateTheme(district.state_name);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to={`/states/${district.state_id}`} className="text-sm text-maroon hover:underline">
        ← {district.state_name}
      </Link>
      <h1 className="font-display text-3xl text-maroon font-semibold mt-2">{district.name} District</h1>
      {district.headquarters && (
        <p className="text-ink/50">Headquarters: {district.headquarters}</p>
      )}
      <div className="h-1 w-16 rounded-full my-3" style={{ backgroundColor: theme.accent }} />

      {profile && availableCategories.length > 0 && (
        <>
	  <DevelopmentScoreBadge population={profile.population} schools={profile.education?.schools} />
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800 mb-6">
            <strong>Illustrative data.</strong> District-level figures below are placeholder
            values used to demonstrate the profile layout. Phase 3 replaces these with verified
            government and public datasets.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
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

      <section className="mb-8">
        <h2 className="font-display text-xl text-maroon font-semibold mb-3">Cities & Towns</h2>
        {district.cities.length === 0 ? (
          <p className="text-ink/40 text-sm">No city/town data yet for this district.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {district.cities.map((c) => (
              <Link
                key={c.id}
                to={`/cities/${c.id}`}
                className="bg-white border border-gold/20 rounded-lg px-4 py-3 hover:border-gold hover:shadow-md transition-all"
              >
                <div className="font-medium">
                  {c.name}{" "}
                  <span className="text-xs uppercase text-gray-400 ml-1">{c.type}</span>
                </div>
                {c.population && (
                  <div className="text-xs text-gray-400">
                    Population: {c.population.toLocaleString("en-IN")}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl text-maroon font-semibold mb-3">Villages</h2>
        {district.villages.length === 0 ? (
          <p className="text-ink/40 text-sm">No village data yet for this district.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {district.villages.map((v) => (
              <Link
                key={v.id}
                to={`/villages/${v.id}`}
                className="bg-white border border-gold/20 rounded-lg px-4 py-3 hover:border-gold hover:shadow-md transition-all"
              >
                <div className="font-medium">{v.name}</div>
                {v.population && (
                  <div className="text-xs text-gray-400">
                    Population: {v.population.toLocaleString("en-IN")}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
