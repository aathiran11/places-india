import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, SearchResult } from "../lib/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    timer.current = window.setTimeout(async () => {
      try {
        const res = await api.get<SearchResult[]>(`/places/search?q=${encodeURIComponent(query)}`);
        setResults(res);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 250);
  }, [query]);

  function goTo(r: SearchResult) {
    setOpen(false);
    setQuery("");
    if (r.place_type === "state") navigate(`/states/${r.id}`);
    else if (r.place_type === "district") navigate(`/districts/${r.id}`);
    else if (r.place_type === "city") navigate(`/cities/${r.id}`);
    else navigate(`/villages/${r.id}`);
  }

  return (
    <div className="relative w-full max-w-xl">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search any state, district, city, town or village in India..."
        className="w-full rounded-lg px-4 py-3 focus:outline-none font-body text-ink placeholder:text-ink/40"
      />
      {open && results.length > 0 && (
        <ul className="absolute mt-2 w-full bg-white border border-gold/30 rounded-lg shadow-xl overflow-hidden text-left">
          {results.map((r) => (
            <li
              key={`${r.place_type}-${r.id}`}
              onMouseDown={() => goTo(r)}
              className="px-4 py-2.5 hover:bg-sandstone-light cursor-pointer flex items-center justify-between border-b border-sandstone last:border-0"
            >
              <span className="text-ink font-body">{r.name}</span>
              <span className="text-xs text-maroon/60 uppercase tracking-wide font-medium">
                {r.place_type}
                {r.district_name ? ` · ${r.district_name}` : r.state_name ? ` · ${r.state_name}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
