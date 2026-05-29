import Link from "next/link";
import {
  Monitor, Printer, Package, FileText, Truck, CreditCard, Users,
  ChevronRight, Zap, BarChart3, Shield, Clock,
} from "lucide-react";
import PwaInstall from "@/app/components/PwaInstall";
import PwaInstallSection from "@/app/components/PwaInstallSection";

const FEATURES = [
  { icon: Printer,    color: "#0066CC", bg: "#E8F1FB", title: "Installation Reports",   desc: "PC, printer & device installation reports with A4 print and digital sign-off." },
  { icon: Package,    color: "#E65C00", bg: "#FEF0E6", title: "Inventory Management",   desc: "Real-time stock tracking by serial, category and branch with CSV import." },
  { icon: FileText,   color: "#00875A", bg: "#E3F6EE", title: "GST Invoicing",           desc: "GST-ready sales & purchase invoices with full customer history." },
  { icon: Truck,      color: "#6554C0", bg: "#EEE9FF", title: "Dispatch Tracking",       desc: "Batch shipments with live status. Linked directly to installations." },
  { icon: CreditCard, color: "#0066CC", bg: "#E8F1FB", title: "Installment Plans",       desc: "EMI & payment plan management tied to customer invoices." },
  { icon: Users,      color: "#E65C00", bg: "#FEF0E6", title: "Team Management",         desc: "Role-based access for admins, engineers and viewers across branches." },
];

const STATS = [
  { icon: BarChart3, value: "Multi-Branch", label: "Operations" },
  { icon: Shield,    value: "GST Ready",    label: "Tax Compliant" },
  { icon: Zap,       value: "Real-Time",    label: "Stock" },
  { icon: Clock,     value: "A4 Print",     label: "Reports" },
];

export default function Home() {
  return (
    <div className="rk-root">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }

        .rk-root {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          background: #fff;
          color: #1a2332;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── NAV ── */
        .rk-nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E8EDF5;
          box-shadow: 0 1px 0 #E8EDF5;
        }
        .rk-nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 20px; height: 62px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .rk-brand { display: flex; align-items: center; gap: 10; flex-shrink: 0; }
        .rk-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #0066CC, #004499);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(0,102,204,0.35); flex-shrink: 0;
        }
        .rk-brand-name { font-size: 15px; font-weight: 800; color: #0D1F3C; line-height: 1.1; }
        .rk-brand-sub  { font-size: 9px; color: #8A9BB0; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }
        .rk-nav-links { display: flex; gap: 28px; }
        .rk-nav-links a { font-size: 13px; font-weight: 600; color: #4A5568; transition: color 0.15s; }
        .rk-nav-links a:hover { color: #0066CC; }
        .rk-nav-btns { display: flex; gap: 8px; flex-shrink: 0; }
        .rk-btn-ghost {
          padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
          color: #0066CC; border: 1.5px solid #C2D9F5; background: #F0F7FF;
        }
        .rk-btn-solid {
          padding: 7px 16px; border-radius: 8px; font-size: 13px; font-weight: 700;
          color: #fff; background: linear-gradient(135deg, #0066CC, #004FA3);
          box-shadow: 0 3px 12px rgba(0,102,204,0.35);
        }

        /* ── HERO ── */
        .rk-hero {
          background: linear-gradient(160deg, #F0F7FF 0%, #EFF1F7 50%, #FFF8F3 100%);
          padding: 80px 20px 72px;
          position: relative; overflow: hidden;
          border-bottom: 1px solid #E8EDF5;
          text-align: center;
        }
        .rk-hero-inner { max-width: 760px; margin: 0 auto; position: relative; z-index: 1; }
        .rk-hero-icon-wrap {
          width: 68px; height: 68px; border-radius: 18px;
          background: linear-gradient(135deg, #0066CC, #004499);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 28px rgba(0,102,204,0.3);
          margin: 0 auto 22px;
        }
        .rk-badge {
          display: inline-block;
          background: linear-gradient(135deg, #E65C00, #FF7B24);
          color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; padding: 5px 14px; border-radius: 99px;
          margin-bottom: 20px;
        }
        .rk-h1 {
          font-size: clamp(28px, 5.5vw, 56px); font-weight: 900; line-height: 1.12;
          color: #0D1F3C; margin-bottom: 18px; letter-spacing: -0.02em;
        }
        .rk-h1-grad {
          background: linear-gradient(135deg, #0066CC, #0095FF);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .rk-hero-p {
          font-size: clamp(14px, 2vw, 17px); color: #5A6E87;
          max-width: 500px; margin: 0 auto 36px; line-height: 1.8;
        }
        .rk-ctas {
          display: flex; gap: 12px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 36px;
        }
        .rk-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 30px; border-radius: 10px; font-size: 15px; font-weight: 700;
          color: #fff; background: linear-gradient(135deg, #0066CC, #004FA3);
          box-shadow: 0 6px 22px rgba(0,102,204,0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .rk-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,102,204,0.45); }
        .rk-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 30px; border-radius: 10px; font-size: 15px; font-weight: 600;
          color: #0066CC; border: 2px solid #C2D9F5; background: #fff;
        }
        .rk-trust {
          display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;
        }
        .rk-trust span { font-size: 12.5px; color: #5A6E87; font-weight: 600; }

        /* ── STATS ── */
        .rk-stats { background: #0D1F3C; }
        .rk-stats-grid {
          max-width: 1000px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(4,1fr);
        }
        .rk-stat {
          padding: 26px 16px; text-align: center;
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .rk-stat:last-child { border-right: none; }
        .rk-stat-val { font-size: 14px; font-weight: 800; color: #fff; margin: 8px 0 3px; }
        .rk-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); letter-spacing: 0.07em; text-transform: uppercase; font-weight: 600; }

        /* ── FEATURES ── */
        .rk-features { padding: 80px 20px; background: #F7F9FC; }
        .rk-features-inner { max-width: 1100px; margin: 0 auto; }
        .rk-section-label {
          display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          color: #0066CC; text-transform: uppercase; margin-bottom: 12px;
          background: #E8F1FB; padding: 4px 14px; border-radius: 99px;
        }
        .rk-h2 {
          font-size: clamp(22px, 3.5vw, 36px); font-weight: 900; color: #0D1F3C;
          margin-bottom: 12px; letter-spacing: -0.01em;
        }
        .rk-section-p { font-size: 15px; color: #5A6E87; max-width: 440px; margin: 0 auto; line-height: 1.75; }
        .rk-features-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px;
        }
        .rk-card {
          background: #fff; border-radius: 18px; padding: 26px 22px;
          border: 1.5px solid #E8EDF5; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .rk-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }
        .rk-card-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
        }
        .rk-card h3 { font-size: 14.5px; font-weight: 800; color: #0D1F3C; margin-bottom: 8px; }
        .rk-card p  { font-size: 13px; color: #6B7D93; line-height: 1.7; }
        .rk-card-bar { margin-top: 16px; height: 2px; width: 38px; border-radius: 99px; }

        /* ── CTA ── */
        .rk-cta-section {
          padding: 72px 20px; text-align: center;
          background: linear-gradient(135deg, #0D1F3C 0%, #0066CC 100%);
          position: relative; overflow: hidden;
        }
        .rk-cta-icon {
          width: 60px; height: 60px; border-radius: 16px;
          background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 22px;
        }
        .rk-cta-inner { max-width: 500px; margin: 0 auto; position: relative; z-index: 1; }
        .rk-cta-h2 { font-size: clamp(20px,3vw,34px); font-weight: 900; color: #fff; margin-bottom: 12px; letter-spacing: -0.01em; }
        .rk-cta-p  { font-size: 15px; color: rgba(255,255,255,0.65); margin-bottom: 30px; line-height: 1.75; }
        .rk-cta-btn {
          display: inline-block; padding: 13px 40px; border-radius: 10px;
          font-size: 15px; font-weight: 700; color: #0D1F3C;
          background: #fff; box-shadow: 0 6px 24px rgba(0,0,0,0.2);
          transition: transform 0.2s;
        }
        .rk-cta-btn:hover { transform: translateY(-2px); }

        /* ── FOOTER ── */
        .rk-footer {
          background: #0D1F3C; border-top: 1px solid rgba(255,255,255,0.06);
          padding: 22px 20px;
        }
        .rk-footer-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .rk-footer-brand { display: flex; align-items: center; gap: 8px; }
        .rk-footer-icon  { width: 26px; height: 26px; border-radius: 7px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; }
        .rk-footer-copy  { font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 500; }
        .rk-footer-links { display: flex; gap: 18px; }
        .rk-footer-links a { font-size: 12px; color: rgba(255,255,255,0.3); font-weight: 500; }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .rk-nav-links  { display: none; }
          .rk-brand-sub  { display: none; }
          .rk-nav-inner  { padding: 0 14px; }

          .rk-btn-ghost  { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
          .rk-btn-solid  { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
        }
        @media (max-width: 380px) {
          .rk-btn-ghost  { display: none; }
          .rk-btn-solid  { padding: 8px 18px; font-size: 13px; width: auto; }

          .rk-hero       { padding: 52px 16px 48px; }
          .rk-hero-icon-wrap { width: 56px; height: 56px; }
          .rk-badge      { font-size: 9.5px; }
          .rk-ctas       { flex-direction: column; align-items: center; }
          .rk-cta-primary, .rk-cta-secondary { width: 100%; max-width: 300px; justify-content: center; padding: 12px 20px; font-size: 14px; }
          .rk-trust      { display: none; }

          .rk-stats-grid { grid-template-columns: repeat(2,1fr); }
          .rk-stat       { padding: 18px 10px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .rk-stat:nth-child(odd)  { border-right: 1px solid rgba(255,255,255,0.06); }
          .rk-stat:nth-child(3),
          .rk-stat:nth-child(4)   { border-bottom: none; }

          .rk-features   { padding: 56px 16px; }
          .rk-features-grid { grid-template-columns: 1fr; }

          .rk-cta-section { padding: 52px 16px; }

          .rk-footer-inner { flex-direction: column; align-items: flex-start; }
          .rk-footer-links { flex-wrap: wrap; gap: 14px; }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .rk-nav-links { display: none; }
          .rk-stats-grid { grid-template-columns: repeat(2,1fr); }
          .rk-stat { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .rk-stat:nth-child(odd)  { border-right: 1px solid rgba(255,255,255,0.06); }
          .rk-stat:nth-child(3), .rk-stat:nth-child(4) { border-bottom: none; }
          .rk-features-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      {/* ── NAV ── */}
      <header className="rk-nav">
        <div className="rk-nav-inner">
          <div className="rk-brand">
            <div className="rk-brand-icon"><Monitor size={18} color="#fff" /></div>
            <div>
              <div className="rk-brand-name">Rangayan Kitaab</div>
              <div className="rk-brand-sub">By Rangayan Creations</div>
            </div>
          </div>

          <nav className="rk-nav-links">
            {["Features", "Reports", "Inventory", "Contact"].map((item) => (
              <a key={item} href="#features">{item}</a>
            ))}
          </nav>

          <div className="rk-nav-btns">
            <Link href="/login"  className="rk-btn-ghost">Sign In</Link>
            <Link href="/signup" className="rk-btn-solid">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="rk-hero">
        <div style={{ position:"absolute", top:-100, right:-60, width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,102,204,0.07), transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, left:-40, width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle, rgba(230,92,0,0.06), transparent 70%)", pointerEvents:"none" }} />

        <div className="rk-hero-inner">
          <div className="rk-hero-icon-wrap"><Monitor size={28} color="#fff" /></div>

          <div className="rk-badge">Rangayan Creations — Business OS</div>

          <h1 className="rk-h1">
            Manage Your Entire Business<br />
            <span className="rk-h1-grad">From One Dashboard</span>
          </h1>

          <p className="rk-hero-p">
            Inventory tracking, GST invoicing, installation reports, dispatch management and team control — built for Rangayan Creations.
          </p>

          <div className="rk-ctas">
            <Link href="/login" className="rk-cta-primary">
              Open Dashboard <ChevronRight size={17} />
            </Link>
            <Link href="/signup" className="rk-cta-secondary">
              Create Account
            </Link>
          </div>

          <div className="rk-trust">
            {["✓ GST Compliant", "✓ Multi-Branch", "✓ A4 Print Reports", "✓ Secure & Fast"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="rk-stats">
        <div className="rk-stats-grid">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rk-stat">
              <Icon size={18} color="#4DA3FF" style={{ margin: "0 auto", display: "block" }} />
              <div className="rk-stat-val">{value}</div>
              <div className="rk-stat-lbl">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PWA INSTALL ── */}
      <PwaInstallSection />

      {/* ── FEATURES ── */}
      <section id="features" className="rk-features">
        <div className="rk-features-inner">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="rk-section-label">What's Inside</span>
            <h2 className="rk-h2">Everything Your Team Needs</h2>
            <p className="rk-section-p">No generic software. Purpose-built for how Rangayan Creations operates every day.</p>
          </div>

          <div className="rk-features-grid">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="rk-card">
                <div className="rk-card-icon" style={{ background: bg }}>
                  <Icon size={22} color={color} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
                <div className="rk-card-bar" style={{ background: color }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="rk-cta-section">
        <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize:"28px 28px", pointerEvents:"none" }} />
        <div className="rk-cta-inner">
          <div className="rk-cta-icon"><Monitor size={26} color="#fff" /></div>
          <h2 className="rk-cta-h2">Ready to Get Started?</h2>
          <p className="rk-cta-p">Sign in to Rangayan Kitaab and take full control of your business operations.</p>
          <Link href="/login" className="rk-cta-btn">Go to Dashboard →</Link>
        </div>
      </section>

      {/* ── PWA toast ── */}
      <PwaInstall />

      {/* ── FOOTER ── */}
      <footer className="rk-footer">
        <div className="rk-footer-inner">
          <div className="rk-footer-brand">
            <div className="rk-footer-icon"><Monitor size={13} color="rgba(255,255,255,0.4)" /></div>
            <span className="rk-footer-copy">© 2025 Rangayan Creations Pvt. Ltd.</span>
          </div>
          <div className="rk-footer-links">
            <Link href="/login">Sign In</Link>
            <Link href="/signup">Sign Up</Link>
            <a href="https://rangayancreations.com" target="_blank" rel="noopener noreferrer">Main Website</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
