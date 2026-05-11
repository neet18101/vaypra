"use client";

const config = {
  paid: { bg: "#E8F8F0", color: "#00B894", label: "Paid" },
  pending: { bg: "#FEF5E7", color: "#F39C12", label: "Pending" },
  overdue: { bg: "#FDECEA", color: "#E17055", label: "Overdue" },
  "in-stock": { bg: "#E8F8F0", color: "#00B894", label: "In Stock" },
  "low-stock": { bg: "#FEF5E7", color: "#F39C12", label: "Low Stock" },
  "out-of-stock": { bg: "#FDECEA", color: "#E17055", label: "Out of Stock" },
  dispatched: { bg: "#EDE7F6", color: "#6C5CE7", label: "Dispatched" },
  delivered: { bg: "#E0F7FA", color: "#0097A7", label: "Delivered" },
  installed: { bg: "#E8F8F0", color: "#00B894", label: "Installed" },
  "in-transit": { bg: "#FEF5E7", color: "#F39C12", label: "In Transit" },
  completed: { bg: "#E8F8F0", color: "#00B894", label: "Completed" },
  warranty: { bg: "#FEF5E7", color: "#F39C12", label: "Warranty" },
  issue: { bg: "#FDECEA", color: "#E17055", label: "Issue" },
  active: { bg: "#E8F8F0", color: "#00B894", label: "Active" },
  maintenance: { bg: "#FEF5E7", color: "#F39C12", label: "Maintenance" },
  "on-track": { bg: "#E8F8F0", color: "#00B894", label: "On Track" },
  Gold: { bg: "#FFF8E1", color: "#F39C12", label: "Gold" },
  Silver: { bg: "#F1F2F8", color: "#6C6F87", label: "Silver" },
  Platinum: { bg: "#EDE7F6", color: "#6C5CE7", label: "Platinum" },
  Bronze: { bg: "#FBE9E7", color: "#E17055", label: "Bronze" },
};

export default function StatusBadge({ status }) {
  const c = config[status] || { bg: "#F1F2F8", color: "#6C6F87", label: status };
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}
