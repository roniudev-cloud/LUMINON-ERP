"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { getGroupedCoreModules } from "@/lib/modules";
import { ChevronLeft } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, isAdmin } = usePermissions();
  const groups = getGroupedCoreModules();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border hidden lg:flex flex-col print:hidden",
        collapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="LUMINON" className="h-8 object-contain" />
          </Link>
        )}
        {collapsed && (
          <Link
            href="/dashboard"
            className="mx-auto flex items-center justify-center"
          >
            <img src="/logo.png" alt="L" className="h-8 w-8 object-cover object-left" />
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-1.5 rounded-md hover:bg-sidebar-accent transition-colors",
            collapsed && "hidden"
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-sidebar-border scrollbar-track-transparent">
        <nav className="px-3 py-4 space-y-6">
          {groups.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (isAdmin) return true;
              if (!item.permission) return true;
              const viewOwnPerm = item.permission.replace(".view", ".view_own");
              return hasPermission(item.permission) || hasPermission(viewOwnPerm);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group}>
                {!collapsed && (
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                    const isPlannedOrBlocked =
                      item.status === "planned" || item.status === "blocked";

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-disabled={isPlannedOrBlocked}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isPlannedOrBlocked && "opacity-50",
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!collapsed && (
                          <span className="flex-1 flex items-center justify-between gap-2 min-w-0">
                            <span className="truncate">{item.label}</span>
                            {item.phase > 1 && (
                              <span className="shrink-0 rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/60">
                                GĐ{item.phase}
                              </span>
                            )}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Collapse Button (when collapsed) */}
      {collapsed && (
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors flex items-center justify-center"
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}
    </aside>
  );
}
