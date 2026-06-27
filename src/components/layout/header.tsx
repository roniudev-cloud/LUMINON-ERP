"use client";

import { useAuth } from "@/providers/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { HeaderSearch } from "@/components/layout/header-search";
import { NotificationBell } from "@/components/layout/notification-bell";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="flex shrink-0 h-16 items-center gap-4 border-b bg-card px-4 lg:px-6 print:hidden">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Search */}
      <HeaderSearch />

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.roles[0] ?? ""}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={ROUTES.ERP.SETTINGS.COMPANY} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Cài đặt
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={signOut}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
