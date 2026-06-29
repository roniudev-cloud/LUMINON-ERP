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
    <div className={cn("grid gap-5 sm:gap-6 border-b py-6 sm:py-8 last:border-0 lg:grid-cols-3", className)}>
      <div className="space-y-1">
        <h3 className="text-lg font-medium leading-6">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="lg:col-span-2 space-y-5 sm:space-y-6">
        {children}
      </div>
    </div>
  );
}
