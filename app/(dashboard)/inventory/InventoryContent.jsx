"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, AlertCircle, X, Plus, Edit, Trash2, Tag, Upload, Check,
  ChevronDown, ChevronUp, Truck,
} from "lucide-react";
import Card from "@/app/components/Card";
import StatusBadge from "@/app/components/StatusBadge";
import SectionTitle from "@/app/components/SectionTitle";
import CSVImportModal from "@/app/components/CSVImportModal";
import DispatchModal from "@/app/components/DispatchModal";
import { createClient } from "@/utils/supabase/client";

const inputClass =
  "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

const defaultForm = {
  name: "",
  sku: "",
  serial_number: "",
  brand: "",
  stock: "",
  price: "",
  category: "",
  status: "in-stock",
};

export default function InventoryContent({ products, categories, branches }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [customFields, setCustomFields] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const inStockProducts = products.filter((p) => p.status === "in-stock");

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === inStockProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inStockProducts.map((p) => p.id));
    }
  };

  // Category management state
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");

  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.stock > 0 && p.stock <= 20
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getStockColor = (stock) => {
    if (stock === 0) return "#E17055";
    if (stock <= 20) return "#FDCB6E";
    return "#00B894";
  };

  const getStockBarBg = (stock) => {
    if (stock === 0) return "#FDECEA";
    if (stock <= 20) return "#FEF5E7";
    return "#E8F8F0";
  };

  const getStockPercent = (stock) => Math.min((stock / 100) * 100, 100);

  const stats = [
    { label: "Total Products", value: totalProducts, icon: Package, color: "#6C5CE7", bg: "#EDE7F6" },
    { label: "Low Stock Items", value: lowStockItems, icon: AlertCircle, color: "#FDCB6E", bg: "#FEF5E7" },
    { label: "Out of Stock", value: outOfStock, icon: X, color: "#E17055", bg: "#FDECEA" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Custom fields handlers
  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const updateCustomField = (index, field, val) => {
    const updated = [...customFields];
    updated[index][field] = val;
    setCustomFields(updated);
  };

  const removeCustomField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      serial_number: product.serial_number || "",
      brand: product.brand || "",
      stock: product.stock?.toString() || "0",
      price: product.price?.toString() || "0",
      category: product.category || "",
      status: product.status || "in-stock",
    });
    // Load existing custom_fields into the editable array
    const cf = product.custom_fields || {};
    setCustomFields(Object.entries(cf).map(([key, value]) => ({ key, value })));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setForm(defaultForm);
    setCustomFields([]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build custom_fields JSON from the dynamic fields
      const cfObj = {};
      customFields.forEach((f) => {
        if (f.key.trim()) cfObj[f.key.trim()] = f.value;
      });

      const productData = {
        name: form.name,
        sku: form.sku,
        serial_number: form.serial_number || null,
        brand: form.brand || null,
        stock: Number(form.stock),
        price: Number(form.price),
        category: form.category,
        status: form.status,
        custom_fields: Object.keys(cfObj).length > 0 ? cfObj : null,
      };

      if (editingProduct) {
        // Update existing product
        await supabase.from("products").update(productData).eq("id", editingProduct.id);
      } else {
        // Insert new product
        await supabase.from("products").insert({ ...productData, user_id: user.id });
      }

      closeModal();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} product${selectedIds.length > 1 ? "s" : ""}? This cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedIds);
      if (error) throw error;
      setSelectedIds([]);
      router.refresh();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Failed to delete products: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Category management handlers
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setAddingCategory(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("categories").insert({ name: newCategory.trim(), user_id: user.id });
      setNewCategory("");
      router.refresh();
    } finally {
      setAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCatName.trim()) return;
    const supabase = createClient();
    await supabase.from("categories").update({ name: editingCatName.trim() }).eq("id", id);
    setEditingCatId(null);
    setEditingCatName("");
    router.refresh();
  };

  const handleDeleteCategory = async (id) => {
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    router.refresh();
  };

  // CSV Import handler
  const handleCSVImport = async (rows) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const knownCols = ["name", "sku", "serial_number", "brand", "stock", "price", "category", "status"];

    const mapped = rows.map((row) => {
      // Collect any extra columns as custom_fields
      const cfObj = {};
      Object.keys(row).forEach((key) => {
        if (!knownCols.includes(key) && row[key]) {
          cfObj[key] = row[key];
        }
      });

      return {
        user_id: user.id,
        name: row.name || "",
        sku: row.sku || "",
        serial_number: row.serial_number || null,
        brand: row.brand || null,
        stock: Number(row.stock) || 0,
        price: Number(row.price) || 0,
        category: row.category || "",
        status: row.status || "in-stock",
        custom_fields: Object.keys(cfObj).length > 0 ? cfObj : null,
      };
    });
    const { error } = await supabase.from("products").insert(mapped);
    if (error) throw error;
    router.refresh();
    return mapped.length;
  };

  // Get all unique custom field keys across products for display
  const allCustomKeys = [...new Set(
    products.flatMap((p) => (p.custom_fields ? Object.keys(p.custom_fields) : []))
  )];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">
          Inventory Management
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E4F0] bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={16} />
            Import CSV
          </button>
          <button
            onClick={() => { setEditingProduct(null); setForm(defaultForm); setCustomFields([]); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
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

      {/* Categories Section */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={16} className="text-[#6C5CE7]" />
          <h2 className="text-sm font-bold text-[#2D3436]">Categories</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1.5 bg-[#F4F5FB] text-[13px] font-medium text-gray-700 px-3 py-1.5 rounded-full"
            >
              {editingCatId === cat.id ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleUpdateCategory(cat.id); }}
                  className="inline-flex items-center gap-1"
                >
                  <input
                    autoFocus
                    value={editingCatName}
                    onChange={(e) => setEditingCatName(e.target.value)}
                    onBlur={() => { setEditingCatId(null); setEditingCatName(""); }}
                    onKeyDown={(e) => { if (e.key === "Escape") { setEditingCatId(null); setEditingCatName(""); } }}
                    className="bg-white border border-[#6C5CE7] rounded-full px-2 py-0.5 text-[12px] w-[90px] outline-none"
                  />
                  <button type="submit" className="text-[#6C5CE7] hover:text-[#5A4BD1]">
                    <Check size={13} />
                  </button>
                </form>
              ) : (
                <>
                  <span
                    onDoubleClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                    className="cursor-pointer"
                    title="Double-click to rename"
                  >
                    {cat.name}
                  </span>
                  <button
                    onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                    className="text-gray-400 hover:text-[#6C5CE7] transition-colors"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-gray-400 hover:text-[#E17055] transition-colors"
                  >
                    <X size={13} />
                  </button>
                </>
              )}
            </span>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCategory();
            }}
            className="inline-flex items-center gap-1"
          >
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
              className="bg-[#F4F5FB] border border-[#E2E4F0] rounded-full px-3 py-1.5 text-[13px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors w-[120px]"
            />
            <button
              type="submit"
              disabled={addingCategory || !newCategory.trim()}
              className="w-7 h-7 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center hover:bg-[#5A4BD1] transition-colors disabled:opacity-40"
            >
              <Plus size={14} />
            </button>
          </form>
        </div>
      </Card>

      {/* Quick Select Bar */}
      {inStockProducts.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm text-gray-500">Quick select:</span>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(e.target.elements.selectCount.value) || 0;
              const count = Math.min(Math.max(val, 0), inStockProducts.length);
              setSelectedIds(inStockProducts.slice(0, count).map((p) => p.id));
              e.target.elements.selectCount.value = "";
            }}
            className="flex items-center gap-2"
          >
            <input
              name="selectCount"
              type="number"
              min="0"
              max={inStockProducts.length}
              placeholder={`1–${inStockProducts.length}`}
              className="w-[90px] bg-[#F8F9FE] border border-[#E2E4F0] rounded-lg px-3 py-1.5 text-[13px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-semibold hover:bg-[#5A4BD1] transition-colors"
            >
              Select
            </button>
          </form>
          {selectedIds.length > 0 && (
            <span className="text-sm font-medium text-[#6C5CE7]">
              {selectedIds.length} selected
            </span>
          )}
          {selectedIds.length > 0 && (
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-[#E17055] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Products Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 px-2 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === inStockProducts.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#6C5CE7] accent-[#6C5CE7]"
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Serial No.
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
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
              {products.map((product, index) => {
                const cf = product.custom_fields || {};
                const cfKeys = Object.keys(cf);
                const hasCustom = cfKeys.length > 0;
                const isExpanded = expandedRow === product.id;

                return (
                  <motion.tr
                    key={product.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(product.id) ? "bg-[#EDE7F6]/40" : ""}`}
                  >
                    <td className="py-3.5 px-2 w-10">
                      {product.status === "in-stock" ? (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="w-4 h-4 rounded border-gray-300 accent-[#6C5CE7]"
                        />
                      ) : (
                        <span className="w-4 h-4 block" />
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {product.name}
                        </span>
                        {hasCustom && (
                          <button
                            onClick={() => setExpandedRow(isExpanded ? null : product.id)}
                            className="text-gray-400 hover:text-[#6C5CE7] transition-colors"
                            title="View custom fields"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {cfKeys.map((k) => (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1 text-[11px] bg-[#F0EDFF] text-[#6C5CE7] px-2 py-1 rounded-md"
                            >
                              <span className="font-semibold">{k}:</span> {cf[k]}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-sm text-gray-500">
                        {product.sku}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-sm text-gray-500">
                        {product.serial_number || "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600 font-medium">
                      {product.brand || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="rounded-full overflow-hidden"
                          style={{
                            width: "60px",
                            height: "6px",
                            background: getStockBarBg(product.stock),
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${getStockPercent(product.stock)}%`,
                              background: getStockColor(product.stock),
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#6C5CE7] hover:bg-[#6C5CE7]/10 transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#E17055] hover:bg-[#E17055]/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400 text-sm">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center overflow-y-auto py-8"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white max-w-lg w-full rounded-2xl p-6 mx-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#2D3436]">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="grid grid-cols-2 gap-4">
                {/* Name - full width */}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Product name" className={inputClass} />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">SKU</label>
                  <input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. PRD-001" className={inputClass} />
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Serial Number</label>
                  <input name="serial_number" value={form.serial_number} onChange={handleChange} placeholder="e.g. SN-2024-001" className={inputClass} />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Brand</label>
                  <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. HP, Canon, Samsung" className={inputClass} />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Category</label>
                  <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                    <option value="">
                      {categories.length > 0 ? "Select category" : "— Add categories above first —"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Stock</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" className={inputClass} />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Price</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0" className={inputClass} />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-[#9699B0] mb-1.5">Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Custom Fields Section */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-[#2D3436] uppercase tracking-wider">
                    Custom Fields
                  </h3>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="flex items-center gap-1 text-xs font-medium text-[#6C5CE7] hover:text-[#5A4BD1] transition-colors"
                  >
                    <Plus size={13} />
                    Add Field
                  </button>
                </div>
                {customFields.length === 0 && (
                  <p className="text-xs text-gray-400 italic">
                    Add custom fields like Warranty, Model, Color, Cartridge Type, etc.
                  </p>
                )}
                <div className="space-y-2">
                  {customFields.map((cf, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={cf.key}
                        onChange={(e) => updateCustomField(i, "key", e.target.value)}
                        placeholder="Field name"
                        className="flex-1 bg-[#F8F9FE] border border-[#E2E4F0] rounded-lg px-3 py-2 text-[12.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                      />
                      <input
                        value={cf.value}
                        onChange={(e) => updateCustomField(i, "value", e.target.value)}
                        placeholder="Value"
                        className="flex-1 bg-[#F8F9FE] border border-[#E2E4F0] rounded-lg px-3 py-2 text-[12.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
                      />
                      <button
                        onClick={() => removeCustomField(i)}
                        className="p-1.5 text-gray-400 hover:text-[#E17055] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-6 w-full py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : editingProduct ? "Update Product" : "Save Product"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Dispatch Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1A1C2E] text-white rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4"
          >
            <span className="text-sm font-medium">
              {selectedIds.length} product{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setShowDispatchModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-semibold hover:shadow-lg transition-shadow"
            >
              <Truck size={16} />
              Dispatch Selected
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#E17055] text-white text-sm font-semibold hover:bg-[#D35440] transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete Selected"}
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <CSVImportModal
        show={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onImport={handleCSVImport}
        columns={["name", "sku", "serial_number", "brand", "stock", "price", "category", "status"]}
        templateName="inventory_template"
      />

      {/* Dispatch Modal — conditionally rendered so it remounts with fresh selectedIds */}
      {showDispatchModal && (
        <DispatchModal
          show={showDispatchModal}
          onClose={() => { setShowDispatchModal(false); setSelectedIds([]); }}
          products={products}
          branches={branches || []}
          preSelectedIds={selectedIds}
        />
      )}
    </div>
  );
}
