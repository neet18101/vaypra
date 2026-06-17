"use client";

import { useState, useEffect } from "react";
import { Download, Smartphone, Monitor, CheckCircle2 } from "lucide-react";

const STEPS = [
  { icon: Smartphone, text: "Works offline after install" },
  { icon: Monitor,    text: "Runs like a native app" },
  { icon: Download,   text: "No app store needed" },
];

export default function PwaInstallSection() {
  const [prompt, setPrompt]       = useState(null);
  const [installed, setInstalled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(display-mode: standalone)").matches === true
  );
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const handler = (e) => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    setLoading(true);
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
    setLoading(false);
  };

  return (
    <section style={{
      padding: "64px 24px",
      background: "linear-gradient(135deg, #EBF4FF 0%, #F0F7FF 50%, #EBF8F2 100%)",
      borderTop: "1px solid #E2ECF8",
      borderBottom: "1px solid #E2ECF8",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap", justifyContent: "center" }}>

        {/* Left — icon + heading */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, flex: 1, minWidth: 240 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,102,204,0.2)", flexShrink: 0,
          }}>
            <img src="/icon-192.png" alt="app icon" style={{ width: "100%", height: "100%" }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0066CC", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
              📱 Install App
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: "#0D1F3C", lineHeight: 1.2, marginBottom: 6 }}>
              Rangayan Kitaab
            </h3>
            <p style={{ fontSize: 13.5, color: "#5A6E87", lineHeight: 1.6 }}>
              Add to your home screen — works offline, opens instantly.
            </p>
          </div>
        </div>

        {/* Middle — feature chips */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 200 }}>
          {STEPS.map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon size={15} color="#0066CC" />
              <span style={{ fontSize: 13, color: "#4A5568", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Right — install button */}
        <div style={{ flexShrink: 0 }}>
          {installed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#00875A", fontWeight: 700, fontSize: 14 }}>
              <CheckCircle2 size={20} />
              App Installed!
            </div>
          ) : prompt ? (
            <button
              onClick={handleInstall}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #0066CC, #004FA3)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                boxShadow: "0 6px 20px rgba(0,102,204,0.35)",
                transition: "opacity 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Download size={18} />
              {loading ? "Installing…" : "Install Now"}
            </button>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 12, color: "#8A9BB0", marginBottom: 8, fontWeight: 500 }}>
                Open in Chrome / Edge to install
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {["Chrome", "Edge", "Safari"].map((b) => (
                  <span key={b} style={{ fontSize: 11, fontWeight: 600, color: "#0066CC", background: "#E8F1FB", padding: "3px 10px", borderRadius: 99 }}>{b}</span>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
