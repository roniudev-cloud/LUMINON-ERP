import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed bg-slate-50/50 dark:bg-slate-900/20", className)}>
      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-[250px] mx-auto">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
