"use client";

import { DataTable } from "@/components/data-table/data-table";
import { formatVND } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";

export function ClientDebtsTable({ data, type }: { data: any[]; type: "customer" | "supplier" }) {
  const columns = [
    {
      accessorKey: type === "customer" ? "customer.name" : "supplierName",
      header: type === "customer" ? "Khách hàng" : "Nhà cung cấp",
      cell: ({ row }: any) => <span className="font-medium">{type === "customer" ? row.original.customer?.name : row.original.supplierName}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng giá trị",
      cell: ({ row }: any) => <span className="font-semibold">{formatVND(row.original.totalAmount)}</span>,
    },
    {
      accessorKey: "paidAmount",
      header: "Đã thanh toán",
      cell: ({ row }: any) => <span className="text-green-600 font-medium">{formatVND(row.original.paidAmount)}</span>,
    },
    {
      accessorKey: "remainingAmount",
      header: "Còn lại (Công nợ)",
      cell: ({ row }: any) => {
        const remaining = Number(row.original.remainingAmount);
        return <span className={`font-bold ${remaining > 0 ? "text-destructive" : ""}`}>{formatVND(remaining)}</span>;
      },
    },
    {
      id: "progress",
      header: "Tỷ lệ",
      cell: ({ row }: any) => {
        const total = Number(row.original.totalAmount);
        const paid = Number(row.original.paidAmount);
        const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
        return (
          <div className="w-[80px] space-y-1">
            <div className="text-right text-[10px]">{pct}%</div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
  ];

  return <DataTable columns={columns} data={data} searchKey={type === "customer" ? "customer_name" : "supplierName"} searchPlaceholder="Tìm tên..." />;
}
