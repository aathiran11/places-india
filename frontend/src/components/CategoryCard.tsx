import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CategoryData } from "../lib/api";

const FIELD_LABELS: Record<string, string> = {
  total: "Total Population",
  growth_rate_10yr: "10yr Growth %",
  density_per_sqkm: "Density /km²",
  literacy_rate: "Literacy %",
  avg_monthly_income_inr: "Avg Income ₹/mo",
  employment_rate: "Employment %",
  cost_of_living_index: "Cost of Living",
  schools: "Schools",
  colleges: "Colleges",
  student_teacher_ratio: "Student:Teacher",
  higher_ed_access_score: "Higher Ed Access",
  hospitals: "Hospitals",
  clinics: "Clinics",
  doctors_per_10k: "Doctors /10k",
  accessibility_score: "Accessibility",
  road_quality_score: "Road Quality",
  public_transport_score: "Public Transport",
  internet_penetration: "Internet %",
  power_reliability: "Power Reliability",
  aqi_avg: "Avg AQI",
  green_cover_pct: "Green Cover %",
  water_availability_score: "Water Availability",
  crime_rate_index: "Crime Rate Index",
  night_safety_score: "Night Safety",
  women_safety_score: "Women's Safety",
  job_openings_index: "Job Openings Index",
  avg_salary_growth_pct: "Salary Growth %",
  restaurants: "Restaurants",
  malls: "Malls",
  parks: "Parks",
  nightlife_score: "Nightlife Score",
  tourism_score: "Tourism Score",
  avg_temp_c: "Avg Temp °C",
  rainfall_mm_yearly: "Rainfall mm/yr",
  climate_comfort_index: "Climate Comfort",
};

 const ML_ONLY_FIELDS = new Set(["area_sqkm", "sc_pop_pct", "st_pop_pct", "pop_0_6_pct"]);
function label(key: string) {
  return FIELD_LABELS[key] || key.replace(/_/g, " ");
}

// Fields whose raw values are counts/currency (thousands to millions) rather
// than percentages or 0-100 scores. These get their own single-bar mini chart
// so they don't share an axis with small comparable values and squash them.
const LARGE_VALUE_FIELDS = new Set([
  "total",
  "avg_monthly_income_inr",
  "density_per_sqkm",
  "schools",
  "colleges",
  "hospitals",
  "clinics",
  "restaurants",
  "malls",
  "parks",
  "rainfall_mm_yearly",
]);

export default function CategoryCard({
  title,
  emoji,
  data,
  accent = "#4f46e5",
}: {
  title: string;
  emoji: string;
  data: CategoryData;
  accent?: string;
}) {
  const numericEntries = Object.entries(data).filter(([k,v]) => typeof v === "number" && !ML_ONLY_FIELDS.has(k)) as [
    string,
    number
  ][];
  const listEntries = Object.entries(data).filter(([, v]) => Array.isArray(v)) as [
    string,
    string[]
  ][];

  const largeEntries = numericEntries.filter(([key]) => LARGE_VALUE_FIELDS.has(key));
  const comparableEntries = numericEntries.filter(([key]) => !LARGE_VALUE_FIELDS.has(key));

  const chartData = comparableEntries.map(([key, value]) => ({
    name: label(key),
    value,
  }));

  return (
    <div className="bg-white border border-gold/20 rounded-xl p-5">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>

      {largeEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {largeEntries.map(([key, value]) => (
            <div key={key} className="bg-sandstone-light rounded-lg px-3 py-2">
              <div className="text-xs text-ink/40 uppercase tracking-wide">{label(key)}</div>
              <div className="text-base font-semibold">{value.toLocaleString("en-IN")}</div>
            </div>
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <div style={{ width: "100%", height: Math.max(100, chartData.length * 34) }}>
          <ResponsiveContainer>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="value" fill={accent} radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {listEntries.map(([key, values]) => (
        <div key={key} className="mt-3">
          <div className="text-xs text-ink/40 uppercase tracking-wide mb-1.5">{label(key)}</div>
          <div className="flex flex-wrap gap-1.5">
            {values.map((v) => (
              <span
                key={v}
                className="text-xs bg-sandstone text-ink/70 px-2 py-1 rounded-full"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
