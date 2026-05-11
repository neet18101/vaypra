"use client";

import { motion } from "framer-motion";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  PieChart,
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Target,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import SectionTitle from "@/app/components/SectionTitle";
import MiniChart from "@/app/components/charts/MiniChart";
import RevenueChart from "@/app/components/charts/RevenueChart";
import DonutChart from "@/app/components/charts/DonutChart";
import LifecycleTracker from "@/app/components/LifecycleTracker";

// Stat card definitions
const defaultStats = [
  {
    label: "Total Revenue",
    key: "totalRevenue",
    change: "+12.5%",
    up: true,
    icon: IndianRupee,
    color: "#6C5CE7",
    sparkline: [30, 45, 35, 55, 40, 60, 50, 70, 55, 75, 65, 80],
  },
  {
    label: "Total Orders",
    key: "totalOrders",
    change: "+8.3%",
    up: true,
    icon: ShoppingCart,
    color: "#00CEC9",
    sparkline: [20, 35, 45, 30, 55, 50, 65, 45, 70, 60, 75, 68],
  },
  {
    label: "Products Sold",
    key: "productsSold",
    change: "+15.7%",
    up: true,
    icon: Package,
    color: "#FD79A8",
    sparkline: [40, 55, 48, 62, 58, 72, 65, 78, 70, 85, 80, 90],
  },
  {
    label: "Active Customers",
    key: "activeCustomers",
    change: "-2.1%",
    up: false,
    icon: Users,
    color: "#FDCB6E",
    sparkline: [60, 55, 58, 52, 56, 50, 54, 48, 52, 46, 50, 47],
  },
];

// AI Insights data
const aiInsights = [
  {
    icon: TrendingUp,
    title: "Revenue Prediction",
    desc: "Expected 18% growth next month based on seasonal trends and current order pipeline.",
    color: "#6C5CE7",
  },
  {
    icon: AlertCircle,
    title: "Stock Alert",
    desc: "JBL Flip 6 and Canon PIXMA G3000 will run out in ~5 days. Reorder recommended.",
    color: "#E17055",
  },
];

export default function DashboardContent({ stats, recentTransactions, lifecycleCounts }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Greeting */}
      <div>
        <h1 className="text-[26px] font-extrabold m-0 font-[var(--font-display)]">
          Good Morning, User {"\uD83D\uDC4B"}
        </h1>
        <p className="text-sm m-0 mt-1" style={{ color: "#9699B0" }}>
          Here&apos;s what&apos;s happening with your business today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultStats.map((stat, i) => {
          const Icon = stat.icon;
          const value = stats[stat.key];

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium m-0" style={{ color: "#9699B0" }}>
                      {stat.label}
                    </p>
                    <h3 className="text-2xl font-extrabold mt-2 mb-1.5 font-[var(--font-display)]">
                      {value}
                    </h3>
                    <div className="flex items-center gap-1">
                      {stat.up ? (
                        <ArrowUpRight size={14} style={{ color: "#00B894" }} />
                      ) : (
                        <ArrowDownRight size={14} style={{ color: "#E17055" }} />
                      )}
                      <span
                        className="text-xs font-semibold"
                        style={{ color: stat.up ? "#00B894" : "#E17055" }}
                      >
                        {stat.change}
                      </span>
                      <span className="text-[11px]" style={{ color: "#9699B0" }}>
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${stat.color}15` }}
                  >
                    <Icon size={22} style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="mt-3">
                  <MiniChart data={stat.sparkline} color={stat.color} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Asset Lifecycle */}
      {lifecycleCounts && (
        <Card>
          <SectionTitle icon={Package} title="Asset Lifecycle Overview" />
          <LifecycleTracker counts={lifecycleCounts} />
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Card>
          <SectionTitle
            icon={BarChart3}
            title="Revenue Overview"
            action={
              <select
                className="border border-[#E2E4F0] rounded-lg px-3 py-1.5 text-xs outline-none font-[var(--font-body)]"
                style={{ color: "#6C6F87", background: "#F8F9FE" }}
              >
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            }
          />
          <RevenueChart />
        </Card>

        <Card>
          <SectionTitle icon={PieChart} title="Sales by Category" />
          <DonutChart
            segments={[
              { label: "Mobile", value: 45, color: "#6C5CE7" },
              { label: "Audio", value: 28, color: "#00CEC9" },
              { label: "Printer", value: 18, color: "#FD79A8" },
              { label: "Other", value: 9, color: "#FDCB6E" },
            ]}
          />
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <SectionTitle
          icon={Receipt}
          title="Recent Transactions"
          action={
            <button
              className="text-[13px] font-semibold bg-transparent border-none cursor-pointer font-[var(--font-body)]"
              style={{ color: "#6C5CE7" }}
            >
              View All &rarr;
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13.5px]">
            <thead>
              <tr className="border-b-2 border-[#F1F2F8]">
                {["Invoice", "Customer", "Amount", "Status", "Date", "Type"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2.5 font-semibold text-[11.5px] uppercase tracking-wide"
                    style={{ color: "#9699B0" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[#F4F5FB] hover:bg-[#F8F9FE] transition-colors"
                >
                  <td
                    className="px-3 py-3 font-semibold font-[var(--font-mono)] text-xs"
                    style={{ color: "#6C5CE7" }}
                  >
                    {t.id}
                  </td>
                  <td className="px-3 py-3 font-medium">{t.customer}</td>
                  <td className="px-3 py-3 font-bold">{t.amount}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="px-3 py-3" style={{ color: "#9699B0" }}>
                    {t.date}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                      style={{
                        background: t.type === "sale" ? "#E8F8F0" : "#EDE7F6",
                        color: t.type === "sale" ? "#00B894" : "#6C5CE7",
                      }}
                    >
                      {t.type === "sale" ? "\u2191 Sale" : "\u2193 Purchase"}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Quick Insights */}
      <Card>
        <SectionTitle icon={Sparkles} title="AI Quick Insights" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aiInsights.map((ins, i) => {
            const Icon = ins.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl flex gap-3 items-start"
                style={{
                  background: `${ins.color}08`,
                  border: `1px solid ${ins.color}20`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: `${ins.color}15` }}
                >
                  <Icon size={18} style={{ color: ins.color }} />
                </div>
                <div>
                  <div className="font-bold text-[13.5px] mb-1">{ins.title}</div>
                  <div className="text-[12.5px] leading-relaxed" style={{ color: "#6C6F87" }}>
                    {ins.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
