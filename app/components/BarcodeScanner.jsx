"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera, Zap, ZapOff, Check, RefreshCw, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Try to extract serial number from OCR text.
// 1. Look for value right after known keywords (S/N, Serial No, etc.)
// 2. Fall back to tokens that look like serial numbers (mix of letters+digits, 6-20 chars)
function parseSerials(text) {
  if (!text) return [];
  const upper = text.toUpperCase().replace(/\s+/g, " ");

  // Priority: keyword-anchored extraction
  const keywordMatch = upper.match(
    /(?:S\s*[/\\]\s*N|SN|SERIAL\s*(?:NO|NUMBER|NUM|#)?|S\.N\.|SERIE)[:\s#.]*([A-Z0-9][A-Z0-9\-_.]{4,19})/
  );
  if (keywordMatch) return [keywordMatch[1].trim()];

  // Fallback: tokens that are 6-20 chars, contain BOTH letters and digits
  const tokens = upper
    .replace(/[^A-Z0-9\-_.\n ]/g, " ")
    .split(/[\s\n]+/)
    .map((t) => t.trim())
    .filter((t) =>
      t.length >= 6 &&
      t.length <= 20 &&
      /[A-Z]/.test(t) &&   // must have at least one letter
      /[0-9]/.test(t)       // must have at least one digit
    );
  return [...new Set(tokens)];
}

// Crop the video frame to just the scan-box area and enhance contrast for OCR
function cropAndEnhance(video, canvas) {
  const vw = video.videoWidth  || 640;
  const vh = video.videoHeight || 480;

  // Scan box is 288×144px shown inside the viewport; map to video pixels
  const displayW = video.offsetWidth  || vw;
  const displayH = video.offsetHeight || vh;
  const scaleX = vw / displayW;
  const scaleY = vh / displayH;

  // Box is centred: 288px wide, 144px tall on screen
  const boxW = Math.round(288 * scaleX);
  const boxH = Math.round(144 * scaleY);
  const boxX = Math.round((vw - boxW) / 2);
  const boxY = Math.round((vh - boxH) / 2);

  // Scale up 2× for better OCR accuracy
  const out = 2;
  canvas.width  = boxW * out;
  canvas.height = boxH * out;
  const ctx = canvas.getContext("2d");

  // Draw cropped region
  ctx.drawImage(video, boxX, boxY, boxW, boxH, 0, 0, canvas.width, canvas.height);

  // Enhance: grayscale + contrast boost
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    // Boost contrast: stretch toward black/white
    const c = Math.min(255, Math.max(0, (gray - 128) * 1.6 + 128));
    d[i] = d[i + 1] = d[i + 2] = c;
  }
  ctx.putImageData(img, 0, 0);
}

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const workerRef  = useRef(null);   // tesseract worker (reused)
  const barDetRef  = useRef(null);
  const timerRef   = useRef(null);
  const alive      = useRef(true);
  const scanning   = useRef(false);  // prevent overlapping OCR calls

  const [status, setStatus]         = useState("starting");   // starting | warming | live | error
  const [errorMsg, setErrorMsg]     = useState("");
  const [torch, setTorch]           = useState(false);
  const [candidates, setCandidates] = useState(null);         // null=scanning, array=results
  const [picked, setPicked]         = useState("");

  /* ── scan helpers (declared before the effect that calls them) ── */
  function stopAndShow(vals) {
    clearInterval(timerRef.current);
    setCandidates(vals);
    setPicked(vals[0] ?? "");
  }

  async function doScan() {
    if (!alive.current || scanning.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    scanning.current = true;
    try {
      // Crop to scan-box area only and boost contrast
      cropAndEnhance(video, canvas);

      // 1. BarcodeDetector (fast)
      if (barDetRef.current) {
        try {
          const codes = await barDetRef.current.detect(canvas);
          if (codes.length > 0) {
            stopAndShow([codes[0].rawValue]);
            return;
          }
        } catch { /* fall through */ }
      }

      // 2. Tesseract OCR
      if (workerRef.current) {
        const { data } = await workerRef.current.recognize(canvas);
        if (!alive.current) return;
        const found = parseSerials(data.text);
        if (found.length > 0) {
          stopAndShow(found);
        }
      }
    } catch { /* frame error — keep going */ }
    finally { scanning.current = false; }
  }

  /* ── auto scan every 2 s ──────────────────────────────────────── */
  function startAutoScan() {
    timerRef.current = setInterval(doScan, 2000);
    doScan(); // also run immediately
  }

  /* ── init: camera + warm-up worker ───────────────────────────── */
  useEffect(() => {
    alive.current = true;

    async function init() {
      // BarcodeDetector (bonus — covers barcodes too)
      if ("BarcodeDetector" in window) {
        try {
          const fmts = await window.BarcodeDetector.getSupportedFormats();
          barDetRef.current = new window.BarcodeDetector({ formats: fmts.length ? fmts : ["qr_code", "code_128"] });
        } catch { /* optional */ }
      }

      // Camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      } catch {
        try { stream = await navigator.mediaDevices.getUserMedia({ video: true }); }
        catch (err) {
          if (!alive.current) return;
          const n = err?.name || "";
          setErrorMsg(
            n === "NotAllowedError"  ? "Permission denied — allow camera in browser settings." :
            n === "NotFoundError"    ? "No camera found on this device." :
            n === "NotReadableError" ? "Camera busy in another app." :
            `Camera error: ${err?.message || n}`
          );
          setStatus("error");
          return;
        }
      }

      if (!alive.current) { stream.getTracks().forEach((t) => t.stop()); return; }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      try { await video.play(); } catch (e) { if (!alive.current || e?.name === "AbortError") return; }
      if (!alive.current) return;

      // Warm-up Tesseract worker (download eng model once)
      setStatus("warming");
      try {
        const { createWorker } = await import("tesseract.js");
        const w = await createWorker("eng");
        if (!alive.current) { w.terminate(); return; }
        workerRef.current = w;
      } catch (err) {
        if (!alive.current) return;
        // Worker failed to load — still let camera show, but OCR won't work
        console.warn("Tesseract load failed:", err);
      }

      if (!alive.current) return;
      setStatus("live");
      startAutoScan();
    }

    init();

    return () => {
      alive.current = false;
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      workerRef.current?.terminate();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resumeScan() {
    setCandidates(null);
    setPicked("");
    scanning.current = false;
    startAutoScan();
  }

  function confirmPicked() {
    if (!picked.trim()) return;
    alive.current = false;
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    workerRef.current?.terminate();
    onDetected(picked.trim());
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try { await track.applyConstraints({ advanced: [{ torch: !torch }] }); setTorch((v) => !v); }
    catch { /* unsupported */ }
  }

  function handleClose() {
    alive.current = false;
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    workerRef.current?.terminate();
    onClose();
  }

  /* ── render ───────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 bg-black z-[70] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/70">
        <div className="flex items-center gap-2 text-white">
          <Camera size={18} />
          <span className="text-sm font-semibold">
            {status === "warming" ? "Loading scanner…" : "Scan Serial Number"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status === "live" && (
            <button onClick={toggleTorch} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
              {torch ? <ZapOff size={17} /> : <Zap size={17} />}
            </button>
          )}
          <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />

        {/* Error */}
        {status === "error" && (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-center text-white px-8 max-w-sm">
              <Camera size={44} className="mx-auto mb-4 opacity-40" />
              <p className="text-sm opacity-80 mb-6">{errorMsg}</p>
              <button onClick={handleClose} className="w-full px-5 py-2.5 bg-white/10 rounded-xl text-sm font-semibold">Close</button>
            </div>
          </div>
        )}

        {/* Warming up */}
        {status === "warming" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-3">
            <Loader size={28} className="text-[#A29BFE] animate-spin" />
            <p className="text-white/70 text-sm">Loading OCR engine…</p>
            <p className="text-white/40 text-xs">First time takes a few seconds</p>
          </div>
        )}

        {/* Live — auto scanning */}
        {status === "live" && candidates === null && (
          <>
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute inset-x-0 top-0 bg-black/50" style={{ bottom: "calc(50% + 72px)" }} />
              <div className="absolute inset-x-0 bottom-0 bg-black/50" style={{ top: "calc(50% + 72px)" }} />
              <div className="absolute bg-black/50" style={{ top: "calc(50% - 72px)", bottom: "calc(50% - 72px)", left: 0, right: "calc(50% + 148px)" }} />
              <div className="absolute bg-black/50" style={{ top: "calc(50% - 72px)", bottom: "calc(50% - 72px)", right: 0, left: "calc(50% + 148px)" }} />
            </div>

            {/* Scan frame */}
            <div className="relative w-72 h-36 pointer-events-none">
              <span className="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-[#6C5CE7] rounded-tl-md" />
              <span className="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-[#6C5CE7] rounded-tr-md" />
              <span className="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-[#6C5CE7] rounded-bl-md" />
              <span className="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-[#6C5CE7] rounded-br-md" />
              <motion.div
                className="absolute left-0 right-0 h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg,transparent,#6C5CE7,#A29BFE,#6C5CE7,transparent)" }}
                animate={{ top: ["8%", "88%", "8%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            {/* Scanning indicator */}
            <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6C5CE7] animate-ping" />
              <span className="text-white/60 text-xs">Auto-scanning for serial number…</span>
            </div>
          </>
        )}

        {/* Result sheet */}
        <AnimatePresence>
          {candidates !== null && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl px-5 pt-5 pb-8 shadow-2xl"
            >
              <p className="text-[11px] font-bold text-[#9699B0] uppercase tracking-wider mb-3">
                {candidates.length > 0 ? "Serial number found — confirm or edit" : "Not detected — type manually"}
              </p>

              <input
                type="text"
                value={picked}
                onChange={(e) => setPicked(e.target.value.toUpperCase())}
                placeholder="e.g. SN1234567890"
                className="w-full bg-[#F8F9FE] border-2 border-[#6C5CE7] rounded-[10px] px-4 py-2.5 text-[15px] font-mono font-semibold text-[#2D3436] outline-none mb-3 tracking-wider"
                autoFocus
              />

              {candidates.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidates.slice(0, 8).map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setPicked(c)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors ${
                        picked === c
                          ? "bg-[#6C5CE7] text-white border-[#6C5CE7]"
                          : "bg-[#F8F9FE] text-[#2D3436] border-[#E2E4F0]"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={confirmPicked}
                  disabled={!picked.trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] disabled:opacity-40"
                >
                  <Check size={16} /> Use This
                </button>
                <button
                  onClick={resumeScan}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E4F0] text-sm text-gray-600 hover:bg-gray-50"
                >
                  <RefreshCw size={15} /> Retry
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
