"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import TopBar from "@/app/components/TopBar";

export default function DashboardShell({ children, userEmail, userRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Installer can only access /installations and its sub-routes
  useEffect(() => {
    if (userRole === "installer" && !pathname.startsWith("/installations")) {
      router.replace("/installations");
    }
  }, [userRole, pathname, router]);

  const isInstaller = userRole === "installer";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F4F5FB", color: "#2D3436" }}>
      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        userEmail={userEmail}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!isInstaller && (
          <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        )}
        <main className={`flex-1 overflow-auto ${isInstaller ? "p-4" : "p-4 lg:p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
