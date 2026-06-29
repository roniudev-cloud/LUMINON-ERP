"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { StatusBadge } from "@/components/shared/status-badge";
import { CheckCircle2, Plus } from "lucide-react";
import { workerPaymentSchema, type WorkerPaymentFormValues } from "@/lib/validations/workers";
import { createWorkerPayment, markWorkerPaymentPaid } from "@/actions/workers";
import { formatVND } from "@/lib/utils";
import { toast } from "sonner";

export function PaymentsTab({
  workerId,
  payments,
  projects,
  suggestedAdvances,
  dailyRate,
}: {
  workerId: string;
  payments: any[];
  projects: any[];
  suggestedAdvances: number;
  dailyRate: number;
}) {
  const [open, setOpen] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(workerPaymentSchema),
    defaultValues: {
      period: new Date().toISOString().slice(0, 7),
      projectId: "",
      paymentType: "daily" as const,
      totalDays: 0,
      dailyRate,
      totalAmount: 0,
      advances: suggestedAdvances,
    },
  });

  const paymentType = form.watch("paymentType");
  const totalDays = Number(form.watch("totalDays")) || 0;
  const rate = Number(form.watch("dailyRate")) || 0;
  const lumpSum = Number(form.watch("totalAmount")) || 0;
  const advances = Number(form.watch("advances")) || 0;
  const computedTotal = paymentType === "daily" ? totalDays * rate : lumpSum;
  const netAmount = computedTotal - advances;

  async function onSubmit(data: WorkerPaymentFormValues) {
    try {
      await createWorkerPayment(workerId, data);
      toast.success("Đã tạo bảng lương");
      setOpen(false);
      form.reset({
        period: new Date().toISOString().slice(0, 7),
        projectId: "",
        paymentType: "daily",
        totalDays: 0,
        dailyRate,
        totalAmount: 0,
        advances: 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  async function handleMarkPaid(paymentId: string) {
    setMarkingPaidId(paymentId);
    try {
      await markWorkerPaymentPaid(workerId, paymentId);
      toast.success("Đã xác nhận đã thanh toán");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setMarkingPaidId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Chốt lương</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Chốt lương kỳ</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="period" render={({ field }) => (
                    <FormItem><FormLabel>Kỳ lương *</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="paymentType" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hình thức *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Công nhật</SelectItem>
                          <SelectItem value="lump_sum">Khoán việc</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="projectId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Công trình</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn công trình (nếu khoán theo công trình)" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">-- Không gắn công trình --</SelectItem>
                        {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {paymentType === "daily" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="totalDays" render={({ field }) => (
                      <FormItem><FormLabel>Số công</FormLabel><FormControl><Input type="number" min="0" step="0.5" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="dailyRate" render={({ field }) => (
                      <FormItem><FormLabel>Lương/ngày</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                ) : (
                  <FormField control={form.control} name="totalAmount" render={({ field }) => (
                    <FormItem><FormLabel>Tổng tiền khoán</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                )}

                <FormField control={form.control} name="advances" render={({ field }) => (
                  <FormItem><FormLabel>Trừ tiền đã ứng</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tổng lương:</span><span className="font-medium">{formatVND(computedTotal)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Trừ đã ứng:</span><span className="font-medium text-red-600">-{formatVND(advances)}</span></div>
                  <div className="flex justify-between border-t pt-1"><span className="font-semibold">Còn phải trả:</span><span className="font-bold">{formatVND(netAmount)}</span></div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t">
                  <Button variant="outline" type="button" onClick={() => setOpen(false)}>Hủy</Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>Tạo bảng lương</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Chưa có bảng lương nào.</p>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kỳ</TableHead>
                <TableHead>Công trình</TableHead>
                <TableHead className="text-right">Tổng lương</TableHead>
                <TableHead className="text-right">Đã ứng</TableHead>
                <TableHead className="text-right">Còn lại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.period}</TableCell>
                  <TableCell>{p.project ? `${p.project.name} (${p.project.code})` : "—"}</TableCell>
                  <TableCell className="text-right">{formatVND(p.totalAmount)}</TableCell>
                  <TableCell className="text-right text-red-600">-{formatVND(p.advances)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatVND(p.netAmount)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell className="text-right">
                    {p.status === "pending" && (
                      <Button size="sm" variant="outline" disabled={markingPaidId === p.id} onClick={() => handleMarkPaid(p.id)}>
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Đã trả
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
