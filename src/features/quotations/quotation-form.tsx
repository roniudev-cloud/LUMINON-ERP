"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { quotationSchema, type QuotationFormValues } from "@/lib/validations/quotations";
import { createQuotation, updateQuotation } from "@/actions/quotations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/forms/form-section";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface QuotationFormProps {
  initialData?: any;
  customers: { id: string; name: string }[];
}

export function QuotationForm({ initialData, customers }: QuotationFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<QuotationFormValues> = initialData
    ? {
      ...initialData,
      items: initialData.items.map((i: any) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
        amount: Number(i.amount),
        })),
    subtotal: Number(initialData.subtotal),
      discount: Number(initialData.discount),
        vatRate: Number(initialData.vatRate),
          vatAmount: Number(initialData.vatAmount),
            otherFees: Number(initialData.otherFees),
              totalAmount: Number(initialData.totalAmount),
      }
    : {
  customerId: "",
    title: "",
      status: "draft",
        discount: 0,
          discountType: "amount",
            vatRate: 10,
              otherFees: 0,
                items: [{ name: "", unit: "bộ", quantity: 1, unitPrice: 0, amount: 0, sortOrder: 0 }],
                  subtotal: 0,
                    vatAmount: 0,
                      totalAmount: 0,
      };

const form = useForm<QuotationFormValues>({
  resolver: zodResolver(quotationSchema) as any,
  defaultValues,
});

const { fields, append, remove } = useFieldArray({
  name: "items",
  control: form.control,
});

// Watch values for auto-calculation
const watchedItems = form.watch("items");
const watchedDiscount = form.watch("discount") || 0;
const watchedDiscountType = form.watch("discountType");
const watchedVatRate = form.watch("vatRate") || 0;
const watchedOtherFees = form.watch("otherFees") || 0;

useEffect(() => {
  // Calculate each item's amount
  const items = form.getValues("items");
  let newSubtotal = 0;

  items.forEach((item, index) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unitPrice) || 0;
    const amt = q * p;
    if (item.amount !== amt) {
      form.setValue(`items.${index}.amount`, amt, { shouldValidate: true });
    }
    newSubtotal += amt;
  });

  // Subtotal
  if (form.getValues("subtotal") !== newSubtotal) {
    form.setValue("subtotal", newSubtotal);
  }

  // Discount
  let discountAmount = 0;
  if (watchedDiscountType === "percent") {
    discountAmount = newSubtotal * (Number(watchedDiscount) / 100);
  } else {
    discountAmount = Number(watchedDiscount);
  }

  // Base for VAT
  const baseAmount = newSubtotal - discountAmount + Number(watchedOtherFees);
  const vatAmount = baseAmount > 0 ? baseAmount * (Number(watchedVatRate) / 100) : 0;

  form.setValue("vatAmount", vatAmount);

  // Total Amount
  const totalAmount = baseAmount + vatAmount;
  form.setValue("totalAmount", totalAmount > 0 ? totalAmount : 0);

}, [watchedItems, watchedDiscount, watchedDiscountType, watchedVatRate, watchedOtherFees, form]);

const onSubmit = (values: QuotationFormValues) => {
  startTransition(async () => {
    try {
      if (initialData) {
        await updateQuotation(initialData.id, values);
        toast.success("Đã cập nhật báo giá");
        router.push(`/quotations/${initialData.id}`);
      } else {
        const created = await createQuotation(values);
        toast.success("Đã tạo báo giá thành công");
        router.push(`/quotations/${created.id}`);
      }
    } catch (error: any) {
      toast.error("Lỗi cập nhật", { description: error.message });
    }
  });
};

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FormSection
        title="Thông tin chung"
        description="Khách hàng và tiêu đề báo giá."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }: { field: any }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Tiêu đề báo giá</FormLabel>
                <FormControl>
                  <Input placeholder="Vd: Báo giá thi công nội thất anh Tuấn" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerId"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Khách hàng</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khách hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="sent">Đã gửi khách</SelectItem>
                    <SelectItem value="reviewing">Khách đang xem xét</SelectItem>
                    <SelectItem value="revising">Cần chỉnh sửa</SelectItem>
                    <SelectItem value="approved">Đã chốt</SelectItem>
                    <SelectItem value="rejected">Không chốt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection
        title="Hạng mục báo giá"
        description="Thêm các sản phẩm/dịch vụ cần báo giá."
        className="md:grid-cols-1"
      >
        <div className="rounded-xl border overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-2 bg-muted p-4 text-sm font-medium">
            <div className="col-span-4">Tên hạng mục</div>
            <div className="col-span-1">ĐVT</div>
            <div className="col-span-1">SL</div>
            <div className="col-span-2">Đơn giá</div>
            <div className="col-span-3">Thành tiền</div>
            <div className="col-span-1 text-right">Xóa</div>
          </div>

          <div className="p-4 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-2 md:items-start rounded-lg border p-3 md:border-0 md:p-0">
                <div className="col-span-2 md:col-span-4 space-y-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.name`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Tên sản phẩm/dịch vụ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Mô tả / Quy cách (tùy chọn)" className="text-xs h-8" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1">
                  <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">ĐVT</FormLabel>
                  <FormField
                    control={form.control}
                    name={`items.${index}.unit`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1">
                  <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">SL</FormLabel>
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">Đơn giá</FormLabel>
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="number" step="1000" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 md:col-span-3">
                  <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">Thành tiền</FormLabel>
                  <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 flex items-center justify-end font-medium">
                    {formatVND(form.watch(`items.${index}.amount`))}
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 md:h-9 md:w-9 md:p-0"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 md:mr-0 mr-2" /> <span className="md:hidden">Xóa hạng mục</span>
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ name: "", unit: "bộ", quantity: 1, unitPrice: 0, amount: 0, sortOrder: fields.length })}
            >
              <Plus className="mr-2 h-4 w-4" /> Thêm hạng mục
            </Button>
            {form.formState.errors.items && (
              <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.items.message}</p>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Tổng kết"
        description="Cập nhật chiết khấu và thuế."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Loại chiết khấu</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="amount">Số tiền cố định (VNĐ)</SelectItem>
                    <SelectItem value="percent">Phần trăm (%)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Chiết khấu</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vatRate"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Thuế VAT (%)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="otherFees"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Phí khác (Vận chuyển, phát sinh...)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="sm:col-span-2 border rounded-xl p-6 bg-card mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tổng tiền hàng:</span>
              <span className="font-medium">{formatVND(form.watch("subtotal"))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Thuế VAT ({form.watch("vatRate")}%):</span>
              <span className="font-medium">{formatVND(form.watch("vatAmount"))}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
              <span>Tổng thanh toán:</span>
              <span className="text-primary">{formatVND(form.watch("totalAmount"))}</span>
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }: { field: any }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Ghi chú / Điều khoản báo giá</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Lưu báo giá
        </Button>
      </div>
    </form>
  </Form>
);
}
