"use client";

import { ShoppingBag, Eye, Target, IndianRupee, Store, ShoppingCart } from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import SectionTitle from "@/app/components/SectionTitle";

const stats = [
  { label: "Online Orders", value: "324", icon: ShoppingBag, color: "#6C5CE7" },
  { label: "Visitors Today", value: "1,208", icon: Eye, color: "#00CEC9" },
  { label: "Conversion Rate", value: "3.8%", icon: Target, color: "#FD79A8" },
  { label: "Avg Order Value", value: "\u20B92,340", icon: IndianRupee, color: "#FDCB6E" },
];

const storeStatus = [
  { label: "Store URL", value: "shop.bizflowpro.in" },
  { label: "Payment Gateway", value: "Razorpay" },
  { label: "Shipping Partner", value: "Delhivery" },
  { label: "WhatsApp Orders", value: "Enabled" },
];

const recentOrders = [
  { id: "#ORD-501", customer: "Ankit J.", amount: "\u20B94,599", status: "paid" },
  { id: "#ORD-500", customer: "Meena R.", amount: "\u20B912,999", status: "pending" },
  { id: "#ORD-499", customer: "Suresh K.", amount: "\u20B92,998", status: "paid" },
  { id: "#ORD-498", customer: "Divya P.", amount: "\u20B98,450", status: "paid" },
];

export default function EcommerceContent() {
  return (
    <div>
      {/* Header */}
      <h1 className="text-[24px] font-extrabold font-[var(--font-display)] mb-6">
        Online Store
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="flex flex-col items-center justify-center text-center py-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}20` }}
              >
                <Icon size={24} style={{ color: stat.color }} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Store Status */}
        <Card>
          <SectionTitle icon={Store} title="Store Status" />
          <div className="flex flex-col gap-3">
            {storeStatus.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-[10px] px-4 py-3"
                style={{ background: "#F8F9FE" }}
              >
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Online Orders */}
        <Card>
          <SectionTitle icon={ShoppingCart} title="Recent Online Orders" />
          <div className="flex flex-col gap-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-[10px] px-4 py-3"
                style={{ background: "#F8F9FE" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{order.id}</span>
                  <span className="text-sm text-gray-500">{order.customer}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{order.amount}</span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
