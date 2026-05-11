"use client";

import { motion } from "framer-motion";
import { Package, Truck, MapPin, Wrench, ArrowRight } from "lucide-react";

const stages = [
  { key: "in-stock", label: "In Stock", icon: Package, color: "#6C5CE7", bg: "#EDE7F6" },
  { key: "dispatched", label: "Dispatched", icon: Truck, color: "#F39C12", bg: "#FEF5E7" },
  { key: "delivered", label: "Delivered", icon: MapPin, color: "#0097A7", bg: "#E0F7FA" },
  { key: "installed", label: "Installed", icon: Wrench, color: "#00B894", bg: "#E8F8F0" },
];

export default function LifecycleTracker({ counts }) {
  const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;

  return (
    <div className="flex items-center justify-between gap-2">
      {stages.map((stage, i) => {
        const Icon = stage.icon;
        const count = counts[stage.key] || 0;
        const pct = Math.round((count / total) * 100);

        return (
          <div key={stage.key} className="flex items-center gap-2 flex-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex-1 rounded-xl p-4 text-center"
              style={{ background: stage.bg }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: `${stage.color}20` }}
              >
                <Icon size={20} style={{ color: stage.color }} />
              </div>
              <div className="text-2xl font-extrabold" style={{ color: stage.color }}>
                {count}
              </div>
              <div className="text-[11px] font-semibold text-gray-500 mt-0.5">
                {stage.label}
              </div>
              <div
                className="mt-2 mx-auto h-1.5 rounded-full overflow-hidden"
                style={{ background: `${stage.color}15`, width: "80%" }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                  className="h-full rounded-full"
                  style={{ background: stage.color }}
                />
              </div>
            </motion.div>
            {i < stages.length - 1 && (
              <ArrowRight size={16} className="text-gray-300 flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
