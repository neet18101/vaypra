"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PwaInstall() {
  const [prompt, setPrompt]     = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(display-mode: standalone)").matches === true
  );

  useEffect(() => {
    // Don't attach listeners if already running as standalone PWA
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  };

  if (installed || dismissed || !prompt) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      zIndex: 999, display: "flex", alignItems: "center", gap: 12,
      background: "#0D1F3C",
      border: "1px solid rgba(0,102,204,0.4)",
      borderRadius: 16, padding: "14px 20px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      minWidth: 300, maxWidth: "calc(100vw - 32px)",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
        <img src="/icon-192.png" alt="app icon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Install Rangayan Kitaab</div>
        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Add to Home Screen for quick access</div>
      </div>

      <button
        onClick={handleInstall}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #0066CC, #004FA3)",
          color: "#fff", fontSize: 12, fontWeight: 700,
          boxShadow: "0 3px 10px rgba(0,102,204,0.4)",
          flexShrink: 0,
        }}
      >
        <Download size={14} />
        Install
      </button>

      <button
        onClick={() => setDismissed(true)}
        style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: 4, flexShrink: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
