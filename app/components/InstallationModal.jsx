"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Search, Check, Printer, Key, Monitor, FileText, LayoutTemplate,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  TEMPLATES, getBrandTheme, normalizeData,
  generatePrintHtml, openPrintWindow,
} from "./PrintTemplates"
import { HpInstallPrintView } from "./HpInstallReport";

const inputClass =
  "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

const labelClass = "block text-xs font-medium text-[#9699B0] mb-1.5";

export default function InstallationModal({ show, onClose, products, branches }) {
  const router = useRouter();
  const supabase = createClient();

  // Search state
  const [snQuery, setSnQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchRef = useRef(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [installerName, setInstallerName] = useState("");
  const [installationDate, setInstallationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [windowsKey, setWindowsKey] = useState("");
  const [msOfficeKey, setMsOfficeKey] = useState("");
  const [antivirusKey, setAntivirusKey] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // PC-specific fields
  const [address, setAddress] = useState("");
  const [custState, setCustState] = useState("");
  const [pin, setPin] = useState("");
  const [telNo, setTelNo] = useState("");
  const [email, setEmail] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [procRamSsd, setProcRamSsd] = useState("");
  const [winVersion, setWinVersion] = useState("");
  const [officeVersion, setOfficeVersion] = useState("");
  const [avName, setAvName] = useState("");
  const [avValidity, setAvValidity] = useState("");
  const [engCode, setEngCode] = useState("");

  // Post-save state
  const [savedInstallation, setSavedInstallation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("brand");
  const [showHpReport, setShowHpReport] = useState(false);

  const deliveredProducts =
    products?.filter((p) => p.status === "delivered") || [];

  // Filter products by serial number query
  const filteredProducts = snQuery.trim()
    ? deliveredProducts.filter((p) => {
        const q = snQuery.toLowerCase();
        const sn = (p.serial_number || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        return sn.includes(q) || name.includes(q);
      })
    : deliveredProducts;

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setSnQuery(product.serial_number || product.name);
    setShowSuggestions(false);

    // Auto-fill keys from product's custom_fields
    const cf = product.custom_fields || {};
    setWindowsKey(cf.windows_key || cf.Windows_Key || cf.window_key || "");
    setMsOfficeKey(cf.ms_office_key || cf.MS_Office_Key || cf.office_key || cf.Office_Key || "");
    setAntivirusKey(cf.antivirus_key || cf.Antivirus_Key || cf.antivirus || "");

    // Auto-pick brand template if product has a brand
    if (product.brand) {
      setSelectedTemplate("brand");
    }
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setSnQuery("");
    setWindowsKey("");
    setMsOfficeKey("");
    setAntivirusKey("");
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { name: "", value: "" }]);
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index, field, val) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [field]: val };
    setCustomFields(updated);
  };

  const resetForm = () => {
    setSnQuery("");
    setSelectedProduct(null);
    setCustomerName("");
    setInstallerName("");
    setInstallationDate(new Date().toISOString().split("T")[0]);
    setWindowsKey("");
    setMsOfficeKey("");
    setAntivirusKey("");
    setCustomFields([]);
    setNotes("");
    setSavedInstallation(null);
    setSelectedTemplate("brand");
    setShowHpReport(false);
    setAddress(""); setCustState(""); setPin(""); setTelNo("");
    setEmail(""); setContactPerson(""); setProcRamSsd("");
    setWinVersion(""); setOfficeVersion(""); setAvName("");
    setAvValidity(""); setEngCode("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !customerName || !installerName) return;
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let customFieldsObj = null;
      const validFields = customFields.filter(
        (f) => f.name.trim() && f.value.trim()
      );
      if (validFields.length > 0) {
        customFieldsObj = {};
        validFields.forEach((f) => {
          customFieldsObj[f.name.trim()] = f.value.trim();
        });
      }

      // Merge PC-specific fields into custom_fields
      if (selectedProduct?.category?.toLowerCase() === "pc") {
        customFieldsObj = customFieldsObj || {};
        const pcFields = {
          address, state: custState, pin, tel_no: telNo, email,
          contact_person: contactPerson, proc_ram_ssd: procRamSsd,
          win_version: winVersion, office_version: officeVersion,
          av_name: avName, av_validity: avValidity, eng_code: engCode,
        };
        Object.entries(pcFields).forEach(([k, v]) => { if (v) customFieldsObj[k] = v; });
      }

      const branchId =
        selectedProduct?.branch_id ||
        selectedProduct?.dispatch?.branch_id ||
        null;

      const { data: instData, error: installError } = await supabase
        .from("installations")
        .insert({
          user_id: user.id,
          product_id: selectedProduct.id,
          branch_id: branchId,
          customer_name: customerName,
          installer_name: installerName,
          installation_date: installationDate,
          windows_key: windowsKey || null,
          ms_office_key: msOfficeKey || null,
          antivirus_key: antivirusKey || null,
          custom_fields: customFieldsObj,
          notes: notes || null,
          status: "completed",
        })
        .select()
        .single();

      if (installError) throw installError;

      await supabase
        .from("products")
        .update({ status: "installed" })
        .eq("id", selectedProduct.id);

      await supabase
        .from("dispatch_items")
        .update({ status: "installed" })
        .eq("product_id", selectedProduct.id);

      const branchName =
        branches?.find((b) => b.id === branchId)?.name || "";

      setSavedInstallation({
        ...instData,
        productName: selectedProduct.name,
        productBrand: selectedProduct.brand || "",
        productCategory: selectedProduct.category || "",
        serialNumber: selectedProduct.serial_number || "",
        branchName,
        windowsKey: windowsKey || "",
        msOfficeKey: msOfficeKey || "",
        antivirusKey: antivirusKey || "",
        customerName,
        installerName,
        installationDate,
        notes: notes || "",
        customFields: customFieldsObj,
        address, custState, pin, telNo, email,
        contactPerson, procRamSsd, winVersion,
        officeVersion, avName, avValidity, engCode,
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
    const data = savedInstallation;
    if (!data) return;
    if (data.productCategory?.toLowerCase() === "pc") {
      setShowHpReport(true);
      return;
    }
    const normalized = normalizeData(data);
    const html = generatePrintHtml(selectedTemplate, normalized);
    openPrintWindow(html);
  };

  if (!show) return null;

  // ===== HP Installation Report overlay =====
  if (showHpReport && savedInstallation) {
    const d = savedInstallation;
    return (
      <HpInstallPrintView
        initialValues={{
          customer_name: d.customerName,
          mc_serial: d.serialNumber,
          model_no: d.productName,
          device_brand: d.productBrand,
          install_date: d.installationDate,
          win_key: d.windowsKey,
          office_key: d.msOfficeKey,
          av_key: d.antivirusKey,
          eng_name: d.installerName,
          eng_code: d.engCode || "",
          address: d.address || "",
          state: d.custState || "",
          pin: d.pin || "",
          tel_no: d.telNo || "",
          email: d.email || "",
          contact_person: d.contactPerson || "",
          proc_ram_ssd: d.procRamSsd || "",
          win_version: d.winVersion || "",
          office_version: d.officeVersion || "",
          av_name: d.avName || "",
          av_validity: d.avValidity || "",
        }}
        onClose={() => setShowHpReport(false)}
      />
    );
  }

  // ===== Print / Success View =====
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
          {/* Success header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center">
              <Check size={22} className="text-[#00B894]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2D3436]">
                Installation Saved
              </h2>
              <p className="text-xs text-gray-500">
                Installation record created successfully
              </p>
            </div>
            <button
              onClick={handleClose}
              className="ml-auto p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Summary */}
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
            <div className="flex justify-between">
              <span className="text-gray-500">Serial Number</span>
              <span className="font-mono font-semibold text-[#6C5CE7]">{d.serialNumber || "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium text-[#2D3436]">{d.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Installer</span>
              <span className="font-medium text-[#2D3436]">{d.installerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date</span>
              <span className="text-[#2D3436]">
                {new Date(d.installationDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {(d.windowsKey || d.msOfficeKey || d.antivirusKey) && (
              <div className="pt-3 border-t border-gray-200 space-y-2">
                {d.windowsKey && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Key size={12} /> Windows</span>
                    <span className="font-mono text-xs text-[#2D3436]">{d.windowsKey}</span>
                  </div>
                )}
                {d.msOfficeKey && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Key size={12} /> MS Office</span>
                    <span className="font-mono text-xs text-[#2D3436]">{d.msOfficeKey}</span>
                  </div>
                )}
                {d.antivirusKey && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><Key size={12} /> Antivirus</span>
                    <span className="font-mono text-xs text-[#2D3436]">{d.antivirusKey}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Template Picker */}
          <div className="mt-5">
            <div className="flex items-center gap-1.5 mb-3">
              <LayoutTemplate size={14} className="text-[#6C5CE7]" />
              <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">
                Print Template
              </span>
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
                      <div
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: tplColor }}
                      >
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="mb-1.5">
                      {tpl.id === "standard" && <FileText size={18} style={{ color: isSelected ? tplColor : "#9699B0" }} />}
                      {tpl.id === "brand" && (
                        <div
                          className="w-[18px] h-[18px] rounded"
                          style={{ background: brandTheme.primary }}
                        />
                      )}
                      {tpl.id === "compact" && <LayoutTemplate size={18} style={{ color: isSelected ? tplColor : "#9699B0" }} />}
                    </div>
                    <div className="text-[12px] font-semibold text-[#2D3436]">{tpl.name}</div>
                    <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{tpl.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold hover:shadow-lg transition-shadow"
              style={{ background: `linear-gradient(135deg, ${getBrandTheme(d.productBrand).primary}, ${getBrandTheme(d.productBrand).primary}cc)` }}
            >
              <Printer size={16} />
              Print Report
            </button>
            <button
              onClick={() => resetForm()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#E2E4F0] text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} />
              New Installation
            </button>
          </div>
          {isPC && (
            <button
              onClick={() => setShowHpReport(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-[#0096d6] text-[#0096d6] text-sm font-semibold hover:bg-[#e6f6fd] transition-colors"
            >
              <Printer size={16} />
              HP Installation Report
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
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
          className="bg-white max-w-lg w-full rounded-2xl p-6 mx-4 my-auto max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold font-[var(--font-display)]">
              Record Installation
            </h2>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Serial Number Search */}
            <div ref={searchRef}>
              <label className={labelClass}>
                Search by Serial Number or Product Name
              </label>
              {selectedProduct ? (
                <div className="flex items-center gap-3 bg-[#F0EDFF] border border-[#6C5CE7]/30 rounded-[10px] px-4 py-3">
                  <Monitor size={18} className="text-[#6C5CE7] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-[#2D3436]">
                      {selectedProduct.name}
                    </div>
                    <div className="text-[11px] text-gray-500 flex items-center gap-3">
                      {selectedProduct.serial_number && (
                        <span>SN: <span className="font-mono font-semibold text-[#6C5CE7]">{selectedProduct.serial_number}</span></span>
                      )}
                      {selectedProduct.brand && (
                        <span>{selectedProduct.brand}</span>
                      )}
                      {selectedProduct.category && (
                        <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] font-semibold px-1.5 py-0.5 rounded">{selectedProduct.category}</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearProduct}
                    className="p-1 rounded-lg text-gray-400 hover:text-[#E17055] hover:bg-white/60 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={snQuery}
                    onChange={(e) => {
                      setSnQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type serial number or product name..."
                    className={inputClass + " pl-10"}
                    autoFocus
                  />
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E2E4F0] rounded-xl shadow-lg z-10 max-h-[200px] overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          {snQuery.trim()
                            ? "No delivered products match"
                            : "No delivered products available"}
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
                              {product.name}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-3">
                              {product.serial_number && (
                                <span>
                                  SN:{" "}
                                  <span className="font-mono font-semibold text-[#6C5CE7]">
                                    {product.serial_number}
                                  </span>
                                </span>
                              )}
                              {product.brand && <span>{product.brand}</span>}
                              {product.category && <span>{product.category}</span>}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className={labelClass}>Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer / Company name"
                className={inputClass}
                required
              />
            </div>

            {/* Installer Name */}
            <div>
              <label className={labelClass}>Installer Name</label>
              <input
                type="text"
                value={installerName}
                onChange={(e) => setInstallerName(e.target.value)}
                placeholder="Field person name"
                className={inputClass}
                required
              />
            </div>

            {/* Installation Date */}
            <div>
              <label className={labelClass}>Installation Date</label>
              <input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {/* License Keys */}
            <div className="border-t border-[#E2E4F0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5">
                  <Key size={13} className="text-[#6C5CE7]" />
                  License Keys
                </span>
                {selectedProduct && (windowsKey || msOfficeKey || antivirusKey) && (
                  <span className="text-[11px] text-[#00B894] font-medium flex items-center gap-1">
                    <Check size={12} />
                    Auto-filled from product
                  </span>
                )}
              </div>

              <div className="mb-3">
                <label className={labelClass}>Windows Key</label>
                <input
                  type="text"
                  value={windowsKey}
                  onChange={(e) => setWindowsKey(e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className={inputClass}
                />
              </div>

              <div className="mb-3">
                <label className={labelClass}>MS Office Key</label>
                <input
                  type="text"
                  value={msOfficeKey}
                  onChange={(e) => setMsOfficeKey(e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Antivirus Key</label>
                <input
                  type="text"
                  value={antivirusKey}
                  onChange={(e) => setAntivirusKey(e.target.value)}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                  className={inputClass}
                />
              </div>
            </div>

            {/* PC Details – shown only when category is PC */}
            {selectedProduct?.category?.toLowerCase() === "pc" && (
              <div className="border-t border-[#E2E4F0] pt-4">
                <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <Monitor size={13} className="text-[#6C5CE7]" />
                  PC Details
                </span>

                <div className="mb-3">
                  <label className={labelClass}>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Customer address" className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>State</label>
                    <input type="text" value={custState} onChange={(e) => setCustState(e.target.value)} placeholder="State" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>PIN Code</label>
                    <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Tel No</label>
                    <input type="tel" value={telNo} onChange={(e) => setTelNo(e.target.value)} placeholder="Phone number" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Contact Person</label>
                    <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Contact name" className={inputClass} />
                  </div>
                </div>

                <div className="mb-3">
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={inputClass} />
                </div>

                <div className="mb-3">
                  <label className={labelClass}>Processor / RAM / SSD</label>
                  <input type="text" value={procRamSsd} onChange={(e) => setProcRamSsd(e.target.value)} placeholder="e.g. i5 / 8GB / 512GB" className={inputClass} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Windows Version</label>
                    <input type="text" value={winVersion} onChange={(e) => setWinVersion(e.target.value)} placeholder="e.g. Windows 11 Pro" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>MS Office Version</label>
                    <input type="text" value={officeVersion} onChange={(e) => setOfficeVersion(e.target.value)} placeholder="e.g. Office 2021" className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className={labelClass}>Antivirus Name</label>
                    <input type="text" value={avName} onChange={(e) => setAvName(e.target.value)} placeholder="e.g. Quick Heal" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Antivirus Validity</label>
                    <input type="text" value={avValidity} onChange={(e) => setAvValidity(e.target.value)} placeholder="e.g. 1 Year" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Engineer Code</label>
                  <input type="text" value={engCode} onChange={(e) => setEngCode(e.target.value)} placeholder="Engineer code" className={inputClass} />
                </div>
              </div>
            )}

            {/* Custom Fields */}
            <div className="border-t border-[#E2E4F0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#9699B0]">
                  Custom Fields
                </span>
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
                    onChange={(e) =>
                      handleCustomFieldChange(index, "name", e.target.value)
                    }
                    placeholder="Field name"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) =>
                      handleCustomFieldChange(index, "value", e.target.value)
                    }
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

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
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
                submitting || !selectedProduct || !customerName || !installerName
              }
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

// ===== Standalone print for existing installations (with template picker) =====
export function printInstallation(installation, branches, templateId = "brand") {
  const normalized = normalizeData(null, installation, null,
    branches?.find((b) => b.id === installation.branch_id)?.name || ""
  );
  const html = generatePrintHtml(templateId, normalized);
  openPrintWindow(html);
}
