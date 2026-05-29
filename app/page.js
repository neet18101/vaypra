import Link from "next/link";

const FEATURES = [
  { icon: "🖨️", color: "#00B4C8", title: "Installation Reports",  desc: "PC, printer & device installation reports with A4 print output." },
  { icon: "📦", color: "#06C990", title: "Inventory Management",  desc: "Track products by serial number, category and branch." },
  { icon: "🧾", color: "#FF7B24", title: "Invoicing & GST",        desc: "GST-ready sales and purchase invoices with customer history." },
  { icon: "🚚", color: "#F72585", title: "Dispatch Tracking",      desc: "Batch shipping with delivery status tracking." },
  { icon: "💳", color: "#7B2FBE", title: "Installment Plans",      desc: "EMI and payment plan management for customers." },
  { icon: "👥", color: "#FFB300", title: "Team Management",        desc: "Role-based access for admins, engineers and viewers." },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font-body)", background: "#fff", minHeight: "100vh" }}>

      {/* ── NAV ── */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5%", height: 66,
        borderBottom: "1px solid #E2E4F0",
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="logo" style={{ height: 38, objectFit: "contain" }} />
          <span style={{ fontSize: 16, fontWeight: 800, color: "#0D1B2A", fontFamily: "var(--font-display)" }}>
            Rangayan Kitaab
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/login" style={{
            padding: "8px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            color: "#2D3436", textDecoration: "none", border: "1.5px solid #E2E4F0",
          }}>Sign In</Link>
          <Link href="/signup" style={{
            padding: "8px 20px", borderRadius: 9, fontSize: 13, fontWeight: 700,
            color: "#fff", textDecoration: "none",
            background: "linear-gradient(135deg, #00B4C8, #0090A8)",
            boxShadow: "0 3px 10px rgba(0,180,200,0.3)",
          }}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        padding: "80px 5% 72px",
        textAlign: "center",
        background: "linear-gradient(180deg, #F0FCFE 0%, #fff 100%)",
        borderBottom: "1px solid #E2E4F0",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* top colour strip */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#F72585,#FF7B24,#FFB300,#06C990,#00B4C8,#7B2FBE)" }} />

        <img
          src="/logo.png"
          alt="Rangayan Creations"
          style={{ height: 96, objectFit: "contain", marginBottom: 24, filter: "drop-shadow(0 4px 20px rgba(0,180,200,0.25))" }}
        />

        <div style={{
          display: "inline-block", background: "#E6F9FB", color: "#0090A8",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "5px 14px", borderRadius: 99, marginBottom: 20,
        }}>
          Business Management Platform
        </div>

        <h1 style={{
          fontSize: "clamp(30px, 5vw, 52px)", fontWeight: 900,
          color: "#0D1B2A", lineHeight: 1.15, margin: "0 auto 18px",
          fontFamily: "var(--font-display)", maxWidth: 640,
        }}>
          Run Your Entire Business<br />
          <span style={{ color: "#00B4C8" }}>From One Dashboard</span>
        </h1>

        <p style={{
          fontSize: 16, color: "#6C6F87", maxWidth: 480,
          margin: "0 auto 36px", lineHeight: 1.75,
        }}>
          Inventory, invoicing, installation reports, dispatch tracking and team management — built for Rangayan Creations.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/login" style={{
            padding: "13px 34px", borderRadius: 11, fontSize: 14, fontWeight: 700,
            color: "#fff", textDecoration: "none",
            background: "linear-gradient(135deg, #00B4C8, #0090A8)",
            boxShadow: "0 6px 20px rgba(0,180,200,0.38)",
          }}>
            Sign In to Dashboard →
          </Link>
          <Link href="/signup" style={{
            padding: "13px 34px", borderRadius: 11, fontSize: 14, fontWeight: 600,
            color: "#0090A8", textDecoration: "none",
            border: "1.5px solid #00B4C8",
            background: "#fff",
          }}>
            Create Account
          </Link>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ background: "#0D1B2A", padding: "28px 5%" }}>
        <div style={{
          maxWidth: 840, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0, textAlign: "center",
        }}>
          {[
            { v: "Multi-Branch", l: "Operations" },
            { v: "GST Ready",    l: "Invoicing" },
            { v: "A4 Print",     l: "Reports" },
            { v: "Real-Time",    l: "Stock" },
          ].map(({ v, l }, i) => (
            <div key={l} style={{ padding: "8px 0", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#00B4C8", marginBottom: 2, fontFamily: "var(--font-display)" }}>{v}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "72px 5%", background: "#F8F9FE" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#00B4C8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Features</p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, color: "#0D1B2A", fontFamily: "var(--font-display)", marginBottom: 12 }}>
              Everything in one place
            </h2>
            <p style={{ fontSize: 15, color: "#9699B0", maxWidth: 440, margin: "0 auto" }}>
              No generic software. Built specifically for how Rangayan Creations works.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(272px, 1fr))", gap: 16 }}>
            {FEATURES.map(({ icon, color, title, desc }) => (
              <div key={title} style={{
                background: "#fff", borderRadius: 18, padding: "26px 22px",
                border: "1px solid #E2E4F0",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0D1B2A", marginBottom: 8, fontFamily: "var(--font-display)" }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#6C6F87", lineHeight: 1.65 }}>{desc}</p>
                <div style={{ marginTop: 18, height: 2, width: 40, borderRadius: 99, background: color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "72px 5%", textAlign: "center",
        background: "linear-gradient(135deg, #073B4C 0%, #00B4C8 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05, backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <img src="/logo.png" alt="logo" style={{ height: 56, objectFit: "contain", marginBottom: 20, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))" }} />
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 900, color: "#fff", marginBottom: 10, fontFamily: "var(--font-display)" }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", marginBottom: 30 }}>
            Sign in and take control of your business today.
          </p>
          <Link href="/login" style={{
            display: "inline-block", padding: "13px 40px", borderRadius: 11,
            fontSize: 14, fontWeight: 700, color: "#073B4C",
            textDecoration: "none", background: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          }}>
            Go to Dashboard →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#0D1B2A",
        padding: "24px 5%",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="logo" style={{ height: 28, objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.5)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>© 2025 Rangayan Creations Pvt. Ltd.</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Link href="/login"  style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Sign In</Link>
          <Link href="/signup" style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Sign Up</Link>
        </div>
      </footer>

    </div>
  );
}
