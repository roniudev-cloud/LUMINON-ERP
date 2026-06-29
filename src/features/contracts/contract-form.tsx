"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { contractSchema, type ContractFormValues } from "@/lib/validations/contracts";
import { createContract, updateContract } from "@/actions/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/forms/form-section";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface ContractFormProps {
  initialData?: any;
  customers: { id: string; name: string }[];
  quotations?: { id: string; code: string; title: string }[];
}

export function ContractForm({ initialData, customers, quotations = [] }: ContractFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultValues: Partial<ContractFormValues> = initialData
    ? {
        ...initialData,
        items: initialData.items.map((i: any) => ({
          ...i,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          amount: Number(i.amount),
        })),
        paymentTerms: initialData.paymentTerms?.map((p: any) => ({
          ...p,
          percentage: p.percentage ? Number(p.percentage) : undefined,
          amount: Number(p.amount),
        })) || [],
        subtotal: Number(initialData.subtotal),
        discount: Number(initialData.discount),
        vatRate: Number(initialData.vatRate),
        vatAmount: Number(initialData.vatAmount),
        totalAmount: Number(initialData.totalAmount),
        paidAmount: Number(initialData.paidAmount),
      }
    : {
        customerId: "",
        quotationId: "",
        title: "",
        type: "construction",
        status: "draft",
        discount: 0,
        discountType: "amount",
        vatRate: 10,
        paidAmount: 0,
        items: [{ name: "", unit: "bộ", quantity: 1, unitPrice: 0, amount: 0, sortOrder: 0 }],
        paymentTerms: [
          { name: "Đợt 1 (Tạm ứng)", percentage: 40, amount: 0, status: "pending" },
          { name: "Đợt 2", percentage: 30, amount: 0, status: "pending" },
          { name: "Đợt 3 (Quyết toán)", percentage: 30, amount: 0, status: "pending" },
        ],
        subtotal: 0,
        vatAmount: 0,
        totalAmount: 0,
      };

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema) as any,
    defaultValues,
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const { fields: termFields, append: appendTerm, remove: removeTerm } = useFieldArray({
    name: "paymentTerms",
    control: form.control,
  });

  // Watch values for auto-calculation
  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount") || 0;
  const watchedDiscountType = form.watch("discountType");
  const watchedVatRate = form.watch("vatRate") || 0;
  const watchedPaymentTerms = form.watch("paymentTerms");

  useEffect(() => {
    // 1. Calculate Items
    const items = form.getValues("items") || [];
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

    if (form.getValues("subtotal") !== newSubtotal) {
      form.setValue("subtotal", newSubtotal);
    }

    // 2. Discount & VAT
    let discountAmount = 0;
    if (watchedDiscountType === "percent") {
      discountAmount = newSubtotal * (Number(watchedDiscount) / 100);
    } else {
      discountAmount = Number(watchedDiscount);
    }

    const baseAmount = newSubtotal - discountAmount;
    const vatAmount = baseAmount > 0 ? baseAmount * (Number(watchedVatRate) / 100) : 0;
    
    form.setValue("vatAmount", vatAmount);

    const totalAmount = baseAmount + vatAmount;
    form.setValue("totalAmount", totalAmount > 0 ? totalAmount : 0);

    // 3. Payment Terms Auto-calculate amounts if percentage is set
    const terms = form.getValues("paymentTerms") || [];
    terms.forEach((term, index) => {
      if (term.percentage) {
        const pctAmount = totalAmount * (Number(term.percentage) / 100);
        // Only update if difference is more than 1 (rounding issues)
        if (Math.abs((term.amount || 0) - pctAmount) > 1) {
          form.setValue(`paymentTerms.${index}.amount`, pctAmount);
        }
      }
    });

  }, [watchedItems, watchedDiscount, watchedDiscountType, watchedVatRate, watchedPaymentTerms, form]);

  const onSubmit = (values: ContractFormValues) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateContract(initialData.id, values);
          toast.success("Đã cập nhật hợp đồng");
          router.push(`/contracts/${initialData.id}`);
        } else {
          const created = await createContract(values);
          toast.success("Đã tạo hợp đồng thành công");
          router.push(`/contracts/${created.id}`);
        }
      } catch (error: any) {
        toast.error("Lỗi cập nhật", { description: error.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Thông tin chung" description="Khách hàng và phân loại hợp đồng.">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: any }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Tên hợp đồng</FormLabel>
                  <FormControl>
                    <Input placeholder="Vd: HĐ Thi công nội thất nhà phố" {...field} />
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
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Loại hợp đồng</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="construction">Thi công</SelectItem>
                      <SelectItem value="interior">Nội thất</SelectItem>
                      <SelectItem value="design">Thiết kế</SelectItem>
                      <SelectItem value="advertising">Quảng cáo</SelectItem>
                      <SelectItem value="other">Khác</SelectItem>
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
                      <SelectItem value="pending_sign">Chờ ký</SelectItem>
                      <SelectItem value="signed">Đã ký</SelectItem>
                      <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                      <SelectItem value="paused">Tạm dừng</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="liquidated">Thanh lý</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signDate"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Ngày ký</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Ngày bắt đầu dự kiến</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Ngày hoàn thành dự kiến</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="constructionAddress"
              render={({ field }: { field: any }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Địa chỉ thi công</FormLabel>
                  <FormControl>
                    <Input placeholder="Số nhà, đường, quận/huyện..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection title="Hạng mục hợp đồng" description="Danh sách các hạng mục sản phẩm/dịch vụ." className="md:grid-cols-1">
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
              {itemFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-2 md:items-start rounded-lg border p-3 md:border-0 md:p-0">
                  <div className="col-span-2 md:col-span-4 space-y-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }: { field: any }) => (
                        <FormItem><FormControl><Input placeholder="Tên sản phẩm/dịch vụ" {...field} /></FormControl><FormMessage /></FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }: { field: any }) => (
                        <FormItem><FormControl><Input placeholder="Quy cách/Mô tả (tùy chọn)" className="text-xs h-8" {...field} /></FormControl></FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">ĐVT</FormLabel>
                    <FormField control={form.control} name={`items.${index}.unit`} render={({ field }: { field: any }) => (<FormItem><FormControl><Input {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="col-span-1">
                    <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">SL</FormLabel>
                    <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }: { field: any }) => (<FormItem><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">Đơn giá</FormLabel>
                    <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }: { field: any }) => (<FormItem><FormControl><Input type="number" step="1000" {...field} /></FormControl></FormItem>)} />
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <FormLabel className="md:hidden text-xs text-muted-foreground mb-1.5 block">Thành tiền</FormLabel>
                    <div className="h-10 px-3 py-2 border rounded-md bg-muted/30 flex items-center justify-end font-medium">
                      {formatVND(form.watch(`items.${index}.amount`))}
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 md:h-9 md:w-9 md:p-0" onClick={() => removeItem(index)} disabled={itemFields.length === 1}>
                      <Trash2 className="h-4 w-4 md:mr-0 mr-2" /> <span className="md:hidden">Xóa hạng mục</span>
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendItem({ name: "", unit: "bộ", quantity: 1, unitPrice: 0, amount: 0, sortOrder: itemFields.length })}>
                <Plus className="mr-2 h-4 w-4" /> Thêm hạng mục
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <FormField control={form.control} name="discountType" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Loại chiết khấu</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="amount">Số tiền cố định</SelectItem><SelectItem value="percent">Phần trăm (%)</SelectItem></SelectContent></Select>
                </FormItem>
            )} />
            <FormField control={form.control} name="discount" render={({ field }: { field: any }) => (<FormItem><FormLabel>Chiết khấu</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="vatRate" render={({ field }: { field: any }) => (<FormItem><FormLabel>Thuế VAT (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>)} />
            
            <div className="sm:col-span-2 border rounded-xl p-6 bg-primary/5 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tổng tiền hàng:</span><span className="font-medium">{formatVND(form.watch("subtotal"))}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Thuế VAT ({form.watch("vatRate")}%):</span><span className="font-medium">{formatVND(form.watch("vatAmount"))}</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3"><span>Tổng giá trị hợp đồng:</span><span className="text-primary">{formatVND(form.watch("totalAmount"))}</span></div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Tiến độ thanh toán" description="Chia đợt thu tiền cho hợp đồng.">
          <div className="space-y-4 md:col-span-2">
            {termFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-2 md:grid-cols-12 gap-3 md:items-center border p-3 rounded-lg bg-card">
                <div className="col-span-2 md:col-span-3">
                  <FormField control={form.control} name={`paymentTerms.${index}.name`} render={({ field }: { field: any }) => (<FormItem><FormLabel className="text-xs">Tên đợt</FormLabel><FormControl><Input className="h-8" {...field} /></FormControl></FormItem>)} />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <FormField control={form.control} name={`paymentTerms.${index}.percentage`} render={({ field }: { field: any }) => (<FormItem><FormLabel className="text-xs">Tỷ lệ (%)</FormLabel><FormControl><Input type="number" className="h-8" {...field} value={field.value || ""} /></FormControl></FormItem>)} />
                </div>
                <div className="col-span-1 md:col-span-3">
                  <FormField control={form.control} name={`paymentTerms.${index}.amount`} render={({ field }: { field: any }) => (<FormItem><FormLabel className="text-xs">Số tiền</FormLabel><FormControl><Input type="number" className="h-8" {...field} /></FormControl></FormItem>)} />
                </div>
                <div className="col-span-2 md:col-span-3">
                  <FormField control={form.control} name={`paymentTerms.${index}.dueDate`} render={({ field }: { field: any }) => (<FormItem><FormLabel className="text-xs">Ngày dự kiến</FormLabel><FormControl><Input type="date" className="h-8" {...field} value={field.value || ""} /></FormControl></FormItem>)} />
                </div>
                <div className="col-span-2 md:col-span-1 md:pt-6 text-right">
                  <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 h-8 md:w-8" onClick={() => removeTerm(index)}>
                    <Trash2 className="h-4 w-4 md:mr-0 mr-2" /> <span className="md:hidden">Xóa đợt thanh toán</span>
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendTerm({ name: `Đợt ${termFields.length + 1}`, amount: 0, status: "pending" })}>
              <Plus className="mr-2 h-4 w-4" /> Thêm đợt thanh toán
            </Button>
          </div>
        </FormSection>

        <FormSection title="Điều khoản chi tiết" description="Nhập nội dung các điều khoản cụ thể.">
          <div className="space-y-4 md:col-span-2">
             <FormField control={form.control} name="paymentTermsContent" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Điều khoản thanh toán</FormLabel><FormControl><Textarea className="min-h-[80px]" placeholder="Phương thức và quy định thanh toán..." {...field} value={field.value || ""} /></FormControl></FormItem>
             )} />
             <FormField control={form.control} name="executionTerms" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Điều khoản thi công / giao hàng</FormLabel><FormControl><Textarea className="min-h-[80px]" {...field} value={field.value || ""} /></FormControl></FormItem>
             )} />
             <FormField control={form.control} name="warrantyTerms" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Điều khoản bảo hành</FormLabel><FormControl><Textarea className="min-h-[80px]" {...field} value={field.value || ""} /></FormControl></FormItem>
             )} />
             <FormField control={form.control} name="internalNotes" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Ghi chú nội bộ</FormLabel><FormControl><Textarea className="min-h-[80px]" placeholder="Chỉ xem nội bộ, không in ra hợp đồng" {...field} value={field.value || ""} /></FormControl></FormItem>
             )} />
          </div>
        </FormSection>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>Hủy</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Hợp đồng
          </Button>
        </div>
      </form>
    </Form>
  );
}
