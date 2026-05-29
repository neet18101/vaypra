import Link from "next/link";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error   = params?.error;
  const message = params?.message;

  return (
    <div className="flex min-h-screen">

      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0090A8 0%, #00B4C8 40%, #00C9B8 70%, #06C990 100%)" }}
      >
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: "40%", left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(247,37,133,0.15)" }} />

        <div className="relative z-10 text-center">
          <img
            src="/logo.png"
            alt="Rangayan Creations"
            style={{ height: 100, objectFit: "contain", marginBottom: 28, filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.18))" }}
          />
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 1, marginBottom: 10, fontFamily: "var(--font-display)" }}>
            Rangayan Creations
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.82)", maxWidth: 340, lineHeight: 1.7 }}>
            All-in-one business dashboard — inventory, invoicing, installations, and more.
          </p>

          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 40 }}>
            {[
              { label: "Installations", value: "Tracked" },
              { label: "Invoices", value: "Managed" },
              { label: "Inventory", value: "Live" },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 20px", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{value}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F4F5FB]">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/logo.png" alt="Rangayan Creations" style={{ height: 60, objectFit: "contain" }} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-[#E2E4F0] p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-[#2D3436] font-[var(--font-display)]">
                Welcome back
              </h2>
              <p className="text-sm text-[#9699B0] mt-1">Sign in to your Rangayan account</p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-100">
                {message}
              </div>
            )}

            <form action="/auth/sign-in" method="POST" className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#9699B0] mb-1.5 uppercase tracking-wide">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-colors"
                  style={{ "--tw-ring-color": "#00B4C8" }}
                  onFocus={(e) => { e.target.style.borderColor = "#00B4C8"; e.target.style.boxShadow = "0 0 0 3px rgba(0,180,200,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#E2E4F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[#9699B0] mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl py-3 text-white font-bold text-[14px] transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #00B4C8, #0090A8)",
                  boxShadow: "0 4px 16px rgba(0,180,200,0.35)",
                }}
              >
                Sign In
              </button>

              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#9699B0] hover:text-[#00B4C8] transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-[#9699B0] mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold hover:underline" style={{ color: "#00B4C8" }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
