"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormValues } from "@/lib/validations/crm";
import { createLead, updateLead } from "@/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any | null;
  sources: { id: string; name: string }[];
  assignees: { id: string; fullName: string }[];
}

export function LeadFormDialog({
  open,
  onOpenChange,
  initialData,
  sources,
  assignees,
}: LeadFormDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData || {
      name: "",
      phone: "",
      email: "",
      sourceId: "",
      description: "",
      status: "new",
      assignedToId: "",
    },
  });

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      form.reset(
        initialData || {
          name: "",
          phone: "",
          email: "",
          sourceId: "",
          description: "",
          status: "new",
          assignedToId: "",
        }
      );
    }
  }, [open, initialData, form]);

  const onSubmit = async (data: LeadFormValues) => {
    try {
      setLoading(true);
      if (initialData?.id) {
        await updateLead(initialData.id, data);
        toast.success("Cập nhật lead thành công");
      } else {
        await createLead(data);
        toast.success("Tạo lead thành công");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Có lỗi xảy ra", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Cập nhật Lead" : "Thêm mới Lead"}
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin chi tiết của lead để đội sale chăm sóc.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Họ tên / Đơn vị <span className="text-destructive">*</span>
            </Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceId">Nguồn</Label>
              <Select
                value={form.watch("sourceId") || ""}
                onValueChange={(val) => form.setValue("sourceId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Bỏ qua --</SelectItem>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={form.watch("status") || "new"}
                onValueChange={(val) => form.setValue("status", val)}
                disabled={initialData?.status === "converted"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="contacted">Đã liên hệ</SelectItem>
                  <SelectItem value="qualified">Đủ điều kiện</SelectItem>
                  <SelectItem value="lost">Đã mất</SelectItem>
                  {initialData?.status === "converted" && (
                    <SelectItem value="converted">Đã chuyển đổi</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedToId">Người phụ trách</Label>
            <Select
              value={form.watch("assignedToId") || ""}
              onValueChange={(val) => form.setValue("assignedToId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tự động gán (Tôi)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">-- Tự động gán (Tôi) --</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Ghi chú thêm</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Lưu" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
