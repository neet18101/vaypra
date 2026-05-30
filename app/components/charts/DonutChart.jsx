"use client";

import { useState } from "react";

export default function DonutChart({ segments }) {
  const [hovered, setHovered] = useState(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumulative = 0;
  const size = 148;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F2F8"
          strokeWidth={stroke}
        />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const offset = (cumulative / total) * circumference;
          cumulative += seg.value;
          const isHov = hovered === i;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={isHov ? stroke + 3 : stroke}
              strokeDasharray={`${pct * circumference - 2} ${circumference}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: "stroke-width 0.2s", cursor: "pointer" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
        {hovered !== null ? (
          <>
            <text x="50%" y="46%" textAnchor="middle" fontSize="9" fontFamily="var(--font-body)" fill="#9699B0">
              {segments[hovered].label}
            </text>
            <text x="50%" y="63%" textAnchor="middle" fontSize="18" fontWeight="800" fill={segments[hovered].color} fontFamily="var(--font-display)">
              {Math.round((segments[hovered].value / total) * 100)}%
            </text>
          </>
        ) : (
          <>
            <text x="50%" y="46%" textAnchor="middle" fontSize="9" fontFamily="var(--font-body)" fill="#9699B0">
              Total
            </text>
            <text x="50%" y="63%" textAnchor="middle" fontSize="19" fontWeight="800" fill="#2D3436" fontFamily="var(--font-display)">
              {total}
            </text>
          </>
        )}
      </svg>

      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex items-center gap-2 cursor-pointer rounded-lg px-1 py-0.5 transition-colors"
            style={{ background: hovered === i ? `${seg.color}10` : "transparent" }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="text-[12px] flex-1" style={{ color: "#6C6F87" }}>{seg.label}</span>
            <span className="text-[12px] font-bold" style={{ color: "#2D3436" }}>
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
