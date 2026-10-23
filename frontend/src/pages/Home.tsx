import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStateTheme } from "../lib/stateThemes";
import { VERIFIED_STATE_IMAGES } from "../lib/verifiedStateImages";
import SearchBar from "../components/SearchBar";
import { API_BASE_URL } from "../lib/api";

const heroPalace = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1600&q=80";
const placeTemple = "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80";
const placeStepwell = "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80";
const placeBazaar = "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80";
const placeGhat = "https://images.unsplash.com/photo-1561361398-a4b1e1e1e7a5?w=800&q=80";

const API_URL = API_BASE_URL;

interface StateItem {
  id: number;
  name: string;
  capital: string;
  type: "state" | "union_territory";
}

// Cycled as a fallback preview image for states that don't have a specific
// verified real photo yet (see VERIFIED_STATE_IMAGES) — not a claim that any
// specific photo depicts that specific state.
const PREVIEW_IMAGES = [heroPalace, placeTemple, placeStepwell, placeBazaar, placeGhat];

const FEATURED_STATE_NAMES = [
  "Tamil Nadu",
  "Rajasthan",
  "Kerala",
  "Gujarat",
  "Uttar Pradesh",
  "Karnataka",
  "West Bengal",
  "Punjab",
];

export default function Home() {
  const [states, setStates] = useState<StateItem[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/places/states`)
      .then((r) => r.json())
      .then(setStates)
      .catch(() => setStates([]));
  }, []);

  const featured = FEATURED_STATE_NAMES.map((name) => states.find((s) => s.name === name)).filter(
    (s): s is StateItem => !!s
  );
  const current = featured[active];
  const currentTheme = current ? getStateTheme(current.name) : null;
  const verifiedImage = current ? VERIFIED_STATE_IMAGES[current.name] : null;

  return (
    <div className="min-h-screen bg-sandstone-light text-ink">
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[80vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={heroPalace}
            alt="Sunrise over a carved sandstone palace courtyard in Rajasthan"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(43,27,18,0.55) 0%, rgba(43,27,18,0.15) 35%, rgba(43,27,18,0.85) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-14">
            <p className="mb-3 text-xs uppercase tracking-[0.35em] text-gold-light">
              An atlas of every place in India
            </p>
            <h1 className="font-display max-w-3xl text-4xl leading-tight text-sandstone-light sm:text-6xl">
              Stone, culture, and the story
              <span className="italic text-gold-light"> each state carries.</span>
            </h1>
            <div className="mt-8 flex flex-col gap-5 border-t border-gold/40 pt-5 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-md text-sandstone-light/85">
                Explore population, economy, safety, and culture across every state, district,
                city, and village in India — with real data and trained ML predictions.
              </p>
              <a
                href="#atlas"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-gold-light transition-colors"
              >
                Open the Atlas
                <span aria-hidden>→</span>
              </a>
            </div>
            <div className="mt-6 max-w-xl bg-sandstone-light rounded-xl p-1.5 shadow-2xl ring-2 ring-gold/40">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="overflow-hidden border-y border-gold/30 bg-maroon-dark py-3">
          <div className="flex gap-10 whitespace-nowrap text-sm uppercase tracking-[0.25em] text-sandstone-light/80">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex gap-10">
                <span>36 States & Union Territories</span>
                <span className="text-gold">◆</span>
                <span>Trained on real Census & DISE data</span>
                <span className="text-gold">◆</span>
                <span>3 ML models · regression, classification, recommendation</span>
                <span className="text-gold">◆</span>
                <span>Growing district coverage</span>
                <span className="text-gold">◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Atlas — split index with hover image preview */}
      <section id="atlas" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-peacock">The Atlas</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl text-maroon">
              Featured states, and what makes them unique
            </h2>
          </div>
          <div className="hidden h-px flex-1 bg-gold/20 sm:block" />
        </div>

        {featured.length === 0 ? (
          <p className="text-ink/40 text-sm">Loading states...</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr]">
            <ul className="order-2 lg:order-1">
              {featured.map((state, i) => {
                const theme = getStateTheme(state.name);
                return (
                  <li key={state.id}>
                    <Link
                      to={`/states/${state.id}`}
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      className={`group grid w-full grid-cols-[auto_1fr] items-start gap-5 border-b border-gold/20 py-6 px-2 text-left transition-colors ${
                        active === i ? "bg-sandstone" : "hover:bg-sandstone/60"
                      }`}
                    >
                      <span
                        className={`font-display text-xl ${
                          active === i ? "text-maroon" : "text-ink/30"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>
                        <span className="flex flex-wrap items-baseline gap-x-3">
                          <span className="font-display text-2xl text-ink">{state.name}</span>
                          <span className="text-xs uppercase tracking-[0.15em] text-ink/40">
                            Capital: {state.capital}
                          </span>
                        </span>
                        <span className="mt-1.5 block max-w-lg text-sm text-ink/60 italic">
                          {theme.tagline}
                        </span>
                        {theme.famousFor.length > 0 && (
                          <span className="mt-2.5 flex flex-wrap gap-2">
                            <span
                              className="rounded-full px-3 py-1 text-xs"
                              style={{
                                backgroundColor: `${theme.accent}22`,
                                color: theme.accent,
                                border: `1px solid ${theme.accent}55`,
                              }}
                            >
                              {theme.famousFor[0]}
                            </span>
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:h-[30rem]">
              <figure className="relative h-64 overflow-hidden rounded-lg border border-gold/40 lg:h-full">
                <img
                  key={active}
                  src={verifiedImage?.url || PREVIEW_IMAGES[active % PREVIEW_IMAGES.length]}
                  alt={current ? current.name : "India"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const fallback = PREVIEW_IMAGES[active % PREVIEW_IMAGES.length];
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
                />
                <figcaption
                  className="absolute inset-x-0 bottom-0 p-5"
                  style={{
                    background: "linear-gradient(0deg, rgba(43,27,18,0.85), transparent)",
                  }}
                >
                  <p className="font-signature text-xl text-gold-light">
                    {current?.name || "India"}
                  </p>
                  {currentTheme && (
                    <p className="text-sm text-sandstone-light/80">{currentTheme.tagline}</p>
                  )}
                  {verifiedImage && (
                    <p className="mt-1 text-[10px] text-sandstone-light/50">
                      {verifiedImage.credit}
                    </p>
                  )}
                </figcaption>
              </figure>
            </div>
          </div>
        )}
      </section>

      {/* Full index — every state and UT */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="font-display text-2xl text-maroon mb-5">All States & Union Territories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {states.map((s) => (
            <Link
              key={s.id}
              to={`/states/${s.id}`}
              className="bg-white border border-gold/20 rounded-lg px-4 py-3 hover:border-gold hover:shadow-md transition-all"
            >
              <div className="font-medium text-ink">{s.name}</div>
              <div className="text-xs text-ink/40">Capital: {s.capital}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Seasons */}
      <section className="bg-gradient-to-br from-maroon to-maroon-dark py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display max-w-2xl text-3xl text-sandstone-light sm:text-4xl">
            Every place has a season worth visiting it in.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg bg-gold/30 md:grid-cols-3">
            {[
              { label: "Winter", detail: "Nov – Feb", body: "Clear skies across the north, ideal for forts and hill stations." },
              { label: "Monsoon", detail: "Jul – Sep", body: "The Western Ghats and Northeast turn lush and green." },
              { label: "Festival", detail: "Sep – Nov", body: "Diwali, Durga Puja, and Navratri light up cities nationwide." },
            ].map((s) => (
              <article key={s.label} className="bg-sandstone-light p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-peacock">{s.detail}</p>
                <h3 className="font-display mt-2 text-2xl text-maroon">{s.label}</h3>
                <p className="mt-2 text-sm text-ink/60">{s.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How the data comes together */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <figure className="relative">
            <img
              src={placeBazaar}
              alt="A bazaar street in an Indian city"
              className="w-full rounded-lg border border-gold/30 object-cover"
              onError={(e) => {
                if (e.currentTarget.src !== heroPalace) {
                  e.currentTarget.src = heroPalace;
                }
              }}
            />
          </figure>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-peacock">How this works</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl text-maroon">
              Built on real government data, not guesswork.
            </h2>
            <p className="mt-4 max-w-lg text-ink/60 leading-relaxed">
              Population and education statistics come from Census 2011 and the District
              Information System for Education. Development scores and growth predictions are
              produced by models trained on that same real dataset — not arbitrary numbers.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-gold/20 pt-6">
              {[
                ["36", "States & UTs"],
                ["3", "ML Models"],
                ["CSV/JSON", "Import Pipeline"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-3xl text-maroon">{n}</p>
                  <p className="text-xs uppercase tracking-[0.15em] text-ink/40">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
