"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getLeadColumns, type LeadRow } from "./lead-columns";
import { LeadFormDialog } from "./lead-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteLead, convertLeadToCustomer } from "@/actions/leads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ClientLeadTableProps {
  data: LeadRow[];
  sources: { id: string; name: string }[];
  assignees: { id: string; fullName: string }[];
}

export function ClientLeadTable({ data, sources, assignees }: ClientLeadTableProps) {
  const router = useRouter();
  const [editingLead, setEditingLead] = useState<LeadRow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [deletingLead, setDeletingLead] = useState<LeadRow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [convertingLead, setConvertingLead] = useState<LeadRow | null>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const handleEdit = (lead: LeadRow) => {
    setEditingLead(lead);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (lead: LeadRow) => {
    setDeletingLead(lead);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    try {
      setIsDeleting(true);
      await deleteLead(deletingLead.id);
      toast.success("Đã xóa lead");
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast.error("Lỗi xóa lead", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConvertClick = (lead: LeadRow) => {
    setConvertingLead(lead);
    setIsConvertDialogOpen(true);
  };

  const handleConfirmConvert = async () => {
    if (!convertingLead) return;
    try {
      setIsConverting(true);
      const customer = await convertLeadToCustomer(convertingLead.id);
      toast.success("Chuyển đổi thành công!");
      setIsConvertDialogOpen(false);
      
      // Optionally redirect to the new customer
      router.push(`/customers/${customer.id}`);
    } catch (error: any) {
      toast.error("Lỗi chuyển đổi", { description: error.message });
    } finally {
      setIsConverting(false);
    }
  };

  const columns = useMemo(
    () =>
      getLeadColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
        onConvert: handleConvertClick,
      }),
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Tìm kiếm lead..."
      />

      <LeadFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setTimeout(() => setEditingLead(null), 200); // delay clear to avoid flicker
        }}
        initialData={editingLead}
        sources={sources}
        assignees={assignees}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa Lead"
        description={`Bạn có chắc chắn muốn xóa lead "${deletingLead?.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />

      <ConfirmDialog
        open={isConvertDialogOpen}
        onOpenChange={setIsConvertDialogOpen}
        title="Chuyển đổi thành Khách Hàng"
        description={`Lead "${convertingLead?.name}" sẽ được chuyển thành Khách Hàng chính thức trong hệ thống.`}
        confirmLabel="Chuyển đổi"
        onConfirm={handleConfirmConvert}
        loading={isConverting}
      />
    </>
  );
}
