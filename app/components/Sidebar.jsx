"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard, FileText, Package, Users,
  Globe, GitBranch, Brain, BarChart3, Settings, LogOut,
  /* Truck, */ Wrench, UserCog,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNav = [
  { id: "dashboard",      label: "Dashboard",       icon: LayoutDashboard, href: "/dashboard" },
  { id: "invoices",       label: "Invoices & Billing", icon: FileText,      href: "/invoices" },
  { id: "inventory",      label: "Inventory",        icon: Package,         href: "/inventory" },
  // { id: "dispatches",     label: "Dispatches",       icon: Truck,           href: "/dispatches" }, // DISABLED
  { id: "installations",  label: "Installations",    icon: Wrench,          href: "/installations" },
  // { id: "customers",      label: "Customers & CRM",  icon: Users,           href: "/customers" },
  // { id: "ecommerce",      label: "Online Store",     icon: Globe,           href: "/ecommerce" },
  // { id: "branches",       label: "Multi-Branch",     icon: GitBranch,       href: "/branches" },
  // { id: "ai-insights",    label: "AI Insights",      icon: Brain,           href: "/ai-insights" },
  // { id: "reports",        label: "Reports & GST",    icon: BarChart3,       href: "/reports" },
  // { id: "team",           label: "Team",             icon: UserCog,         href: "/team" },
  { id: "settings",       label: "Settings",         icon: Settings,        href: "/settings" },
];

const installerNav = [
  { id: "installations", label: "Installations", icon: Wrench, href: "/installations" },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile, userEmail, userRole }) {
  const pathname = usePathname();
  const isInstaller = userRole === "installer";
  const navItems = isInstaller ? installerNav : adminNav;
  const initials = userEmail ? userEmail.substring(0, 2).toUpperCase() : "RC";
  const showLabels = isMobile ? true : sidebarOpen;

  // Installer: minimal fixed sidebar
  if (isInstaller) {
    return (
      <aside
        className="flex flex-col flex-shrink-0"
        style={{ width: 64, background: "linear-gradient(195deg, #1A1C2E 0%, #252836 100%)" }}
      >
        {/* Logo icon */}
        <div className="flex items-center justify-center py-5 border-b border-white/[0.06]">
          <Image src="/icon.png" alt="Rangayan Creations" width={36} height={30} className="rounded object-contain" />
        </div>

        {/* Single nav item */}
        <nav className="flex-1 flex flex-col items-center pt-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.id} href={item.href} title={item.label}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                  style={{
                    background: isActive ? "rgba(108,92,231,0.25)" : "transparent",
                    color: isActive ? "#A29BFE" : "rgba(255,255,255,0.45)",
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="flex flex-col items-center gap-2 py-4 border-t border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00CEC9] to-[#00B894] flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <form action="/auth/sign-out" method="POST">
            <button type="submit" className="text-white/40 hover:text-white/70 transition-colors bg-transparent border-none cursor-pointer p-1">
              <LogOut size={15} />
            </button>
          </form>
        </div>
      </aside>
    );
  }

  // Admin: full collapsible sidebar
  return (
    <motion.aside
      animate={{
        width: isMobile ? 260 : (sidebarOpen ? 260 : 72),
        x: isMobile ? (sidebarOpen ? 0 : -270) : 0,
      }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className={`flex flex-col overflow-hidden flex-shrink-0 ${
        isMobile ? "fixed top-0 left-0 h-full z-50" : "relative"
      }`}
      style={{ background: "linear-gradient(195deg, #1A1C2E 0%, #252836 100%)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 border-b border-white/[0.06]"
        style={{ padding: showLabels ? "24px 20px" : "24px 16px" }}
      >
        <div className="w-[38px] h-[38px] flex items-center justify-center flex-shrink-0">
          <Image src="/icon.png" alt="Rangayan Creations" width={38} height={32} className="rounded object-contain" />
        </div>
        {showLabels && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
            <div className="text-lg font-extrabold text-white tracking-tight font-[var(--font-display)]">
              Rangayan <span className="text-[#A29BFE]">Kitaab</span>
            </div>
            <div className="text-[10px] text-white/40 font-medium tracking-widest uppercase">
              Business Suite
            </div>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.id}
              href={item.href}
              className="no-underline"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-[10px] relative cursor-pointer transition-all duration-200"
                style={{
                  padding: showLabels ? "11px 14px" : "11px 0",
                  justifyContent: showLabels ? "flex-start" : "center",
                  background: isActive
                    ? "linear-gradient(135deg, rgba(108,92,231,0.2), rgba(108,92,231,0.08))"
                    : "transparent",
                  color: isActive ? "#A29BFE" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "13.5px",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded bg-[#6C5CE7]"
                  />
                )}
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
                {showLabels && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        className="flex items-center gap-2.5 border-t border-white/[0.06]"
        style={{ padding: showLabels ? "16px 16px" : "16px 10px" }}
      >
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#00CEC9] to-[#00B894] flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
          {initials}
        </div>
        {showLabels && (
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {userEmail || "User"}
            </div>
            <div className="text-[11px] text-white/35">Admin</div>
          </div>
        )}
        {showLabels && (
          <form action="/auth/sign-out" method="POST">
            <button type="submit" className="text-white/40 hover:text-white/70 transition-colors p-1 bg-transparent border-none cursor-pointer">
              <LogOut size={16} />
            </button>
          </form>
        )}
      </div>
    </motion.aside>
  );
}
