"use client";

export default function SectionTitle({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={20} className="text-primary" />}
        <h2 className="text-lg font-bold m-0 font-[var(--font-display)]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
