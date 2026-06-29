import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileEntityCardField {
  label: string;
  value: React.ReactNode;
}

interface MobileEntityCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fields: MobileEntityCardField[];
  actions?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/** Card hiển thị 1 dòng dữ liệu trên mobile, dùng thay cho bảng dài trượt ngang.
 * Ghép với `hidden md:block` trên <Table/> gốc và `md:hidden` trên danh sách card này. */
export function MobileEntityCard({ title, subtitle, fields, actions, onClick, className }: MobileEntityCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm transition-colors",
        onClick && "cursor-pointer active:bg-muted/50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5 pb-2.5 border-b border-dashed">
        <div className="min-w-0">
          <div className="font-medium text-[15px] truncate">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</div>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="space-y-1.5">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground shrink-0">{f.label}</span>
            <span className="text-right min-w-0 truncate">{f.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileEntityCardList({ children, empty }: { children: React.ReactNode; empty?: boolean }) {
  if (empty) {
    return <p className="text-center text-sm text-muted-foreground py-10">Chưa có dữ liệu.</p>;
  }
  return <div className="md:hidden space-y-3">{children}</div>;
}
