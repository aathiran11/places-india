const BASE_URL = "http://localhost:5000/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, data: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(data) }),
  put: <T,>(path: string, data: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
  del: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};

export interface StateItem {
  id: number;
  name: string;
  code: string;
  type: "state" | "union_territory";
  capital: string;
}

export interface DistrictItem {
  id: number;
  name: string;
  headquarters: string | null;
  state_name?: string;
  profile?: PlaceProfile | null;
}

export type CategoryData = Record<string, number | string | string[]>;

export interface PlaceProfile {
  population?: CategoryData;
  economy?: CategoryData;
  education?: CategoryData;
  healthcare?: CategoryData;
  infrastructure?: CategoryData;
  environment?: CategoryData;
  safety?: CategoryData;
  employment?: CategoryData;
  lifestyle?: CategoryData;
  tourism?: CategoryData;
  climate?: CategoryData;
  updated_at?: string;
}

export interface CityItem {
  id: number;
  name: string;
  type: "city" | "town";
  population: number | null;
  district_name?: string;
  state_name?: string;
  state_id?: number;
  profile?: PlaceProfile | null;
}

export interface VillageItem {
  id: number;
  name: string;
  population: number | null;
  district_name?: string;
  state_name?: string;
  state_id?: number;
  profile?: PlaceProfile | null;
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportRecord {
  id: number;
  filename: string;
  import_type: "places_hierarchy" | "place_data";
  format: "csv" | "json";
  status: "success" | "partial" | "failed";
  rows_total: number;
  rows_success: number;
  rows_failed: number;
  errors: ImportError[];
  created_by_name?: string;
  created_at: string;
}

export interface ScheduledJob {
  id: number;
  job_name: string;
  last_run_at: string | null;
  last_status: string | null;
  run_count: number;
}

export async function uploadImport(file: File, importType: "places_hierarchy" | "place_data") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("import_type", importType);

  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/admin/import`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed: ${res.status}`);
  }

  return res.json() as Promise<ImportRecord>;
}
export interface SearchResult {
  id: number;
  name: string;
  place_type: "state" | "district" | "city" | "village";
  state_name?: string;
  district_name?: string;
}
