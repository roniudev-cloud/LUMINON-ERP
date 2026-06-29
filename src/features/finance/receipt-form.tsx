"use client";

import { useTransition, useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { receiptSchema, type ReceiptFormValues } from "@/lib/validations/finance";
import { createReceipt } from "@/actions/finance";
import { getContractsByCustomer, getProjectsByCustomer } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/forms/form-section";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface ReceiptFormProps {
  customers: { id: string; name: string }[];
  projects: { id: string; name: string, code: string }[];
  contracts: { id: string; code: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReceiptForm({ customers = [], projects: allProjects = [], contracts: allContracts = [], onSuccess, onCancel }: ReceiptFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cascade state: filtered lists based on selected customer
  const [filteredContracts, setFilteredContracts] = useState<{ id: string; code: string; totalValue?: any }[]>(allContracts || []);
  const [filteredProjects, setFilteredProjects] = useState<{ id: string; name: string; code: string }[]>(allProjects || []);
  const [isLoadingLookups, setIsLoadingLookups] = useState(false);

  const defaultValues: Partial<ReceiptFormValues> = {
    date: "",
    amount: 0,
    type: "deposit",
    paymentMethod: "bank_transfer",
    files: [],
  };

  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptSchema) as any,
    defaultValues,
  });

  const files = form.watch("files") || [];

  useEffect(() => {
    if (!form.getValues("date")) {
      form.setValue("date", new Date().toISOString().split("T")[0]);
    }
  }, [form]);

  // When customer changes → load matching contracts & projects
  const handleCustomerChange = useCallback(async (customerId: string) => {
    // Reset dependent fields
    form.setValue("contractId", "");
    form.setValue("projectId", "");

    if (!customerId) {
      // No customer selected → show all
      setFilteredContracts(allContracts);
      setFilteredProjects(allProjects);
      return;
    }

    setIsLoadingLookups(true);
    try {
      const [customerContracts, customerProjects] = await Promise.all([
        getContractsByCustomer(customerId),
        getProjectsByCustomer(customerId),
      ]);
      setFilteredContracts(customerContracts);
      setFilteredProjects(customerProjects);
    } catch {
      // Fallback: show all if lookup fails
      setFilteredContracts(allContracts);
      setFilteredProjects(allProjects);
    } finally {
      setIsLoadingLookups(false);
    }
  }, [allContracts, allProjects, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn", { description: "Vui lòng chọn file dưới 5MB để upload Base64." });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      form.setValue("files", [...files, base64String]);
      toast.success("Đã đính kèm tệp");
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: ReceiptFormValues) => {
    startTransition(async () => {
      try {
        await createReceipt(values);
        toast.success("Đã tạo phiếu thu thành công");
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/receipts");
        }
      } catch (error: any) {
        toast.error("Lỗi tạo phiếu thu", { description: error.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Thông tin chung" description="Nhập thông tin người nộp và tham chiếu.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="date" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Ngày thu</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="submitterName" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Người nộp (Tên KH / NV)</FormLabel><FormControl><Input placeholder="Tên người nộp tiền" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="customerId" render={({ field }: { field: any }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Khách hàng (Bắt buộc)</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    handleCustomerChange(val);
                    // Auto-fill submitter name
                    const customer = customers.find(c => c.id === val);
                    if (customer && !form.getValues("submitterName")) {
                      form.setValue("submitterName", customer.name);
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn khách hàng — Hợp đồng & Công trình sẽ tự lọc theo" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="contractId" render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>
                  Hợp đồng tham chiếu
                  {isLoadingLookups && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingLookups}>
                  <FormControl><SelectTrigger><SelectValue placeholder={filteredContracts.length === 0 ? "Không có hợp đồng" : "Chọn hợp đồng"} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">Không có</SelectItem>
                    {filteredContracts.map((c) => (<SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="projectId" render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>
                  Công trình tham chiếu
                  {isLoadingLookups && <Loader2 className="inline ml-2 h-3 w-3 animate-spin" />}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingLookups}>
                  <FormControl><SelectTrigger><SelectValue placeholder={filteredProjects.length === 0 ? "Không có công trình" : "Chọn công trình"} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">Không có</SelectItem>
                    {filteredProjects.map((c) => (<SelectItem key={c.id} value={c.id}>[{c.code}] {c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </FormSection>

        <FormSection title="Chi tiết khoản thu" description="Nhập số tiền và hình thức thanh toán.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="type" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Loại thu</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                <SelectItem value="deposit">Cọc</SelectItem>
                <SelectItem value="installment">Đợt thanh toán</SelectItem>
                <SelectItem value="final">Đợt cuối (Nghiệm thu)</SelectItem>
                <SelectItem value="extra">Phát sinh</SelectItem>
                <SelectItem value="warranty">Bảo hành</SelectItem>
                <SelectItem value="online_order">Đơn hàng Online</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent></Select><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="paymentMethod" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Hình thức thanh toán</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                <SelectItem value="pos">Quẹt thẻ</SelectItem>
                <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent></Select><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="amount" render={({ field }: { field: any }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Số tiền thu (VNĐ)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input type="number" className="text-lg font-semibold h-12" {...field} />
                    <div className="absolute right-3 top-3 text-muted-foreground text-sm font-medium">
                      {formatVND(field.value || 0)}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }: { field: any }) => (
              <FormItem className="md:col-span-2"><FormLabel>Nội dung thu / Ghi chú</FormLabel><FormControl><Textarea className="h-20" placeholder="Lý do thu tiền..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="md:col-span-2 pt-4">
              <label className="text-sm font-medium mb-2 block">Chứng từ đính kèm ({files.length} file)</label>
              <div className="flex gap-4 items-center">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="h-4 w-4 mr-2" /> Chọn hình ảnh / Hóa đơn
                </Button>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Sau khi tạo, bạn có thể bấm vào biểu tượng &quot;In&quot; bên cạnh phiếu thu để xuất bản in phiếu thu chuẩn Thông tư 200.</p>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.back())} disabled={isPending}>Hủy</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo Phiếu Thu
          </Button>
        </div>
      </form>
    </Form>
  );
}
