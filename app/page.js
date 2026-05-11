import Link from "next/link";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center" style={{ background: "#F4F5FB" }}>
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE]">
            <Zap size={32} color="#fff" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-[#2D3436] font-[var(--font-display)]">
            BizFlow<span className="text-[#A29BFE]">Pro</span>
          </h1>
          <p className="text-[#9699B0] mt-2 text-lg">Complete business management solution</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="rounded-[10px] px-8 py-3 text-white font-semibold text-[14px] no-underline"
            style={{
              background: "linear-gradient(135deg, #6C5CE7, #5A4BD1)",
              boxShadow: "0 4px 15px rgba(108,92,231,0.3)",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-[10px] px-8 py-3 text-[#6C5CE7] font-semibold text-[14px] border border-[#6C5CE7] hover:bg-[#6C5CE7]/5 no-underline"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
