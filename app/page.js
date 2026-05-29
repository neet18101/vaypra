import Link from "next/link";
import {
  Monitor, Printer, Package, FileText, Truck, CreditCard, Users,
  ChevronRight, Zap, BarChart3, Shield, Clock,
} from "lucide-react";
import PwaInstall from "@/app/components/PwaInstall";
import PwaInstallSection from "@/app/components/PwaInstallSection";

const NAV = ["Features", "Reports", "Inventory", "Contact"];

const FEATURES = [
  { icon: Printer,    color: "#0066CC", bg: "#E8F1FB", title: "Installation Reports",   desc: "PC, printer & device installation reports with A4 print and digital sign-off." },
  { icon: Package,    color: "#E65C00", bg: "#FEF0E6", title: "Inventory Management",   desc: "Real-time stock tracking by serial, category and branch with CSV import." },
  { icon: FileText,   color: "#00875A", bg: "#E3F6EE", title: "GST Invoicing",           desc: "GST-ready sales & purchase invoices with full customer history." },
  { icon: Truck,      color: "#6554C0", bg: "#EEE9FF", title: "Dispatch Tracking",       desc: "Batch shipments with live status. Linked directly to installations." },
  { icon: CreditCard, color: "#0066CC", bg: "#E8F1FB", title: "Installment Plans",       desc: "EMI & payment plan management tied to customer invoices." },
  { icon: Users,      color: "#E65C00", bg: "#FEF0E6", title: "Team Management",         desc: "Role-based access for admins, engineers and viewers across branches." },
];

const STATS = [
  { icon: BarChart3, value: "Multi-Branch", label: "Business Operations" },
  { icon: Shield,    value: "GST Ready",    label: "Tax Compliant" },
  { icon: Zap,       value: "Real-Time",    label: "Stock Updates" },
  { icon: Clock,     value: "A4 Print",     label: "Instant Reports" },
];

export default function Home() {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", background: "#fff", color: "#1a2332", minHeight: "100vh" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
        .hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,102,204,0.15); }
        .nav-link { font-size: 13.5px; font-weight: 600; color: #4A5568; transition: color 0.15s; text-decoration: none; }
        .nav-link:hover { color: #0066CC; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-brand-sub { display: none !important; }
          .hero-trust { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .stats-grid > div:nth-child(2) { border-right: none !important; }
          .footer-row { flex-direction: column; align-items: flex-start !important; gap: 12px; }
          .hero-ctas { flex-direction: column; align-items: center; }
          .hero-ctas a { width: 100%; max-width: 320px; text-align: center; justify-content: center; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #E8EDF5",
        boxShadow: "0 1px 0 #E8EDF5",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Brand mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #0066CC, #004499)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(0,102,204,0.35)",
            }}>
              <Monitor size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#0D1F3C", lineHeight: 1.1 }}>Rangayan Kitaab</div>
              <div className="nav-brand-sub" style={{ fontSize: 9.5, color: "#8A9BB0", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>By Rangayan Creations</div>
            </div>
          </div>

          {/* Nav links — hidden on mobile */}
          <nav className="nav-desktop" style={{ display: "flex", gap: 32 }}>
            {NAV.map((item) => (
              <a key={item} href="#features" className="nav-link">{item}</a>
            ))}
          </nav>

          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/login" style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: "#0066CC", border: "1.5px solid #C2D9F5", background: "#F0F7FF",
            }}>Sign In</Link>
            <Link href="/signup" style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700,
              color: "#fff", background: "linear-gradient(135deg, #0066CC, #004FA3)",
              boxShadow: "0 3px 12px rgba(0,102,204,0.35)",
            }}>Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(160deg, #F0F7FF 0%, #EFF1F7 50%, #FFF8F3 100%)",
        padding: "90px 24px 80px",
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid #E8EDF5",
      }}>
        {/* Decorative shapes */}
        <div style={{ position:"absolute", top:-120, right:-80, width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,102,204,0.07), transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-60, width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(230,92,0,0.06), transparent 70%)", pointerEvents:"none" }} />

        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>

          {/* Icon badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #0066CC, #004499)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 8px 28px rgba(0,102,204,0.3)",
            }}>
              <Monitor size={30} color="#fff" />
            </div>
          </div>

          {/* Pill badge */}
          <div style={{ marginBottom: 22 }}>
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg, #E65C00, #FF7B24)",
              color: "#fff", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: "5px 16px", borderRadius: 99,
            }}>
              Rangayan Creations — Business OS
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(32px,5.5vw,58px)", fontWeight: 900, lineHeight: 1.1,
            color: "#0D1F3C", marginBottom: 20, letterSpacing: "-0.02em",
          }}>
            Manage Your Entire Business<br />
            <span style={{ background: "linear-gradient(135deg, #0066CC, #0095FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              From One Dashboard
            </span>
          </h1>

          <p style={{ fontSize: 17, color: "#5A6E87", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.8 }}>
            Inventory tracking, GST invoicing, installation reports, dispatch management and team control — built for Rangayan Creations.
          </p>

          <div className="hero-ctas" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/login" className="hover-lift" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 700,
              color: "#fff",
              background: "linear-gradient(135deg, #0066CC 0%, #004FA3 100%)",
              boxShadow: "0 6px 22px rgba(0,102,204,0.4)",
            }}>
              Open Dashboard <ChevronRight size={18} />
            </Link>
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 36px", borderRadius: 10, fontSize: 15, fontWeight: 600,
              color: "#0066CC", border: "2px solid #C2D9F5", background: "#fff",
            }}>
              Create Account
            </Link>
          </div>

          {/* Trust bar — hidden on mobile */}
          <div className="hero-trust" style={{ display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap" }}>
            {["✓ GST Compliant", "✓ Multi-Branch", "✓ A4 Print Reports", "✓ Secure & Fast"].map((item) => (
              <span key={item} style={{ fontSize: 13, color: "#5A6E87", fontWeight: 600 }}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: "#0D1F3C", padding: "0" }}>
        <div className="stats-grid" style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <div key={label} style={{
              padding: "28px 20px", textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              <Icon size={20} color="#4DA3FF" style={{ margin: "0 auto 10px", display: "block" }} />
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3 }}>{value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PWA INSTALL SECTION ── */}
      <PwaInstallSection />

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "88px 24px", background: "#F7F9FC" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{
              display: "inline-block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
              color: "#0066CC", textTransform: "uppercase", marginBottom: 12,
              background: "#E8F1FB", padding: "4px 14px", borderRadius: 99,
            }}>What's Inside</span>
            <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, color: "#0D1F3C", marginBottom: 12, letterSpacing: "-0.01em" }}>
              Everything Your Team Needs
            </h2>
            <p style={{ fontSize: 16, color: "#5A6E87", maxWidth: 450, margin: "0 auto", lineHeight: 1.75 }}>
              No generic software. Purpose-built for how Rangayan Creations operates every day.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="hover-lift" style={{
                background: "#fff", borderRadius: 18, padding: "28px 24px",
                border: "1.5px solid #E8EDF5",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
              }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                  <Icon size={23} color={color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0D1F3C", marginBottom: 9 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: "#6B7D93", lineHeight: 1.7 }}>{desc}</p>
                <div style={{ marginTop: 18, height: 2, width: 40, borderRadius: 99, background: color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "80px 24px", textAlign: "center",
        background: "linear-gradient(135deg, #0D1F3C 0%, #0066CC 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 520, margin: "0 auto" }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
            <Monitor size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#fff", marginBottom: 12, letterSpacing: "-0.01em" }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", marginBottom: 32, lineHeight: 1.75 }}>
            Sign in to Rangayan Kitaab and take full control of your business operations.
          </p>
          <Link href="/login" className="hover-lift" style={{
            display: "inline-block", padding: "14px 44px", borderRadius: 10,
            fontSize: 15, fontWeight: 700, color: "#0D1F3C",
            background: "#fff", boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
          }}>
            Go to Dashboard →
          </Link>
        </div>
      </section>

      {/* ── PWA Install prompt ── */}
      <PwaInstall />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0D1F3C", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 32px" }}>
        <div className="footer-row" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Monitor size={15} color="rgba(255,255,255,0.5)" />
            </div>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>© 2025 Rangayan Creations Pvt. Ltd. All rights reserved.</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link href="/login"  style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Sign In</Link>
            <Link href="/signup" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Sign Up</Link>
            <a href="https://rangayancreations.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Main Website</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
