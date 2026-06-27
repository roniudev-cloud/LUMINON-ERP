"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckSquare, Clock, AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { TaskDialog } from "./task-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteTask } from "@/actions/tasks";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { StatusBadge } from "@/components/shared/status-badge";

export function ClientTasksTable({ data }: { data: any[] }) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete(task: any) {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await deleteTask(deletingTask.id);
      toast.success("Xóa công việc thành công");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit(task: any) {
    setSelectedTask(task);
    setIsDialogOpen(true);
  }

  function handleCreate() {
    setSelectedTask(null);
    setIsDialogOpen(true);
  }

  return (
    <>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">Danh sách công việc</h3>
        <Button onClick={handleCreate}>+ Thêm công việc</Button>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Người phụ trách</TableHead>
              <TableHead>Độ ưu tiên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead>Ngày hết hạn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Chưa có công việc nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.assignedUser?.fullName || "—"}</TableCell>
                  <TableCell>
                    <StatusBadge status={task.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[100px]">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? format(new Date(task.dueDate), "dd/MM/yyyy", { locale: vi }) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(task)}>
                          <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(task)} className="text-destructive focus:bg-destructive/10">
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

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa công việc"
        description={`Bạn có chắc chắn muốn xóa công việc "${deletingTask?.name}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
