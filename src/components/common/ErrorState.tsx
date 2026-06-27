"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Đã xảy ra lỗi",
  message = "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  className,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-6 gap-2">
          <RotateCcw className="h-4 w-4" />
          Thử lại
        </Button>
      )}
    </div>
  );
}
