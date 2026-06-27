import { formatCurrencyVND } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface MoneyTextProps {
  amount: number | string | null | undefined;
  className?: string;
  type?: "neutral" | "income" | "expense" | "debt";
  bold?: boolean;
}

export function MoneyText({
  amount,
  className,
  type = "neutral",
  bold = false,
}: MoneyTextProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount || 0;
  
  const typeClasses = {
    neutral: "text-foreground",
    income: "text-emerald-600 dark:text-emerald-500",
    expense: "text-rose-600 dark:text-rose-500",
    debt: "text-amber-600 dark:text-amber-500",
  };

  return (
    <span
      className={cn(
        typeClasses[type],
        bold && "font-semibold",
        className
      )}
    >
      {formatCurrencyVND(num)}
    </span>
  );
}
