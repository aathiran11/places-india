import { PlaceProfile } from "./api";

export type ProfileCategoryKey = Exclude<keyof PlaceProfile, "updated_at">;

export const CATEGORIES: { key: ProfileCategoryKey; title: string; emoji: string; accent: string }[] = [
  { key: "population", title: "Demographics", emoji: "👥", accent: "#4f46e5" },
  { key: "economy", title: "Economy", emoji: "💰", accent: "#16a34a" },
  { key: "employment", title: "Employment", emoji: "💼", accent: "#0891b2" },
  { key: "education", title: "Education", emoji: "🎓", accent: "#7c3aed" },
  { key: "healthcare", title: "Healthcare", emoji: "🏥", accent: "#dc2626" },
  { key: "infrastructure", title: "Infrastructure", emoji: "🚗", accent: "#ca8a04" },
  { key: "environment", title: "Environment", emoji: "🌳", accent: "#059669" },
  { key: "safety", title: "Safety", emoji: "🛡", accent: "#db2777" },
  { key: "lifestyle", title: "Lifestyle", emoji: "🎭", accent: "#9333ea" },
  { key: "tourism", title: "Tourism", emoji: "🗺️", accent: "#ea580c" },
  { key: "climate", title: "Climate", emoji: "🌤️", accent: "#0d9488" },
];
