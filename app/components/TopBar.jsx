"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Search, Bell, Plus, X } from "lucide-react";
import Link from "next/link";

export default function TopBar({ sidebarOpen, setSidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 lg:h-16 bg-white border-b border-[#E2E4F0] flex items-center px-3 lg:px-6 gap-2 lg:gap-4 flex-shrink-0">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="bg-transparent border-none cursor-pointer text-[#6C6F87] p-1.5 rounded-lg flex flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      {searchOpen ? (
        /* Mobile expanded search */
        <div className="flex-1 flex items-center gap-2 bg-[#F4F5FB] rounded-[10px] px-3 py-2">
          <Search size={15} className="text-[#9699B0] flex-shrink-0" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="border-none bg-transparent outline-none text-[13px] text-[#2D3436] w-full"
          />
          <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-[#9699B0] flex-shrink-0">
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Desktop search bar */}
          <div className="hidden md:flex flex-1 max-w-[480px] items-center gap-2 bg-[#F4F5FB] rounded-[10px] px-3.5 py-2">
            <Search size={16} className="text-[#9699B0]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices, products, customers..."
              className="border-none bg-transparent outline-none text-[13.5px] text-[#2D3436] w-full font-[var(--font-body)]"
            />
            <kbd className="hidden lg:block text-[10px] px-1.5 py-0.5 bg-[#E2E4F0] rounded text-[#9699B0] font-[var(--font-mono)]">
              ⌘K
            </kbd>
          </div>

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-1.5 text-[#6C6F87] bg-transparent border-none cursor-pointer rounded-lg"
          >
            <Search size={19} />
          </button>
        </>
      )}

      <div className="ml-auto flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
        <button className="relative bg-transparent border-none cursor-pointer p-2 rounded-[10px] text-[#6C6F87] flex">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E17055] border-2 border-white" />
        </button>

      </div>
    </header>
  );
}
