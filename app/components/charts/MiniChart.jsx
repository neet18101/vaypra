"use client";

export default function MiniChart({ data, color = "#6C5CE7", height = 38 }) {
  const points = data || [30, 45, 35, 55, 40, 60, 50, 70, 55, 75, 65, 80];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 200;
  const h = height;
  const pad = h * 0.1;

  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - pad - ((p - min) / range) * (h - pad * 2),
  }));

  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = path + ` L ${w} ${h} L 0 ${h} Z`;
  const gradId = `mg-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="overflow-visible block"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
