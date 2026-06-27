"use client";

import { DataTable } from "@/components/data-table/data-table";
import { formatVND, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export function ClientContractsTable({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "code",
      header: "Mã HĐ",
      cell: ({ row }: any) => <span className="font-medium text-primary">{row.original.code}</span>,
    },
    {
      accessorKey: "title",
      header: "Tên Hợp đồng",
      cell: ({ row }: any) => <div className="max-w-[200px] truncate" title={row.original.title}>{row.original.title}</div>
    },
    {
      accessorKey: "customer.name",
      header: "Khách hàng",
      cell: ({ row }: any) => row.original.customer?.name || "—",
    },
    {
      accessorKey: "totalAmount",
      header: "Giá trị HĐ",
      cell: ({ row }: any) => <span className="font-bold">{formatVND(row.original.totalAmount)}</span>,
    },
    {
      id: "paymentProgress",
      header: "Tiến độ thu",
      cell: ({ row }: any) => {
        const total = Number(row.original.totalAmount) || 0;
        const paid = Number(row.original.paidAmount) || 0;
        const pct = total > 0 ? (paid / total) * 100 : 0;
        return (
          <div className="w-[100px] space-y-1">
            <div className="flex justify-between text-[10px]">
              <span>{formatVND(paid)}</span>
              <span className="font-medium">{pct.toFixed(0)}%</span>
            </div>
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
    {
      id: "actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/contracts/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/contracts/${row.original.id}/edit`}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="title" searchPlaceholder="Tìm theo tên HĐ hoặc Mã HĐ..." />;
}
