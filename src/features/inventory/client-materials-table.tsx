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
import { MoreHorizontal, Pencil, Trash2, Search, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MaterialDialog } from "./material-form-dialog";
import { deleteMaterial } from "@/actions/inventory";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";

export function ClientMaterialsTable({ data }: { data: any[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = data.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase()));

  async function handleConfirmDelete() {
    if (!deleting) return;
    try {
      setIsDeleting(true);
      await deleteMaterial(deleting.id);
      toast.success("Đã xóa vật tư");
      setIsDeleteOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error("Lỗi xóa vật tư", { description: error.message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-card">
        <h3 className="font-semibold text-lg">Danh mục vật tư</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Tìm vật tư..." className="pl-8 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button onClick={() => { setSelected(null); setIsDialogOpen(true); }}>+ Thêm vật tư</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã VT</TableHead>
              <TableHead>Tên vật tư</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead className="text-right">Tồn tối thiểu</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có vật tư nào.</TableCell></TableRow>
            ) : (
              filtered.map((m) => {
                const low = m.currentStock <= m.minStock;
                return (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-primary">{m.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.unit}</div>
                    </TableCell>
                    <TableCell>{m.category?.name || "—"}</TableCell>
                    <TableCell className="text-right">
                      <span className={low ? "text-red-600 font-semibold inline-flex items-center gap-1" : ""}>
                        {low && <AlertTriangle className="h-3.5 w-3.5" />}
                        {m.currentStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{m.minStock}</TableCell>
                    <TableCell className="text-right">{formatVND(m.unitPrice)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setSelected(m); setIsDialogOpen(true); }}>
                            <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setDeleting(m); setIsDeleteOpen(true); }} className="text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <MaterialDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} material={selected} />
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa vật tư"
        description={`Bạn có chắc chắn muốn xóa vật tư "${deleting?.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
