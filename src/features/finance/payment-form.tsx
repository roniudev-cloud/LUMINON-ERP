"use client";

import { useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { paymentSchema, type PaymentFormValues } from "@/lib/validations/finance";
import { createPayment } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/forms/form-section";
import { toast } from "sonner";
import { Loader2, UploadCloud } from "lucide-react";
import { formatVND } from "@/lib/utils";

interface PaymentFormProps {
  projects: { id: string; name: string, code: string }[];
  suppliers?: { id: string; name: string; code: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ projects, suppliers = [], onSuccess, onCancel }: PaymentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultValues: Partial<PaymentFormValues> = {
    date: "",
    amount: 0,
    category: "material",
    paymentMethod: "bank_transfer",
    files: [],
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues,
  });

  const files = form.watch("files") || [];

  useEffect(() => {
    if (!form.getValues("date")) {
      form.setValue("date", new Date().toISOString().split("T")[0]);
    }
  }, [form]);

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

  const onSubmit = (values: PaymentFormValues) => {
    startTransition(async () => {
      try {
        await createPayment(values);
        toast.success("Đã tạo phiếu chi thành công");
        router.refresh();
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/payments");
        }
      } catch (error: any) {
        toast.error("Lỗi tạo phiếu chi", { description: error.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Thông tin chung" description="Nhập thông tin người nhận và tham chiếu công trình.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="date" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Ngày chi</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="receiverName" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Người nhận (Tên / Công ty)</FormLabel><FormControl><Input placeholder="Tên người nhận tiền" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="supplierId" render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Nhà cung cấp (nếu có)</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    const picked = suppliers.find((s) => s.id === val);
                    form.setValue("supplierName", picked?.name || "");
                  }}
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp (để theo dõi công nợ)" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Không có</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>[{s.code}] {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="projectId" render={({ field }: { field: any }) => (
              <FormItem className="sm:col-span-2"><FormLabel>Công trình tham chiếu (Sẽ cộng vào chi phí thực tế)</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Chọn công trình (Không bắt buộc)" /></SelectTrigger></FormControl><SelectContent><SelectItem value="">Không có</SelectItem>{projects.map((c) => (<SelectItem key={c.id} value={c.id}>[{c.code}] {c.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
            )} />
          </div>
        </FormSection>

        <FormSection title="Chi tiết khoản chi" description="Nhập số tiền và hạng mục chi phí.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="category" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Hạng mục chi phí</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                <SelectItem value="material">Vật tư</SelectItem>
                <SelectItem value="labor">Nhân công</SelectItem>
                <SelectItem value="subcontract">Thuê ngoài (Thầu phụ)</SelectItem>
                <SelectItem value="transport">Vận chuyển</SelectItem>
                <SelectItem value="utility">Điện nước / Sinh hoạt</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="office">Văn phòng</SelectItem>
                <SelectItem value="tool">Công cụ / Dụng cụ</SelectItem>
                <SelectItem value="extra">Phát sinh</SelectItem>
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
              <FormItem className="sm:col-span-2">
                <FormLabel>Số tiền chi (VNĐ)</FormLabel>
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
              <FormItem className="sm:col-span-2"><FormLabel>Nội dung chi / Lý do</FormLabel><FormControl><Textarea className="h-20" placeholder="Lý do chi tiền..." {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="sm:col-span-2 pt-4">
              <label className="text-sm font-medium mb-2 block">Chứng từ đính kèm ({files.length} file)</label>
              <div className="flex gap-4 items-center">
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <UploadCloud className="h-4 w-4 mr-2" /> Chọn hóa đơn / Ủy nhiệm chi
                </Button>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Đính kèm hóa đơn mua vật tư hoặc biên nhận.</p>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.back())} disabled={isPending}>Hủy</Button>
          <Button type="submit" variant="destructive" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo Phiếu Chi
          </Button>
        </div>
      </form>
    </Form>
  );
}
