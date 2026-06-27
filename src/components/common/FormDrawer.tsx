"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: FormDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto bg-background p-6 shadow-lg",
          className
        )}
      >
        <SheetHeader className="mb-6 space-y-2">
          <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-sm text-muted-foreground">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="py-2">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
