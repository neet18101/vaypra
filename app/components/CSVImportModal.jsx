"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileSpreadsheet, Check, AlertCircle } from "lucide-react";

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === "," && !inQuotes) { values.push(current.trim()); current = ""; continue; }
      current += ch;
    }
    values.push(current.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ""; });
    return obj;
  });
  return { headers, rows };
}

export default function CSVImportModal({ show, onClose, onImport, columns, templateName }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers, rows } = parseCSV(ev.target.result);
      setPreview({ headers, rows: rows.slice(0, 5), totalRows: rows.length, allRows: rows });
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!preview?.allRows?.length) return;
    setImporting(true);
    try {
      const count = await onImport(preview.allRows);
      setResult({ success: true, count });
    } catch (err) {
      setResult({ success: false, message: err.message });
    }
    setImporting(false);
  };

  const downloadTemplate = () => {
    const csv = columns.join(",") + "\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${templateName || "template"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={reset}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[var(--font-display)]">Import CSV</h2>
            <button onClick={reset} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          {/* Template download */}
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 text-[13px] text-[#6C5CE7] font-medium mb-4 hover:underline bg-transparent border-none cursor-pointer"
          >
            <FileSpreadsheet size={15} />
            Download CSV template
          </button>

          {/* Upload area */}
          {!preview && (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#E2E4F0] rounded-xl p-10 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/[0.02] transition-colors"
            >
              <Upload size={32} className="mx-auto mb-3 text-[#9699B0]" />
              <p className="text-sm font-medium text-gray-700">Click to upload CSV file</p>
              <p className="text-xs text-[#9699B0] mt-1">or drag and drop</p>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </div>
          )}

          {/* Preview */}
          {preview && !result && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{file?.name}</span> — {preview.totalRows} rows found
                </p>
                <button
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="text-xs text-[#9699B0] hover:text-gray-700 bg-transparent border-none cursor-pointer"
                >
                  Change file
                </button>
              </div>
              <div className="overflow-x-auto border border-[#E2E4F0] rounded-xl mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FE]">
                      {preview.headers.map((h) => (
                        <th key={h} className="text-left py-2 px-3 font-semibold text-[#6C6F87] whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr key={i} className="border-t border-[#F1F2F8]">
                        {preview.headers.map((h) => (
                          <td key={h} className="py-2 px-3 text-gray-700 whitespace-nowrap">{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.totalRows > 5 && (
                <p className="text-xs text-[#9699B0] mb-4">Showing 5 of {preview.totalRows} rows</p>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={reset} className="px-5 py-2.5 rounded-[10px] border border-[#E2E4F0] text-sm font-medium text-gray-600">
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-5 py-2.5 rounded-[10px] text-white text-sm font-semibold disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)" }}
                >
                  {importing ? "Importing..." : `Import ${preview.totalRows} rows`}
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-5 text-center ${result.success ? "bg-[#E8F8F0]" : "bg-[#FDECEA]"}`}>
              {result.success ? (
                <>
                  <Check size={32} className="mx-auto mb-2 text-[#00B894]" />
                  <p className="font-semibold text-[#00B894]">Successfully imported {result.count} rows</p>
                </>
              ) : (
                <>
                  <AlertCircle size={32} className="mx-auto mb-2 text-[#E17055]" />
                  <p className="font-semibold text-[#E17055]">Import failed: {result.message}</p>
                </>
              )}
              <button onClick={reset} className="mt-3 px-5 py-2 rounded-[10px] border border-[#E2E4F0] text-sm font-medium bg-white">
                Close
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
