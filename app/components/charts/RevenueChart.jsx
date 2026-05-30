"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const values = [45, 62, 58, 73, 68, 82, 79, 91, 85, 95, 88, 100];
const currentMonth = new Date().getMonth();

export default function RevenueChart() {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...values);

  return (
    <div className="flex items-end gap-1 sm:gap-1.5 h-44 px-1">
      {months.map((m, i) => {
        const isActive = i === currentMonth;
        const isHovered = hovered === i;
        const barH = Math.max((values[i] / max) * 148, 6);
        const showLabel = isActive || isHovered;

        return (
          <div
            key={m}
            className="flex-1 flex flex-col items-center gap-1 cursor-pointer select-none"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="h-5 flex items-end justify-center">
              {showLabel && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[9px] font-bold px-1 py-0.5 rounded text-white leading-none"
                  style={{ background: isActive ? "#6C5CE7" : "#9699B0" }}
                >
                  {values[i]}
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${barH}px` }}
              transition={{ delay: i * 0.04, duration: 0.45, ease: "easeOut" }}
              className="w-full rounded-md min-h-[4px]"
              style={{
                background: isActive
                  ? "linear-gradient(180deg, #6C5CE7, #A29BFE)"
                  : isHovered
                  ? "linear-gradient(180deg, #9699B0, #C4C7DB)"
                  : "linear-gradient(180deg, #D8DAF0, #EDEEF7)",
                opacity: hovered !== null && !isHovered && !isActive ? 0.55 : 1,
                transition: "opacity 0.15s, background 0.15s",
              }}
            />

            <span
              className="text-[9px] sm:text-[10px] font-medium"
              style={{ color: isActive ? "#6C5CE7" : "#B0B3C8" }}
            >
              {m}
            </span>
          </div>
        );
      })}
    </div>
  );
}
