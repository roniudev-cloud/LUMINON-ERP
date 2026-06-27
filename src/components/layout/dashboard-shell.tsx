"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main Content */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 min-h-0 transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[260px]"
        )}
      >
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative scroll-smooth">{children}</main>
      </div>
    </div>
  );
}
