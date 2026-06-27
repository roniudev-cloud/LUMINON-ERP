import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn("grid gap-6 border-b py-8 last:border-0 md:grid-cols-3", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="md:col-span-2 space-y-6">
        {children}
      </div>
    </div>
  );
}
