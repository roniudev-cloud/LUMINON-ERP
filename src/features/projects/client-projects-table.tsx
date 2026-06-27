"use client";

import { DataTable } from "@/components/data-table/data-table";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export function ClientProjectsTable({ data }: { data: any[] }) {
  const columns = [
    {
      accessorKey: "code",
      header: "Mã CT",
      cell: ({ row }: any) => <span className="font-medium text-primary">{row.original.code}</span>,
    },
    {
      accessorKey: "name",
      header: "Tên Công Trình",
      cell: ({ row }: any) => <div className="max-w-[200px] truncate" title={row.original.name}>{row.original.name}</div>
    },
    {
      accessorKey: "customer.name",
      header: "Khách hàng",
      cell: ({ row }: any) => row.original.customer?.name || "—",
    },
    {
      accessorKey: "manager.fullName",
      header: "Người phụ trách",
      cell: ({ row }: any) => row.original.manager?.fullName || "—",
    },
    {
      id: "progress",
      header: "Tiến độ",
      cell: ({ row }: any) => {
        const pct = row.original.progress || 0;
        return (
          <div className="w-[100px] space-y-1">
            <div className="text-right text-[10px] font-medium">{pct}%</div>
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
              <Link href={`/projects/${row.original.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/projects/${row.original.id}/edit`}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Tìm tên công trình..." />;
}
