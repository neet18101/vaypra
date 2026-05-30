"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginForm({ error, message }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #E2E4F0", padding: "36px 36px 32px" }}>

      {/* Colorful top accent bar */}
      <div style={{ height: 3, borderRadius: 99, background: "linear-gradient(90deg, #00B4C8, #06C990, #F72585)", marginBottom: 28 }} />

      <div style={{ marginBottom: 26 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: "#2D3436", marginBottom: 6, fontFamily: "var(--font-display)" }}>
          Welcome back 👋
        </h2>
        <p style={{ fontSize: 13, color: "#9699B0", margin: 0 }}>
          Sign in to your Rangayan account
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 20, background: "#FFF5F5", border: "1px solid #FED7D7", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#C53030", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚠️</span> {error}
        </div>
      )}
      {message && (
        <div style={{ marginBottom: 20, background: "#F0FFF4", border: "1px solid #C6F6D5", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#276749", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>✅</span> {message}
        </div>
      )}

      <form
        action="/auth/sign-in"
        method="POST"
        onSubmit={() => setLoading(true)}
        style={{ display: "flex", flexDirection: "column", gap: 18 }}
      >
        {/* Email */}
        <div>
          <label htmlFor="email" style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9699B0", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Email Address
          </label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9699B0", display: "flex", pointerEvents: "none" }}>
              <Mail size={16} />
            </span>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] py-3 text-[13.5px] text-[#2D3436] outline-none transition-all focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20"
              style={{ paddingLeft: 40, paddingRight: 16 }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <label htmlFor="password" style={{ fontSize: 11, fontWeight: 700, color: "#9699B0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Password
            </label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "#00B4C8", textDecoration: "none", fontWeight: 600 }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9699B0", display: "flex", pointerEvents: "none" }}>
              <Lock size={16} />
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] py-3 text-[13.5px] text-[#2D3436] outline-none transition-all focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20"
              style={{ paddingLeft: 40, paddingRight: 44 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                borderRadius: 6,
                color: showPassword ? "#00B4C8" : "#9699B0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 4,
            width: "100%",
            padding: "13px 0",
            borderRadius: 12,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: 0.3,
            background: loading
              ? "linear-gradient(135deg, #9699B0, #C4C7DB)"
              : "linear-gradient(135deg, #00C4D8 0%, #00B4C8 50%, #0090A8 100%)",
            boxShadow: loading ? "none" : "0 6px 20px rgba(0,180,200,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 20px" }}>
        <div style={{ flex: 1, height: 1, background: "#E2E4F0" }} />
        <span style={{ fontSize: 11, color: "#C4C7DB", fontWeight: 600 }}>RANGAYAN KITAAB</span>
        <div style={{ flex: 1, height: 1, background: "#E2E4F0" }} />
      </div>

      <p style={{ textAlign: "center", fontSize: 13, color: "#9699B0", margin: 0 }}>
        Don&apos;t have an account?{" "}
        <Link href="/signup" style={{ color: "#00B4C8", fontWeight: 700, textDecoration: "none" }}>
          Sign Up
        </Link>
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
