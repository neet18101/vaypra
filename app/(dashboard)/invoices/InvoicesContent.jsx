"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FileText, Download, Plus, Eye, Edit, Send, X, Upload } from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import CSVImportModal from "@/app/components/CSVImportModal";
import { createClient } from "@/utils/supabase/client";

const tabs = ["All", "Paid", "Pending", "Overdue"];

const defaultForm = {
  invoice_number: "",
  customer_name: "",
  amount: "",
  gst_percent: "18",
  status: "pending",
  type: "sale",
};

export default function InvoicesContent({ invoices }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });

  const filteredInvoices =
    activeTab === "All"
      ? invoices
      : invoices.filter(
          (inv) => inv.status?.toLowerCase() === activeTab.toLowerCase()
        );

  const getCount = (tab) => {
    if (tab === "All") return invoices.length;
    return invoices.filter(
      (inv) => inv.status?.toLowerCase() === tab.toLowerCase()
    ).length;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice_number: form.invoice_number,
          customer_name: form.customer_name,
          amount: parseFloat(form.amount),
          gst_amount: parseFloat(form.amount) * (parseFloat(form.gst_percent) / 100),
          status: form.status,
          type: form.type,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ ...defaultForm });
        startTransition(() => router.refresh());
      } else {
        const err = await res.json();
        alert("Failed to add invoice: " + err.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCSVImport = async (rows) => {
    const mapped = rows.map(r => ({
      invoice_number: r.invoice_number || "",
      customer_name: r.customer_name || "",
      amount: parseFloat(r.amount) || 0,
      gst_amount: parseFloat(r.gst_amount) || 0,
      status: r.status || "pending",
      type: r.type || "sale",
      date: new Date().toISOString(),
    }));
    for (const row of mapped) {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
    }
    startTransition(() => router.refresh());
    return mapped.length;
  };

  const inputClass =
    "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] text-[13.5px] px-4 py-2.5 outline-none focus:border-[#6C5CE7] transition-colors";
  const labelClass = "block text-xs font-medium text-[#9699B0] mb-1.5";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          Invoices &amp; Billing
        </h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
          <button onClick={() => setShowCSVModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus size={16} />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-6" style={{ background: "#F4F5FB" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab
                  ? "bg-[#6C5CE7] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {getCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  GST
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice, index) => (
                <motion.tr
                  key={invoice.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-sm font-semibold" style={{ color: "#6C5CE7" }}>
                      {invoice.invoice_number || invoice.id}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-700">
                    {invoice.customer_name}
                  </td>
                  <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-600">
                    {formatCurrency(invoice.gst_amount || 0)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="py-3.5 px-4 text-sm text-gray-500">
                    {formatDate(invoice.date)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                        <Eye size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                        <Edit size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                        <Send size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    <FileText size={32} className="mx-auto mb-2 opacity-50" />
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-xl mx-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Create Invoice</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Invoice Number */}
                <div>
                  <label className={labelClass}>Invoice Number</label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={form.invoice_number}
                    onChange={handleChange}
                    required
                    placeholder="INV-001"
                    className={inputClass}
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className={labelClass}>Customer Name</label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    required
                    placeholder="Customer name"
                    className={inputClass}
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className={labelClass}>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                {/* GST % */}
                <div>
                  <label className={labelClass}>GST %</label>
                  <input
                    type="number"
                    name="gst_percent"
                    value={form.gst_percent}
                    onChange={handleChange}
                    placeholder="18"
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="sale">Sale</option>
                    <option value="purchase">Purchase</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Invoice"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImportModal
        show={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImport={handleCSVImport}
        columns={["invoice_number", "customer_name", "amount", "gst_amount", "status", "type"]}
        templateName="invoices"
      />
    </div>
  );
}
