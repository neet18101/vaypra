"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee, ShoppingCart, Package, Users,
  ArrowUpRight, ArrowDownRight, Receipt, PieChart,
  BarChart3, Sparkles, TrendingUp, AlertCircle,
  FileText, Zap, Calendar, ChevronRight, Activity,
} from "lucide-react";
import Link from "next/link";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import SectionTitle from "@/app/components/SectionTitle";
import MiniChart from "@/app/components/charts/MiniChart";
import RevenueChart from "@/app/components/charts/RevenueChart";
import DonutChart from "@/app/components/charts/DonutChart";
import LifecycleTracker from "@/app/components/LifecycleTracker";

const defaultStats = [
  {
    label: "Total Revenue",
    key: "totalRevenue",
    change: "+12.5%",
    up: true,
    icon: IndianRupee,
    color: "#6C5CE7",
    gradient: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
    sparkline: [30, 45, 35, 55, 40, 60, 50, 70, 55, 75, 65, 80],
  },
  {
    label: "Total Orders",
    key: "totalOrders",
    change: "+8.3%",
    up: true,
    icon: ShoppingCart,
    color: "#00B4C8",
    gradient: "linear-gradient(135deg, #00B4C8, #67E8F9)",
    sparkline: [20, 35, 45, 30, 55, 50, 65, 45, 70, 60, 75, 68],
  },
  {
    label: "Products Sold",
    key: "productsSold",
    change: "+15.7%",
    up: true,
    icon: Package,
    color: "#F72585",
    gradient: "linear-gradient(135deg, #F72585, #FF85AD)",
    sparkline: [40, 55, 48, 62, 58, 72, 65, 78, 70, 85, 80, 90],
  },
  {
    label: "Active Customers",
    key: "activeCustomers",
    change: "-2.1%",
    up: false,
    icon: Users,
    color: "#FF7B24",
    gradient: "linear-gradient(135deg, #FF7B24, #FFAB76)",
    sparkline: [60, 55, 58, 52, 56, 50, 54, 48, 52, 46, 50, 47],
  },
];

const quickActions = [
  { label: "New Invoice", icon: FileText, href: "/invoices", color: "#6C5CE7" },
  { label: "Add Product", icon: Package, href: "/inventory", color: "#00B4C8" },
  { label: "Customers", icon: Users, href: "/customers", color: "#F72585" },
  { label: "AI Insights", icon: Zap, href: "/ai-insights", color: "#FF7B24" },
];

const aiInsights = [
  {
    icon: TrendingUp,
    title: "Revenue Prediction",
    desc: "Expected 18% growth next month based on seasonal trends and current order pipeline.",
    color: "#6C5CE7",
    badge: "High Confidence",
  },
  {
    icon: AlertCircle,
    title: "Stock Alert",
    desc: "JBL Flip 6 and Canon PIXMA G3000 will run out in ~5 days. Reorder recommended.",
    color: "#E17055",
    badge: "Action Needed",
  },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardContent({ stats, recentTransactions, lifecycleCounts }) {
  const [greeting, setGreeting] = useState("Good Morning");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
    setCurrentDate(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className="flex flex-col gap-5">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 md:p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6C5CE7 0%, #5A4BD1 55%, #00B4C8 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-[0.12]" style={{ background: "white" }} />
        <div className="absolute -bottom-12 right-24 w-32 h-32 rounded-full opacity-[0.08]" style={{ background: "white" }} />
        <div className="absolute top-4 right-48 w-20 h-20 rounded-full opacity-[0.06]" style={{ background: "white" }} />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/65 text-[12.5px] font-medium mb-1.5 flex items-center gap-1.5 m-0">
              <Calendar size={12} />
              {currentDate}
            </p>
            <h1 className="text-[22px] md:text-[28px] font-extrabold text-white m-0 font-[var(--font-display)] leading-tight">
              {greeting}, Rangayan! 👋
            </h1>
            <p className="text-white/65 text-[13px] mt-1.5 m-0">
              Here&apos;s an overview of your business today
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <Link key={qa.label} href={qa.href}>
                  <motion.div
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.94 }}
                    className="flex flex-col items-center gap-1.5 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
                    >
                      <Icon size={17} className="text-white" />
                    </div>
                    <span className="text-[10px] text-white/75 font-medium hidden sm:block leading-none">
                      {qa.label}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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
              <Card className="relative overflow-hidden hover:shadow-md transition-shadow duration-200 p-4 md:p-5">
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
                  style={{ background: stat.gradient }}
                />
                <div className="flex justify-between items-start mb-2.5">
                  <p className="text-[10.5px] font-semibold m-0 uppercase tracking-wider" style={{ color: "#9699B0" }}>
                    {stat.label}
                  </p>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${stat.color}14` }}
                  >
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                </div>
                <h3 className="text-[20px] md:text-[23px] font-extrabold mt-0 mb-2 font-[var(--font-display)] leading-none">
                  {value}
                </h3>
                <div className="flex items-center gap-1.5 mb-3">
                  <div
                    className="flex items-center gap-0.5 px-1.5 py-[3px] rounded-md text-[11px] font-bold"
                    style={{
                      background: stat.up ? "#00B89418" : "#E1705518",
                      color: stat.up ? "#00B894" : "#E17055",
                    }}
                  >
                    {stat.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {stat.change}
                  </div>
                  <span className="text-[11px]" style={{ color: "#9699B0" }}>vs last mo.</span>
                </div>
                <MiniChart data={stat.sparkline} color={stat.color} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <Card>
          <SectionTitle
            icon={BarChart3}
            title="Revenue Overview"
            action={
              <select
                className="border border-[#E2E4F0] rounded-lg px-2.5 py-1.5 text-xs outline-none font-[var(--font-body)] cursor-pointer"
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
              { label: "Audio", value: 28, color: "#00B4C8" },
              { label: "Printer", value: 18, color: "#F72585" },
              { label: "Other", value: 9, color: "#FF7B24" },
            ]}
          />
        </Card>
      </div>

      {/* Asset Lifecycle */}
      {lifecycleCounts && (
        <Card>
          <SectionTitle icon={Activity} title="Asset Lifecycle Overview" />
          <LifecycleTracker counts={lifecycleCounts} />
        </Card>
      )}

      {/* Transactions + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr] gap-4">
        {/* Recent Transactions */}
        <Card>
          <SectionTitle
            icon={Receipt}
            title="Recent Transactions"
            action={
              <Link href="/invoices">
                <button
                  className="text-[13px] font-semibold bg-transparent border-none cursor-pointer font-[var(--font-body)] flex items-center gap-0.5 hover:underline"
                  style={{ color: "#6C5CE7" }}
                >
                  View All <ChevronRight size={14} />
                </button>
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Invoice", "Customer", "Amount", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-2 font-semibold text-[10.5px] uppercase tracking-wider"
                      style={{ color: "#9699B0", background: "#F8F9FE" }}
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
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-[#F4F5FB] hover:bg-[#F8F9FE] transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-3 font-semibold font-[var(--font-mono)] text-[12px]" style={{ color: "#6C5CE7" }}>
                      {t.id}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg, #6C5CE7, #00B4C8)` }}
                        >
                          {(t.customer || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium truncate max-w-[90px]">{t.customer}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-bold">{t.amount}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-3 py-3 text-[12px]" style={{ color: "#9699B0" }}>
                      {t.date}
                    </td>
                  </motion.tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-10 text-center text-sm" style={{ color: "#9699B0" }}>
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* AI Insights */}
        <Card>
          <SectionTitle icon={Sparkles} title="AI Quick Insights" />
          <div className="flex flex-col gap-3">
            {aiInsights.map((ins, i) => {
              const Icon = ins.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="p-4 rounded-xl"
                  style={{ background: `${ins.color}07`, border: `1px solid ${ins.color}22` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${ins.color}18` }}
                    >
                      <Icon size={17} style={{ color: ins.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-[13.5px]">{ins.title}</span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                          style={{ background: `${ins.color}18`, color: ins.color }}
                        >
                          {ins.badge}
                        </span>
                      </div>
                      <p className="text-[12.5px] leading-relaxed m-0" style={{ color: "#6C6F87" }}>
                        {ins.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <Link href="/ai-insights">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="p-3.5 rounded-xl cursor-pointer text-center mt-1"
                style={{ background: "linear-gradient(135deg, #6C5CE710, #00B4C810)", border: "1px dashed #6C5CE735" }}
              >
                <span className="text-[13px] font-semibold" style={{ color: "#6C5CE7" }}>
                  View Full AI Analysis →
                </span>
              </motion.div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
