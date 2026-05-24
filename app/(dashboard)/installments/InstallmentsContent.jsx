"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import {
  Plus,
  HandCoins,
  BadgeIndianRupee,
  AlertCircle,
  X,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const emptyForm = {
  customer_name: "",
  total_amount: "",
  paid_amount: "",
  total_emis: "",
  paid_emis: "",
  next_due_date: "",
  status: "on-track",
};

export default function InstallmentsContent({ installments }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalAmount = Number(form.total_amount) || 0;
      const paidAmount = Number(form.paid_amount) || 0;
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.customer_name,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          remaining: totalAmount - paidAmount,
          total_emis: Number(form.total_emis) || 0,
          paid_emis: Number(form.paid_emis) || 0,
          next_due_date: form.next_due_date || null,
          status: form.status,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Failed to add installment plan: " + err.error);
        return;
      }
      setShowModal(false);
      setForm(emptyForm);
      router.refresh();
    } catch (err) {
      console.error("Failed to create installment plan:", err);
    } finally {
      setSaving(false);
    }
  };

  // Calculate summary from actual data
  const totalReceivable = installments.reduce(
    (sum, row) => sum + (row.total_amount || 0),
    0
  );
  const collected = installments.reduce(
    (sum, row) => sum + (row.paid_amount || row.paid || 0),
    0
  );
  const overdue = installments
    .filter((row) => row.status === "overdue")
    .reduce(
      (sum, row) =>
        sum + ((row.total_amount || 0) - (row.paid_amount || row.paid || 0)),
      0
    );

  const summaryCards = [
    {
      label: "Total Receivable",
      value: totalReceivable,
      color: "#6C5CE7",
      Icon: HandCoins,
    },
    {
      label: "Collected",
      value: collected,
      color: "#00B894",
      Icon: BadgeIndianRupee,
    },
    {
      label: "Overdue",
      value: overdue,
      color: "#E17055",
      Icon: AlertCircle,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#2D3436]">
          Installment Reports
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#8E7CF8] hover:shadow-lg transition-shadow"
        >
          <Plus size={16} />
          New Installment Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summaryCards.map((card) => (
          <Card key={card.label} className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${card.color}18` }}
            >
              <card.Icon size={22} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-xs text-[#6C6F87]">{card.label}</p>
              <p className="text-xl font-bold text-[#2D3436]">
                {formatCurrency(card.value)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Installments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Paid
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Remaining
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  EMIs
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Next Due
                </th>
                <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6C6F87] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {installments.map((row, i) => {
                const paid = row.paid_amount || row.paid || 0;
                const total = row.total_amount || 0;
                const remaining = total - paid;
                const totalEmis = row.total_emis || row.emis || 0;
                const paidEmis = row.paid_emis || 0;

                return (
                  <tr
                    key={row.id || i}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-[#2D3436]">
                      {row.customer_name || row.customer || "-"}
                    </td>
                    <td className="py-3 px-4 text-[#2D3436]">
                      {formatCurrency(total)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#00B894]">
                      {formatCurrency(paid)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#E17055]">
                      {formatCurrency(remaining)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: totalEmis }).map((_, idx) => (
                            <span
                              key={idx}
                              className="inline-block w-2 h-2 rounded-full"
                              style={{
                                background:
                                  idx < paidEmis ? "#00B894" : "#E2E4F0",
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-[#6C6F87]">
                          {paidEmis}/{totalEmis}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#6C6F87]">
                      {formatDate(row.next_due_date)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={row.status || "pending"} />
                    </td>
                  </tr>
                );
              })}
              {installments.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-[#6C6F87]"
                  >
                    No installment plans found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Installment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white max-w-lg w-full mx-4 rounded-2xl p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2D3436]">
                New Installment Plan
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                }}
                className="text-[#9699B0] hover:text-[#2D3436] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Customer Name - full width */}
              <div>
                <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                  placeholder="Enter customer name"
                />
              </div>

              {/* Total Amount & Paid Amount - side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    name="total_amount"
                    value={form.total_amount}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Paid Amount
                  </label>
                  <input
                    type="number"
                    name="paid_amount"
                    value={form.paid_amount}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Total EMIs & Paid EMIs - side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Total EMIs
                  </label>
                  <input
                    type="number"
                    name="total_emis"
                    value={form.total_emis}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Paid EMIs
                  </label>
                  <input
                    type="number"
                    name="paid_emis"
                    value={form.paid_emis}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Next Due Date & Status - side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    name="next_due_date"
                    value={form.next_due_date}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                  >
                    <option value="on-track">On Track</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setForm(emptyForm);
                }}
                className="border border-[#E2E4F0] rounded-[10px] px-5 py-2.5 text-sm text-[#6C6F87] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
