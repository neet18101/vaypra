"use client";

import { useState, useRef, startTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, X, Plus, Edit, Trash2, Upload, Download, ChevronDown,
  Truck, Monitor, Printer, Zap, ScanLine, Copy, Eye, Search, Filter,
} from "lucide-react";
import Card from "@/app/components/Card";
import CSVImportModal from "@/app/components/CSVImportModal";
import DispatchModal from "@/app/components/DispatchModal";
import { createClient } from "@/utils/supabase/client";

const inputClass =
  "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

const TABS = [
  { id: "PC",                     label: "PC",                     icon: Monitor, color: "#6C5CE7" },
  { id: "Single Printer",         label: "Single Printer",         icon: Printer, color: "#00CEC9" },
  { id: "Multi-Function Printer", label: "Multi-Function Printer", icon: Printer, color: "#0984E3" },
  { id: "UPS",                    label: "UPS",                    icon: Zap,     color: "#FDCB6E" },
  { id: "Scanner",                label: "Scanner",                icon: ScanLine,color: "#00B894" },
  { id: "Photocopier",              label: "Photocopier",              icon: Copy,    color: "#E17055" },
];

const defaultPCForm = {
  department_name: "", address: "", mobile_no: "", email_id: "", name_of_user: "",
  specification: "", brand: "", model_no: "", serial_no: "", installation_date: "",
  warranty_period: "", warranty_expiry_date: "", room_no: "",
  windows_key: "", windows_version: "",
  ms_office_key: "", ms_office_version: "",
  antivirus_batchnumber: "", antivirus_serial_key: "", antivirus_name: "", antivirus_validity: "",
};

const defaultGenericForm = {
  name: "", sku: "", serial_number: "", brand: "", stock: "1", price: "0", status: "in-stock",
};

const DEPARTMENTS = [
  "Aishbagh",
  "Hazratganj",
  "Camp Office Directorate-Hazratganj",
  "Government Branch Press Hazratganj",
  "Government Press Aishbagh",
  "Government Press Rampur",
  "Government Press Varanasi",
  "Government Press Prayagraj",
  "Directorate of Printing and Stationary",
];

const PC_CSV_COLUMNS = [
  "DEPARTMENT Name:", "Address:", "Mobile No", "Email ID", "Name of User",
  "Specification", "Processor", "Brand", "Model No", "M/C Serial No:", "Installation Date:",
  "Warranty Period:", "Warranty Expiry Date:", "Room No:", "Windows Key:",
  "Windows Version:", "MS Office Key:", "MS Office Version:", "Antivirus Batchnumber",
  "Antivirus Serial Key", "Antivirus Name:", "Antivirus Validity:", "Category",
];

const PRINTER_CSV_COLUMNS = [
  "Department Name", "Address", "Mobile No", "Email ID", "Name of User", "Room No",
  "Brand", "Model No", "Serial No", "Installation Date", "Warranty Period", "Warranty Expiry Date",
  "Printer Type", "Toner/Cartridge Model",
];

const UPS_CSV_COLUMNS = [
  "Department Name", "Address", "Mobile No", "Email ID", "Name of User", "Room No",
  "Brand", "Model No", "Serial No", "Installation Date", "Warranty Period", "Warranty Expiry Date",
  "Capacity (KVA)", "Battery Type", "Battery Replace Date",
];

const SCANNER_CSV_COLUMNS = [
  "Department Name", "Address", "Mobile No", "Email ID", "Name of User", "Room No",
  "Brand", "Model No", "Serial No", "Installation Date", "Warranty Period", "Warranty Expiry Date",
  "Scanner Type",
];

const PHOTOCOPIER_CSV_COLUMNS = [
  "Department Name", "Address", "Mobile No", "Email ID", "Name of User", "Room No",
  "Brand", "Model No", "Serial No", "Installation Date", "Warranty Period", "Warranty Expiry Date",
  "Toner Model", "Counter Reading",
];

function mapDeviceCSVRow(row, category) {
  const get = (...keys) => { for (const k of keys) if (row[k]) return row[k]; return ""; };
  const cf = {};
  const set = (k, ...keys) => { const v = get(...keys); if (v) cf[k] = v; };
  set("department_name", "Department Name", "DEPARTMENT Name:", "DEPARTMENT Name");
  set("address", "Address", "Address:");
  set("mobile_no", "Mobile No");
  set("email_id", "Email ID");
  set("name_of_user", "Name of User");
  set("room_no", "Room No");
  set("installation_date", "Installation Date", "Installation Date:");
  set("warranty_period", "Warranty Period", "Warranty Period:");
  set("warranty_expiry_date", "Warranty Expiry Date", "Warranty Expiry Date:");
  if (category === "Single Printer" || category === "Multi-Function Printer") {
    set("printer_type", "Printer Type");
    set("toner_cartridge_model", "Toner/Cartridge Model");
  } else if (category === "UPS") {
    set("capacity_kva", "Capacity (KVA)");
    set("battery_type", "Battery Type");
    set("battery_replace_date", "Battery Replace Date");
  } else if (category === "Scanner") {
    set("scanner_type", "Scanner Type");
  } else if (category === "Photocopier") {
    set("toner_model", "Toner Model");
    set("counter_reading", "Counter Reading");
  }
  return {
    name: get("Specification", "Model No"),
    brand: get("Brand") || null,
    sku: get("Model No"),
    serial_number: get("Serial No", "M/C SerialNo:", "M/C Serial No:", "M/C Serial No") || null,
    category,
    stock: 1,
    price: 0,
    status: "in-stock",
    custom_fields: Object.keys(cf).length > 0 ? cf : null,
  };
}

function mapPCCSVRow(row) {
  const get = (...keys) => { for (const k of keys) if (row[k]) return row[k]; return ""; };
  const cf = {};
  const set = (k, ...keys) => { const v = get(...keys); if (v) cf[k] = v; };
  set("department_name", "DEPARTMENT Name:", "DEPARTMENT Name");
  set("address", "Address:", "Address");
  set("mobile_no", "Mobile No");
  set("email_id", "Email ID");
  set("name_of_user", "Name of User");
  set("installation_date", "Installation Date:", "Installation Date");
  set("warranty_period", "Warranty Period:", "Warranty Period");
  set("warranty_expiry_date", "Warranty Expiry Date:", "Warranty Expiry Date");
  set("room_no", "Room No:", "Room No");
  set("windows_key", "Windows Key:", "Windows Key");
  set("windows_version", "Windows Version:", "Windows Version");
  set("ms_office_key", "MS Office Key:", "MS Office Key");
  set("ms_office_version", "MS Office Version:", "MS Office Version");
  set("antivirus_batchnumber", "Antivirus Batchnumber");
  set("antivirus_serial_key", "Antivirus Serial Key");
  set("antivirus_name", "Antivirus Name:", "Antivirus Name");
  set("antivirus_validity", "Antivirus Validity:", "Antivirus Validity");
  set("processor", "Processor");
  return {
    name: get("Specification"),
    brand: get("Brand") || null,
    sku: get("Model No"),
    serial_number: get("M/C Serial No:", "M/C Serial No") || null,
    category: "PC",
    stock: 1,
    price: 0,
    status: "in-stock",
    custom_fields: Object.keys(cf).length > 0 ? cf : null,
  };
}

function PCLabel({ children }) {
  return <label className="block text-xs font-medium text-[#9699B0] mb-1.5">{children}</label>;
}

function SectionHeading({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7] mb-3 mt-5">
      {children}
    </p>
  );
}

export default function InventoryContent({ products, branches }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("PC");
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // PC form
  const [pcForm, setPCForm] = useState(defaultPCForm);
  // Generic form (Printer / UPS)
  const [genericForm, setGenericForm] = useState(defaultGenericForm);
  const [customFields, setCustomFields] = useState([]);

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);

  // Delete confirmation dialog
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, countdown }
  const deleteCountdownRef = useRef(null);

  // PC filters
  const [pcDeptFilter, setPcDeptFilter] = useState("");
  const [pcSerialSearch, setPcSerialSearch] = useState("");
  const [pcProcessorFilter, setPcProcessorFilter] = useState("");

  // UPS filters
  const [upsDeptFilter, setUpsDeptFilter] = useState("");
  const [upsSerialSearch, setUpsSerialSearch] = useState("");

  // Single Printer filters
  const [spDeptFilter, setSpDeptFilter] = useState("");
  const [spSerialSearch, setSpSerialSearch] = useState("");

  // Multi-Function Printer filters
  const [mfpDeptFilter, setMfpDeptFilter] = useState("");
  const [mfpSerialSearch, setMfpSerialSearch] = useState("");

  // Scanner filters
  const [scanDeptFilter, setScanDeptFilter] = useState("");
  const [scanSerialSearch, setScanSerialSearch] = useState("");

  // Photocopier filters
  const [photoDeptFilter, setPhotoDeptFilter] = useState("");
  const [photoSerialSearch, setPhotoSerialSearch] = useState("");

  // Background import progress chip
  const [importProgress, setImportProgress] = useState(null); // { tab, current, total, done, errorCount }


  const normalizeCategory = (cat) => cat === "PhotoCopy" ? "Photocopier" : cat;
  const tabProducts = products.filter((p) => normalizeCategory(p.category) === activeTab);

  const filteredPCProducts = activeTab === "PC"
    ? tabProducts.filter((p) => {
        const cf = p.custom_fields || {};
        if (pcDeptFilter && cf.department_name !== pcDeptFilter) return false;
        if (pcSerialSearch && !(p.serial_number || "").toLowerCase().includes(pcSerialSearch.toLowerCase())) return false;
        if (pcProcessorFilter && (cf.processor || "").toLowerCase() !== pcProcessorFilter.toLowerCase()) return false;
        return true;
      })
    : tabProducts;

  const filteredUPSProducts = activeTab === "UPS"
    ? tabProducts.filter((p) => {
        const cf = p.custom_fields || {};
        if (upsDeptFilter && cf.department_name !== upsDeptFilter) return false;
        if (upsSerialSearch && !(p.serial_number || "").toLowerCase().includes(upsSerialSearch.toLowerCase())) return false;
        return true;
      })
    : tabProducts;

  const filteredSPProducts = activeTab === "Single Printer"
    ? tabProducts.filter((p) => {
        const cf = p.custom_fields || {};
        if (spDeptFilter && cf.department_name !== spDeptFilter) return false;
        if (spSerialSearch && !(p.serial_number || "").toLowerCase().includes(spSerialSearch.toLowerCase())) return false;
        return true;
      })
    : tabProducts;

  const filteredMFPProducts = activeTab === "Multi-Function Printer"
    ? tabProducts.filter((p) => {
        const cf = p.custom_fields || {};
        if (mfpDeptFilter && cf.department_name !== mfpDeptFilter) return false;
        if (mfpSerialSearch && !(p.serial_number || "").toLowerCase().includes(mfpSerialSearch.toLowerCase())) return false;
        return true;
      })
    : tabProducts;

  const filteredScannerProducts = activeTab === "Scanner"
    ? tabProducts.filter((p) => {
        const cf = p.custom_fields || {};
        if (scanDeptFilter && cf.department_name !== scanDeptFilter) return false;
        if (scanSerialSearch && !(p.serial_number || "").toLowerCase().includes(scanSerialSearch.toLowerCase())) return false;
        return true;
      })
    : tabProducts;

  const filteredPhotocopierProducts = activeTab === "Photocopier"
    ? tabProducts.filter((p) => {
        const cf = p.custom_fields || {};
        if (photoDeptFilter && cf.department_name !== photoDeptFilter) return false;
        if (photoSerialSearch && !(p.serial_number || "").toLowerCase().includes(photoSerialSearch.toLowerCase())) return false;
        return true;
      })
    : tabProducts;

  const displayedNonPCProducts =
    activeTab === "UPS" ? filteredUPSProducts :
    activeTab === "Single Printer" ? filteredSPProducts :
    activeTab === "Multi-Function Printer" ? filteredMFPProducts :
    activeTab === "Scanner" ? filteredScannerProducts :
    activeTab === "Photocopier" ? filteredPhotocopierProducts :
    tabProducts;

  const inStockTabProducts = (activeTab === "PC" ? filteredPCProducts : displayedNonPCProducts).filter((p) => p.status === "in-stock");

  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleSelectAll = () => {
    if (selectedIds.length === inStockTabProducts.length) setSelectedIds([]);
    else setSelectedIds(inStockTabProducts.map((p) => p.id));
  };


  // ── PC modal ──────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingProduct(null);
    if (activeTab === "PC") setPCForm(defaultPCForm);
    else { setGenericForm(defaultGenericForm); setCustomFields([]); }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setPCForm(defaultPCForm);
    setGenericForm(defaultGenericForm);
    setCustomFields([]);
  };

  const handleEditPC = (product) => {
    const cf = product.custom_fields || {};
    setEditingProduct(product);
    setPCForm({
      department_name: cf.department_name || "",
      address: cf.address || "",
      mobile_no: cf.mobile_no || "",
      email_id: cf.email_id || "",
      name_of_user: cf.name_of_user || "",
      specification: product.name || "",
      brand: product.brand || "",
      model_no: product.sku || "",
      serial_no: product.serial_number || "",
      installation_date: cf.installation_date || "",
      warranty_period: cf.warranty_period || "",
      warranty_expiry_date: cf.warranty_expiry_date || "",
      room_no: cf.room_no || "",
      windows_key: cf.windows_key || "",
      windows_version: cf.windows_version || "",
      ms_office_key: cf.ms_office_key || "",
      ms_office_version: cf.ms_office_version || "",
      antivirus_batchnumber: cf.antivirus_batchnumber || "",
      antivirus_serial_key: cf.antivirus_serial_key || "",
      antivirus_name: cf.antivirus_name || "",
      antivirus_validity: cf.antivirus_validity || "",
    });
    setShowModal(true);
  };

  const handleSavePC = async () => {
    setSaving(true);
    try {
      const cfKeys = [
        "department_name", "address", "mobile_no", "email_id", "name_of_user",
        "installation_date", "warranty_period", "warranty_expiry_date", "room_no",
        "windows_key", "windows_version", "ms_office_key", "ms_office_version",
        "antivirus_batchnumber", "antivirus_serial_key", "antivirus_name", "antivirus_validity",
      ];
      const cf = {};
      cfKeys.forEach((k) => { if (pcForm[k]) cf[k] = pcForm[k]; });
      const productData = {
        name: pcForm.specification,
        brand: pcForm.brand || null,
        sku: pcForm.model_no,
        serial_number: pcForm.serial_no || null,
        category: "PC",
        stock: 1,
        price: 0,
        status: "in-stock",
        custom_fields: Object.keys(cf).length > 0 ? cf : null,
      };
      if (editingProduct) {
        const supabase = createClient();
        await supabase.from("products").update(productData).eq("id", editingProduct.id);
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (!res.ok) { const err = await res.json(); alert("Failed: " + err.error); return; }
      }
      closeModal();
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  };

  // ── Generic modal (Printer / UPS) ─────────────────────────────────────────
  const handleEditGeneric = (product) => {
    setEditingProduct(product);
    setGenericForm({
      name: product.name || "",
      sku: product.sku || "",
      serial_number: product.serial_number || "",
      brand: product.brand || "",
      stock: product.stock?.toString() || "1",
      price: product.price?.toString() || "0",
      status: product.status || "in-stock",
    });
    const cf = product.custom_fields || {};
    setCustomFields(Object.entries(cf).map(([key, value]) => ({ key, value })));
    setShowModal(true);
  };

  const handleSaveGeneric = async () => {
    setSaving(true);
    try {
      const cfObj = {};
      customFields.forEach((f) => { if (f.key.trim()) cfObj[f.key.trim()] = f.value; });
      const productData = {
        name: genericForm.name,
        sku: genericForm.sku,
        serial_number: genericForm.serial_number || null,
        brand: genericForm.brand || null,
        stock: Number(genericForm.stock),
        price: Number(genericForm.price),
        category: activeTab,
        status: genericForm.status,
        custom_fields: Object.keys(cfObj).length > 0 ? cfObj : null,
      };
      if (editingProduct) {
        const supabase = createClient();
        await supabase.from("products").update(productData).eq("id", editingProduct.id);
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (!res.ok) { const err = await res.json(); alert("Failed: " + err.error); return; }
      }
      closeModal();
      startTransition(() => router.refresh());
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setDeleteConfirm({ id, countdown: 10 });
    deleteCountdownRef.current = setInterval(() => {
      setDeleteConfirm((prev) => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          clearInterval(deleteCountdownRef.current);
          // auto-execute delete after countdown
          (async () => {
            const supabase = createClient();
            await supabase.from("installations").update({ product_id: null }).eq("product_id", prev.id);
            await supabase.from("products").delete().eq("id", prev.id);
            startTransition(() => router.refresh());
          })();
          return null;
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);
  };

  const cancelDelete = () => {
    clearInterval(deleteCountdownRef.current);
    setDeleteConfirm(null);
  };

  const confirmDeleteNow = async () => {
    clearInterval(deleteCountdownRef.current);
    const id = deleteConfirm?.id;
    setDeleteConfirm(null);
    if (!id) return;
    const supabase = createClient();
    await supabase.from("installations").update({ product_id: null }).eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    startTransition(() => router.refresh());
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} item(s)?`)) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("products").delete().in("id", selectedIds);
      setSelectedIds([]);
      startTransition(() => router.refresh());
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── CSV import ────────────────────────────────────────────────────────────
  const fetchExistingSerials = async (category) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("serial_number")
      .eq("category", category)
      .not("serial_number", "is", null);
    const set = new Set();
    (data || []).forEach((r) => { if (r.serial_number) set.add(r.serial_number.trim().toLowerCase()); });
    return set;
  };

  const handlePCCSVImport = async (rows) => {
    setShowCSVModal(false);
    setImportProgress({ tab: "PC", current: 0, total: rows.length, done: false, errorCount: 0, skipped: 0 });
    const existingSerials = await fetchExistingSerials("PC");
    const seenThisBatch = new Set();
    const errors = [];
    let skipped = 0;
    for (let i = 0; i < rows.length; i++) {
      const mapped = mapPCCSVRow(rows[i]);
      const serial = (mapped.serial_number || "").trim().toLowerCase();
      if (serial && (existingSerials.has(serial) || seenThisBatch.has(serial))) {
        skipped++;
      } else {
        if (serial) seenThisBatch.add(serial);
        try {
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mapped),
          });
          if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        } catch (err) {
          errors.push({ row: i + 1, message: err.message });
        }
      }
      setImportProgress({ tab: "PC", current: i + 1, total: rows.length, done: false, errorCount: errors.length, skipped });
    }
    setImportProgress({ tab: "PC", current: rows.length, total: rows.length, done: true, errorCount: errors.length, skipped });
    startTransition(() => router.refresh());
    setTimeout(() => setImportProgress(null), 5000);
    return { count: rows.length - errors.length - skipped, errors };
  };

  const handleDeviceCSVImport = async (rows) => {
    const tab = activeTab;
    setShowCSVModal(false);
    setImportProgress({ tab, current: 0, total: rows.length, done: false, errorCount: 0, skipped: 0 });
    const existingSerials = await fetchExistingSerials(tab);
    const seenThisBatch = new Set();
    const errors = [];
    let skipped = 0;
    for (let i = 0; i < rows.length; i++) {
      const mapped = mapDeviceCSVRow(rows[i], tab);
      const serial = (mapped.serial_number || "").trim().toLowerCase();
      if (serial && (existingSerials.has(serial) || seenThisBatch.has(serial))) {
        skipped++;
      } else {
        if (serial) seenThisBatch.add(serial);
        try {
          const res = await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mapped),
          });
          if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        } catch (err) {
          errors.push({ row: i + 1, message: err.message });
        }
      }
      setImportProgress({ tab, current: i + 1, total: rows.length, done: false, errorCount: errors.length, skipped });
    }
    setImportProgress({ tab, current: rows.length, total: rows.length, done: true, errorCount: errors.length, skipped });
    startTransition(() => router.refresh());
    setTimeout(() => setImportProgress(null), 5000);
    return { count: rows.length - errors.length - skipped, errors };
  };

  const handleGenericCSVImport = async (rows, onProgress) => {
    const known = ["name", "sku", "serial_number", "brand", "stock", "price", "status"];
    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const cfObj = {};
      Object.keys(row).forEach((k) => { if (!known.includes(k) && row[k]) cfObj[k] = row[k]; });
      const productData = {
        name: row.name || "",
        sku: row.sku || "",
        serial_number: row.serial_number || null,
        brand: row.brand || null,
        stock: Number(row.stock) || 0,
        price: Number(row.price) || 0,
        category: activeTab,
        status: row.status || "in-stock",
        custom_fields: Object.keys(cfObj).length > 0 ? cfObj : null,
      };
      try {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
        onProgress?.(i + 1, i, null);
      } catch (err) {
        errors.push({ row: i + 1, message: err.message });
        onProgress?.(i + 1, i, err.message);
      }
    }
    startTransition(() => router.refresh());
    return { count: rows.length - errors.length, errors };
  };

  const handleExportCSV = () => {
    const tab = activeTab;
    const rows = tabProducts;

    let headers, getRow;

    if (tab === "PC") {
      headers = [
        "Department Name", "Address", "Name of User", "Mobile No", "Email ID", "Room No",
        "Brand", "Model No", "Serial No", "Specification", "Processor",
        "Installation Date", "Warranty Period", "Warranty Expiry Date",
        "Windows Key", "Windows Version", "MS Office Key", "MS Office Version",
        "Antivirus Name", "Antivirus Serial Key", "Antivirus Validity",
        "Installation Status",
      ];
      getRow = (p) => {
        const cf = p.custom_fields || {};
        return [
          cf.department_name || "", cf.address || "", cf.name_of_user || cf.contact_person || "",
          cf.mobile_no || cf.tel_no || "", cf.email_id || cf.email || "", cf.room_no || "",
          p.brand || "", p.name || "", p.serial_number || "",
          cf.specification || "", cf.processor || "",
          cf.installation_date || "", cf.warranty_period || "", cf.warranty_expiry_date || "",
          cf.windows_key || "", cf.win_version || cf.windows_version || "",
          cf.ms_office_key || "", cf.ms_office_version || cf.office_version || "",
          cf.antivirus_name || cf.av_name || "", cf.antivirus_serial_key || cf.av_key || "",
          cf.antivirus_validity || cf.av_validity || "",
          p.status === "installed" ? "Installed" : "Not Installed",
        ];
      };
    } else if (tab === "Single Printer" || tab === "Multi-Function Printer") {
      headers = [
        "Department Name", "Address", "Name of User", "Mobile No", "Email ID", "Room No",
        "Brand", "Model No", "Serial No",
        "Installation Date", "Warranty Period", "Warranty Expiry Date",
        "Toner/Cartridge Model", "Installation Status",
      ];
      getRow = (p) => {
        const cf = p.custom_fields || {};
        return [
          cf.department_name || "", cf.address || "", cf.name_of_user || "",
          cf.mobile_no || "", cf.email_id || "", cf.room_no || "",
          p.brand || "", p.name || "", p.serial_number || cf.mc_serial || "",
          cf.installation_date || "", cf.warranty_period || "", cf.warranty_expiry_date || "",
          cf.toner_cartridge_model || cf.toner_model || "",
          p.status === "installed" ? "Installed" : "Not Installed",
        ];
      };
    } else if (tab === "UPS") {
      headers = [
        "Department Name", "Address", "Name of User", "Mobile No", "Email ID", "Room No",
        "Brand", "Model No", "Serial No",
        "Installation Date", "Warranty Period", "Warranty Expiry Date",
        "Capacity (KVA)", "Battery Type", "Installation Status",
      ];
      getRow = (p) => {
        const cf = p.custom_fields || {};
        return [
          cf.department_name || "", cf.address || "", cf.name_of_user || "",
          cf.mobile_no || "", cf.email_id || "", cf.room_no || "",
          p.brand || "", p.name || "", p.serial_number || cf.mc_serial || "",
          cf.installation_date || "", cf.warranty_period || "", cf.warranty_expiry_date || "",
          cf.capacity_kva || "", cf.battery_type || "",
          p.status === "installed" ? "Installed" : "Not Installed",
        ];
      };
    } else if (tab === "Scanner") {
      headers = [
        "Department Name", "Address", "Name of User", "Mobile No", "Email ID", "Room No",
        "Brand", "Model No", "Serial No",
        "Installation Date", "Warranty Period", "Warranty Expiry Date",
        "Scanner Type", "Installation Status",
      ];
      getRow = (p) => {
        const cf = p.custom_fields || {};
        return [
          cf.department_name || "", cf.address || "", cf.name_of_user || "",
          cf.mobile_no || "", cf.email_id || "", cf.room_no || "",
          p.brand || "", p.name || "", p.serial_number || cf.mc_serial || "",
          cf.installation_date || "", cf.warranty_period || "", cf.warranty_expiry_date || "",
          cf.scanner_type || "",
          p.status === "installed" ? "Installed" : "Not Installed",
        ];
      };
    } else if (tab === "Photocopier") {
      headers = [
        "Department Name", "Address", "Name of User", "Mobile No", "Email ID", "Room No",
        "Brand", "Model No", "Serial No",
        "Installation Date", "Warranty Period", "Warranty Expiry Date",
        "Toner Model", "Installation Status",
      ];
      getRow = (p) => {
        const cf = p.custom_fields || {};
        return [
          cf.department_name || "", cf.address || "", cf.name_of_user || "",
          cf.mobile_no || "", cf.email_id || "", cf.room_no || "",
          p.brand || "", p.name || "", p.serial_number || cf.mc_serial || "",
          cf.installation_date || "", cf.warranty_period || "", cf.warranty_expiry_date || "",
          cf.toner_model || "",
          p.status === "installed" ? "Installed" : "Not Installed",
        ];
      };
    } else {
      headers = ["Brand", "Model No", "Serial No", "Status", "Installation Status"];
      getRow = (p) => [p.brand || "", p.name || "", p.serial_number || "", p.status || "", p.status === "installed" ? "Installed" : "Not Installed"];
    }

    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [headers.map(escape).join(","), ...rows.map((p) => getRow(p).map(escape).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_${tab.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentTab = TABS.find((t) => t.id === activeTab);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          Inventory Management
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E4F0] bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E4F0] bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
            style={{ background: `linear-gradient(135deg, ${currentTab.color}, ${currentTab.color}CC)` }}
          >
            <Plus size={16} />
            Add {activeTab}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((tab) => {
          const count = products.filter((p) => normalizeCategory(p.category) === tab.id).length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedIds([]); setExpandedRow(null); setPcDeptFilter(""); setPcSerialSearch(""); setPcProcessorFilter(""); setUpsDeptFilter(""); setUpsSerialSearch(""); setSpDeptFilter(""); setSpSerialSearch(""); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? "text-white border-transparent shadow-md"
                  : "bg-white border-[#E2E4F0] text-gray-600 hover:text-[#6C5CE7] hover:border-[#6C5CE7]/30"
              }`}
              style={isActive ? { background: `linear-gradient(135deg, ${tab.color}, ${tab.color}AA)` } : {}}
            >
              <tab.icon size={15} />
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/25 text-white" : "bg-[#F4F5FB] text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        <Card className="flex items-center gap-3 py-3 px-4">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: currentTab.color + "22" }}>
            <currentTab.icon size={18} style={{ color: currentTab.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 truncate">{activeTab} Items</p>
            <p className="text-xl font-bold text-gray-900">{tabProducts.length}</p>
          </div>
        </Card>
        {TABS.filter((t) => t.id !== activeTab).map((tab) => {
          const c = products.filter((p) => normalizeCategory(p.category) === tab.id).length;
          return (
            <Card key={tab.id} className="flex items-center gap-3 py-3 px-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: tab.color + "22" }}>
                <tab.icon size={18} style={{ color: tab.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 truncate">{tab.label}</p>
                <p className="text-xl font-bold text-gray-900">{c}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── PC TAB TABLE ──────────────────────────────────────────────────── */}
      {activeTab === "PC" && (
        <>
          {/* PC Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-[#E2E4F0] rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9699B0] uppercase tracking-wider">
              <Filter size={13} />
              Filters
            </div>

            {/* Department dropdown */}
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <select
                value={pcDeptFilter}
                onChange={(e) => { setPcDeptFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Processor dropdown */}
            <div className="relative min-w-[140px] flex-1 max-w-[180px]">
              <select
                value={pcProcessorFilter}
                onChange={(e) => { setPcProcessorFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
              >
                <option value="">All Processors</option>
                <option value="i5">i5</option>
                <option value="i7">i7</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Serial No search */}
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={pcSerialSearch}
                onChange={(e) => { setPcSerialSearch(e.target.value); setSelectedIds([]); }}
                placeholder="Search serial no…"
                className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-9 pr-8 py-2 text-[13px] outline-none focus:border-[#6C5CE7] transition-colors"
              />
              {pcSerialSearch && (
                <button onClick={() => setPcSerialSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Clear + count */}
            {(pcDeptFilter || pcSerialSearch || pcProcessorFilter) && (
              <button
                onClick={() => { setPcDeptFilter(""); setPcSerialSearch(""); setPcProcessorFilter(""); setSelectedIds([]); }}
                className="text-xs text-[#E17055] font-semibold hover:underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-gray-400 font-medium">
              {filteredPCProducts.length}
              {(pcDeptFilter || pcSerialSearch || pcProcessorFilter) ? ` of ${tabProducts.length}` : ""} items
            </span>
          </div>

          {/* Quick select */}
          {inStockTabProducts.length > 0 && (
            <div className="mb-4 flex items-center gap-3">
              <span className="text-sm text-gray-500">Quick select:</span>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseInt(e.target.elements.sc.value) || 0;
                  const count = Math.min(Math.max(val, 0), inStockTabProducts.length);
                  setSelectedIds(inStockTabProducts.slice(0, count).map((p) => p.id));
                  e.target.elements.sc.value = "";
                }}
                className="flex items-center gap-2"
              >
                <input
                  name="sc"
                  type="number"
                  min="0"
                  max={inStockTabProducts.length}
                  placeholder={`1–${inStockTabProducts.length}`}
                  className="w-[90px] bg-[#F8F9FE] border border-[#E2E4F0] rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-[#6C5CE7]"
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-semibold">
                  Select
                </button>
              </form>
              {selectedIds.length > 0 && (
                <>
                  <span className="text-sm font-medium text-[#6C5CE7]">{selectedIds.length} selected</span>
                  <button onClick={() => setSelectedIds([])} className="text-xs text-gray-400 hover:text-[#E17055]">Clear</button>
                </>
              )}
            </div>
          )}

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-2 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === inStockTabProducts.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 accent-[#6C5CE7]"
                      />
                    </th>
                    {[
                      "Category", "Department", /* "User / Room", */ "Specification", "Brand / Model",
                      "Serial No", /* "Install Date", */ "Warranty", "Windows Key",
                      "Office Key", "Antivirus", "Actions",
                    ].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPCProducts.map((product, index) => {
                    const cf = product.custom_fields || {};
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selectedIds.includes(product.id) ? "bg-[#EDE7F6]/40" : ""}`}
                      >
                        <td className="py-3 px-2 w-10">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="w-4 h-4 accent-[#6C5CE7]"
                          />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-bold bg-[#EDE7F6] text-[#6C5CE7]">
                            {product.category || "PC"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-[13px] text-gray-700 max-w-[140px]">
                          <div className="font-medium truncate" title={cf.department_name}>{cf.department_name || "—"}</div>
                        </td>
                        {/* <td className="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                          <div>{cf.name_of_user || "—"}</div>
                          {cf.room_no && <div className="text-[#9699B0]">Room: {cf.room_no}</div>}
                        </td> */}
                        <td className="py-3 px-3 text-[13px] text-gray-800 font-medium max-w-[160px]">
                          <span className="truncate block" title={product.name}>{product.name || "—"}</span>
                        </td>
                        <td className="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                          <div className="font-medium">{product.brand || "—"}</div>
                          <div className="text-[#9699B0] font-mono">{product.sku || ""}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-[13px] text-gray-500 whitespace-nowrap">
                          {product.serial_number || "—"}
                        </td>
                        {/* <td className="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                          {cf.installation_date || "—"}
                        </td> */}
                        <td className="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                          <div>{cf.warranty_period || "—"}</div>
                          {cf.warranty_expiry_date && (
                            <div className="text-[#9699B0]">Exp: {cf.warranty_expiry_date}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-[12px] text-gray-500 max-w-[140px]">
                          <div className="truncate" title={cf.windows_key}>{cf.windows_key || "—"}</div>
                          {cf.windows_version && <div className="text-[#9699B0] truncate">{cf.windows_version}</div>}
                        </td>
                        <td className="py-3 px-3 font-mono text-[12px] text-gray-500 max-w-[140px]">
                          <div className="truncate" title={cf.ms_office_key}>{cf.ms_office_key || "—"}</div>
                          {cf.ms_office_version && <div className="text-[#9699B0] truncate">{cf.ms_office_version}</div>}
                        </td>
                        <td className="py-3 px-3 text-[13px] text-gray-600 whitespace-nowrap">
                          <div>{cf.antivirus_name || "—"}</div>
                          {cf.antivirus_validity && <div className="text-[#9699B0]">{cf.antivirus_validity}</div>}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewingProduct(product)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#00CEC9] hover:bg-[#00CEC9]/10 transition-colors"
                              title="View details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleEditPC(product)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-[#E17055] hover:bg-[#E17055]/10 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filteredPCProducts.length === 0 && (
                    <tr>
                      <td colSpan={13} className="py-14 text-center text-gray-400 text-sm">
                        <Monitor size={32} className="mx-auto mb-2 opacity-40" />
                        {(pcDeptFilter || pcSerialSearch)
                          ? "No PCs match your filters"
                          : "No PCs found — add one or import CSV"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* ── PRINTER / UPS TAB TABLE ──────────────────────────────────────── */}
      {activeTab !== "PC" && (
        <>
        {/* Single Printer filters */}
        {activeTab === "Single Printer" && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-[#E2E4F0] rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9699B0] uppercase tracking-wider">
              <Filter size={13} />
              Filters
            </div>
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <select
                value={spDeptFilter}
                onChange={(e) => { setSpDeptFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#00CEC9] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={spSerialSearch}
                onChange={(e) => { setSpSerialSearch(e.target.value); setSelectedIds([]); }}
                placeholder="Search serial no…"
                className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-9 pr-8 py-2 text-[13px] outline-none focus:border-[#00CEC9] transition-colors"
              />
              {spSerialSearch && (
                <button onClick={() => setSpSerialSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            {(spDeptFilter || spSerialSearch) && (
              <button
                onClick={() => { setSpDeptFilter(""); setSpSerialSearch(""); setSelectedIds([]); }}
                className="text-xs text-[#E17055] font-semibold hover:underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-gray-400 font-medium">
              {filteredSPProducts.length}
              {(spDeptFilter || spSerialSearch) ? ` of ${tabProducts.length}` : ""} items
            </span>
          </div>
        )}

        {/* UPS filters */}
        {activeTab === "UPS" && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-[#E2E4F0] rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9699B0] uppercase tracking-wider">
              <Filter size={13} />
              Filters
            </div>

            {/* Department dropdown */}
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <select
                value={upsDeptFilter}
                onChange={(e) => { setUpsDeptFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#FDCB6E] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Serial No search */}
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={upsSerialSearch}
                onChange={(e) => { setUpsSerialSearch(e.target.value); setSelectedIds([]); }}
                placeholder="Search serial no…"
                className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-9 pr-8 py-2 text-[13px] outline-none focus:border-[#FDCB6E] transition-colors"
              />
              {upsSerialSearch && (
                <button onClick={() => setUpsSerialSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Clear + count */}
            {(upsDeptFilter || upsSerialSearch) && (
              <button
                onClick={() => { setUpsDeptFilter(""); setUpsSerialSearch(""); setSelectedIds([]); }}
                className="text-xs text-[#E17055] font-semibold hover:underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-gray-400 font-medium">
              {filteredUPSProducts.length}
              {(upsDeptFilter || upsSerialSearch) ? ` of ${tabProducts.length}` : ""} items
            </span>
          </div>
        )}

        {/* Multi-Function Printer filters */}
        {activeTab === "Multi-Function Printer" && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-[#E2E4F0] rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9699B0] uppercase tracking-wider">
              <Filter size={13} />
              Filters
            </div>
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <select
                value={mfpDeptFilter}
                onChange={(e) => { setMfpDeptFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#0984E3] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={mfpSerialSearch}
                onChange={(e) => { setMfpSerialSearch(e.target.value); setSelectedIds([]); }}
                placeholder="Search serial no…"
                className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-9 pr-8 py-2 text-[13px] outline-none focus:border-[#0984E3] transition-colors"
              />
              {mfpSerialSearch && (
                <button onClick={() => setMfpSerialSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            {(mfpDeptFilter || mfpSerialSearch) && (
              <button
                onClick={() => { setMfpDeptFilter(""); setMfpSerialSearch(""); setSelectedIds([]); }}
                className="text-xs text-[#E17055] font-semibold hover:underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-gray-400 font-medium">
              {filteredMFPProducts.length}
              {(mfpDeptFilter || mfpSerialSearch) ? ` of ${tabProducts.length}` : ""} items
            </span>
          </div>
        )}

        {/* Scanner filters */}
        {activeTab === "Scanner" && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-[#E2E4F0] rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9699B0] uppercase tracking-wider">
              <Filter size={13} />
              Filters
            </div>
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <select
                value={scanDeptFilter}
                onChange={(e) => { setScanDeptFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#00B894] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={scanSerialSearch}
                onChange={(e) => { setScanSerialSearch(e.target.value); setSelectedIds([]); }}
                placeholder="Search serial no…"
                className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-9 pr-8 py-2 text-[13px] outline-none focus:border-[#00B894] transition-colors"
              />
              {scanSerialSearch && (
                <button onClick={() => setScanSerialSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            {(scanDeptFilter || scanSerialSearch) && (
              <button
                onClick={() => { setScanDeptFilter(""); setScanSerialSearch(""); setSelectedIds([]); }}
                className="text-xs text-[#E17055] font-semibold hover:underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-gray-400 font-medium">
              {filteredScannerProducts.length}
              {(scanDeptFilter || scanSerialSearch) ? ` of ${tabProducts.length}` : ""} items
            </span>
          </div>
        )}

        {/* Photocopier filters */}
        {activeTab === "Photocopier" && (
          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 bg-white border border-[#E2E4F0] rounded-xl">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#9699B0] uppercase tracking-wider">
              <Filter size={13} />
              Filters
            </div>
            <div className="relative min-w-[220px] flex-1 max-w-xs">
              <select
                value={photoDeptFilter}
                onChange={(e) => { setPhotoDeptFilter(e.target.value); setSelectedIds([]); }}
                className="w-full appearance-none bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-4 pr-8 py-2 text-[13px] text-[#2D3436] outline-none focus:border-[#E17055] transition-colors"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={photoSerialSearch}
                onChange={(e) => { setPhotoSerialSearch(e.target.value); setSelectedIds([]); }}
                placeholder="Search serial no…"
                className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-xl pl-9 pr-8 py-2 text-[13px] outline-none focus:border-[#E17055] transition-colors"
              />
              {photoSerialSearch && (
                <button onClick={() => setPhotoSerialSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>
            {(photoDeptFilter || photoSerialSearch) && (
              <button
                onClick={() => { setPhotoDeptFilter(""); setPhotoSerialSearch(""); setSelectedIds([]); }}
                className="text-xs text-[#E17055] font-semibold hover:underline"
              >
                Clear
              </button>
            )}
            <span className="ml-auto text-[12px] text-gray-400 font-medium">
              {filteredPhotocopierProducts.length}
              {(photoDeptFilter || photoSerialSearch) ? ` of ${tabProducts.length}` : ""} items
            </span>
          </div>
        )}

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Department", "Specification", "Brand / Model", "Serial No", "Warranty", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedNonPCProducts.map((product, index) => {
                  const cf = product.custom_fields || {};
                  return (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${selectedIds.includes(product.id) ? "bg-[#EDE7F6]/40" : ""}`}
                    >
                      <td className="py-3 px-4 text-[13px] text-gray-700 min-w-[200px] max-w-[300px]">
                        <div className="font-medium" title={cf.department_name}>{cf.department_name || "—"}</div>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-gray-800 font-medium max-w-[200px]">
                        <span className="truncate block" title={product.name}>{product.name || "—"}</span>
                      </td>
                      <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                        <div className="font-medium">{product.brand || "—"}</div>
                        <div className="text-[#9699B0] font-mono text-[12px]">{product.sku || ""}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[13px] text-gray-500 whitespace-nowrap">
                        {product.serial_number || "—"}
                      </td>
                      <td className="py-3 px-4 text-[13px] text-gray-600 whitespace-nowrap">
                        {cf.warranty_period || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewingProduct(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#00CEC9] hover:bg-[#00CEC9]/10 transition-colors" title="View details">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleEditGeneric(product)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors">
                            <Edit size={15} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#E17055] hover:bg-[#E17055]/10 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {displayedNonPCProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-14 text-center text-gray-400 text-sm">
                      <Package size={32} className="mx-auto mb-2 opacity-40" />
                      {tabProducts.length > 0 ? `No ${activeTab}s match your filters` : `No ${activeTab}s found`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
        </>
      )}

      {/* ── PC ADD / EDIT MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && activeTab === "PC" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-2xl rounded-2xl p-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#2D3436]">
                  {editingProduct ? "Edit PC" : "Add PC"}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>

              {/* Location Info */}
              <SectionHeading>Location Info</SectionHeading>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <PCLabel>Department Name</PCLabel>
                  <select
                    className={inputClass}
                    value={pcForm.department_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const branch = (branches || []).find(b => b.name === name);
                      setPCForm({ ...pcForm, department_name: name, address: branch?.address || "" });
                    }}
                  >
                    <option value="">— Select department —</option>
                    {(branches && branches.length > 0 ? branches : DEPARTMENTS.map(d => ({ name: d }))).map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <PCLabel>Address</PCLabel>
                  <input name="address" value={pcForm.address} onChange={(e) => setPCForm({ ...pcForm, address: e.target.value })} placeholder="Full address" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Mobile No</PCLabel>
                  <input name="mobile_no" value={pcForm.mobile_no} onChange={(e) => setPCForm({ ...pcForm, mobile_no: e.target.value })} placeholder="Mobile number" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Email ID</PCLabel>
                  <input name="email_id" value={pcForm.email_id} onChange={(e) => setPCForm({ ...pcForm, email_id: e.target.value })} placeholder="Email address" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Name of User</PCLabel>
                  <input name="name_of_user" value={pcForm.name_of_user} onChange={(e) => setPCForm({ ...pcForm, name_of_user: e.target.value })} placeholder="User's name" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Room No</PCLabel>
                  <input name="room_no" value={pcForm.room_no} onChange={(e) => setPCForm({ ...pcForm, room_no: e.target.value })} placeholder="Room number" className={inputClass} />
                </div>
              </div>

              {/* Machine Info */}
              <SectionHeading>Machine Info</SectionHeading>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <PCLabel>Specification</PCLabel>
                  <input name="specification" value={pcForm.specification} onChange={(e) => setPCForm({ ...pcForm, specification: e.target.value })} placeholder="e.g. HP AIO i5 512SSD 8GB W11 OFF Quickheal" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Brand</PCLabel>
                  <input name="brand" value={pcForm.brand} onChange={(e) => setPCForm({ ...pcForm, brand: e.target.value })} placeholder="e.g. HP, Dell, Lenovo" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Model No</PCLabel>
                  <input name="model_no" value={pcForm.model_no} onChange={(e) => setPCForm({ ...pcForm, model_no: e.target.value })} placeholder="e.g. HP AIO 440 G9" className={inputClass} />
                </div>
                <div>
                  <PCLabel>M/C Serial No</PCLabel>
                  <input name="serial_no" value={pcForm.serial_no} onChange={(e) => setPCForm({ ...pcForm, serial_no: e.target.value })} placeholder="Machine serial number" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Installation Date</PCLabel>
                  <input name="installation_date" value={pcForm.installation_date} onChange={(e) => setPCForm({ ...pcForm, installation_date: e.target.value })} placeholder="DD/MM/YYYY" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Warranty Period</PCLabel>
                  <input name="warranty_period" value={pcForm.warranty_period} onChange={(e) => setPCForm({ ...pcForm, warranty_period: e.target.value })} placeholder="e.g. 3 Years" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Warranty Expiry Date</PCLabel>
                  <input name="warranty_expiry_date" value={pcForm.warranty_expiry_date} onChange={(e) => setPCForm({ ...pcForm, warranty_expiry_date: e.target.value })} placeholder="DD/MM/YYYY" className={inputClass} />
                </div>
              </div>

              {/* Software */}
              <SectionHeading>Windows &amp; Office</SectionHeading>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <PCLabel>Windows Key</PCLabel>
                  <input name="windows_key" value={pcForm.windows_key} onChange={(e) => setPCForm({ ...pcForm, windows_key: e.target.value })} placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Windows Version</PCLabel>
                  <input name="windows_version" value={pcForm.windows_version} onChange={(e) => setPCForm({ ...pcForm, windows_version: e.target.value })} placeholder="e.g. Windows 11 Professional" className={inputClass} />
                </div>
                <div>
                  <PCLabel>MS Office Key</PCLabel>
                  <input name="ms_office_key" value={pcForm.ms_office_key} onChange={(e) => setPCForm({ ...pcForm, ms_office_key: e.target.value })} placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" className={inputClass} />
                </div>
                <div>
                  <PCLabel>MS Office Version</PCLabel>
                  <input name="ms_office_version" value={pcForm.ms_office_version} onChange={(e) => setPCForm({ ...pcForm, ms_office_version: e.target.value })} placeholder="e.g. MS Office 2021" className={inputClass} />
                </div>
              </div>

              {/* Antivirus */}
              <SectionHeading>Antivirus</SectionHeading>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <PCLabel>Antivirus Name</PCLabel>
                  <input name="antivirus_name" value={pcForm.antivirus_name} onChange={(e) => setPCForm({ ...pcForm, antivirus_name: e.target.value })} placeholder="e.g. Quick Heal" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Antivirus Validity</PCLabel>
                  <input name="antivirus_validity" value={pcForm.antivirus_validity} onChange={(e) => setPCForm({ ...pcForm, antivirus_validity: e.target.value })} placeholder="e.g. 3 Years" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Antivirus Batch No</PCLabel>
                  <input name="antivirus_batchnumber" value={pcForm.antivirus_batchnumber} onChange={(e) => setPCForm({ ...pcForm, antivirus_batchnumber: e.target.value })} placeholder="Batch number" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Antivirus Serial Key</PCLabel>
                  <input name="antivirus_serial_key" value={pcForm.antivirus_serial_key} onChange={(e) => setPCForm({ ...pcForm, antivirus_serial_key: e.target.value })} placeholder="Serial key" className={inputClass} />
                </div>
              </div>

              <button
                onClick={handleSavePC}
                disabled={saving}
                className="mt-6 w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : editingProduct ? "Update PC" : "Save PC"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GENERIC ADD / EDIT MODAL (Printer / UPS) ─────────────────────── */}
      <AnimatePresence>
        {showModal && activeTab !== "PC" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8 px-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-lg rounded-2xl p-6 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#2D3436]">
                  {editingProduct ? `Edit ${activeTab}` : `Add ${activeTab}`}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <PCLabel>Name</PCLabel>
                  <input name="name" value={genericForm.name} onChange={(e) => setGenericForm({ ...genericForm, name: e.target.value })} placeholder={`${activeTab} name`} className={inputClass} />
                </div>
                <div>
                  <PCLabel>SKU / Model</PCLabel>
                  <input name="sku" value={genericForm.sku} onChange={(e) => setGenericForm({ ...genericForm, sku: e.target.value })} placeholder="Model number" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Serial Number</PCLabel>
                  <input name="serial_number" value={genericForm.serial_number} onChange={(e) => setGenericForm({ ...genericForm, serial_number: e.target.value })} placeholder="Serial number" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Brand</PCLabel>
                  <input name="brand" value={genericForm.brand} onChange={(e) => setGenericForm({ ...genericForm, brand: e.target.value })} placeholder="Brand" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Stock</PCLabel>
                  <input name="stock" type="number" value={genericForm.stock} onChange={(e) => setGenericForm({ ...genericForm, stock: e.target.value })} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Price</PCLabel>
                  <input name="price" type="number" value={genericForm.price} onChange={(e) => setGenericForm({ ...genericForm, price: e.target.value })} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <PCLabel>Status</PCLabel>
                  <select name="status" value={genericForm.status} onChange={(e) => setGenericForm({ ...genericForm, status: e.target.value })} className={inputClass}>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Custom fields */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">Custom Fields</h3>
                  <button onClick={() => setCustomFields([...customFields, { key: "", value: "" }])} className="flex items-center gap-1 text-xs font-medium text-[#6C5CE7]">
                    <Plus size={13} /> Add Field
                  </button>
                </div>
                <div className="space-y-2">
                  {customFields.map((cf, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input value={cf.key} onChange={(e) => { const u = [...customFields]; u[i].key = e.target.value; setCustomFields(u); }} placeholder="Field name" className="flex-1 bg-[#F8F9FE] border border-[#E2E4F0] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#6C5CE7]" />
                      <input value={cf.value} onChange={(e) => { const u = [...customFields]; u[i].value = e.target.value; setCustomFields(u); }} placeholder="Value" className="flex-1 bg-[#F8F9FE] border border-[#E2E4F0] rounded-lg px-3 py-2 text-[12.5px] outline-none focus:border-[#6C5CE7]" />
                      <button onClick={() => setCustomFields(customFields.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-[#E17055]"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSaveGeneric}
                disabled={saving}
                className="mt-6 w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : editingProduct ? `Update ${activeTab}` : `Save ${activeTab}`}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING DISPATCH BAR ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1A1C2E] text-white rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4"
          >
            <span className="text-sm font-medium">{selectedIds.length} selected</span>
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-semibold"
            >
              <Truck size={16} /> Dispatch Selected
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E17055] text-white text-sm font-semibold disabled:opacity-50"
            >
              <Trash2 size={16} /> {deleting ? "Deleting..." : "Delete"}
            </button>
            <button onClick={() => setSelectedIds([])} className="text-white/50 hover:text-white p-1"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── VIEW DETAIL MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingProduct && (() => {
          const cf = viewingProduct.custom_fields || {};
          const isPC = viewingProduct.category === "PC";
          const tab = TABS.find((t) => t.id === viewingProduct.category) || TABS[0];
          const Field = ({ label, value }) => value ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9699B0] mb-0.5">{label}</p>
              <p className="text-[13.5px] text-[#2D3436] font-medium break-all">{value}</p>
            </div>
          ) : null;
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
              onClick={() => setViewingProduct(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden my-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Coloured header */}
                <div className="px-6 py-5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${tab.color}, ${tab.color}BB)` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <tab.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-medium">{viewingProduct.category}</p>
                      <h2 className="text-white text-base font-bold leading-tight">{viewingProduct.name || "—"}</h2>
                    </div>
                  </div>
                  <button onClick={() => setViewingProduct(null)} className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {isPC ? (
                    <>
                      {/* Location */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7] mb-3">Location Info</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <Field label="Department" value={cf.department_name} />
                          <Field label="Room No" value={cf.room_no} />
                          <div className="col-span-2"><Field label="Address" value={cf.address} /></div>
                          <Field label="Name of User" value={cf.name_of_user} />
                          <Field label="Mobile No" value={cf.mobile_no} />
                          <Field label="Email ID" value={cf.email_id} />
                        </div>
                      </div>
                      {/* Machine */}
                      <div className="border-t border-gray-100 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7] mb-3">Machine Info</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <div className="col-span-2"><Field label="Specification" value={viewingProduct.name} /></div>
                          <Field label="Brand" value={viewingProduct.brand} />
                          <Field label="Model No" value={viewingProduct.sku} />
                          <Field label="M/C Serial No" value={viewingProduct.serial_number} />
                          <Field label="Installation Date" value={cf.installation_date} />
                          <Field label="Warranty Period" value={cf.warranty_period} />
                          <Field label="Warranty Expiry" value={cf.warranty_expiry_date} />
                        </div>
                      </div>
                      {/* Windows & Office */}
                      <div className="border-t border-gray-100 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7] mb-3">Windows &amp; Office</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <Field label="Windows Key" value={cf.windows_key} />
                          <Field label="Windows Version" value={cf.windows_version} />
                          <Field label="MS Office Key" value={cf.ms_office_key} />
                          <Field label="MS Office Version" value={cf.ms_office_version} />
                        </div>
                      </div>
                      {/* Antivirus */}
                      <div className="border-t border-gray-100 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#6C5CE7] mb-3">Antivirus</p>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <Field label="Antivirus Name" value={cf.antivirus_name} />
                          <Field label="Validity" value={cf.antivirus_validity} />
                          <Field label="Batch No" value={cf.antivirus_batchnumber} />
                          <Field label="Serial Key" value={cf.antivirus_serial_key} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <Field label="SKU / Model" value={viewingProduct.sku} />
                      <Field label="Serial Number" value={viewingProduct.serial_number} />
                      <Field label="Brand" value={viewingProduct.brand} />
                      <Field label="Status" value={viewingProduct.status} />
                      <Field label="Stock" value={viewingProduct.stock?.toString()} />
                      <Field label="Price" value={viewingProduct.price ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(viewingProduct.price) : null} />
                      {Object.entries(cf).map(([k, v]) => <Field key={k} label={k.replace(/_/g, " ")} value={v} />)}
                    </div>
                  )}
                </div>

                <div className="px-6 pb-5 flex justify-end gap-3">
                  <button
                    onClick={() => { setViewingProduct(null); if (isPC) handleEditPC(viewingProduct); else handleEditGeneric(viewingProduct); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2E4F0] text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => setViewingProduct(null)} className="px-5 py-2 rounded-xl text-white text-sm font-semibold" style={{ background: `linear-gradient(135deg, ${tab.color}, ${tab.color}BB)` }}>
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── CSV IMPORT MODAL ──────────────────────────────────────────────── */}
      <CSVImportModal
        show={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImport={
          activeTab === "PC" ? handlePCCSVImport :
          ["Single Printer","Multi-Function Printer","UPS","Scanner","Photocopier"].includes(activeTab) ? handleDeviceCSVImport :
          handleGenericCSVImport
        }
        columns={
          activeTab === "PC"        ? PC_CSV_COLUMNS :
          (activeTab === "Single Printer" || activeTab === "Multi-Function Printer") ? PRINTER_CSV_COLUMNS :
          activeTab === "UPS"       ? UPS_CSV_COLUMNS :
          activeTab === "Scanner"   ? SCANNER_CSV_COLUMNS :
          activeTab === "Photocopier" ? PHOTOCOPIER_CSV_COLUMNS :
          ["name", "sku", "serial_number", "brand", "stock", "price", "status"]
        }
        templateName={`${activeTab.toLowerCase()}_inventory_template`}
      />

      {/* ── DISPATCH MODAL ────────────────────────────────────────────────── */}
      {showDispatchModal && (
        <DispatchModal
          show={showDispatchModal}
          onClose={() => { setShowDispatchModal(false); setSelectedIds([]); }}
          products={products}
          branches={branches || []}
          preSelectedIds={selectedIds}
        />
      )}

      {/* ── BACKGROUND IMPORT PROGRESS CHIP ──────────────────────────────── */}
      <AnimatePresence>
        {importProgress && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-4 right-4 z-50 min-w-[220px] max-w-[300px] rounded-xl shadow-2xl overflow-hidden"
            style={{ background: importProgress.done ? (importProgress.errorCount > 0 ? "#FFF3E0" : "#E8F5E9") : "#1A1C2E" }}
          >
            <div className="px-4 py-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-[12px] font-semibold truncate" style={{ color: importProgress.done ? (importProgress.errorCount > 0 ? "#E65100" : "#2E7D32") : "#fff" }}>
                  {importProgress.done
                    ? (() => {
                        const inserted = importProgress.total - importProgress.errorCount - (importProgress.skipped || 0);
                        const parts = [`${inserted} imported`];
                        if (importProgress.skipped) parts.push(`${importProgress.skipped} skipped`);
                        if (importProgress.errorCount) parts.push(`${importProgress.errorCount} errors`);
                        return `${importProgress.tab}: ${parts.join(", ")}`;
                      })()
                    : `Importing ${importProgress.tab}… ${importProgress.current} / ${importProgress.total}${importProgress.skipped ? ` (${importProgress.skipped} dupes)` : ""}`}
                </span>
                {importProgress.done && (
                  <button onClick={() => setImportProgress(null)} className="flex-shrink-0 text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: importProgress.done ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.15)" }}>
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%`,
                    background: importProgress.done
                      ? (importProgress.errorCount > 0 ? "#FF9800" : "#4CAF50")
                      : "#6C5CE7",
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION DIALOG ────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash2 size={22} className="text-[#E17055]" />
            </div>
            <h2 className="text-[15px] font-bold text-[#2D3436] text-center mb-1">Delete this item?</h2>
            <p className="text-[13px] text-gray-500 text-center mb-5">
              This will permanently remove the product. Any linked installations will be kept.
            </p>

            {/* Countdown ring */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#F0EDFF" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke="#E17055" strokeWidth="4"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - deleteConfirm.countdown / 10)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.9s linear" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[15px] font-bold text-[#E17055]">
                  {deleteConfirm.countdown}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 py-2.5 rounded-xl border border-[#E2E4F0] text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteNow}
                className="flex-1 py-2.5 rounded-xl bg-[#E17055] text-white text-[13px] font-semibold hover:bg-[#d4634a] transition-colors"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
