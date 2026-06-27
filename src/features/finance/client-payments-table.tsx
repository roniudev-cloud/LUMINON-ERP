"use client";

import { DataTable } from "@/components/data-table/data-table";
import { formatDateTime, formatVND } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Printer } from "lucide-react";
import Link from "next/link";

export function ClientPaymentsTable({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "code",
      header: "Mã PC",
      cell: ({ row }: any) => <span className="font-medium text-destructive">{row.original.code}</span>,
    },
    {
      accessorKey: "date",
      header: "Ngày chi",
      cell: ({ row }: any) => formatDateTime(row.original.date).split(" ")[0],
    },
    {
      accessorKey: "receiverName",
      header: "Người nhận",
      cell: ({ row }: any) => row.original.receiverName || "—",
    },
    {
      accessorKey: "category",
      header: "Hạng mục",
      cell: ({ row }: any) => <StatusBadge status={row.original.category} />,
    },
    {
      accessorKey: "project.name",
      header: "Công trình",
      cell: ({ row }: any) => row.original.project ? <span className="text-xs">[{row.original.project.code}] {row.original.project.name}</span> : "—",
    },
    {
      accessorKey: "amount",
      header: "Số tiền",
      cell: ({ row }: any) => <span className="font-bold text-destructive">{formatVND(row.original.amount)}</span>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Hình thức",
      cell: ({ row }: any) => {
        const method = row.original.paymentMethod;
        const labels: Record<string, string> = { cash: "Tiền mặt", bank_transfer: "Chuyển khoản", pos: "Quẹt thẻ", e_wallet: "Ví ĐT", other: "Khác" };
        return labels[method] || method;
      },
    },
    {
      accessorKey: "createdByUser.fullName",
      header: "Người tạo",
      cell: ({ row }: any) => row.original.createdByUser?.fullName || "—",
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/payments/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => window.open(`/payments/${row.original.id}?print=true`, "_blank")} title="In Phiếu Chi">
              <Printer className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="code" searchPlaceholder="Tìm theo mã PC..." />;
}
