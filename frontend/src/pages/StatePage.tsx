import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, DistrictItem, StateItem } from "../lib/api";
import {
  GopuramSkyline,
  MountainSkyline,
  BeachSkyline,
  FortSkyline,
  MonasterySkyline,
  TribalSkyline,
  CitySkyline,
  DancerSilhouette,
  KolamPattern,
} from "../components/HeritageMotifs";
import { getStateTheme, SkylineMotif } from "../lib/stateThemes";
import { VERIFIED_STATE_IMAGES } from "../lib/verifiedStateImages";

const SKYLINES: Record<SkylineMotif, typeof GopuramSkyline> = {
  temple: GopuramSkyline,
  mountains: MountainSkyline,
  beach: BeachSkyline,
  fort: FortSkyline,
  monastery: MonasterySkyline,
  tribal: TribalSkyline,
  city: CitySkyline,
};

interface StateDetail extends StateItem {
  districts: DistrictItem[];
}

export default function StatePage() {
  const { id } = useParams();
  const [state, setState] = useState<StateDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get<StateDetail>(`/places/states/${id}`)
      .then(setState)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-ink/40">Loading...</p>;
  if (!state) return <p className="text-center mt-10 text-ink/40">State not found.</p>;

  const theme = getStateTheme(state.name);
  const Skyline = SKYLINES[theme.skyline];
  const photo = VERIFIED_STATE_IMAGES[state.name];

  return (
    <div>
      {/* Cultural hero banner — real photo when we have one verified, else the illustrated fallback */}
      <div className="relative overflow-hidden min-h-[420px]">
        {photo ? (
          <>
            <img
              src={photo.url}
              alt={`${state.name} — real photograph`}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Two overlays: a left-to-right dark gradient so the text block
                (always left-aligned) stays readable regardless of what's in
                the photo there, plus a vertical gradient for the bottom
                attribution line and top nav contrast. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(20,12,8,0.92) 0%, rgba(20,12,8,0.75) 35%, rgba(20,12,8,0.25) 65%, rgba(20,12,8,0.15) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(20,12,8,0.35) 0%, rgba(20,12,8,0) 25%, rgba(20,12,8,0) 60%, rgba(20,12,8,0.8) 100%)",
              }}
            />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
            }}
          >
            <KolamPattern className="absolute inset-0 w-full h-full" color={theme.accent} opacity={0.1} />
            {theme.danceFigure && (
              <DancerSilhouette
                color={theme.accent}
                className="absolute right-4 sm:right-12 top-4 h-60 sm:h-80 opacity-40 pointer-events-none"
              />
            )}
          </div>
        )}

        <div className="relative max-w-5xl mx-auto px-4 pt-10 pb-20">
          <Link to="/" className="text-sm text-sandstone-light/70 hover:text-gold-light">
            ← All states
          </Link>
          <h1
            className="font-display text-4xl sm:text-5xl text-sandstone-light font-semibold mt-3"
            style={photo ? { textShadow: "0 2px 12px rgba(0,0,0,0.6)" } : undefined}
          >
            {state.name}
          </h1>
          <p
            className="font-display italic text-lg mt-1"
            style={{ color: theme.accent, textShadow: photo ? "0 1px 8px rgba(0,0,0,0.7)" : undefined }}
          >
            {theme.tagline}
          </p>
          <p
            className="text-sandstone-light/70 text-sm mt-1"
            style={photo ? { textShadow: "0 1px 6px rgba(0,0,0,0.7)" } : undefined}
          >
            Capital: {state.capital}
          </p>

          {theme.famousFor.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-sandstone-light/50 mb-2">
                Famous For
              </p>
              <div className="flex flex-wrap gap-2 max-w-2xl">
                {theme.famousFor.map((item) => (
                  <span
                    key={item}
                    className="text-sm px-3 py-1.5 rounded-full font-body"
                    style={{
                      backgroundColor: photo ? "rgba(20,12,8,0.75)" : `${theme.accent}22`,
                      color: theme.accent,
                      border: `1px solid ${theme.accent}55`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {photo && (
            <p className="mt-6 text-[11px] text-sandstone-light/40">{photo.credit}</p>
          )}
        </div>

        {!photo && (
          <Skyline color="#F3E7D3" className="absolute bottom-0 left-0 w-full h-12 opacity-80" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-display text-2xl text-maroon font-semibold">Districts</h2>
          {state.districts.length > 0 && (
            <span className="text-ink/40 text-sm">({state.districts.length})</span>
          )}
        </div>

        {state.districts.length === 0 ? (
          <p className="text-ink/40 text-sm">
            District data for this state hasn't been added yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {state.districts.map((d) => (
              <Link
                key={d.id}
                to={`/districts/${d.id}`}
                className="bg-white border border-gold/20 rounded-lg px-4 py-3 hover:border-gold hover:shadow-md transition-all"
                style={{ borderLeftColor: theme.accent, borderLeftWidth: 3 }}
              >
                <div className="font-medium font-body text-ink">{d.name}</div>
                {d.headquarters && <div className="text-xs text-ink/40">HQ: {d.headquarters}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
