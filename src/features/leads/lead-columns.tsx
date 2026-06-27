"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants";

export type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  source: { id: string; name: string } | null;
  assignedTo: { id: string; fullName: string } | null;
  createdAt: Date;
};

interface LeadColumnsProps {
  onEdit: (lead: LeadRow) => void;
  onDelete: (lead: LeadRow) => void;
  onConvert: (lead: LeadRow) => void;
}

export function getLeadColumns({
  onEdit,
  onDelete,
  onConvert,
}: LeadColumnsProps): ColumnDef<LeadRow>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Họ tên" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Điện thoại" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "source",
      accessorFn: (row) => row.source?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nguồn" />
      ),
    },
    {
      id: "assignedTo",
      accessorFn: (row) => row.assignedTo?.fullName,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Người phụ trách" />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;
        // Rules of Hooks apply - this is a functional component rendered by the table
        const { hasPermission } = usePermissions();

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Mở menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
              {hasPermission(PERMISSIONS.CUSTOMERS_CREATE) &&
                lead.status !== "converted" && (
                  <DropdownMenuItem
                    onClick={() => onConvert(lead)}
                    className="text-primary cursor-pointer font-medium"
                  >
                    <UserPlus className="mr-2 h-4 w-4" /> Chuyển thành Khách Hàng
                  </DropdownMenuItem>
                )}
              {hasPermission(PERMISSIONS.LEADS_UPDATE) && (
                <DropdownMenuItem
                  onClick={() => onEdit(lead)}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" /> Cập nhật
                </DropdownMenuItem>
              )}
              {hasPermission(PERMISSIONS.LEADS_DELETE) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => onDelete(lead)}
                  >
                    <Trash className="mr-2 h-4 w-4" /> Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
