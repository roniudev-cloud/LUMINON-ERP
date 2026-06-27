"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, type CustomerFormValues } from "@/lib/validations/crm";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { FormSection } from "@/components/forms/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface CustomerFormProps {
  initialData?: any;
  sources: { id: string; name: string }[];
  statuses: { id: string; name: string }[];
  assignees: { id: string; fullName: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomerForm({
  initialData,
  sources,
  statuses,
  assignees,
  onSuccess,
  onCancel,
}: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      name: "",
      phone: "",
      email: "",
      zalo: "",
      facebook: "",
      website: "",
      address: "",
      city: "",
      district: "",
      ward: "",
      taxCode: "",
      contactPerson: "",
      sourceId: "",
      statusId: statuses[0]?.id || "",
      assignedToId: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await updateCustomer(initialData.id, data);
        toast.success("Cập nhật khách hàng thành công");
      } else {
        await createCustomer(data);
        toast.success("Tạo khách hàng thành công");
      }
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/customers");
      }
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description: error.message,
      });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
      <div className="bg-card border rounded-lg p-6">
        <FormSection
          title="Thông tin cơ bản"
          description="Thông tin liên lạc chính của khách hàng."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">
                Tên khách hàng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Công ty TNHH ABC"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="0912345678"
                {...form.register("phone")}
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactPerson">Người liên hệ (nếu có)</Label>
              <Input
                id="contactPerson"
                placeholder="Tên người đại diện..."
                {...form.register("contactPerson")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zalo">Zalo</Label>
              <Input
                id="zalo"
                placeholder="Số điện thoại hoặc link Zalo..."
                {...form.register("zalo")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                placeholder="Link trang Facebook..."
                {...form.register("facebook")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://..."
                {...form.register("website")}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Thông tin bổ sung"
          description="Địa chỉ, mã số thuế và các thông tin khác."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                placeholder="Số nhà, tên đường..."
                {...form.register("address")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Tỉnh / Thành phố</Label>
              <Input
                id="city"
                placeholder="Hà Nội"
                {...form.register("city")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận / Huyện</Label>
              <Input
                id="district"
                placeholder="Cầu Giấy"
                {...form.register("district")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">Phường / Xã</Label>
              <Input
                id="ward"
                placeholder="Dịch Vọng"
                {...form.register("ward")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxCode">Mã số thuế</Label>
              <Input
                id="taxCode"
                placeholder="0101234567"
                {...form.register("taxCode")}
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Quản lý"
          description="Phân loại và phân công người phụ trách."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="statusId">Trạng thái</Label>
              <Select
                value={form.watch("statusId") || ""}
                onValueChange={(val) => form.setValue("statusId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceId">Nguồn khách hàng</Label>
              <Select
                value={form.watch("sourceId") || ""}
                onValueChange={(val) => form.setValue("sourceId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Không xác định --</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedToId">Người phụ trách</Label>
              <Select
                value={form.watch("assignedToId") || ""}
                onValueChange={(val) => form.setValue("assignedToId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Tự động gán (Tôi) --</SelectItem>
                  {assignees.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Ghi chú thêm về khách hàng này..."
                className="min-h-[100px]"
                {...form.register("notes")}
              />
            </div>
          </div>
        </FormSection>
      </div>

      <div className="flex justify-end gap-4 py-4">
        {onCancel ? (
          <Button variant="outline" type="button" onClick={onCancel}>
            Hủy
          </Button>
        ) : (
          <Button variant="outline" type="button" asChild>
            <Link href="/customers">Hủy</Link>
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Lưu thay đổi" : "Tạo khách hàng"}
        </Button>
      </div>
    </form>
  );
}
