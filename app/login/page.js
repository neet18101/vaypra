import Link from "next/link";
import { Zap } from "lucide-react";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const error = params?.error;
  const message = params?.message;

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "#F4F5FB" }}>
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg border border-[#E2E4F0]">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE]">
            <Zap size={24} color="#fff" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#2D3436] font-[var(--font-display)]">
              BizFlow<span className="text-[#A29BFE]">Pro</span>
            </h1>
            <p className="text-sm text-[#9699B0] mt-1">Sign in to your account</p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</p>
        )}
        {message && (
          <p className="rounded-lg bg-green-50 p-3 text-sm text-green-600 border border-green-100">{message}</p>
        )}

        <form action="/auth/sign-in" method="POST" className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-[#9699B0] mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-[10px] border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-[#9699B0] mb-1.5">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-[10px] border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-[10px] py-2.5 text-white font-semibold text-[14px]"
            style={{
              background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)",
              boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
            }}
          >
            Sign In
          </button>

          <div className="text-center">
            <Link href="/forgot-password" className="text-xs text-[#9699B0] hover:text-[#6C5CE7] transition-colors">
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-[#9699B0]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#6C5CE7] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
