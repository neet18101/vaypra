import Link from "next/link";

export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5FB]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-[#E2E4F0]">

        <div className="flex flex-col items-center gap-3 mb-7">
          <img src="/logo.png" alt="Rangayan Creations" style={{ height: 64, objectFit: "contain" }} />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#2D3436] font-[var(--font-display)]">
              Create Account
            </h1>
            <p className="text-sm text-[#9699B0] mt-1">Join Rangayan Creations dashboard</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form action="/auth/sign-up" method="POST" className="space-y-5">
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
              className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-colors focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20"
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
              minLength={6}
              placeholder="Min 6 characters"
              className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-colors focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20"
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
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-[#9699B0] mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:underline" style={{ color: "#00B4C8" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
