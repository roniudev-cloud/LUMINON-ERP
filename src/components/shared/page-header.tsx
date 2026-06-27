import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden",
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action &&
          (action.href ? (
            <Button asChild>
              <Link href={action.href}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          ))}
      </div>
    </div>
  );
}
