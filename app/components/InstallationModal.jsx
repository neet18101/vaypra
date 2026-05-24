"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Search, Check, Printer, Monitor, FileText, LayoutTemplate, ScanLine,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  TEMPLATES, getBrandTheme, normalizeData,
  generatePrintHtml, openPrintWindow,
} from "./PrintTemplates";
import BarcodeScanner from "./BarcodeScanner";

const inputClass =
  "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

const labelClass = "block text-xs font-medium text-[#9699B0] mb-1.5";

export default function InstallationModal({ show, onClose, products, branches, category = "PC" }) {
  const router = useRouter();
  const supabase = createClient();

  // Search state
  const [snQuery, setSnQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchRef = useRef(null);

  // Form state
  const [customFields, setCustomFields] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Post-save state
  const [savedInstallation, setSavedInstallation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("brand");

  // Scanner state
  const [showScanner, setShowScanner] = useState(false);

  const availableProducts =
    category === "PC"
      ? (products?.filter((p) => p.category === "PC" && p.status !== "installed") || [])
      : (products?.filter((p) => p.category === category && p.status !== "installed") || []);

  const filteredProducts = snQuery.trim()
    ? availableProducts.filter((p) => {
        const q = snQuery.toLowerCase();
        return (p.serial_number || "").toLowerCase().includes(q) ||
               (p.name || "").toLowerCase().includes(q) ||
               (p.custom_fields?.name_of_user || "").toLowerCase().includes(q) ||
               (p.custom_fields?.department_name || "").toLowerCase().includes(q);
      })
    : availableProducts;

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setSnQuery(product.serial_number || product.name);
    setShowSuggestions(false);
    if (product.brand) setSelectedTemplate("brand");
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setSnQuery("");
  };

  const handleAddCustomField = () =>
    setCustomFields([...customFields, { name: "", value: "" }]);

  const handleRemoveCustomField = (index) =>
    setCustomFields(customFields.filter((_, i) => i !== index));

  const handleCustomFieldChange = (index, field, val) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: val };
    setCustomFields(updated);
  };

  const handleScan = (rawValue) => {
    setShowScanner(false);
    setSnQuery(rawValue);
    setShowSuggestions(true);
    // Auto-select if there's an exact serial match
    const exact = availableProducts.find(
      (p) => (p.serial_number || "").toLowerCase() === rawValue.toLowerCase()
    );
    if (exact) selectProduct(exact);
  };

  const resetForm = () => {
    setSnQuery("");
    setSelectedProduct(null);
    setCustomFields([]);
    setSavedInstallation(null);
    setSelectedTemplate("brand");
    setShowScanner(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Get organization_id (migration 001 replaced user_id with organization_id)
      const { data: profile } = await supabase
        .from("profiles")
        .select("current_organization_id")
        .eq("id", user.id)
        .single();
      const orgId = profile?.current_organization_id;

      // Auto-read license keys stored on the product
      const pcf = selectedProduct.custom_fields || {};
      const winKey = pcf.windows_key || pcf.Windows_Key || pcf.window_key || null;
      const offKey = pcf.ms_office_key || pcf.MS_Office_Key || pcf.office_key || pcf.Office_Key || null;
      const avKey  = pcf.antivirus_serial_key || pcf.antivirus_key || pcf.Antivirus_Key || pcf.antivirus || null;

      // Build custom_fields: PC metadata first, then user-added fields
      const mergedCF = {};
      if (category === "PC") {
        const PC_CF_KEYS = [
          "department_name", "address", "name_of_user", "room_no", "mobile_no", "email_id",
          "windows_version", "ms_office_version", "antivirus_name", "antivirus_validity",
          "antivirus_batchnumber", "warranty_period", "warranty_expiry_date",
        ];
        PC_CF_KEYS.forEach((k) => { if (pcf[k]) mergedCF[k] = pcf[k]; });
      }
      const validFields = customFields.filter((f) => f.name.trim() && f.value.trim());
      validFields.forEach((f) => { mergedCF[f.name.trim()] = f.value.trim(); });
      const customFieldsObj = Object.keys(mergedCF).length > 0 ? mergedCF : null;

      const branchId =
        selectedProduct?.branch_id ||
        selectedProduct?.dispatch?.branch_id ||
        null;

      const { data: instData, error: installError } = await supabase
        .from("installations")
        .insert({
          organization_id: orgId,
          product_id: selectedProduct.id,
          branch_id: branchId,
          installation_date: new Date().toISOString().split("T")[0],
          windows_key:    winKey,
          ms_office_key:  offKey,
          antivirus_key:  avKey,
          custom_fields: customFieldsObj,
          status: "completed",
        })
        .select()
        .single();

      if (installError) throw installError;

      await supabase.from("products").update({ status: "installed" }).eq("id", selectedProduct.id);
      await supabase.from("dispatch_items").update({ status: "installed" }).eq("product_id", selectedProduct.id);

      setSavedInstallation({
        ...instData,
        productName: selectedProduct.name,
        productBrand: selectedProduct.brand || "",
        productCategory: selectedProduct.category || "",
        serialNumber: selectedProduct.serial_number || "",
        branchName: branches?.find((b) => b.id === branchId)?.name || "",
      });

      router.refresh();
    } catch (err) {
      console.error("Installation recording failed:", err);
      alert("Failed to record installation: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!savedInstallation) return;
    const html = generatePrintHtml(selectedTemplate, normalizeData(savedInstallation));
    openPrintWindow(html);
  };

  if (!show) return null;

  // BarcodeScanner renders full-screen over everything
  if (showScanner) {
    return <BarcodeScanner onDetected={handleScan} onClose={() => setShowScanner(false)} />;
  }

  // ===== Success View =====
  if (savedInstallation) {
    const d = savedInstallation;
    const isPC = d.productCategory?.toLowerCase() === "pc";
    const brandTheme = getBrandTheme(d.productBrand);

    return (
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-lg w-full rounded-2xl p-6 mx-4 my-auto"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center">
              <Check size={22} className="text-[#00B894]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D3436]">Installation Saved</h2>
              <p className="text-xs text-gray-500">Record created successfully</p>
            </div>
            <button onClick={handleClose} className="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="bg-[#F8F9FE] rounded-xl p-4 space-y-3 text-[13px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Product</span>
              <span className="font-semibold text-[#2D3436]">{d.productName}</span>
            </div>
            {d.productBrand && (
              <div className="flex justify-between">
                <span className="text-gray-500">Brand</span>
                <span className="font-medium text-[#2D3436]">{d.productBrand}</span>
              </div>
            )}
            {d.serialNumber && (
              <div className="flex justify-between">
                <span className="text-gray-500">Serial Number</span>
                <span className="font-mono font-semibold text-[#6C5CE7]">{d.serialNumber}</span>
              </div>
            )}
          </div>

          {!isPC && (
            <div className="mt-5">
              <div className="flex items-center gap-1.5 mb-3">
                <LayoutTemplate size={14} className="text-[#6C5CE7]" />
                <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Print Template</span>
                {d.productBrand && (
                  <span
                    className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: brandTheme.secondary, color: brandTheme.primary }}
                  >
                    {d.productBrand}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  const tplColor = tpl.id === "brand" ? brandTheme.primary : "#6C5CE7";
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className="relative rounded-xl border-2 p-3 text-left transition-all"
                      style={{
                        borderColor: isSelected ? tplColor : "#E2E4F0",
                        background: isSelected ? (tpl.id === "brand" ? brandTheme.secondary : "#EDE7F6") : "#fff",
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: tplColor }}>
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                      <div className="mb-1.5">
                        {tpl.id === "standard" && <FileText size={18} style={{ color: isSelected ? tplColor : "#9699B0" }} />}
                        {tpl.id === "brand" && <div className="w-[18px] h-[18px] rounded" style={{ background: brandTheme.primary }} />}
                        {tpl.id === "compact" && <LayoutTemplate size={18} style={{ color: isSelected ? tplColor : "#9699B0" }} />}
                      </div>
                      <div className="text-[12px] font-semibold text-[#2D3436]">{tpl.name}</div>
                      <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{tpl.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-5">
            {isPC ? (
              <button
                onClick={() => { handleClose(); router.push(`/installations/${savedInstallation.id}`); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold hover:shadow-lg transition-shadow"
                style={{ background: "linear-gradient(135deg, #0096d6, #0082bb)" }}
              >
                <FileText size={16} />
                View Installation Report →
              </button>
            ) : (
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold hover:shadow-lg transition-shadow"
                style={{ background: `linear-gradient(135deg, ${brandTheme.primary}, ${brandTheme.primary}cc)` }}
              >
                <Printer size={16} />
                Print Report
              </button>
            )}
            <button
              onClick={() => resetForm()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E2E4F0] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} />
              New Installation
            </button>
          </div>
          <button onClick={handleClose} className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  // ===== Form View =====
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
          className="bg-white max-w-lg w-full rounded-2xl p-6 mx-4 my-auto"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[var(--font-display)]">Record {category} Installation</h2>
            <button onClick={handleClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Search */}
            <div ref={searchRef}>
              <label className={labelClass}>
                {category === "PC" ? "Search by Serial No, Department, or User" : "Search by Serial Number or Product Name"}
              </label>
              {selectedProduct ? (
                <div className="flex items-center gap-3 bg-[#F0EDFF] border border-[#6C5CE7]/30 rounded-[10px] px-4 py-3">
                  <Monitor size={18} className="text-[#6C5CE7] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#2D3436]">
                      {selectedProduct.serial_number
                        ? <><span className="font-mono text-[#6C5CE7]">{selectedProduct.serial_number}</span> — {selectedProduct.name}</>
                        : selectedProduct.name}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap mt-0.5">
                      {selectedProduct.brand && <span>{selectedProduct.brand}</span>}
                      {category === "PC" && selectedProduct.custom_fields?.department_name && (
                        <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] font-semibold px-1.5 py-0.5 rounded">
                          {selectedProduct.custom_fields.department_name}
                        </span>
                      )}
                      {category === "PC" && selectedProduct.custom_fields?.name_of_user && (
                        <span>{selectedProduct.custom_fields.name_of_user}</span>
                      )}
                    </div>
                  </div>
                  <button type="button" onClick={clearProduct} className="p-1 rounded-lg text-gray-400 hover:text-[#E17055] hover:bg-white/60 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={snQuery}
                    onChange={(e) => { setSnQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type serial number or product name..."
                    className={inputClass + " pl-10 pr-11"}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    title="Scan barcode with camera"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#6C5CE7]/10 hover:bg-[#6C5CE7]/20 text-[#6C5CE7] transition-colors"
                  >
                    <ScanLine size={16} />
                  </button>
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E4F0] rounded-xl shadow-lg z-10 max-h-[200px] overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          {snQuery.trim() ? "No products match" : `No ${category} products available`}
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => selectProduct(product)}
                            className="w-full text-left px-4 py-2.5 hover:bg-[#F8F9FE] transition-colors border-b border-gray-50 last:border-0"
                          >
                            <div className="text-[13px] font-medium text-[#2D3436]">
                              {product.serial_number
                                ? <><span className="font-mono font-bold text-[#6C5CE7]">{product.serial_number}</span> — {product.name}</>
                                : product.name}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-2 flex-wrap">
                              {product.brand && <span>{product.brand}</span>}
                              {product.custom_fields?.department_name && (
                                <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] font-semibold px-1.5 py-0.5 rounded">
                                  {product.custom_fields.department_name}
                                </span>
                              )}
                              {category === "PC" && product.custom_fields?.name_of_user && (
                                <span>{product.custom_fields.name_of_user}</span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Custom Fields */}
            <div className="border-t border-[#E2E4F0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#9699B0]">Custom Fields</span>
                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="flex items-center gap-1 text-xs font-medium text-[#6C5CE7] hover:underline bg-transparent border-none cursor-pointer"
                >
                  <Plus size={14} />
                  Add Field
                </button>
              </div>
              {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleCustomFieldChange(index, "name", e.target.value)}
                    placeholder="Field name"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                    placeholder="Value"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomField(index)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !selectedProduct}
              className="w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Installation"}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ===== Standalone print for existing installations =====
export function printInstallation(installation, branches, templateId = "brand") {
  const normalized = normalizeData(null, installation, null,
    branches?.find((b) => b.id === installation.branch_id)?.name || ""
  );
  const html = generatePrintHtml(templateId, normalized);
  openPrintWindow(html);
}
