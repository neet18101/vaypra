"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { Plus, MapPin, X, Pencil } from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";

const gradientColors = [
  "from-[#6C5CE7]/20 to-[#8B5CF6]/5",
  "from-[#00CEC9]/20 to-[#00B894]/5",
  "from-[#FD79A8]/20 to-[#E84393]/5",
  "from-[#FDCB6E]/20 to-[#F39C12]/5",
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const emptyForm = {
  name: "",
  manager: "",
  address: "",
  revenue: "",
  orders: "",
  status: "active",
};

export default function BranchesContent({ branches }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (branch) => {
    setEditingId(branch.id);
    setForm({ name: branch.name, manager: branch.manager || "", address: branch.address || "", revenue: branch.revenue || "", orders: branch.orders || "", status: branch.status || "active" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: form.name, manager: form.manager, address: form.address, revenue: Number(form.revenue) || 0, orders: Number(form.orders) || 0, status: form.status };
      const res = await fetch(editingId ? `/api/branches/${editingId}` : "/api/branches", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Failed to save branch: " + err.error);
        return;
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      startTransition(() => router.refresh());
    } catch (err) {
      console.error("Failed to save branch:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          Multi-Branch Management
        </h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={16} />
          Add Branch
        </button>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {branches.map((branch, index) => (
          <motion.div
            key={branch.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              {/* Decorative gradient corner */}
              <div
                className={`absolute top-0 right-0 w-[120px] h-[120px] bg-gradient-to-bl ${gradientColors[index % gradientColors.length]} rounded-bl-full pointer-events-none`}
              />

              {/* Branch Info */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={18} className="text-[#6C5CE7]" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {branch.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 ml-[26px]">
                      {branch.manager}
                    </p>
                    {branch.address
                      ? <p className="text-xs text-gray-400 ml-[26px] mt-0.5">{branch.address}</p>
                      : <p className="text-xs text-orange-400 ml-[26px] mt-0.5 cursor-pointer" onClick={() => openEdit(branch)}>⚠ No address — click Edit to add</p>
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(branch)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#6C5CE7] transition-colors"><Pencil size={14} /></button>
                    <StatusBadge status={branch.status} />
                  </div>
                </div>

                {/* Stats Sub-Grid */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="rounded-[10px] p-4" style={{ background: "#F8F9FE" }}>
                    <p className="text-xs text-gray-500 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(branch.revenue || 0)}
                    </p>
                  </div>
                  <div className="rounded-[10px] p-4" style={{ background: "#F8F9FE" }}>
                    <p className="text-xs text-gray-500 mb-1">Orders</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(branch.orders || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {branches.length === 0 && (
          <div className="col-span-2 text-center py-12 text-gray-400 text-sm">
            <MapPin size={32} className="mx-auto mb-2 opacity-50" />
            No branches found
          </div>
        )}
      </div>

      {/* Add / Edit Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white max-w-lg w-full mx-4 rounded-2xl p-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#2D3436]">
                {editingId ? "Edit Branch" : "Add Branch"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm); setEditingId(null); }}
                className="text-[#9699B0] hover:text-[#2D3436] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Branch Name - full width */}
              <div>
                <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                  Branch Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                  placeholder="Enter branch name"
                />
              </div>

              {/* Manager - full width */}
              <div>
                <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                  Manager
                </label>
                <input
                  type="text"
                  name="manager"
                  value={form.manager}
                  onChange={handleChange}
                  className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                  placeholder="Enter manager name"
                />
              </div>

              {/* Address - full width */}
              <div>
                <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                  placeholder="Enter branch address"
                />
              </div>

              {/* Revenue & Orders - side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Revenue
                  </label>
                  <input
                    type="number"
                    name="revenue"
                    value={form.revenue}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                    Orders
                  </label>
                  <input
                    type="number"
                    name="orders"
                    value={form.orders}
                    onChange={handleChange}
                    className="bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] w-full outline-none focus:border-[#6C5CE7]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status - full width */}
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
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowModal(false); setForm(emptyForm); setEditingId(null); }}
                className="border border-[#E2E4F0] rounded-[10px] px-5 py-2.5 text-sm text-[#6C6F87] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] text-white rounded-[10px] px-5 py-2.5 text-sm font-semibold hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
