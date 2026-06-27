"use client";

import { DataTable } from "@/components/data-table/data-table";
import { formatVND, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

export function ClientQuotationsTable({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "code",
      header: "Mã Báo Giá",
      cell: ({ row }: any) => <span className="font-medium">{row.original.code}</span>,
    },
    {
      accessorKey: "title",
      header: "Tiêu đề",
    },
    {
      accessorKey: "customer.name",
      header: "Khách hàng",
      cell: ({ row }: any) => row.original.customer?.name || "—",
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng thanh toán",
      cell: ({ row }: any) => <span className="font-bold text-primary">{formatVND(row.original.totalAmount)}</span>,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }: any) => formatDateTime(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/quotations/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/quotations/${row.original.id}/edit`}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="title" searchPlaceholder="Tìm theo tiêu đề..." />;
}
