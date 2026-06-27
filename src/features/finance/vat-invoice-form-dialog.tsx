"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { vatInvoiceSchema, type VatInvoiceFormValues } from "@/lib/validations/vat-invoices";
import { createVatInvoice, updateVatInvoice } from "@/actions/vat-invoices";
import { toast } from "sonner";
import { DatePicker } from "@/components/forms/date-picker";
import { FormSection } from "@/components/forms/form-section";
import { getCustomers } from "@/actions/customers"; 
import { getCustomerLookups } from "@/actions/customers"; // kept just in case, or we can replace it entirely if unused

interface VatInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: any | null;
}

export function VatInvoiceDialog({ open, onOpenChange, invoice }: VatInvoiceDialogProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const isEditing = !!invoice;

  const form = useForm({
    resolver: zodResolver(vatInvoiceSchema),
    defaultValues: {
      code: "",
      type: "outbound",
      customerId: null,
      supplierId: null,
      amount: 0,
      vatRate: 10,
      vatAmount: 0,
      totalAmount: 0,
      issueDate: "",
      status: "draft",
    },
  });

  const type = form.watch("type");
  const amount = form.watch("amount") as number;
  const vatRate = form.watch("vatRate") as number;

  useEffect(() => {
    async function loadLookups() {
      const { data } = await getCustomers({ pageSize: 100 });
      setCustomers(data);
    }
    if (open) loadLookups();
  }, [open]);

  useEffect(() => {
    if (open && invoice) {
      form.reset({
        code: invoice.code,
        type: invoice.type,
        customerId: invoice.customerId,
        supplierId: invoice.supplierId,
        amount: Number(invoice.amount),
        vatRate: Number(invoice.vatRate),
        vatAmount: Number(invoice.vatAmount),
        totalAmount: Number(invoice.totalAmount),
        issueDate: invoice.issueDate,
        status: invoice.status,
      });
    } else if (open && !invoice) {
      form.reset({
        code: "",
        type: "outbound",
        customerId: null,
        supplierId: null,
        amount: 0,
        vatRate: 10,
        vatAmount: 0,
        totalAmount: 0,
        issueDate: new Date().toISOString(),
        status: "draft",
      });
    }
  }, [open, invoice, form]);

  useEffect(() => {
    const vAmount = (amount * vatRate) / 100;
    form.setValue("vatAmount", vAmount);
    form.setValue("totalAmount", amount + vAmount);
  }, [amount, vatRate, form]);

  async function onSubmit(data: VatInvoiceFormValues) {
    try {
      if (isEditing) {
        await updateVatInvoice(invoice.id, data);
        toast.success("Cập nhật hóa đơn thành công");
      } else {
        await createVatInvoice(data);
        toast.success("Thêm hóa đơn thành công");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-5xl h-[95vh] overflow-y-auto">
        <DialogHeader className="mb-6">
          <DialogTitle>{isEditing ? "Cập nhật hóa đơn VAT" : "Thêm hóa đơn VAT mới"}</DialogTitle>
          <DialogDescription>
            Khai báo thông tin hóa đơn GTGT đầu vào / đầu ra.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Thông tin cơ bản" description="Mã hóa đơn và loại hóa đơn.">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số hóa đơn (Mã tra cứu) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số hóa đơn..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày xuất hóa đơn *</FormLabel>
                      <FormControl>
                        <DatePicker date={field.value ? new Date(field.value) : undefined} setDate={(date) => field.onChange(date?.toISOString())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại hóa đơn</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="outbound">Hóa đơn đầu ra (Bán hàng)</SelectItem>
                          <SelectItem value="inbound">Hóa đơn đầu vào (Mua hàng)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="issued">Đã xuất / Đã nhận</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {type === "outbound" ? (
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Khách hàng</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn khách hàng" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Nhà cung cấp (ID)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập Supplier ID hoặc để trống..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormSection>

            <FormSection title="Giá trị thanh toán" description="Số tiền trước thuế, thuế suất và tổng tiền.">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giá trị trước thuế (VNĐ) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thuế suất (%)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value.toString()}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn % thuế" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="8">8%</SelectItem>
                          <SelectItem value="10">10%</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="vatAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiền thuế (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" disabled {...field} className="bg-slate-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tổng tiền thanh toán (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" disabled {...field} className="bg-slate-50 font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm hóa đơn"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
