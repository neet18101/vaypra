"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) { setError(updateError.message); setLoading(false); return; }

    await supabase.auth.signOut();
    router.replace("/login?message=" + encodeURIComponent("Password updated — please sign in"));
  }

  const inp = "w-full rounded-xl border border-[#E2E4F0] bg-[#F8F9FE] px-4 py-3 text-[13.5px] text-[#2D3436] outline-none transition-colors focus:border-[#00B4C8] focus:ring-2 focus:ring-[#00B4C8]/20";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4F5FB]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-[#E2E4F0]">

        <div className="flex flex-col items-center gap-3 mb-7">
          <img src="/logo.png" alt="Rangayan Creations" style={{ height: 64, objectFit: "contain" }} />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-[#2D3436] font-[var(--font-display)]">
              New Password
            </h1>
            <p className="text-sm text-[#9699B0] mt-1">Choose a strong password</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#9699B0] mb-1.5 uppercase tracking-wide">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9699B0] hover:text-[#00B4C8] transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#9699B0] mb-1.5 uppercase tracking-wide">
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
            className="w-full rounded-xl py-3 text-white font-bold text-[14px] disabled:opacity-60 transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #00B4C8, #0090A8)",
              boxShadow: "0 4px 16px rgba(0,180,200,0.35)",
            }}
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
