"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Eye, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePermissions } from "@/hooks/use-permissions";
import { PERMISSIONS } from "@/lib/constants";

// The shape of the customer data returned by the server action
export type CustomerRow = {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: { id: string; name: string; color: string } | null;
  source: { id: string; name: string } | null;
  assignedTo: { id: string; fullName: string } | null;
  createdAt: Date;
};

interface CustomerColumnsProps {
  onDelete: (customer: CustomerRow) => void;
}

export function getCustomerColumns({ onDelete }: CustomerColumnsProps): ColumnDef<CustomerRow>[] {
  return [
    {
      accessorKey: "code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã KH" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("code")}</div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Khách hàng" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {row.original.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{row.original.name}</span>
              {row.original.phone && (
                <span className="text-xs text-muted-foreground">
                  {row.original.phone}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.status?.name,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return null;
        return (
          <div
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
            style={{
              backgroundColor: `${status.color}20`,
              color: status.color,
            }}
          >
            {status.name}
          </div>
        );
      },
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
        const customer = row.original;
        // Call hook inside the cell, or pass permissions down.
        // It's safe to use hook here as cell is a React component render function
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
              <DropdownMenuItem asChild>
                <Link href={`/customers/${customer.id}`} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                </Link>
              </DropdownMenuItem>
              {hasPermission(PERMISSIONS.CUSTOMERS_UPDATE) && (
                <DropdownMenuItem asChild>
                  <Link href={`/customers/${customer.id}/edit`} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" /> Cập nhật
                  </Link>
                </DropdownMenuItem>
              )}
              {hasPermission(PERMISSIONS.CUSTOMERS_DELETE) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() => onDelete(customer)}
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
