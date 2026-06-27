"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table/data-table";
import { getCustomerColumns, type CustomerRow } from "./customer-columns";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteCustomer } from "@/actions/customers";
import { toast } from "sonner";

export function ClientCustomerTable({ data }: { data: CustomerRow[] }) {
  const router = useRouter();

  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (customer: CustomerRow) => {
    setDeletingCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCustomer) return;
    try {
      setIsDeleting(true);
      await deleteCustomer(deletingCustomer.id);
      toast.success("Đã xóa khách hàng");
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Lỗi xóa khách hàng", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoize columns to prevent re-renders
  const columns = useMemo(() => getCustomerColumns({ onDelete: handleDeleteClick }), []);

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Tìm kiếm khách hàng..."
        onRowClick={(row) => router.push(`/customers/${row.id}`)}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa khách hàng"
        description={`Bạn có chắc chắn muốn xóa khách hàng "${deletingCustomer?.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
