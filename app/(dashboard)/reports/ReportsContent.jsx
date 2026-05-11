"use client";

import { motion } from "framer-motion";
import {
  FileBarChart,
  ClipboardList,
  TrendingUp,
  Layers,
  Package,
  Users,
  Activity,
  PieChart,
} from "lucide-react";
import Card from "@/app/components/Card";

const reports = [
  {
    title: "GSTR-1 Report",
    icon: FileBarChart,
    color: "#6C5CE7",
    description: "Outward supplies return",
  },
  {
    title: "GSTR-3B Summary",
    icon: ClipboardList,
    color: "#00CEC9",
    description: "Monthly summary return",
  },
  {
    title: "Profit & Loss",
    icon: TrendingUp,
    color: "#00B894",
    description: "Income vs expenses analysis",
  },
  {
    title: "Balance Sheet",
    icon: Layers,
    color: "#FD79A8",
    description: "Assets, liabilities & equity",
  },
  {
    title: "Stock Report",
    icon: Package,
    color: "#FDCB6E",
    description: "Current inventory valuation",
  },
  {
    title: "Party Ledger",
    icon: Users,
    color: "#E17055",
    description: "Customer/supplier balances",
  },
  {
    title: "Cash Flow",
    icon: Activity,
    color: "#6C5CE7",
    description: "Money in vs money out",
  },
  {
    title: "Sales by Category",
    icon: PieChart,
    color: "#00CEC9",
    description: "Revenue breakdown",
  },
];

export default function ReportsContent() {
  return (
    <div>
      {/* Header */}
      <h1 className="text-[24px] font-extrabold font-[var(--font-display)] mb-6">
        Reports &amp; GST
      </h1>

      {/* Reports Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
              className="rounded-2xl"
            >
              <Card className="flex flex-col items-center text-center cursor-pointer h-full">
                {/* Icon Circle */}
                <div
                  className="flex items-center justify-center w-[52px] h-[52px] rounded-2xl mb-3"
                  style={{ background: `${report.color}1F` }}
                >
                  <Icon size={24} style={{ color: report.color }} />
                </div>

                {/* Title */}
                <h3 className="text-[14px] font-bold text-gray-900 mb-1">
                  {report.title}
                </h3>

                {/* Description */}
                <p className="text-[12px] text-gray-500">
                  {report.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
