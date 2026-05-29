import Link from "next/link";

export default async function LoginPage({ searchParams }) {
  const params  = await searchParams;
  const error   = params?.error;
  const message = params?.message;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "var(--font-body)" }}>

      {/* ══════════════════════════════════════
          LEFT — Brand Panel
      ══════════════════════════════════════ */}
      <div
        className="hidden lg:flex"
        style={{
          width: "52%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #0D1B2A 0%, #0B3A4A 35%, #005F73 65%, #00B4C8 100%)",
        }}
      >
        {/* Rainbow petal blobs — matching the logo flower */}
        <div style={{ position:"absolute", top:"-120px", right:"-80px",   width:380, height:380, borderRadius:"50%", background:"radial-gradient(circle, rgba(0,180,200,0.25) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"-100px", left:"-60px", width:340, height:340, borderRadius:"50%", background:"radial-gradient(circle, rgba(6,201,144,0.2) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", top:"15%", left:"-50px",       width:220, height:220, borderRadius:"50%", background:"radial-gradient(circle, rgba(247,37,133,0.22) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"20%", right:"-30px",   width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,123,36,0.18) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", top:"55%", left:"10%",         width:140, height:140, borderRadius:"50%", background:"radial-gradient(circle, rgba(123,47,190,0.2) 0%, transparent 70%)" }} />

        {/* Subtle dot grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.07,
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />

        {/* Content */}
        <div style={{ position:"relative", zIndex:10, textAlign:"center", padding:"0 48px", maxWidth:520 }}>
          <img
            src="/logo.png"
            alt="Rangayan Creations"
            style={{ height:110, objectFit:"contain", marginBottom:32, filter:"drop-shadow(0 8px 32px rgba(0,180,200,0.4))" }}
          />

          <h1 style={{ fontSize:34, fontWeight:900, color:"#fff", letterSpacing:0.5, marginBottom:8, lineHeight:1.2, fontFamily:"var(--font-display)" }}>
            Rangayan Creations
          </h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", marginBottom:40, lineHeight:1.8, letterSpacing:0.3 }}>
            BUSINESS MANAGEMENT PLATFORM
          </p>

          {/* Feature list */}
          <div style={{ display:"flex", flexDirection:"column", gap:14, textAlign:"left", marginBottom:44 }}>
            {[
              { icon:"📦", title:"Inventory Management",   desc:"Real-time stock tracking across branches" },
              { icon:"🖨️", title:"Installation Records",   desc:"PC, printer & device installation reports" },
              { icon:"📋", title:"Invoicing & Billing",    desc:"GST invoices with customer EMI plans" },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ display:"flex", alignItems:"flex-start", gap:14, background:"rgba(255,255,255,0.07)", borderRadius:14, padding:"13px 16px", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:2 }}>{title}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom rainbow bar */}
          <div style={{ height:4, borderRadius:99, background:"linear-gradient(90deg, #F72585, #FF7B24, #FFB300, #06C990, #00B4C8, #7B2FBE)", opacity:0.8 }} />
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT — Form Panel
      ══════════════════════════════════════ */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        background: "#F4F5FB",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Subtle background rings */}
        <div style={{ position:"absolute", top:"-100px", right:"-100px", width:400, height:400, borderRadius:"50%", background:"rgba(0,180,200,0.05)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-80px", left:"-80px",  width:320, height:320, borderRadius:"50%", background:"rgba(247,37,133,0.04)", pointerEvents:"none" }} />

        <div style={{ width:"100%", maxWidth:420, position:"relative", zIndex:1 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
            <img src="/logo.png" alt="Rangayan Creations" style={{ height:64, objectFit:"contain" }} />
          </div>

          {/* Card */}
          <div style={{ background:"#fff", borderRadius:24, boxShadow:"0 8px 40px rgba(0,0,0,0.08)", border:"1px solid #E2E4F0", padding:"36px 36px 32px" }}>

            {/* Colorful top accent bar */}
            <div style={{ height:3, borderRadius:99, background:"linear-gradient(90deg, #00B4C8, #06C990, #F72585)", marginBottom:28 }} />

            <div style={{ marginBottom:24 }}>
              <h2 style={{ fontSize:24, fontWeight:900, color:"#2D3436", marginBottom:6, fontFamily:"var(--font-display)" }}>
                Welcome back 👋
              </h2>
              <p style={{ fontSize:13, color:"#9699B0" }}>
                Sign in to your Rangayan account
              </p>
            </div>

            {error && (
              <div style={{ marginBottom:20, background:"#FFF5F5", border:"1px solid #FED7D7", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#C53030" }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ marginBottom:20, background:"#F0FFF4", border:"1px solid #C6F6D5", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#276749" }}>
                {message}
              </div>
            )}

            <form action="/auth/sign-in" method="POST" style={{ display:"flex", flexDirection:"column", gap:18 }}>

              <div>
                <label htmlFor="email" style={{ display:"block", fontSize:11, fontWeight:700, color:"#9699B0", marginBottom:7, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                  Email Address
                </label>
                <input
                  id="email" name="email" type="email" required
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-all focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20"
                />
              </div>

              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <label htmlFor="password" style={{ fontSize:11, fontWeight:700, color:"#9699B0", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                    Password
                  </label>
                  <Link href="/forgot-password" style={{ fontSize:12, color:"#00B4C8", textDecoration:"none", fontWeight:500 }}>
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password" name="password" type="password" required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-all focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20"
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop:4,
                  width:"100%",
                  padding:"13px 0",
                  borderRadius:12,
                  border:"none",
                  cursor:"pointer",
                  fontSize:14,
                  fontWeight:700,
                  color:"#fff",
                  letterSpacing:0.3,
                  background:"linear-gradient(135deg, #00C4D8 0%, #00B4C8 50%, #0090A8 100%)",
                  boxShadow:"0 6px 20px rgba(0,180,200,0.4)",
                }}
              >
                Sign In →
              </button>

            </form>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0 20px" }}>
              <div style={{ flex:1, height:1, background:"#E2E4F0" }} />
              <span style={{ fontSize:11, color:"#C4C7DB", fontWeight:600 }}>RANGAYAN KITAAB</span>
              <div style={{ flex:1, height:1, background:"#E2E4F0" }} />
            </div>

            <p style={{ textAlign:"center", fontSize:13, color:"#9699B0" }}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color:"#00B4C8", fontWeight:700, textDecoration:"none" }}>
                Sign Up
              </Link>
            </p>
          </div>

          <p style={{ textAlign:"center", fontSize:12, color:"#C4C7DB", marginTop:20 }}>
            © 2025 Rangayan Creations Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>

    </div>
  );
}
