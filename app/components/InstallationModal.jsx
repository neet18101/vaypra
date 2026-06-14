"use client";

import { useState, useRef, useEffect, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Search, Check, Printer, Monitor, FileText, LayoutTemplate, ScanLine, Key, ClipboardList, Zap,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  TEMPLATES, getBrandTheme, normalizeData,
  generatePrintHtml, openPrintWindow,
} from "./PrintTemplates";
import { buildHpPrintHtml, HP_TEMPLATE } from "./HpInstallReport";
import BarcodeScanner from "./BarcodeScanner";

const inputClass =
  "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

const labelClass = "block text-xs font-medium text-[#9699B0] mb-1.5";

const PC_CHECKLIST = [
  { id: "c1", label: "Hardware unboxing & physical setup" },
  { id: "c3", label: "Windows installation & activation" },
  { id: "c4", label: "MS Office installation & activation" },
  { id: "c5", label: "Antivirus installation & activation" },
  { id: "c7", label: "Windows Updates installed" },
];

function ActStatus({ id, value, onChange }) {
  return (
    <div className="flex gap-3">
      {["Activated", "Pending"].map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            name={id}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-[#6C5CE7]"
          />
          <span className="text-[12px] text-[#2D3436]">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex gap-3">
      {["yes", "no"].map((opt) => (
        <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="radio"
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-[#6C5CE7]"
          />
          <span className="text-[12px] text-[#2D3436] capitalize">{opt}</span>
        </label>
      ))}
    </div>
  );
}

const EMPTY_PC = {
  contact_person: "", tel_no: "", email: "", room_no: "",
  win_key: "", win_version: "", win_activation: "",
  office_key: "", office_version: "", office_activation: "",
  av_key: "", av_name: "", av_validity: "", av_activation: "",
  c1: "", c3: "", c4: "", c5: "", c7: "",
};

const EMPTY_PRINTER = {
  name_of_user: "", tel_no: "", email_admin: "", room_no: "",
  meter_black_large: "", meter_black_small: "", meter_black_xl: "",
  meter_color_large: "", meter_color_small: "", meter_color_xl: "",
  power_type: "None",
  tr_doc_align: "yes", tr_media: "yes", tr_ctrl_panel: "yes", tr_manual_feed: "yes",
  tr_two_side: "yes", tr_warming: "yes", tr_toner_rep: "yes", tr_waste_toner: "yes",
  tr_paper_jam: "yes", tr_routine: "yes", tr_driver: "yes", tr_call_log: "yes",
  tr_dos_donts: "yes", tr_printout: "yes",
};

const PRINTER_TRAINING = [
  { id: "tr_doc_align",   label: "Document Alignment" },
  { id: "tr_media",       label: "Media Loading" },
  { id: "tr_ctrl_panel",  label: "Control Panel Operation" },
  { id: "tr_manual_feed", label: "Manual Feed" },
  { id: "tr_two_side",    label: "Two Sided Printing" },
  { id: "tr_warming",     label: "Warming Up Time" },
  { id: "tr_toner_rep",   label: "Toner Replacement" },
  { id: "tr_waste_toner", label: "Waste Toner Replacement" },
  { id: "tr_paper_jam",   label: "Paper Jam Clearance" },
  { id: "tr_routine",     label: "Routine Cleaning" },
  { id: "tr_driver",      label: "Driver Installation" },
  { id: "tr_call_log",    label: "Call Logging Procedure" },
  { id: "tr_dos_donts",   label: "Do's & Don'ts" },
  { id: "tr_printout",    label: "Printout Demonstration" },
];

const REPORT_CATS = new Set(["pc", "single printer", "multi-function printer", "scanner", "photocopier", "photocopy"]);

export default function InstallationModal({ show, onClose, products, branches, installations = [], category = "PC" }) {
  const router = useRouter();
  const supabase = createClient();

  const [snQuery, setSnQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const searchRef = useRef(null);

  const [customFields, setCustomFields] = useState([]);
  const [pcFields, setPcFields] = useState(EMPTY_PC);
  const [printerFields, setPrinterFields] = useState(EMPTY_PRINTER);
  const [linkedPcId, setLinkedPcId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isUPS = category === "UPS";
  const isSinglePrinter = category === "Single Printer";
  const isMultiFunctionPrinter = category === "Multi-Function Printer";
  const isPrinterType = isSinglePrinter || isMultiFunctionPrinter
    || category === "Scanner" || category === "Photocopier";
  const LINK_PC_CATEGORIES = new Set(["UPS", "Single Printer", "Multi-Function Printer", "Scanner", "Photocopier"]);
  const needsPcLink = LINK_PC_CATEGORIES.has(category);

  // PC installations available to link
  const pcInstallations = installations.filter(
    (i) => i.products?.category?.toLowerCase() === "pc"
  );

  const [savedInstallation, setSavedInstallation] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("brand");
  const [showScanner, setShowScanner] = useState(false);

  const isPC = category === "PC";

  // "PhotoCopy" in DB is displayed as "Photocopier" in the UI — normalize before comparing
  const normalizeCategory = (cat) => cat === "PhotoCopy" ? "Photocopier" : (cat || "");
  const availableProducts =
    category === "PC"
      ? (products?.filter((p) => normalizeCategory(p.category).toLowerCase() === "pc" && p.status !== "installed") || [])
      : (products?.filter((p) => normalizeCategory(p.category).toLowerCase() === category.toLowerCase() && p.status !== "installed") || []);

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

  // Auto-fill printer fields from linked PC installation
  useEffect(() => {
    if (!linkedPcId || !isPrinterType) return;
    const linked = pcInstallations.find((i) => i.id === linkedPcId);
    if (!linked) return;
    const cf = linked.custom_fields || {};
    setPrinterFields((prev) => ({
      ...prev,
      name_of_user: cf.contact_person || cf.name_of_user || prev.name_of_user || "",
      tel_no:       cf.tel_no         || cf.mobile_no    || prev.tel_no       || "",
      email_admin:  cf.email          || cf.email_id     || prev.email_admin  || "",
      room_no:      cf.room_no        || prev.room_no    || "",
    }));
  }, [linkedPcId]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setSnQuery(product.serial_number || product.name);
    setShowSuggestions(false);
    if (product.brand) setSelectedTemplate("brand");

    if (isPC) {
      const pcf = product.custom_fields || {};
      setPcFields({
        contact_person: pcf.name_of_user    || pcf.contact_person    || "",
        tel_no:         pcf.mobile_no        || pcf.tel_no            || "",
        email:          pcf.email_id         || pcf.email             || "",
        room_no:        pcf.room_no          || "",
        win_key:
          pcf.windows_key  || pcf.Windows_Key  || pcf.window_key  || "",
        win_version:
          pcf.windows_version || pcf.win_version || "",
        win_activation:    "",
        office_key:
          pcf.ms_office_key || pcf.MS_Office_Key || pcf.office_key || pcf.Office_Key || "",
        office_version:
          pcf.ms_office_version || pcf.office_version || "",
        office_activation: "",
        av_key:
          pcf.antivirus_serial_key || pcf.antivirus_key || pcf.Antivirus_Key || pcf.antivirus || "",
        av_name:
          pcf.antivirus_name    || pcf.av_name     || "",
        av_validity:
          pcf.antivirus_validity || pcf.av_validity || "",
        av_activation: "",
        c1: "", c3: "", c4: "", c5: "", c7: "",
      });
    }

    if (isPrinterType) {
      const pf = product.custom_fields || {};
      setPrinterFields((prev) => ({
        ...prev,
        name_of_user: pf.name_of_user  || pf.contact_person || "",
        tel_no:       pf.tel_no        || pf.mobile_no       || "",
        email_admin:  pf.email_admin   || pf.email           || pf.email_id || "",
        room_no:      pf.room_no       || "",
      }));
    }
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setSnQuery("");
    if (isPC) setPcFields(EMPTY_PC);
    if (isPrinterType) setPrinterFields(EMPTY_PRINTER);
    if (needsPcLink) setLinkedPcId("");
  };

  const pc = (field, val) => setPcFields((prev) => ({ ...prev, [field]: val }));
  const pf = (field, val) => setPrinterFields((prev) => ({ ...prev, [field]: val }));

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
    const exact = availableProducts.find(
      (p) => (p.serial_number || "").toLowerCase() === rawValue.toLowerCase()
    );
    if (exact) selectProduct(exact);
  };

  const resetForm = () => {
    setSnQuery("");
    setSelectedProduct(null);
    setCustomFields([]);
    setPcFields(EMPTY_PC);
    setPrinterFields(EMPTY_PRINTER);
    setLinkedPcId("");
    setSavedInstallation(null);
    setSelectedTemplate("brand");
    setShowScanner(false);
  };

  const handleClose = () => { resetForm(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profile } = await supabase
        .from("profiles")
        .select("current_organization_id")
        .eq("id", user.id)
        .single();
      const orgId = profile?.current_organization_id;

      const pcf = selectedProduct.custom_fields || {};
      // Fallback keys from product if PC fields are empty
      const winKey = pcFields.win_key    || pcf.windows_key    || pcf.Windows_Key   || pcf.window_key   || null;
      const offKey = pcFields.office_key || pcf.ms_office_key  || pcf.MS_Office_Key || pcf.office_key   || pcf.Office_Key || null;
      const avKey  = pcFields.av_key     || pcf.antivirus_serial_key || pcf.antivirus_key || pcf.Antivirus_Key || pcf.antivirus || null;

      // Base custom_fields: copy relevant PC product metadata
      const mergedCF = {};
      if (isPC) {
        const PC_CF_KEYS = [
          "department_name", "address", "warranty_period", "warranty_expiry_date",
        ];
        PC_CF_KEYS.forEach((k) => { if (pcf[k]) mergedCF[k] = pcf[k]; });

        // Merge modal PC fields
        Object.assign(mergedCF, {
          contact_person:    pcFields.contact_person,
          tel_no:            pcFields.tel_no,
          email:             pcFields.email,
          room_no:           pcFields.room_no,
          win_version:       pcFields.win_version,
          win_activation:    pcFields.win_activation,
          office_version:    pcFields.office_version,
          office_activation: pcFields.office_activation,
          av_name:           pcFields.av_name,
          av_validity:       pcFields.av_validity,
          av_activation:     pcFields.av_activation,
          c1: pcFields.c1, c3: pcFields.c3, c4: pcFields.c4,
          c5: pcFields.c5, c7: pcFields.c7,
        });
      }

      // Merge Single / Multi-Function Printer fields
      if (isPrinterType) {
        const spf = selectedProduct.custom_fields || {};
        Object.assign(mergedCF, {
          // Auto-fill from product
          department_name: spf.department_name || spf.name_of_user || "",
          address:         spf.address || "",
          // User-entered
          name_of_user:  printerFields.name_of_user,
          tel_no:        printerFields.tel_no,
          email_admin:   printerFields.email_admin,
          room_no:       printerFields.room_no,
          // Meter Reading
          meter_black_large: printerFields.meter_black_large,
          meter_black_small: printerFields.meter_black_small,
          meter_black_xl:    printerFields.meter_black_xl,
          meter_color_large: printerFields.meter_color_large,
          meter_color_small: printerFields.meter_color_small,
          meter_color_xl:    printerFields.meter_color_xl,
          // Power Supply
          power_type: printerFields.power_type,
          // Customer Training
          tr_doc_align:   printerFields.tr_doc_align,   tr_media:      printerFields.tr_media,
          tr_ctrl_panel:  printerFields.tr_ctrl_panel,  tr_manual_feed: printerFields.tr_manual_feed,
          tr_two_side:    printerFields.tr_two_side,    tr_warming:    printerFields.tr_warming,
          tr_toner_rep:   printerFields.tr_toner_rep,   tr_waste_toner: printerFields.tr_waste_toner,
          tr_paper_jam:   printerFields.tr_paper_jam,   tr_routine:    printerFields.tr_routine,
          tr_driver:      printerFields.tr_driver,      tr_call_log:   printerFields.tr_call_log,
          tr_dos_donts:   printerFields.tr_dos_donts,   tr_printout:   printerFields.tr_printout,
        });
      }

      // Save linked PC installation info (UPS, printers, scanners, photocopier)
      if (needsPcLink && linkedPcId) {
        const linkedPc = pcInstallations.find((i) => i.id === linkedPcId);
        if (linkedPc) {
          mergedCF.linked_pc_installation_id = linkedPcId;
          mergedCF.linked_pc_serial    = linkedPc.products?.serial_number || "";
          mergedCF.linked_pc_name      = linkedPc.products?.name          || "";
          mergedCF.linked_pc_dept      = linkedPc.custom_fields?.department_name || linkedPc.customer_name || "";
          mergedCF.linked_pc_user      = linkedPc.custom_fields?.contact_person  || "";
        }
      }

      const validFields = customFields.filter((f) => f.name.trim() && f.value.trim());
      validFields.forEach((f) => { mergedCF[f.name.trim()] = f.value.trim(); });

      const branchId = selectedProduct?.branch_id || selectedProduct?.dispatch?.branch_id || null;

      const { data: instData, error: installError } = await supabase
        .from("installations")
        .insert({
          organization_id: orgId,
          product_id:      selectedProduct.id,
          branch_id:       branchId,
          installation_date: new Date().toISOString().split("T")[0],
          windows_key:     winKey,
          ms_office_key:   offKey,
          antivirus_key:   avKey,
          custom_fields:   Object.keys(mergedCF).length > 0 ? mergedCF : null,
          status:          "completed",
        })
        .select()
        .single();

      if (installError) throw installError;

      await supabase.from("products").update({ status: "installed" }).eq("id", selectedProduct.id);
      await supabase.from("dispatch_items").update({ status: "installed" }).eq("product_id", selectedProduct.id);

      // EMAIL DISABLED — uncomment when SMTP is configured and working
      // const emailTo =
      //   mergedCF.email || mergedCF.email_admin || mergedCF.email_id ||
      //   (linkedPcId && pcInstallations.find(i => i.id === linkedPcId)?.custom_fields?.email) ||
      //   "";
      // if (emailTo && instData?.id) {
      //   try {
      //     const linkedPc = pcInstallations.find(i => i.id === linkedPcId);
      //     const pcCf = linkedPc?.custom_fields || {};
      //     const pcProduct = linkedPc?.products || {};
      //     const reportFillValues = isPC ? {
      //       department_name: mergedCF.department_name || "",
      //       model_no: selectedProduct.name || "",
      //       mc_serial: selectedProduct.serial_number || "",
      //       device_brand: selectedProduct.brand || "",
      //       install_date: instData.installation_date || "",
      //       address: mergedCF.address || "",
      //       tel_no: mergedCF.tel_no || "",
      //       email: mergedCF.email || "",
      //       contact_person: mergedCF.contact_person || "",
      //       room_no: mergedCF.room_no || "",
      //       win_key: instData.windows_key || "",
      //       win_version: mergedCF.win_version || "",
      //       win_activation: mergedCF.win_activation || "",
      //       office_key: instData.ms_office_key || "",
      //       office_version: mergedCF.office_version || "",
      //       office_activation: mergedCF.office_activation || "",
      //       av_key: instData.antivirus_key || "",
      //       av_name: mergedCF.av_name || "",
      //       av_validity: mergedCF.av_validity || "",
      //       av_activation: mergedCF.av_activation || "",
      //       c1: mergedCF.c1 || "yes", c3: mergedCF.c3 || "yes",
      //       c4: mergedCF.c4 || "yes", c5: mergedCF.c5 || "yes", c7: mergedCF.c7 || "yes",
      //       remarks: mergedCF.remarks || "",
      //       service_date: mergedCF.service_date || instData.installation_date || "",
      //       cust_signing: mergedCF.cust_signing || "",
      //       ups_model: selectedProduct.category === "UPS" ? selectedProduct.name : "",
      //       ups_brand: selectedProduct.category === "UPS" ? selectedProduct.brand : "",
      //       ups_serial: selectedProduct.category === "UPS" ? selectedProduct.serial_number : "",
      //       ups_warranty: selectedProduct.category === "UPS" ? "3 Years" : "",
      //       ups_install_date: selectedProduct.category === "UPS" ? instData.installation_date : "",
      //     } : linkedPc ? {
      //       department_name: pcCf.department_name || linkedPc.customer_name || "",
      //       model_no: pcProduct.name || "",
      //       mc_serial: pcProduct.serial_number || "",
      //       device_brand: pcProduct.brand || "",
      //       install_date: linkedPc.installation_date?.split("T")[0] || "",
      //       address: pcCf.address || "",
      //       tel_no: pcCf.tel_no || pcCf.mobile_no || "",
      //       email: pcCf.email || "",
      //       contact_person: pcCf.contact_person || pcCf.name_of_user || "",
      //       room_no: pcCf.room_no || "",
      //       win_key: linkedPc.windows_key || "",
      //       win_version: pcCf.win_version || "",
      //       win_activation: pcCf.win_activation || "",
      //       office_key: linkedPc.ms_office_key || "",
      //       office_version: pcCf.office_version || "",
      //       office_activation: pcCf.office_activation || "",
      //       av_key: linkedPc.antivirus_key || "",
      //       av_name: pcCf.av_name || "",
      //       av_validity: pcCf.av_validity || "",
      //       av_activation: pcCf.av_activation || "",
      //       c1: "yes", c3: "yes", c4: "yes", c5: "yes", c7: "yes",
      //       remarks: pcCf.remarks || "",
      //       service_date: instData.installation_date || "",
      //       cust_signing: pcCf.cust_signing || pcCf.contact_person || "",
      //       ups_model: selectedProduct.name || "",
      //       ups_brand: selectedProduct.brand || "",
      //       ups_serial: selectedProduct.serial_number || "",
      //       ups_warranty: "3 Years",
      //       ups_install_date: instData.installation_date || "",
      //     } : null;
      //     if (reportFillValues) {
      //       const reportHtml = buildHpPrintHtml(reportFillValues, HP_TEMPLATE);
      //       fetch("/api/send-report", {
      //         method: "POST",
      //         headers: { "Content-Type": "application/json" },
      //         body: JSON.stringify({
      //           to: emailTo,
      //           subject: `Installation Report — ${selectedProduct.name} — Rangayan Creations`,
      //           html: reportHtml,
      //           installationId: instData.id,
      //         }),
      //         signal: AbortSignal.timeout(10_000),
      //       }).catch((err) => console.warn("Report email failed:", err.message));
      //     }
      //   } catch (emailErr) {
      //     console.warn("Report email failed:", emailErr.message);
      //   }
      // }

      const productCategory = (selectedProduct.category || "").toLowerCase();
      if (REPORT_CATS.has(productCategory)) {
        // Navigate directly to report page — skip the success modal
        handleClose();
        startTransition(() => router.push(`/installations/${instData.id}`));
      } else {
        setSavedInstallation({
          ...instData,
          productName:     selectedProduct.name,
          productBrand:    selectedProduct.brand || "",
          productCategory: selectedProduct.category || "",
          serialNumber:    selectedProduct.serial_number || "",
          branchName:      branches?.find((b) => b.id === branchId)?.name || "",
        });
        startTransition(() => router.refresh());
      }
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
  if (showScanner) {
    return <BarcodeScanner onDetected={handleScan} onClose={() => setShowScanner(false)} />;
  }

  // ===== Success View =====
  if (savedInstallation) {
    const d = savedInstallation;
    const isReportCat = REPORT_CATS.has(d.productCategory?.toLowerCase());
    const brandTheme = getBrandTheme(d.productBrand);

    return (
      <div
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
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

          {!isReportCat && (
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
            {isReportCat ? (
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
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-2xl p-6 mx-4 my-auto overflow-hidden w-full ${isPrinterType ? "max-w-2xl" : "max-w-lg"}`}
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
                {isPC ? "Search by Serial No, Department, or User" : "Search by Serial Number or Product Name"}
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
                      {isPC && selectedProduct.custom_fields?.department_name && (
                        <span className="bg-[#6C5CE7]/10 text-[#6C5CE7] font-semibold px-1.5 py-0.5 rounded">
                          {selectedProduct.custom_fields.department_name}
                        </span>
                      )}
                      {isPC && selectedProduct.custom_fields?.name_of_user && (
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
                              {isPC && product.custom_fields?.name_of_user && (
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

            {/* ── Linked PC selector (UPS / printers / scanner / photocopier) ── */}
            {needsPcLink && selectedProduct && (
              <div className="border-t border-[#E2E4F0] pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Zap size={13} className="text-[#FDCB6E]" />
                  <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Link to PC Installation</span>
                  <span className="ml-auto text-[10px] text-gray-400">Optional</span>
                </div>

                {pcInstallations.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-[#F8F9FE] rounded-xl px-4 py-3">
                    No PC installations found. Record a PC installation first.
                  </p>
                ) : (
                  <select
                    value={linkedPcId}
                    onChange={(e) => setLinkedPcId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">— Select a PC installation —</option>
                    {pcInstallations.map((inst) => {
                      const sn   = inst.products?.serial_number || "";
                      const name = inst.products?.name          || "Unknown";
                      const dept = inst.custom_fields?.department_name || inst.customer_name || "";
                      const user = inst.custom_fields?.contact_person  || "";
                      const label = [sn && `SN: ${sn}`, name, dept, user].filter(Boolean).join(" — ");
                      return (
                        <option key={inst.id} value={inst.id}>{label}</option>
                      );
                    })}
                  </select>
                )}

                {linkedPcId && (() => {
                  const linked = pcInstallations.find((i) => i.id === linkedPcId);
                  if (!linked) return null;
                  return (
                    <div className="mt-2 bg-[#F0EDFF] border border-[#6C5CE7]/20 rounded-xl px-4 py-3 text-[12px] text-[#2D3436] space-y-0.5">
                      <div className="font-semibold text-[#6C5CE7]">{linked.products?.name || "PC"}</div>
                      {linked.products?.serial_number && <div className="font-mono text-[#6C5CE7]">{linked.products.serial_number}</div>}
                      {(linked.custom_fields?.department_name || linked.customer_name) && (
                        <div className="text-gray-500">{linked.custom_fields?.department_name || linked.customer_name}</div>
                      )}
                      {linked.custom_fields?.contact_person && (
                        <div className="text-gray-500">{linked.custom_fields.contact_person}</div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── Single / Multi-Function Printer fields ── */}
            {isPrinterType && selectedProduct && (
              <div className="space-y-4 border-t border-[#E2E4F0] pt-4">

                {/* User Details */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Printer size={13} className="text-[#6C5CE7]" />
                    <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Printer Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Name of User</label>
                      <input type="text" value={printerFields.name_of_user} onChange={(e) => pf("name_of_user", e.target.value)} placeholder="User full name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile Number</label>
                      <input type="tel" value={printerFields.tel_no} onChange={(e) => pf("tel_no", e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input type="email" value={printerFields.email_admin} onChange={(e) => pf("email_admin", e.target.value)} placeholder="email@example.com" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Room No / Room Name</label>
                      <input type="text" value={printerFields.room_no} onChange={(e) => pf("room_no", e.target.value)} placeholder="e.g. Room 101" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Meter Reading */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Meter Reading</span>
                  </div>
                  <div className="bg-[#F8F9FE] rounded-xl overflow-hidden border border-[#E2E4F0]">
                    <div className="grid grid-cols-4 text-[11px] font-semibold text-[#9699B0] px-3 py-1.5 border-b border-[#E2E4F0]">
                      <span>Type</span><span>Large</span><span>Small</span><span>XL</span>
                    </div>
                    {[["Black","black"],["Color","color"]].map(([label, key]) => (
                      <div key={key} className="grid grid-cols-4 gap-1 px-3 py-1.5 border-b border-[#E2E4F0] last:border-0 items-center">
                        <span className="text-[12px] font-semibold text-[#2D3436]">{label}</span>
                        {["large","small","xl"].map((size) => (
                          <input key={size} type="text" value={printerFields[`meter_${key}_${size}`]} onChange={(e) => pf(`meter_${key}_${size}`, e.target.value)} placeholder="0" className="bg-white border border-[#E2E4F0] rounded-lg px-2 py-1.5 text-[12px] text-[#2D3436] outline-none focus:border-[#6C5CE7] w-full" />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Power Supply Type */}
                <div>
                  <label className={labelClass}>Power Supply Type</label>
                  <div className="flex gap-4 flex-wrap pt-1">
                    {["UPS","CVT","Stabilizer","None"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <input type="radio" name="pf_power_type" checked={printerFields.power_type === opt} onChange={() => pf("power_type", opt)} className="accent-[#6C5CE7]" />
                        <span className="text-[12px] text-[#2D3436]">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Customer Training */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <ClipboardList size={13} className="text-[#6C5CE7]" />
                    <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Customer Training</span>
                    <span className="ml-auto text-[10px] text-[#9699B0]">✓ = Trained</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRINTER_TRAINING.map(({ id, label }, i) => {
                      const checked = printerFields[id] === "yes";
                      return (
                        <label
                          key={id}
                          onClick={() => pf(id, checked ? "no" : "yes")}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer select-none transition-all"
                          style={{
                            background: checked ? "#EDE7F6" : "#F8F9FE",
                            border: `1px solid ${checked ? "#6C5CE730" : "#E2E4F0"}`,
                          }}
                        >
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: checked ? "#6C5CE7" : "#fff",
                              border: `1.5px solid ${checked ? "#6C5CE7" : "#C4C7DB"}`,
                            }}
                          >
                            {checked && (
                              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] font-medium leading-tight" style={{ color: checked ? "#6C5CE7" : "#6C6F87" }}>
                            {label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* ── PC-specific fields (shown only when a PC product is selected) ── */}
            {isPC && selectedProduct && (
              <div className="space-y-4 border-t border-[#E2E4F0] pt-4">

                {/* Customer Details */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Monitor size={13} className="text-[#6C5CE7]" />
                    <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Customer Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Name of User</label>
                      <input type="text" value={pcFields.contact_person} onChange={(e) => pc("contact_person", e.target.value)} placeholder="Full name" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Room No.</label>
                      <input type="text" value={pcFields.room_no} onChange={(e) => pc("room_no", e.target.value)} placeholder="e.g. 101" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile No.</label>
                      <input type="tel" value={pcFields.tel_no} onChange={(e) => pc("tel_no", e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Email ID</label>
                      <input type="email" value={pcFields.email} onChange={(e) => pc("email", e.target.value)} placeholder="user@example.com" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* License / Product Keys */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Key size={13} className="text-[#6C5CE7]" />
                    <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">License / Product Keys</span>
                  </div>
                  <div className="space-y-3">

                    {/* Windows */}
                    <div className="bg-[#F8F9FE] rounded-xl p-3 space-y-2">
                      <label className={labelClass + " !mb-0"}>Windows Key</label>
                      <input type="text" value={pcFields.win_key} onChange={(e) => pc("win_key", e.target.value)} placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" className={inputClass + " font-mono text-[12px]"} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>Version</label>
                          <input type="text" value={pcFields.win_version} onChange={(e) => pc("win_version", e.target.value)} placeholder="e.g. Windows 11 Pro" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Activation Status</label>
                          <div className="pt-1">
                            <ActStatus id="win_activation" value={pcFields.win_activation} onChange={(v) => pc("win_activation", v)} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MS Office */}
                    <div className="bg-[#F8F9FE] rounded-xl p-3 space-y-2">
                      <label className={labelClass + " !mb-0"}>MS Office Key</label>
                      <input type="text" value={pcFields.office_key} onChange={(e) => pc("office_key", e.target.value)} placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" className={inputClass + " font-mono text-[12px]"} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>Version</label>
                          <input type="text" value={pcFields.office_version} onChange={(e) => pc("office_version", e.target.value)} placeholder="e.g. MS Office 2021" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Activation Status</label>
                          <div className="pt-1">
                            <ActStatus id="office_activation" value={pcFields.office_activation} onChange={(v) => pc("office_activation", v)} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Antivirus */}
                    <div className="bg-[#F8F9FE] rounded-xl p-3 space-y-2">
                      <label className={labelClass + " !mb-0"}>Antivirus Key</label>
                      <input type="text" value={pcFields.av_key} onChange={(e) => pc("av_key", e.target.value)} placeholder="Enter antivirus product key" className={inputClass + " font-mono text-[12px]"} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className={labelClass}>Name</label>
                          <input type="text" value={pcFields.av_name} onChange={(e) => pc("av_name", e.target.value)} placeholder="e.g. Quick Heal" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Validity</label>
                          <input type="text" value={pcFields.av_validity} onChange={(e) => pc("av_validity", e.target.value)} placeholder="e.g. 3 Years" className={inputClass} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Activation Status</label>
                        <ActStatus id="av_activation" value={pcFields.av_activation} onChange={(v) => pc("av_activation", v)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Installation Checklist */}
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <ClipboardList size={13} className="text-[#6C5CE7]" />
                    <span className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Installation Checklist</span>
                  </div>
                  <div className="space-y-2">
                    {PC_CHECKLIST.map(({ id, label }) => (
                      <div key={id} className="flex items-center justify-between bg-[#F8F9FE] rounded-xl px-4 py-2.5">
                        <span className="text-[12.5px] text-[#2D3436] flex-1 mr-3">{label}</span>
                        <YesNo value={pcFields[id]} onChange={(v) => pc(id, v)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Custom Fields (non-PC or extra) */}
            <div className="border-t border-[#E2E4F0] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[#9699B0]">Additional Fields</span>
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
