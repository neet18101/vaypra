"use client";

export default function Card({ children, className = "", style, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)] border border-gray-200 ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}
