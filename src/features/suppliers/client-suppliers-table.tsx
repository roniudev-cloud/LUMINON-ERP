"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Pencil, Trash2, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MobileEntityCard, MobileEntityCardList } from "@/components/shared/mobile-entity-card";
import { SupplierDialog } from "./supplier-form-dialog";
import { deleteSupplier } from "@/actions/suppliers";
import { toast } from "sonner";

export function ClientSuppliersTable({ data }: { data: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = data.filter((s) =>
    [s.name, s.code, s.phone].filter(Boolean).some((v) => v.toLowerCase().includes(search.toLowerCase()))
  );

  function handleCreate() {
    setSelectedSupplier(null);
    setIsDialogOpen(true);
  }

  function handleEdit(supplier: any) {
    setSelectedSupplier(supplier);
    setIsDialogOpen(true);
  }

  function handleDeleteClick(supplier: any) {
    setDeletingSupplier(supplier);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingSupplier) return;
    try {
      setIsDeleting(true);
      await deleteSupplier(deletingSupplier.id);
      toast.success("Đã xóa nhà cung cấp");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Lỗi xóa nhà cung cấp", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-card">
        <h3 className="font-semibold text-lg">Danh sách nhà cung cấp</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm nhà cung cấp..."
              className="pl-8 w-full sm:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate}>+ Thêm nhà cung cấp</Button>
        </div>
      </div>

      <div className="hidden md:block overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã NCC</TableHead>
              <TableHead>Tên nhà cung cấp</TableHead>
              <TableHead>Nhóm</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Chưa có nhà cung cấp nào.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium text-primary">{supplier.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{supplier.name}</div>
                    {supplier.taxCode && (
                      <div className="text-xs text-muted-foreground">MST: {supplier.taxCode}</div>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={supplier.category} /></TableCell>
                  <TableCell>
                    <div>{supplier.contactPerson || "—"}</div>
                    <div className="text-xs text-muted-foreground">{supplier.phone || "—"}</div>
                  </TableCell>
                  <TableCell className="text-center"><StatusBadge status={supplier.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                          <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(supplier)}
                          className="text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MobileEntityCardList empty={filtered.length === 0}>
        {filtered.map((supplier) => (
          <MobileEntityCard
            key={supplier.id}
            title={supplier.name}
            subtitle={supplier.code}
            actions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                    <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteClick(supplier)} className="text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            fields={[
              { label: "Nhóm", value: <StatusBadge status={supplier.category} /> },
              { label: "Liên hệ", value: supplier.contactPerson || "—" },
              { label: "SĐT", value: supplier.phone || "—" },
              { label: "Trạng thái", value: <StatusBadge status={supplier.status} /> },
            ]}
          />
        ))}
      </MobileEntityCardList>

      <SupplierDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} supplier={selectedSupplier} />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc chắn muốn xóa nhà cung cấp "${deletingSupplier?.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
