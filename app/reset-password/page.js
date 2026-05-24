"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sign out so user logs in fresh with new password
    await supabase.auth.signOut();
    router.replace("/login?message=" + encodeURIComponent("Password updated — please sign in"));
  }

  const inp =
    "w-full rounded-[10px] border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-2.5 text-[13.5px] outline-none focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]";

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
              New Password
            </h1>
            <p className="text-sm text-[#9699B0] mt-1">Choose a strong password</p>
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inp + " pr-10"}
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9699B0] hover:text-[#6C5CE7]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              className={inp}
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] py-2.5 text-white font-semibold text-[14px] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)",
              boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
            }}
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
