"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, CheckCircle2, XCircle, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WorkerDialog } from "./worker-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteWorker } from "@/actions/workers";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

export function ClientWorkersTable({ data }: { data: any[] }) {
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingWorker, setDeletingWorker] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete(worker: any) {
    setDeletingWorker(worker);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingWorker) return;
    setIsDeleting(true);
    try {
      await deleteWorker(deletingWorker.id);
      toast.success("Xóa nhân công thành công");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit(worker: any) {
    setSelectedWorker(worker);
    setIsDialogOpen(true);
  }

  function handleCreate() {
    setSelectedWorker(null);
    setIsDialogOpen(true);
  }

  return (
    <>
      <div className="p-4 border-b flex justify-between items-center bg-card">
        <h3 className="font-semibold text-lg">Danh sách nhân công</h3>
        <Button onClick={handleCreate}>+ Thêm nhân công</Button>
      </div>
      
      <div className="overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead className="text-right">Lương/Ngày</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Chưa có nhân công nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">{worker.code}</TableCell>
                  <TableCell className="font-bold">
                    <Link href={`/workers/${worker.id}`} className="hover:underline hover:text-primary">
                      {worker.name}
                    </Link>
                  </TableCell>
                  <TableCell>{worker.phone || "—"}</TableCell>
                  <TableCell>{worker.role?.name || "Chưa phân loại"}</TableCell>
                  <TableCell className="text-right">{formatNumber(worker.dailyRate)} đ</TableCell>
                  <TableCell className="text-center">
                    {worker.isActive ? (
                      <span className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đang làm việc
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3 mr-1" /> Đã nghỉ
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/workers/${worker.id}`}><Eye className="mr-2 h-4 w-4" /> Xem chi tiết</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(worker)}>
                          <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(worker)} className="text-destructive focus:bg-destructive/10">
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

      <WorkerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        worker={selectedWorker}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa nhân công"
        description={`Bạn có chắc chắn muốn xóa nhân công "${deletingWorker?.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
