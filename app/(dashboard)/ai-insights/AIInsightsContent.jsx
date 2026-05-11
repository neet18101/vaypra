"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Users,
  Target,
  Brain,
} from "lucide-react";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";

const insights = [
  {
    title: "Revenue Prediction",
    icon: TrendingUp,
    color: "#6C5CE7",
    description: "Expected 18% growth next month based on current sales trends and seasonal patterns.",
  },
  {
    title: "Stock Alert",
    icon: AlertCircle,
    color: "#E17055",
    description: "JBL Flip 6 and Canon PIXMA G3000 will run out of stock within 5 days at current sell rate.",
  },
  {
    title: "Churn Risk",
    icon: Users,
    color: "#FDCB6E",
    description: "3 Gold customers haven't ordered in 30+ days. Consider sending a personalized offer.",
  },
  {
    title: "Price Optimization",
    icon: Target,
    color: "#00CEC9",
    description: "Boat Rockerz 450 can be priced ₹200 higher without affecting demand based on market analysis.",
  },
];

export default function AIInsightsContent() {
  const [query, setQuery] = useState("");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <Sparkles size={24} className="text-[#6C5CE7]" />
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          AI-Powered Insights
        </h1>
      </div>
      <p className="text-[13px] text-gray-500 mb-6">
        Smart predictions and recommendations for your business
      </p>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                {/* Decorative circle */}
                <div
                  className="absolute top-[-20px] right-[-20px] w-[80px] h-[80px] rounded-full"
                  style={{ background: `${insight.color}14` }}
                />

                <div className="flex flex-row items-start gap-4">
                  {/* Icon box */}
                  <div
                    className="flex items-center justify-center w-[48px] h-[48px] min-w-[48px] rounded-xl"
                    style={{ background: `${insight.color}1F` }}
                  >
                    <Icon size={22} style={{ color: insight.color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                      {insight.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    <button
                      className="text-[13px] font-medium px-3 py-1.5 rounded-lg border transition-colors"
                      style={{
                        color: insight.color,
                        borderColor: `${insight.color}40`,
                      }}
                    >
                      Take Action →
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Ask AI Section */}
      <Card>
        <SectionTitle icon={Brain} title="Ask AI About Your Business" />

        <div
          className="flex flex-col items-center justify-center py-8 px-6 rounded-xl"
          style={{
            background: "#F8F9FE",
            border: "2px dashed #E2E4F0",
          }}
        >
          <Brain size={32} className="text-[#A29BFE] mb-3" />
          <p className="text-[14px] text-gray-500 mb-4 text-center">
            Ask anything about your sales, customers, or inventory
          </p>

          <div className="flex items-center gap-2 w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What's my best selling product this month?"
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E4F0] bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7]"
            />
            <button className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white shadow-md hover:shadow-lg transition-shadow">
              <Sparkles size={18} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
