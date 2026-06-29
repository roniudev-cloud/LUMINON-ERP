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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Trash2 } from "lucide-react";
import { advanceSchema, type AdvanceFormValues } from "@/lib/validations/workers";
import { createAdvance, deleteAdvance } from "@/actions/workers";
import { formatDate, formatVND } from "@/lib/utils";
import { toast } from "sonner";

export function AdvancesTab({ workerId, advances }: { workerId: string; advances: any[] }) {
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(advanceSchema),
    defaultValues: { amount: 0, date: new Date().toISOString().split("T")[0], note: "" },
  });

  async function onSubmit(data: AdvanceFormValues) {
    try {
      await createAdvance(workerId, data);
      toast.success("Đã ghi nhận ứng lương");
      setOpen(false);
      form.reset({ amount: 0, date: new Date().toISOString().split("T")[0], note: "" });
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteAdvance(workerId, deleteTarget.id);
      toast.success("Đã xóa bản ghi ứng lương");
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
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Ghi ứng lương</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Ghi ứng lương</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Số tiền (VNĐ) *</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem><FormLabel>Ngày *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
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

      {advances.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Chưa có bản ghi ứng lương.</p>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {advances.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{formatDate(a.date)}</TableCell>
                  <TableCell className="text-right font-medium">{formatVND(a.amount)}</TableCell>
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
        title="Xóa bản ghi ứng lương"
        description="Bản ghi ứng lương này sẽ bị xóa."
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
