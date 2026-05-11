"use client";

import { motion } from "framer-motion";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const values = [45, 62, 58, 73, 68, 82, 79, 91, 85, 95, 88, 100];

export default function RevenueChart() {
  const max = Math.max(...values);

  return (
    <div className="flex items-end gap-2 h-40 px-2">
      {months.map((m, i) => (
        <div key={m} className="flex-1 flex flex-col items-center gap-1.5">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(values[i] / max) * 130}px` }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            className="w-full rounded-md min-h-[4px]"
            style={{
              background:
                i === 11
                  ? "linear-gradient(180deg, #6C5CE7, #A29BFE)"
                  : "linear-gradient(180deg, #E2E4F0, #F1F2F8)",
            }}
          />
          <span className="text-[10px] text-gray-400 font-medium">{m}</span>
        </div>
      ))}
    </div>
  );
}
