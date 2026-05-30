import LoginForm from "./LoginForm";

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
          <LoginForm error={error} message={message} />

          <p style={{ textAlign:"center", fontSize:12, color:"#C4C7DB", marginTop:20 }}>
            © 2025 Rangayan Creations Pvt. Ltd. All rights reserved.
          </p>
        </div>
      </div>

    </div>
  );
}
