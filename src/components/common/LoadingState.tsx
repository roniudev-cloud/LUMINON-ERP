import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "table" | "cards" | "form" | "page";
  className?: string;
  count?: number;
}

export function LoadingState({ variant = "table", className, count = 5 }: LoadingStateProps) {
  if (variant === "table") {
    return (
      <div className={cn("w-full space-y-4 p-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <div className="rounded-md border border-muted p-2">
          <div className="space-y-3">
            <div className="flex space-x-4 border-b border-muted pb-2">
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4 pt-1">
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-xl border border-muted p-6 space-y-4">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className={cn("space-y-6 p-4", className)}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-[50vh] flex-col items-center justify-center space-y-4", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
    </div>
  );
}
