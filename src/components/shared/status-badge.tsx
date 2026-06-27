import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status] || STATUS_COLORS.default;
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium text-xs border-0 px-2.5 py-0.5",
        colorClass,
        className
      )}
    >
      {label}
    </Badge>
  );
}
