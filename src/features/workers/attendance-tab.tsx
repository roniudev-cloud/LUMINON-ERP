"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Trash2 } from "lucide-react";
import { attendanceSchema, type AttendanceFormValues } from "@/lib/validations/workers";
import { createAttendance, deleteAttendance } from "@/actions/workers";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_LABEL: Record<string, string> = { present: "Có mặt", absent: "Vắng", half_day: "Nửa ngày" };
const STATUS_COLOR: Record<string, string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  half_day: "bg-yellow-100 text-yellow-700",
};

export function AttendanceTab({ workerId, attendances, projects }: { workerId: string; attendances: any[]; projects: any[] }) {
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { date: new Date().toISOString().split("T")[0], status: "present" as const, projectId: "", note: "" },
  });

  async function onSubmit(data: AttendanceFormValues) {
    try {
      await createAttendance(workerId, data);
      toast.success("Đã chấm công");
      setOpen(false);
      form.reset({ date: new Date().toISOString().split("T")[0], status: "present", projectId: "", note: "" });
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAttendance(workerId, deleteTarget.id);
      toast.success("Đã xóa bản ghi chấm công");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Chấm công</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Chấm công</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Ngày *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="present">Có mặt</SelectItem>
                        <SelectItem value="half_day">Nửa ngày</SelectItem>
                        <SelectItem value="absent">Vắng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Công trình</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn công trình làm việc" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">-- Không gắn công trình --</SelectItem>
                        {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="note" render={({ field }) => (
                  <FormItem><FormLabel>Ghi chú</FormLabel><FormControl><Textarea {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Hủy</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>Lưu</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {attendances.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu chấm công.</p>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Công trình</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendances.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_COLOR[a.status]}`}>{STATUS_LABEL[a.status]}</span></TableCell>
                  <TableCell>{a.project ? `${a.project.name} (${a.project.code})` : "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{a.note || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(a)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Xóa bản ghi chấm công"
        description="Bản ghi chấm công ngày này sẽ bị xóa."
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
