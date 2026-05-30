"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Phone, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import ProductSelector from "./ProductSelector";

const inputClass =
  "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

export default function DispatchModal({
  show,
  onClose,
  products,
  branches: initialBranches,
  preSelectedIds,
}) {
  const router = useRouter();
  const supabase = createClient();

  const [selectedIds, setSelectedIds] = useState(preSelectedIds || []);
  const [branches, setBranches] = useState(initialBranches || []);
  const [dispatchNumber, setDispatchNumber] = useState("");
  const [branchId, setBranchId] = useState("");
  const [dispatchedByName, setDispatchedByName] = useState("");
  const [dispatchedByMobile, setDispatchedByMobile] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inline branch creation
  const [showNewBranch, setShowNewBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [addingBranch, setAddingBranch] = useState(false);

  const selectedProducts =
    products?.filter((p) => selectedIds.includes(p.id)) || [];

  const handleClose = () => {
    onClose();
  };

  const handleAddBranch = async () => {
    if (!newBranchName.trim()) return;
    setAddingBranch(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: branchProfile } = await supabase.from("profiles").select("current_organization_id").eq("id", user.id).single();
      const branchOrgId = branchProfile?.current_organization_id;

      const { data: newBranch, error } = await supabase
        .from("branches")
        .insert({ name: newBranchName.trim(), organization_id: branchOrgId })
        .select()
        .single();

      if (error) throw error;

      setBranches([...branches, newBranch]);
      setBranchId(newBranch.id);
      setNewBranchName("");
      setShowNewBranch(false);
    } catch (err) {
      console.error("Failed to add branch:", err);
      alert("Failed to add branch: " + err.message);
    } finally {
      setAddingBranch(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedIds.length ||
      !dispatchNumber ||
      !branchId ||
      !dispatchedByName.trim()
    )
      return;
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: dispProfile } = await supabase.from("profiles").select("current_organization_id").eq("id", user.id).single();
      const dispOrgId = dispProfile?.current_organization_id;

      // 1. Insert dispatch
      const { data: dispatch, error: dispatchError } = await supabase
        .from("dispatches")
        .insert({
          organization_id: dispOrgId,
          dispatch_number: dispatchNumber,
          dispatched_by: dispatchedByName.trim(),
          dispatched_by_mobile: dispatchedByMobile.trim() || null,
          branch_id: branchId,
          notes,
          status: "in-transit",
          dispatch_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (dispatchError) throw dispatchError;

      // 2. Insert dispatch items
      const dispatchItems = selectedIds.map((productId) => ({
        organization_id: dispOrgId,
        dispatch_id: dispatch.id,
        product_id: productId,
        status: "dispatched",
      }));

      const { error: itemsError } = await supabase
        .from("dispatch_items")
        .insert(dispatchItems);

      if (itemsError) throw itemsError;

      // 3. Update each product status
      for (const productId of selectedIds) {
        await supabase
          .from("products")
          .update({ status: "dispatched", stock: 0 })
          .eq("id", productId);
      }

      startTransition(() => router.refresh());
      handleClose();
    } catch (err) {
      console.error("Dispatch creation failed:", err);
      alert("Failed to create dispatch: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-2xl w-full rounded-2xl p-6 mx-4 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[var(--font-display)]">
              Create Dispatch
            </h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Product selection or summary */}
          {!preSelectedIds ? (
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                Select Products
              </label>
              <ProductSelector
                products={products}
                selectedIds={selectedIds}
                onToggle={(id) =>
                  setSelectedIds((prev) =>
                    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                  )
                }
                onToggleAll={(ids, selectAll) => {
                  const idSet = new Set(ids);
                  setSelectedIds((prev) =>
                    selectAll
                      ? [...new Set([...prev, ...ids])]
                      : prev.filter((i) => !idSet.has(i))
                  );
                }}
              />
            </div>
          ) : (
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                Selected Products ({selectedProducts.length})
              </label>
              <div className="border border-[#E2E4F0] rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-[#F8F9FE]">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-[#6C6F87]">
                        Name
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-[#6C6F87]">
                        SKU
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-[#6C6F87]">
                        Serial Number
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-t border-[#F1F2F8]"
                      >
                        <td className="py-2 px-3 text-gray-700">
                          {product.name}
                        </td>
                        <td className="py-2 px-3 text-gray-700">
                          {product.sku}
                        </td>
                        <td className="py-2 px-3 text-gray-700">
                          {product.serial_number || "\u2014"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dispatch Number */}
            <div>
              <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                Dispatch Number
              </label>
              <input
                type="text"
                value={dispatchNumber}
                onChange={(e) => setDispatchNumber(e.target.value)}
                placeholder="e.g. DSP-2026-001"
                className={inputClass}
                required
              />
            </div>

            {/* Destination Branch — with inline "Add New" */}
            <div>
              <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                Destination Branch
              </label>
              {!showNewBranch ? (
                <div className="flex items-center gap-2">
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className={inputClass + " flex-1"}
                    required
                  >
                    <option value="">Select a branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewBranch(true)}
                    className="flex items-center gap-1 px-3 py-2.5 rounded-[10px] bg-[#EDE7F6] text-[#6C5CE7] text-xs font-semibold hover:bg-[#E0D7F8] transition-colors whitespace-nowrap"
                  >
                    <Plus size={14} />
                    Add New
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="Branch name (e.g. Lucknow Office)"
                    className={inputClass + " flex-1"}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBranch();
                      }
                      if (e.key === "Escape") {
                        setShowNewBranch(false);
                        setNewBranchName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddBranch}
                    disabled={addingBranch || !newBranchName.trim()}
                    className="px-3 py-2.5 rounded-[10px] bg-[#6C5CE7] text-white text-xs font-semibold hover:bg-[#5A4BD1] transition-colors disabled:opacity-50"
                  >
                    {addingBranch ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewBranch(false);
                      setNewBranchName("");
                    }}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Dispatched By — Name & Mobile */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                  Dispatched By (Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dispatchedByName}
                    onChange={(e) => setDispatchedByName(e.target.value)}
                    placeholder="Person name"
                    className={inputClass + " pl-10"}
                    required
                  />
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={dispatchedByMobile}
                    onChange={(e) => setDispatchedByMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={inputClass + " pl-10"}
                  />
                  <Phone
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[13px] font-semibold text-[#2D3436] mb-1.5">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={3}
                className={inputClass + " resize-none"}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                submitting ||
                !selectedIds.length ||
                !dispatchNumber ||
                !branchId ||
                !dispatchedByName.trim()
              }
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : `Dispatch ${selectedIds.length} Product${selectedIds.length !== 1 ? "s" : ""}`}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
