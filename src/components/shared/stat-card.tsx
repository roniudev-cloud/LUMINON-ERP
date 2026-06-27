import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg group",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%{" "}
              <span className="text-muted-foreground font-normal">
                so với tháng trước
              </span>
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 transition-colors group-hover:bg-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
