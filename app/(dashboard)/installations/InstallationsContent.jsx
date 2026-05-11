"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, Monitor, Calendar, User, Key, ChevronDown, ChevronUp, Plus, Search, X, Printer,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import InstallationModal, { printInstallation } from "@/app/components/InstallationModal";
import { TEMPLATES, getBrandTheme } from "@/app/components/PrintTemplates";
import { HpInstallPrintView } from "@/app/components/HpInstallReport";
import { createClient } from "@/utils/supabase/client";

export default function InstallationsContent({ installations, products, branches }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [printMenuId, setPrintMenuId] = useState(null);
  const [hpPrintValues, setHpPrintValues] = useState(null);

  const totalInstallations = installations.length;

  const thisMonthCount = installations.filter((inst) => {
    if (!inst.installation_date) return false;
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

  const deliveredProducts = products.filter((p) => p.status === "delivered");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          Installations
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={16} />
          Record Installation
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, serial number, or customer..."
            className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
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
        <Card>
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Installer
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallations.map((installation, index) => {
                  const isExpanded = expandedRow === installation.id;
                  const branchName =
                    branches.find((b) => b.id === installation.branch_id)?.name || "Unknown";
                  const cf = installation.custom_fields || {};
                  const cfKeys = Object.keys(cf);

                  return (
                    <React.Fragment key={installation.id || index}>
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
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
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {installation.customer_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {installation.installer_name}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {formatDate(installation.installation_date)}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-gray-600">
                          {branchName}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={installation.status} />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const isPC = installation.products?.category?.toLowerCase() === "pc";
                                if (isPC) {
                                  const cf = installation.custom_fields || {};
                                  const isoDate = installation.installation_date
                                    ? installation.installation_date.split("T")[0]
                                    : "";
                                  setHpPrintValues({
                                    customer_name: installation.customer_name || "",
                                    mc_serial: installation.products?.serial_number || "",
                                    model_no: installation.products?.name || "",
                                    device_brand: installation.products?.brand || "",
                                    install_date: isoDate,
                                    win_key: installation.windows_key || "",
                                    office_key: installation.ms_office_key || "",
                                    av_key: installation.antivirus_key || "",
                                    eng_name: installation.installer_name || "",
                                    eng_code: cf.eng_code || "",
                                    address: cf.address || "",
                                    state: cf.state || "",
                                    pin: cf.pin || "",
                                    tel_no: cf.tel_no || "",
                                    email: cf.email || "",
                                    contact_person: cf.contact_person || "",
                                    proc_ram_ssd: cf.proc_ram_ssd || "",
                                    win_version: cf.win_version || "",
                                    office_version: cf.office_version || "",
                                    av_name: cf.av_name || "",
                                    av_validity: cf.av_validity || "",
                                  });
                                } else {
                                  setPrintMenuId(installation.id);
                                }
                              }}
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

      {/* HP Installation Report (PC category) */}
      {hpPrintValues && (
        <HpInstallPrintView
          initialValues={hpPrintValues}
          onClose={() => setHpPrintValues(null)}
        />
      )}

      {/* Installation Modal */}
      {showModal && (
        <InstallationModal
          show={showModal}
          onClose={() => setShowModal(false)}
          products={products}
          branches={branches}
        />
      )}
    </div>
  );
}
