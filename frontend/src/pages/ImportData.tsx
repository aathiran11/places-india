import { useEffect, useRef, useState } from "react";
import { api, ImportRecord, ScheduledJob, uploadImport } from "../lib/api";

const STATUS_STYLES: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  partial: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
};

export default function ImportData() {
  const [importType, setImportType] = useState<"places_hierarchy" | "place_data">("places_hierarchy");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportRecord | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ImportRecord[]>([]);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadHistory() {
    api.get<ImportRecord[]>("/admin/imports").then(setHistory).catch(() => {});
    api.get<ScheduledJob[]>("/admin/scheduled-jobs").then(setJobs).catch(() => {});
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);
    try {
      const res = await uploadImport(file, importType);
      setResult(res);
      loadHistory();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl text-maroon font-semibold mb-1">Import Data</h1>
      <p className="text-gray-500 text-sm mb-6">
        Bulk-load places or category statistics from a CSV or JSON file.
      </p>

      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <div className="flex gap-2 mb-4">
          <TypeButton
            active={importType === "places_hierarchy"}
            onClick={() => setImportType("places_hierarchy")}
          >
            Places (districts/cities/villages)
          </TypeButton>
          <TypeButton
            active={importType === "place_data"}
            onClick={() => setImportType("place_data")}
          >
            Category Data (population, economy, etc.)
          </TypeButton>
        </div>

        <p className="text-xs text-gray-500 mb-3">
          {importType === "places_hierarchy" ? (
            <>
              Columns: <code className="bg-gray-100 px-1 rounded">level</code> (district/city/town/village),{" "}
              <code className="bg-gray-100 px-1 rounded">name</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">state_name</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">district_name</code> (required except for
              level=district), <code className="bg-gray-100 px-1 rounded">population</code>{" "}
              (optional).
            </>
          ) : (
            <>
              Long/tidy format — one row per stat. Columns:{" "}
              <code className="bg-gray-100 px-1 rounded">place_type</code> (city/district/village),{" "}
              <code className="bg-gray-100 px-1 rounded">name</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">state_name</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">district_name</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">category</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">field</code>,{" "}
              <code className="bg-gray-100 px-1 rounded">value</code>. Comma-separated values
              become a list (e.g. for major_industries).
            </>
          )}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm mb-4 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sandstone file:text-maroon hover:file:bg-sandstone-dark"
        />

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-maroon text-white rounded-lg px-4 py-2 hover:bg-maroon-dark disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload & Import"}
        </button>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
      </div>

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[result.status]}`}>
              {result.status.toUpperCase()}
            </span>
            <span className="text-sm text-gray-600">
              {result.rows_success} of {result.rows_total} rows imported
            </span>
          </div>
          {result.errors.length > 0 && (
            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Row</th>
                    <th className="text-left px-3 py-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.map((e, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-3 py-2 text-gray-500">{e.row}</td>
                      <td className="px-3 py-2 text-red-600">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {jobs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-3 text-sm">Scheduled Updates</h2>
          {jobs.map((j) => (
            <div key={j.id} className="text-sm text-gray-600 flex items-center justify-between">
              <span>{j.job_name.replace(/_/g, " ")}</span>
              <span className="text-xs text-gray-400">
                {j.last_run_at
                  ? `last ran ${new Date(j.last_run_at).toLocaleString()} · ${j.run_count} runs`
                  : "not run yet"}
              </span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-2">
            Runs hourly in the background. Currently a placeholder heartbeat — will call real
            government/public data sources once one is integrated.
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold mb-3 text-sm">Recent Imports</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No imports yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-400 text-xs uppercase">
              <tr>
                <th className="text-left py-1.5">File</th>
                <th className="text-left py-1.5">Type</th>
                <th className="text-left py-1.5">Status</th>
                <th className="text-left py-1.5">Rows</th>
                <th className="text-left py-1.5">When</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-t border-gray-100">
                  <td className="py-2">{h.filename}</td>
                  <td className="py-2 text-gray-500">{h.import_type}</td>
                  <td className="py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[h.status]}`}>
                      {h.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {h.rows_success}/{h.rows_total}
                  </td>
                  <td className="py-2 text-gray-400 text-xs">
                    {new Date(h.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TypeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-2 rounded-lg border ${
        active
          ? "bg-maroon text-white border-maroon"
          : "bg-white text-gray-600 border-gray-200 hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}
