"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || pathname === ROUTES.ERP.DASHBOARD) {
    return null;
  }

  return (
    <nav className="hidden md:flex items-center text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
      <Link
        href={ROUTES.ERP.DASHBOARD}
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/${segments.slice(0, index + 1).join("/")}`;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

        // Pretty print segment names (you can expand this dictionary)
        let label = isUuid ? "Chi tiết" : segment.replace(/-/g, " ");
        label = label.charAt(0).toUpperCase() + label.slice(1);
        
        // Map some common English routes to Vietnamese for ERP
        const dict: Record<string, string> = {
          "customers": "Khách hàng",
          "leads": "Leads",
          "quotations": "Báo giá",
          "contracts": "Hợp đồng",
          "projects": "Công trình",
          "products": "Sản phẩm",
          "inventory": "Kho vật tư",
          "materials": "Vật tư",
          "stock-in": "Nhập kho",
          "stock-out": "Xuất kho",
          "movements": "Lịch sử",
          "suppliers": "Nhà cung cấp",
          "receipts": "Phiếu thu",
          "payments": "Phiếu chi",
          "customer-debts": "Công nợ KH",
          "supplier-debts": "Công nợ NCC",
          "vat-invoices": "Hóa đơn VAT",
          "workers": "Nhân công",
          "acceptance-reports": "Biên bản nghiệm thu",
          "liquidation-reports": "Biên bản thanh lý",
          "tasks": "Giao việc",
          "reminders": "Nhắc nhở",
          "calendar": "Lịch biểu",
          "settings": "Cài đặt",
          "company": "Công ty",
          "users": "Người dùng",
          "roles": "Phân quyền",
          "reports": "Báo cáo",
          "revenue": "Doanh thu",
          "expenses": "Chi phí",
          "profit": "Lợi nhuận",
          "debts": "Công nợ",
          "edit": "Chỉnh sửa",
          "new": "Tạo mới",
          "finance": "Tài chính",
          "sales": "Bán hàng",
          "documents": "Tài liệu",
          "notifications": "Thông báo",
          "security": "Bảo mật",
          "audit-logs": "Nhật ký",
          "backups": "Sao lưu",
        };

        const displayLabel = dict[segment] || label;

        return (
          <div key={href} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground">{displayLabel}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-foreground transition-colors truncate max-w-[150px]"
              >
                {displayLabel}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
