import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, StateItem } from "../lib/api";
import { useAuth } from "../lib/auth";

interface Stats {
  states: number;
  districts: number;
  cities: number;
  villages: number;
  users: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [states, setStates] = useState<StateItem[]>([]);
  const [message, setMessage] = useState("");

  const [districtForm, setDistrictForm] = useState({ name: "", state_id: "", headquarters: "" });
  const [cityForm, setCityForm] = useState({
    name: "",
    district_id: "",
    type: "city",
    population: "",
  });

  useEffect(() => {
    api.get<Stats>("/admin/stats").then(setStats).catch(() => {});
    api.get<StateItem[]>("/places/states").then(setStates).catch(() => {});
  }, []);

  async function refreshStats() {
    const s = await api.get<Stats>("/admin/stats");
    setStats(s);
  }

  async function addDistrict(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/admin/districts", {
        name: districtForm.name,
        state_id: Number(districtForm.state_id),
        headquarters: districtForm.headquarters || null,
      });
      setMessage(`District "${districtForm.name}" added.`);
      setDistrictForm({ name: "", state_id: "", headquarters: "" });
      refreshStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add district");
    }
  }

  async function addCity(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/admin/cities", {
        name: cityForm.name,
        district_id: Number(cityForm.district_id),
        type: cityForm.type,
        population: cityForm.population ? Number(cityForm.population) : null,
      });
      setMessage(`City/town "${cityForm.name}" added.`);
      setCityForm({ name: "", district_id: "", type: "city", population: "" });
      refreshStats();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to add city");
    }
  }

  if (user?.role !== "admin") {
    return <p className="text-center mt-10 text-gray-400">Admin access required.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-maroon font-semibold">Admin Dashboard</h1>
        <Link to="/admin/import" className="text-sm text-maroon hover:underline">
          Import Data →
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          <StatCard label="States/UTs" value={stats.states} />
          <StatCard label="Districts" value={stats.districts} />
          <StatCard label="Cities" value={stats.cities} />
          <StatCard label="Villages" value={stats.villages} />
          <StatCard label="Users" value={stats.users} />
        </div>
      )}

      {message && (
        <div className="bg-sandstone border border-gold/30 text-maroon-dark text-sm rounded-lg px-4 py-2 mb-6">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={addDistrict} className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold mb-3">Add District</h2>
          <div className="space-y-3">
            <select
              required
              value={districtForm.state_id}
              onChange={(e) => setDistrictForm({ ...districtForm, state_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select state/UT</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              required
              placeholder="District name"
              value={districtForm.name}
              onChange={(e) => setDistrictForm({ ...districtForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              placeholder="Headquarters (optional)"
              value={districtForm.headquarters}
              onChange={(e) => setDistrictForm({ ...districtForm, headquarters: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <button className="w-full bg-maroon text-white rounded-lg py-2 hover:bg-maroon-dark">
              Add District
            </button>
          </div>
        </form>

        <form onSubmit={addCity} className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold mb-3">Add City / Town</h2>
          <div className="space-y-3">
            <input
              required
              placeholder="District ID"
              value={cityForm.district_id}
              onChange={(e) => setCityForm({ ...cityForm, district_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              required
              placeholder="City/town name"
              value={cityForm.name}
              onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <select
              value={cityForm.type}
              onChange={(e) => setCityForm({ ...cityForm, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="city">City</option>
              <option value="town">Town</option>
            </select>
            <input
              type="number"
              placeholder="Population (optional)"
              value={cityForm.population}
              onChange={(e) => setCityForm({ ...cityForm, population: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <button className="w-full bg-maroon text-white rounded-lg py-2 hover:bg-maroon-dark">
              Add City/Town
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-gray-400 mt-6">
        Tip: find a district's ID by opening its page — the ID is in the URL
        (e.g. /districts/3 → ID is 3). A district picker for the city form will be added in a
        later phase.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-maroon">{value}</div>
      <div className="text-xs text-gray-400 uppercase">{label}</div>
    </div>
  );
}
