"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/use-permissions";
import { getGroupedCoreModules } from "@/lib/modules";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { hasPermission, isAdmin } = usePermissions();
  const groups = getGroupedCoreModules();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar text-sidebar-foreground">
        <SheetHeader className="px-4 h-16 flex flex-row items-center gap-2.5 border-b border-sidebar-border">
          <img src="/logo.png" alt="LUMINON" className="h-10 w-10 rounded-lg object-cover shrink-0" />
          <SheetTitle className="font-heading font-bold text-lg tracking-tight text-sidebar-foreground">
            LUMINON <span className="text-sidebar-foreground/50 font-medium">ERP</span>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 py-4 h-[calc(100vh-4rem)]">
          <nav className="px-3 space-y-6">
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
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(item.href + "/");

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
