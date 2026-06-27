import { formatDateVN, formatDateTimeVN } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface DateTextProps {
  date: Date | string | null | undefined;
  className?: string;
  showTime?: boolean;
}

export function DateText({ date, className, showTime = false }: DateTextProps) {
  if (!date) {
    return <span className={cn("text-muted-foreground", className)}>—</span>;
  }

  return (
    <span className={cn("tabular-nums text-sm", className)}>
      {showTime ? formatDateTimeVN(date) : formatDateVN(date)}
    </span>
  );
}
