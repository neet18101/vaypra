"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Package, MapPin, Calendar, ChevronDown, ChevronUp, Check, Plus, X, Phone,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import DispatchModal from "@/app/components/DispatchModal";
import { createClient } from "@/utils/supabase/client";

export default function DispatchesContent({ dispatches, branches, products }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const totalDispatches = dispatches.length;
  const inTransitCount = dispatches.filter((d) => d.status === "in-transit").length;
  const deliveredCount = dispatches.filter((d) => d.status === "delivered").length;

  const stats = [
    { label: "Total Dispatches", value: totalDispatches, icon: Truck, color: "#6C5CE7", bg: "#EDE7F6" },
    { label: "In Transit", value: inTransitCount, icon: Package, color: "#FDCB6E", bg: "#FEF5E7" },
    { label: "Delivered", value: deliveredCount, icon: Check, color: "#00B894", bg: "#E8F8F0" },
  ];

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleMarkDelivered = async (dispatch) => {
    setMarkingId(dispatch.id);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();

      // Update dispatch status and delivered_date
      await supabase
        .from("dispatches")
        .update({ status: "delivered", delivered_date: now })
        .eq("id", dispatch.id);

      // Update all dispatch_items status to delivered
      if (dispatch.dispatch_items && dispatch.dispatch_items.length > 0) {
        const itemIds = dispatch.dispatch_items.map((item) => item.id);
        await supabase
          .from("dispatch_items")
          .update({ status: "delivered" })
          .in("id", itemIds);

        // Update all associated products status to delivered
        const productIds = dispatch.dispatch_items
          .map((item) => item.product_id)
          .filter(Boolean);
        if (productIds.length > 0) {
          await supabase
            .from("products")
            .update({ status: "delivered" })
            .in("id", productIds);
        }
      }

      startTransition(() => router.refresh());
    } finally {
      setMarkingId(null);
    }
  };

  const inStockProducts = products.filter((p) => p.status === "in-stock");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          Dispatches
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={16} />
          New Dispatch
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: stat.bg }}
              >
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dispatches List */}
      {dispatches.length === 0 ? (
        <Card className="py-12 text-center">
          <Truck size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">No dispatches yet</p>
        </Card>
      ) : (
        <div>
          {dispatches.map((dispatch, index) => {
            const isExpanded = expandedId === dispatch.id;
            const branchName =
              branches.find((b) => b.id === dispatch.branch_id)?.name || "Unknown";
            const items = dispatch.dispatch_items || [];

            return (
              <motion.div
                key={dispatch.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-4"
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-wrap">
                      {/* Dispatch number */}
                      <span className="text-sm font-bold text-gray-900">
                        {dispatch.dispatch_number}
                      </span>

                      {/* Branch */}
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {branchName}
                      </span>

                      {/* Date */}
                      <span className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(dispatch.dispatch_date)}
                      </span>

                      {/* Dispatched by */}
                      {dispatch.dispatched_by && (
                        <span className="text-sm text-gray-500">
                          by {dispatch.dispatched_by}
                          {dispatch.dispatched_by_mobile && (
                            <span className="inline-flex items-center gap-0.5 ml-1.5 text-gray-400">
                              <Phone size={11} />
                              {dispatch.dispatched_by_mobile}
                            </span>
                          )}
                        </span>
                      )}

                      {/* Status */}
                      <StatusBadge status={dispatch.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mark as Delivered */}
                      {dispatch.status === "in-transit" && (
                        <button
                          onClick={() => handleMarkDelivered(dispatch)}
                          disabled={markingId === dispatch.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00B894] bg-[#E8F8F0] hover:bg-[#D0F0E0] transition-colors disabled:opacity-50"
                        >
                          <Check size={14} />
                          {markingId === dispatch.id ? "Updating..." : "Mark as Delivered"}
                        </button>
                      )}

                      {/* Expand/Collapse */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : dispatch.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {items.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No items in this dispatch</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-100">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Product
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      SKU
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Serial No.
                                    </th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((item) => {
                                    const product = item.products;
                                    return (
                                      <tr
                                        key={item.id}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                      >
                                        <td className="py-2.5 px-3 text-sm font-medium text-gray-900">
                                          {product?.name || "—"}
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="font-mono text-sm text-gray-500">
                                            {product?.sku || "—"}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <span className="font-mono text-sm text-gray-500">
                                            {product?.serial_number || "—"}
                                          </span>
                                        </td>
                                        <td className="py-2.5 px-3">
                                          <StatusBadge status={item.status} />
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dispatch Modal */}
      <DispatchModal
        show={showModal}
        onClose={() => setShowModal(false)}
        branches={branches}
        products={inStockProducts}
      />
    </div>
  );
}
