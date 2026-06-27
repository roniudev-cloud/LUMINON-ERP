"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, Plus } from "lucide-react";
import { stockTicketSchema, type StockTicketFormValues } from "@/lib/validations/inventory";
import { createStockTicket, getMaterials } from "@/actions/inventory";
import { getSupplierOptions } from "@/actions/suppliers";
import { getProjectOptions } from "@/actions/projects";
import { toast } from "sonner";
import { formatVND } from "@/lib/utils";

interface StockTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "IN" | "OUT";
}

export function StockTicketDialog({ open, onOpenChange, type }: StockTicketDialogProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(stockTicketSchema),
    defaultValues: {
      type,
      date: new Date().toISOString().split("T")[0],
      supplierId: "",
      projectId: "",
      delivererName: "",
      receiverName: "",
      notes: "",
      items: [{ materialId: "", quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  useEffect(() => {
    if (!open) return;
    getMaterials().then(setMaterials);
    getSupplierOptions().then(setSuppliers);
    getProjectOptions().then(setProjects);
    form.reset({
      type,
      date: new Date().toISOString().split("T")[0],
      supplierId: "",
      projectId: "",
      delivererName: "",
      receiverName: "",
      notes: "",
      items: [{ materialId: "", quantity: 1, unitPrice: 0 }],
    });
  }, [open, type, form]);

  const items: { quantity?: unknown; unitPrice?: unknown }[] = form.watch("items");
  const total = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);

  function handleMaterialChange(index: number, materialId: string) {
    form.setValue(`items.${index}.materialId`, materialId);
    const material = materials.find((m) => m.id === materialId);
    if (material) form.setValue(`items.${index}.unitPrice`, Number(material.unitPrice) || 0);
  }

  async function onSubmit(data: StockTicketFormValues) {
    try {
      await createStockTicket(data);
      toast.success(type === "IN" ? "Tạo phiếu nhập kho thành công" : "Tạo phiếu xuất kho thành công");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === "IN" ? "Lập phiếu nhập kho" : "Lập phiếu xuất kho"}</DialogTitle>
          <DialogDescription>
            {type === "IN" ? "Nhập vật tư từ nhà cung cấp, tăng tồn kho." : "Xuất vật tư cho công trình, giảm tồn kho."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem><FormLabel>Ngày {type === "IN" ? "nhập" : "xuất"}</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {type === "IN" ? (
                <FormField control={form.control} name="supplierId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà cung cấp</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">-- Không có --</SelectItem>
                        {suppliers.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              ) : (
                <FormField control={form.control} name="receiverName" render={({ field }) => (
                  <FormItem><FormLabel>Người nhận</FormLabel><FormControl><Input placeholder="Tên người nhận vật tư..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
            </div>

            {type === "IN" && (
              <FormField control={form.control} name="delivererName" render={({ field }) => (
                <FormItem><FormLabel>Người giao hàng</FormLabel><FormControl><Input placeholder="Tên người giao..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            )}

            {type === "OUT" && (
              <FormField control={form.control} name="projectId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Công trình sử dụng</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Chọn công trình (nếu xuất cho công trình)" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="">-- Không gắn công trình --</SelectItem>
                      {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Danh sách vật tư *</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ materialId: "", quantity: 1, unitPrice: 0 })}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm dòng
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_90px_120px_32px] gap-2 items-start">
                  <FormField control={form.control} name={`items.${index}.materialId`} render={({ field: f }) => (
                    <FormItem>
                      <Select onValueChange={(v) => handleMaterialChange(index, v)} value={f.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn vật tư" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {materials.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit}) — tồn: {m.currentStock}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: f }) => (
                    <FormItem><FormControl><Input type="number" min="1" placeholder="SL" {...f} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: f }) => (
                    <FormItem><FormControl><Input type="number" min="0" placeholder="Đơn giá" {...f} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="ghost" size="icon" disabled={fields.length === 1} onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-end pt-2 border-t">
                <p className="font-semibold">Tổng giá trị: {formatVND(total)}</p>
              </div>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Ghi chú</FormLabel><FormControl><Textarea className="h-16" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : type === "IN" ? "Tạo phiếu nhập" : "Tạo phiếu xuất"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
