"use client";

import React, { useState, startTransition  } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, Monitor, Calendar, User, Key, ChevronDown, ChevronUp, Plus, Search, X,
  Printer, Eye, Trash2, Zap, ScanLine, Copy, Network,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import InstallationModal, { printInstallation } from "@/app/components/InstallationModal";
import { TEMPLATES, getBrandTheme } from "@/app/components/PrintTemplates";
import { createClient } from "@/utils/supabase/client";

// DB stores "PhotoCopy", UI uses "Photocopier"
const normalizeCategory = (cat) => cat === "PhotoCopy" ? "Photocopier" : (cat || "");

const TABS = [
  { id: "PC",                     label: "PC",                     icon: Monitor, color: "#6C5CE7" },
  { id: "Single Printer",         label: "Single Printer",         icon: Printer, color: "#00CEC9" },
  { id: "Multi-Function Printer", label: "Multi-Function Printer", icon: Printer, color: "#0984E3" },
  { id: "UPS",                    label: "UPS",                    icon: Zap,     color: "#FDCB6E" },
  { id: "Scanner",                label: "Scanner",                icon: ScanLine,color: "#00B894" },
  { id: "Photocopier",              label: "Photocopier",              icon: Copy,    color: "#E17055" },
];

export default function InstallationsContent({ installations, products, branches }) {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("PC");
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [printMenuId, setPrintMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [visualizerPcId, setVisualizerPcId] = useState(null);

  const handleDelete = async (installation) => {
    if (!confirm(`Delete installation for "${installation.products?.name || "this product"}"? This cannot be undone.`)) return;
    setDeletingId(installation.id);
    try {
      await supabase.from("installations").delete().eq("id", installation.id);
      await supabase.from("products").update({ status: "delivered" }).eq("id", installation.product_id);
      startTransition(() => router.refresh());
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getLinkedDevices = (pcId) =>
    installations.filter((i) => i.custom_fields?.linked_pc_installation_id === pcId);

  const DEVICE_META = {
    "UPS":                    { icon: Zap,      color: "#FDCB6E", bg: "#FEF5E7" },
    "Single Printer":         { icon: Printer,  color: "#00CEC9", bg: "#E0F7FA" },
    "Multi-Function Printer": { icon: Printer,  color: "#0984E3", bg: "#E3F2FD" },
    "Scanner":                { icon: ScanLine, color: "#00B894", bg: "#E0F5F1" },
    "Photocopier":            { icon: Copy,     color: "#E17055", bg: "#FDE8E4" },
  };

  const REPORT_CATEGORIES = new Set(["pc", "single printer", "multi-function printer", "scanner", "photocopier"]);

  const handlePrintClick = (installation) => {
    const cat = normalizeCategory(installation.products?.category).toLowerCase();
    if (REPORT_CATEGORIES.has(cat)) {
      router.push(`/installations/${installation.id}`);
    } else {
      setPrintMenuId(installation.id);
    }
  };

  const totalInstallations = installations.filter((i) => TABS.some((t) => t.id === normalizeCategory(i.products?.category))).length;

  const thisMonthCount = installations.filter((inst) => {
    if (!inst.installation_date) return false;
    if (!TABS.some((t) => t.id === normalizeCategory(inst.products?.category))) return false;
    const d = new Date(inst.installation_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const pendingInstallCount = products.filter((p) => p.status === "delivered").length;

  const stats = [
    { label: "Total Installations", value: totalInstallations, icon: Wrench, color: "#6C5CE7", bg: "#EDE7F6" },
    { label: "This Month", value: thisMonthCount, icon: Calendar, color: "#00CEC9", bg: "#E0F7FA" },
    { label: "Pending Install", value: pendingInstallCount, icon: Monitor, color: "#FDCB6E", bg: "#FEF5E7" },
  ];

  const formatDate = (date) => {
    if (!date) return "\u2014";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredInstallations = installations.filter((inst) => {
    if (normalizeCategory(inst.products?.category) !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const productName = inst.products?.name || "";
    const serialNumber = inst.products?.serial_number || "";
    const customerName = inst.customer_name || "";
    return (
      productName.toLowerCase().includes(q) ||
      serialNumber.toLowerCase().includes(q) ||
      customerName.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] sm:text-[24px] font-extrabold font-[var(--font-display)]">
          Installations
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={16} />
          Record Installation
        </button>
      </div>

      {/* Quick Stats — horizontal scroll on mobile */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[160px] sm:w-auto"
          >
            <Card className="flex items-center gap-3 py-3 px-3 sm:px-4 h-full">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: stat.bg }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-[11px] sm:text-sm text-gray-500 leading-tight">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs — scrollable, bigger touch targets on mobile */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = installations.filter((i) => normalizeCategory(i.products?.category) === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(""); setExpandedRow(null); }}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-semibold whitespace-nowrap transition-all min-h-[42px] ${
                isActive ? "text-white shadow-md" : "bg-white border border-[#E2E4F0] text-gray-600"
              }`}
              style={isActive ? { background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)` } : {}}
            >
              <tab.icon size={14} style={isActive ? {} : { color: tab.color }} />
              {tab.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/30 text-white" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, serial, department…"
            className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Installations Table */}
      {filteredInstallations.length === 0 ? (
        <Card className="py-12 text-center">
          <Wrench size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-400">
            {searchQuery ? "No installations match your search" : "No installations recorded yet"}
          </p>
        </Card>
      ) : (
        <>
          {/* ── Mobile cards ── */}
          <div className="md:hidden space-y-3 pb-24">
            {filteredInstallations.map((installation, idx) => {
              const isExpanded = expandedRow === installation.id;
              const branchName = branches.find((b) => b.id === installation.branch_id)?.name || "";
              const cf = installation.custom_fields || {};
              const dept = cf.department_name || cf.linked_pc_dept || installation.customer_name || "—";
              return (
                <motion.div
                  key={installation.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.25) }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.99] transition-transform"
                >
                  {/* Card header — tap to view report */}
                  <button
                    className="w-full text-left p-4"
                    onClick={() => router.push(`/installations/${installation.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#2D3436] text-[14px] truncate">{installation.products?.name || "Unknown"}</div>
                        <div className="font-mono text-[12px] text-[#6C5CE7] mt-0.5">{installation.products?.serial_number || "—"}</div>
                      </div>
                      <StatusBadge status={installation.status} />
                    </div>
                    <div className="text-[12px] text-gray-500 truncate">{dept}</div>
                    <div className="flex items-center gap-4 mt-2 text-[12px] text-gray-500">
                      {installation.installation_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {formatDate(installation.installation_date)}
                        </span>
                      )}
                      {installation.installer_name && (
                        <span className="flex items-center gap-1">
                          <User size={11} />
                          {installation.installer_name}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Expanded keys */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#F8F9FE] px-4 py-3 border-t border-gray-100 space-y-2">
                          {installation.windows_key && (
                            <div className="text-[12px]">
                              <span className="text-gray-400 text-[11px]">Windows Key</span>
                              <div className="font-mono text-[#2D3436] break-all mt-0.5">{installation.windows_key}</div>
                            </div>
                          )}
                          {installation.ms_office_key && (
                            <div className="text-[12px]">
                              <span className="text-gray-400 text-[11px]">MS Office Key</span>
                              <div className="font-mono text-[#2D3436] break-all mt-0.5">{installation.ms_office_key}</div>
                            </div>
                          )}
                          {installation.antivirus_key && (
                            <div className="text-[12px]">
                              <span className="text-gray-400 text-[11px]">Antivirus Key</span>
                              <div className="font-mono text-[#2D3436] break-all mt-0.5">{installation.antivirus_key}</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Action row — large tap targets */}
                  <div className="flex border-t border-gray-100">
                    <button
                      onClick={() => router.push(`/installations/${installation.id}`)}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-500 active:bg-gray-50 transition-colors"
                    >
                      <Eye size={16} className="text-[#6C5CE7]" />
                      <span className="text-[11px] font-medium">View</span>
                    </button>
                    <button
                      onClick={() => handlePrintClick(installation)}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-500 active:bg-gray-50 transition-colors border-l border-gray-100"
                    >
                      <Printer size={16} className="text-[#00CEC9]" />
                      <span className="text-[11px] font-medium">Print</span>
                    </button>
                    {activeTab === "PC" && (() => {
                      const count = getLinkedDevices(installation.id).length;
                      return (
                        <button
                          onClick={() => setVisualizerPcId(installation.id)}
                          className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-500 active:bg-indigo-50 transition-colors border-l border-gray-100 relative"
                        >
                          <div className="relative">
                            <Network size={16} className="text-[#6C5CE7]" />
                            {count > 0 && (
                              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#6C5CE7] text-white text-[8px] font-bold flex items-center justify-center">
                                {count}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium">Links</span>
                        </button>
                      );
                    })()}
                    <button
                      onClick={() => setExpandedRow(isExpanded ? null : installation.id)}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-500 active:bg-gray-50 transition-colors border-l border-gray-100"
                    >
                      {isExpanded ? <ChevronUp size={16} className="text-[#FDCB6E]" /> : <Key size={16} className="text-[#FDCB6E]" />}
                      <span className="text-[11px] font-medium">{isExpanded ? "Less" : "Keys"}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(installation)}
                      disabled={deletingId === installation.id}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-3 text-gray-500 active:bg-red-50 transition-colors border-l border-gray-100 disabled:opacity-40"
                    >
                      <Trash2 size={16} className="text-[#E17055]" />
                      <span className="text-[11px] font-medium">Delete</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Desktop table ── */}
        <Card className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Serial No.
                  </th>
                  {/* <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Installer
                  </th> */}
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Recorded By
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallations.map((installation, index) => {
                  const isExpanded = expandedRow === installation.id;
                  const cf = installation.custom_fields || {};
                  const cfKeys = Object.keys(cf);
                  // Linked devices (UPS, printers, etc.) inherit the department of
                  // the PC they're attached to, stored as linked_pc_dept.
                  const department = cf.department_name || cf.linked_pc_dept || installation.customer_name || "—";

                  return (
                    <React.Fragment key={installation.id || index}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.25) }}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            {installation.products?.name || "Unknown"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-sm text-gray-500">
                            {installation.products?.serial_number || "\u2014"}
                          </span>
                        </td>
                        {/* <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {installation.customer_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {installation.installer_name}
                        </td> */}
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {formatDate(installation.installation_date)}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {department}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={installation.status} />
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {installation.installer_name || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => router.push(`/installations/${installation.id}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors"
                              title="View report"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handlePrintClick(installation)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors"
                              title="Print report"
                            >
                              <Printer size={16} />
                            </button>
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : installation.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors"
                              title="View license keys"
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            {activeTab === "PC" && (() => {
                              const count = getLinkedDevices(installation.id).length;
                              return (
                                <button
                                  onClick={() => setVisualizerPcId(installation.id)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors relative"
                                  title="View connected devices"
                                >
                                  <Network size={16} />
                                  {count > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#6C5CE7] text-white text-[8px] font-bold flex items-center justify-center">
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            })()}
                            <button
                              onClick={() => handleDelete(installation)}
                              disabled={deletingId === installation.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Delete installation"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <AnimatePresence>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-[#F8F9FE] rounded-lg p-4 mt-2 mx-4 mb-4">
                                  {/* License Keys */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                      <span className="text-[11px] text-gray-500 block mb-1 flex items-center gap-1">
                                        <Key size={11} />
                                        Windows Key
                                      </span>
                                      <span className="font-mono text-[13px] text-[#2D3436]">
                                        {installation.windows_key || "\u2014"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-gray-500 block mb-1 flex items-center gap-1">
                                        <Key size={11} />
                                        MS Office Key
                                      </span>
                                      <span className="font-mono text-[13px] text-[#2D3436]">
                                        {installation.ms_office_key || "\u2014"}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[11px] text-gray-500 block mb-1 flex items-center gap-1">
                                        <Key size={11} />
                                        Antivirus Key
                                      </span>
                                      <span className="font-mono text-[13px] text-[#2D3436]">
                                        {installation.antivirus_key || "\u2014"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Custom Fields */}
                                  {cfKeys.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
                                      {cfKeys.map((k) => (
                                        <div key={k}>
                                          <span className="text-[11px] text-gray-500 block mb-1 flex items-center gap-1">
                                            <Key size={11} />
                                            {k}
                                          </span>
                                          <span className="font-mono text-[13px] text-[#2D3436]">
                                            {cf[k] || "\u2014"}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Notes */}
                                  {installation.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <span className="text-[11px] text-gray-500 block mb-1">Notes</span>
                                      <p className="text-[13px] text-[#2D3436]">{installation.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      )}

      {/* Print Template Picker Overlay */}
      <AnimatePresence>
        {printMenuId && (() => {
          const inst = installations.find((i) => i.id === printMenuId);
          if (!inst) return null;
          const brand = inst.products?.brand || "";
          const theme = getBrandTheme(brand);
          return (
            <motion.div
              key="print-picker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
              onClick={() => setPrintMenuId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl p-5 w-[360px] mx-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#2D3436]">Print Installation</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {inst.products?.name || "Unknown"}
                      {inst.products?.serial_number ? ` — SN: ${inst.products.serial_number}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => setPrintMenuId(null)}
                    className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Select Template
                </div>
                <div className="space-y-2">
                  {TEMPLATES.map((tpl) => {
                    const tplTheme = tpl.id === "brand" ? theme : null;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => {
                          setPrintMenuId(null);
                          printInstallation(inst, branches, tpl.id);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#E2E4F0] hover:border-[#6C5CE7] hover:bg-[#F8F9FE] transition-all text-left"
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            background: tpl.id === "brand" ? theme.secondary : tpl.id === "standard" ? "#EDE7F6" : "#F4F5FB",
                          }}
                        >
                          {tpl.id === "brand" && (
                            <div className="w-4 h-4 rounded" style={{ background: theme.primary }} />
                          )}
                          {tpl.id === "standard" && <Printer size={16} className="text-[#6C5CE7]" />}
                          {tpl.id === "compact" && <Printer size={14} className="text-gray-500" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-semibold text-[#2D3436]">
                            {tpl.name}
                            {tpl.id === "brand" && brand && (
                              <span
                                className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: theme.secondary, color: theme.primary }}
                              >
                                {brand}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">{tpl.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── Mobile FAB ── */}
      <button
        onClick={() => setShowModal(true)}
        className="sm:hidden fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#8B5CF6] text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Record Installation"
      >
        <Plus size={24} />
      </button>

      {/* Installation Modal */}
      {showModal && (
        <InstallationModal
          show={showModal}
          onClose={() => setShowModal(false)}
          products={products}
          branches={branches}
          installations={installations}
          category={activeTab}
        />
      )}

      {/* ── PC Visualizer Modal ── */}
      <AnimatePresence>
        {visualizerPcId && (() => {
          const pc = installations.find((i) => i.id === visualizerPcId);
          if (!pc) return null;
          const linked = getLinkedDevices(visualizerPcId);
          return (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setVisualizerPcId(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-[#EDE7F6] flex items-center justify-center flex-shrink-0">
                    <Network size={18} className="text-[#6C5CE7]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[#2D3436] truncate">
                      {pc.products?.name || "PC"}
                    </div>
                    <div className="text-[11px] text-gray-400 font-mono">
                      {pc.products?.serial_number || "—"}
                      {pc.custom_fields?.department_name ? ` · ${pc.custom_fields.department_name}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => setVisualizerPcId(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 flex-shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Connected devices */}
                <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
                  {linked.length === 0 ? (
                    <div className="text-center py-8">
                      <Network size={28} className="mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-400">No devices linked to this PC</p>
                      <p className="text-xs text-gray-300 mt-1">Link devices when recording UPS / Printer / Scanner installations</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Connected Devices ({linked.length})
                      </p>
                      {linked.map((device) => {
                        const cat  = device.products?.category || "";
                        const meta = DEVICE_META[cat] || { icon: Wrench, color: "#9699B0", bg: "#F4F5FB" };
                        const Icon = meta.icon;
                        return (
                          <div
                            key={device.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                            onClick={() => { setVisualizerPcId(null); router.push(`/installations/${device.id}`); }}
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: meta.bg }}
                            >
                              <Icon size={16} style={{ color: meta.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-[#2D3436] truncate">
                                {device.products?.name || cat || "Device"}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {device.products?.serial_number && (
                                  <span className="font-mono text-[11px] text-[#6C5CE7]">
                                    {device.products.serial_number}
                                  </span>
                                )}
                                {device.products?.brand && (
                                  <span className="text-[11px] text-gray-400">{device.products.brand}</span>
                                )}
                                <span
                                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                  style={{ background: meta.bg, color: meta.color }}
                                >
                                  {cat}
                                </span>
                              </div>
                            </div>
                            <Eye size={14} className="text-gray-300 flex-shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
