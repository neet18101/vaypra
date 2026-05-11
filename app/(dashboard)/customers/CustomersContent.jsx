"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Award,
  Star,
  Shield,
  Heart,
  MessageSquare,
  Eye,
  X,
  Upload,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import CSVImportModal from "@/app/components/CSVImportModal";
import { createClient } from "@/utils/supabase/client";

const tierConfig = [
  { name: "Platinum", color: "#6C5CE7", Icon: Award },
  { name: "Gold", color: "#F39C12", Icon: Star },
  { name: "Silver", color: "#9699B0", Icon: Shield },
  { name: "Bronze", color: "#E17055", Icon: Heart },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CustomersContent({ customers }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    balance: "",
    loyalty_tier: "Silver",
    total_orders: "",
  });

  // Count tiers from actual data only - no fallbacks
  const tierCounts = tierConfig.map((tier) => {
    return customers.filter(
      (c) => c.loyalty === tier.name || c.loyalty_tier === tier.name
    ).length;
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("customers").insert({
        user_id: user.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        balance: Number(form.balance),
        loyalty_tier: form.loyalty_tier,
        total_orders: Number(form.total_orders),
      });
      setShowModal(false);
      setForm({ name: "", phone: "", email: "", balance: "", loyalty_tier: "Silver", total_orders: "" });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleCSVImport = async (rows) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const mapped = rows.map(r => ({
      user_id: user.id,
      name: r.name || "",
      phone: r.phone || "",
      email: r.email || "",
      balance: parseFloat(r.balance) || 0,
      loyalty_tier: r.loyalty_tier || "Bronze",
      total_orders: parseInt(r.total_orders) || 0,
    }));
    const { error } = await supabase.from("customers").insert(mapped);
    if (error) throw new Error(error.message);
    router.refresh();
    return mapped.length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2D3436]">Customers & CRM</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:shadow-lg transition-shadow"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Loyalty Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {tierConfig.map((tier, idx) => (
          <Card key={tier.name} className="flex flex-col items-center py-6">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${tier.color}18` }}
            >
              <tier.Icon size={22} style={{ color: tier.color }} />
            </div>
            <span className="text-3xl font-bold text-[#2D3436]">
              {tierCounts[idx]}
            </span>
            <span className="text-xs text-[#6C6F87] mt-1">
              {tier.name} Members
            </span>
          </Card>
        ))}
      </div>

      {/* Customers Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Phone
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Balance
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Loyalty
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Orders
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer, i) => {
                const hue = i * 60;
                const initial = (customer.name || "?")[0].toUpperCase();
                return (
                  <tr
                    key={customer.id || i}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{
                            background: `hsl(${hue}, 60%, 55%)`,
                          }}
                        >
                          {initial}
                        </div>
                        <span className="font-medium text-[#2D3436]">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#6C6F87]">
                      {customer.phone || "-"}
                    </td>
                    <td className="py-3 px-4 text-[#6C6F87]">
                      {customer.email || "-"}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2D3436]">
                      {formatCurrency(customer.balance || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={customer.loyalty || customer.loyalty_tier || "Silver"}
                      />
                    </td>
                    <td className="py-3 px-4 text-[#6C6F87]">
                      {customer.orders ?? customer.total_orders ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6C6F87] transition-colors">
                          <MessageSquare size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6C6F87] transition-colors">
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {customers.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[#6C6F87]"
                  >
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white max-w-lg w-full rounded-2xl p-6 mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#2D3436]">Add Customer</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-4">
                {/* Name - full width */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Customer name"
                    className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Email
                  </label>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>

                {/* Balance */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Balance
                  </label>
                  <input
                    name="balance"
                    type="number"
                    value={form.balance}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>

                {/* Total Orders */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Total Orders
                  </label>
                  <input
                    name="total_orders"
                    type="number"
                    value={form.total_orders}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                  />
                </div>

                {/* Loyalty Tier - full width */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Loyalty Tier
                  </label>
                  <select
                    name="loyalty_tier"
                    value={form.loyalty_tier}
                    onChange={handleChange}
                    className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                  >
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Customer"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <CSVImportModal
        show={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImport={handleCSVImport}
        columns={["name", "phone", "email", "balance", "loyalty_tier", "total_orders"]}
        templateName="customers"
      />
    </motion.div>
  );
}
