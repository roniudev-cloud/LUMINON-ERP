"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface PageToolbarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageToolbar({
  searchPlaceholder = "Tìm kiếm...",
  searchValue,
  onSearchChange,
  filters,
  actions,
  className,
}: PageToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4 mb-4",
        className
      )}
    >
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {onSearchChange && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        )}
        {filters && (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 self-start md:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
