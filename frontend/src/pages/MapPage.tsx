import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:5000/api";

interface MapPoint {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  place_type: "state" | "district" | "city" | "village";
  state_name?: string;
  district_name?: string;
  city_type?: "city" | "town";
  population?: number;
}

interface MapPointsResponse {
  states: MapPoint[];
  districts: MapPoint[];
  cities: MapPoint[];
  villages: MapPoint[];
}

const TYPE_STYLES: Record<string, { color: string; size: number }> = {
  state: { color: "#C99A3B", size: 10 },
  district: { color: "#7A1F2B", size: 12 },
  city: { color: "#0F6E67", size: 14 },
  village: { color: "#E8862B", size: 10 },
};

function makeIcon(placeType: string) {
  const style = TYPE_STYLES[placeType] || TYPE_STYLES.city;
  return L.divIcon({
    className: "",
    html: `<div style="
      width: ${style.size}px;
      height: ${style.size}px;
      border-radius: 50%;
      background: ${style.color};
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [style.size, style.size],
    iconAnchor: [style.size / 2, style.size / 2],
  });
}

export default function MapPage() {
  const [data, setData] = useState<MapPointsResponse | null>(null);
  const [visible, setVisible] = useState({
    state: false,
    district: true,
    city: true,
    village: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/places/map-points`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  function profilePath(p: MapPoint) {
    if (p.place_type === "state") return `/states/${p.id}`;
    if (p.place_type === "district") return `/districts/${p.id}`;
    if (p.place_type === "city") return `/cities/${p.id}`;
    return `/villages/${p.id}`;
  }

  const allPoints: MapPoint[] = data
    ? [...data.states, ...data.districts, ...data.cities, ...data.villages]
    : [];

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <h1 className="font-display text-3xl text-maroon font-semibold mb-1">Explore the Map</h1>
        <p className="text-ink/60 text-sm mb-4">
          Click any marker to see its profile. Toggle layers below.
        </p>
        <div className="flex flex-wrap gap-4">
          {(["state", "district", "city", "village"] as const).map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={visible[type]}
                onChange={(e) => setVisible({ ...visible, [type]: e.target.checked })}
              />
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: TYPE_STYLES[type].color }}
              />
              <span className="capitalize text-ink/70">{type}s</span>
            </label>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="rounded-xl overflow-hidden border border-gold/20" style={{ height: 600 }}>
          <MapContainer
            center={[22.5, 79]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {allPoints
              .filter((p) => visible[p.place_type])
              .map((p) => (
                <Marker
                  key={`${p.place_type}-${p.id}`}
                  position={[p.latitude, p.longitude]}
                  icon={makeIcon(p.place_type)}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-gray-500 capitalize mb-1">
                        {p.place_type}
                        {p.city_type && p.city_type !== "city" ? ` (${p.city_type})` : ""}
                      </div>
                      {(p.district_name || p.state_name) && (
                        <div className="text-xs text-gray-500 mb-1">
                          {p.district_name ? `${p.district_name}, ` : ""}
                          {p.state_name}
                        </div>
                      )}
                      {p.population && (
                        <div className="text-xs text-gray-500 mb-2">
                          Population: {p.population.toLocaleString("en-IN")}
                        </div>
                      )}
                      <button
                        onClick={() => navigate(profilePath(p))}
                        className="text-xs text-white bg-maroon px-2 py-1 rounded hover:bg-maroon-dark"
                      >
                        View Profile
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
