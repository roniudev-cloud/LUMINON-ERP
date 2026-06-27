"use client";

import { DataTable } from "@/components/data-table/data-table";
import { formatDateTime, formatVND } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Printer } from "lucide-react";
import Link from "next/link";

export function ClientReceiptsTable({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "code",
      header: "Mã PT",
      cell: ({ row }: any) => <span className="font-medium text-primary">{row.original.code}</span>,
    },
    {
      accessorKey: "date",
      header: "Ngày thu",
      cell: ({ row }: any) => formatDateTime(row.original.date).split(" ")[0],
    },
    {
      accessorKey: "customer.name",
      header: "Khách hàng",
      cell: ({ row }: any) => row.original.customer?.name || "—",
    },
    {
      accessorKey: "type",
      header: "Loại thu",
      cell: ({ row }: any) => <StatusBadge status={row.original.type} />,
    },
    {
      accessorKey: "amount",
      header: "Số tiền",
      cell: ({ row }: any) => <span className="font-bold text-green-600">{formatVND(row.original.amount)}</span>,
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
      header: "Người thu",
      cell: ({ row }: any) => row.original.createdByUser?.fullName || "—",
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/receipts/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => window.open(`/receipts/${row.original.id}?print=true`, "_blank")} title="In Phiếu Thu">
              <Printer className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="code" searchPlaceholder="Tìm theo mã PT..." />;
}
