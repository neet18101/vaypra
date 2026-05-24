"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileSpreadsheet, Check, AlertCircle, Loader } from "lucide-react";
import * as XLSX from "xlsx";

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
  const [progress, setProgress] = useState({ done: 0, total: 0, log: [] });
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setProgress({ done: 0, total: 0, log: [] });
    const reader = new FileReader();
    const isXlsx = /\.(xlsx|xls)$/i.test(f.name);
    if (isXlsx) {
      reader.onload = (ev) => {
        const wb = XLSX.read(ev.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!data.length) { setPreview({ headers: [], rows: [], totalRows: 0, allRows: [] }); return; }
        const headers = Object.keys(data[0]);
        setPreview({ headers, rows: data.slice(0, 5), totalRows: data.length, allRows: data });
      };
      reader.readAsArrayBuffer(f);
    } else {
      reader.onload = (ev) => {
        const { headers, rows } = parseCSV(ev.target.result);
        setPreview({ headers, rows: rows.slice(0, 5), totalRows: rows.length, allRows: rows });
      };
      reader.readAsText(f);
    }
  };

  const handleImport = async () => {
    if (!preview?.allRows?.length) return;
    setImporting(true);
    const total = preview.allRows.length;
    setProgress({ done: 0, total, log: [] });

    const onProgress = (done, rowIndex, error) => {
      setProgress((prev) => ({
        done,
        total,
        log: [
          ...prev.log,
          { row: rowIndex + 1, ok: !error, message: error || null },
        ],
      }));
    };

    try {
      const { count, errors } = await onImport(preview.allRows, onProgress);
      setResult({ success: errors.length === 0, count, errors });
    } catch (err) {
      setResult({ success: false, message: err.message, count: 0, errors: [] });
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
    setProgress({ done: 0, total: 0, log: [] });
    onClose();
  };

  if (!show) return null;

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={!importing ? reset : undefined}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[var(--font-display)]">Import CSV / Excel</h2>
            {!importing && (
              <button onClick={reset} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Template download */}
          {!importing && !result && (
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-[13px] text-[#6C5CE7] font-medium mb-4 hover:underline bg-transparent border-none cursor-pointer"
            >
              <FileSpreadsheet size={15} />
              Download CSV template
            </button>
          )}

          {/* Upload area */}
          {!preview && !importing && !result && (
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-[#E2E4F0] rounded-xl p-10 text-center cursor-pointer hover:border-[#6C5CE7] hover:bg-[#6C5CE7]/[0.02] transition-colors"
            >
              <Upload size={32} className="mx-auto mb-3 text-[#9699B0]" />
              <p className="text-sm font-medium text-gray-700">Click to upload CSV or Excel file</p>
              <p className="text-xs text-[#9699B0] mt-1">.csv, .xlsx, .xls</p>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
            </div>
          )}

          {/* Preview */}
          {preview && !importing && !result && (
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
                        <th key={h} className="text-left py-2 px-3 font-semibold text-[#6C6F87] whitespace-nowrap">{h}</th>
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
                  className="px-5 py-2.5 rounded-[10px] text-white text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)" }}
                >
                  Import {preview.totalRows} rows
                </button>
              </div>
            </div>
          )}

          {/* ── Live progress ── */}
          {importing && (
            <div>
              {/* Counts */}
              <div className="flex items-center gap-3 mb-3">
                <Loader size={16} className="text-[#6C5CE7] animate-spin shrink-0" />
                <p className="text-sm font-semibold text-gray-700">
                  Importing… <span className="text-[#6C5CE7]">{progress.done}</span> / {progress.total} rows
                </p>
                <span className="ml-auto text-sm font-bold text-[#6C5CE7]">{pct}%</span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-[#F1F2F8] rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #6C5CE7, #00CEC9)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ ease: "linear", duration: 0.15 }}
                />
              </div>

              {/* Summary chips */}
              <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F8F0] text-[#00B894] text-xs font-semibold">
                  <Check size={12} />
                  {progress.done - progress.log.filter((l) => !l.ok).length} success
                </div>
                {progress.log.filter((l) => !l.ok).length > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FDECEA] text-[#E17055] text-xs font-semibold">
                    <AlertCircle size={12} />
                    {progress.log.filter((l) => !l.ok).length} failed
                  </div>
                )}
              </div>

              {/* Row log */}
              <div className="bg-[#F8F9FE] rounded-xl border border-[#E2E4F0] p-3 max-h-[180px] overflow-y-auto space-y-1">
                {progress.log.map((entry) => (
                  <div
                    key={entry.row}
                    className={`flex items-center gap-2 text-[12px] font-mono ${entry.ok ? "text-[#00B894]" : "text-[#E17055]"}`}
                  >
                    {entry.ok ? <Check size={11} /> : <AlertCircle size={11} />}
                    <span>Row {entry.row} — {entry.ok ? "Imported successfully" : `Error: ${entry.message}`}</span>
                  </div>
                ))}
                {progress.done < progress.total && (
                  <div className="flex items-center gap-2 text-[12px] font-mono text-gray-400 animate-pulse">
                    <Loader size={11} className="animate-spin" />
                    <span>Processing row {progress.done + 1}…</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div>
              <div className={`rounded-xl p-5 text-center mb-4 ${result.success ? "bg-[#E8F8F0]" : "bg-[#FEF5E7]"}`}>
                {result.success ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#00B894] flex items-center justify-center mx-auto mb-3">
                      <Check size={24} className="text-white" />
                    </div>
                    <p className="font-bold text-[#00B894] text-base">Import complete!</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.count} row{result.count !== 1 ? "s" : ""} imported successfully
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#FDCB6E] flex items-center justify-center mx-auto mb-3">
                      <AlertCircle size={24} className="text-white" />
                    </div>
                    <p className="font-bold text-[#2D3436] text-base">Imported with some errors</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.count} succeeded · {result.errors?.length || 0} failed
                    </p>
                  </>
                )}
              </div>

              {/* Error list */}
              {result.errors?.length > 0 && (
                <div className="bg-[#F8F9FE] rounded-xl border border-[#E2E4F0] p-3 max-h-[140px] overflow-y-auto space-y-1 font-mono text-[12px] text-[#E17055] mb-4">
                  {result.errors.map((e) => (
                    <div key={e.row} className="flex items-center gap-2">
                      <AlertCircle size={11} />
                      <span>Row {e.row}: {e.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={reset}
                  className="px-5 py-2.5 rounded-[10px] text-white text-sm font-semibold"
                  style={{ background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)" }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
