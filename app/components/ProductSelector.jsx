"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

const formatPrice = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function ProductSelector({ products, selectedIds, onToggle, onToggleAll }) {
  const [search, setSearch] = useState("");

  const selectedSet = useMemo(
    () => (selectedIds instanceof Set ? selectedIds : new Set(selectedIds)),
    [selectedIds]
  );

  const inStockProducts = useMemo(
    () => (products || []).filter((p) => p.status === "in-stock"),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return inStockProducts;
    const q = search.toLowerCase().trim();
    return inStockProducts.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.serial_number && p.serial_number.toLowerCase().includes(q))
    );
  }, [inStockProducts, search]);

  const allFilteredSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedSet.has(p.id));

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9699B0] pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name, SKU, or serial number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 pl-10 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#E2E4F0] rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FE] border-b border-[#E2E4F0]">
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={() =>
                    onToggleAll?.(filteredProducts.map((p) => p.id), !allFilteredSelected)
                  }
                  className="w-4 h-4 rounded border-[#E2E4F0] text-[#6C5CE7] accent-[#6C5CE7] cursor-pointer"
                />
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Serial No.
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-[#9699B0]">
                  No in-stock products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedSet.has(product.id);
                return (
                  <tr
                    key={product.id}
                    onClick={() => onToggle(product.id)}
                    className={`border-t border-[#F1F2F8] cursor-pointer transition-colors hover:bg-[#F8F9FE] ${
                      isSelected ? "bg-[#EDE7F6]" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggle(product.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-[#E2E4F0] text-[#6C5CE7] accent-[#6C5CE7] cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#2D3436]">
                      {product.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6C6F87]">
                      {product.sku}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6C6F87]">
                      {product.serial_number}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6C6F87]">
                      {product.category}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#2D3436]">
                      {formatPrice.format(product.price)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Selected count */}
      <div className="mt-3 text-[13px] font-medium text-[#6C6F87]">
        {selectedSet.size} product{selectedSet.size !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}
