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
import { Checkbox } from "@/components/ui/checkbox";
import { workerSchema, type WorkerFormValues } from "@/lib/validations/workers";
import { createWorker, updateWorker, getWorkerRoles } from "@/actions/workers";
import { toast } from "sonner";
import { FormSection } from "@/components/forms/form-section";

interface WorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker?: any | null;
}

export function WorkerDialog({ open, onOpenChange, worker }: WorkerDialogProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const isEditing = !!worker;

  const form = useForm({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      name: "",
      phone: "",
      idNumber: "",
      roleId: "",
      dailyRate: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    async function loadRoles() {
      const data = await getWorkerRoles();
      setRoles(data);
    }
    if (open) loadRoles();
  }, [open]);

  useEffect(() => {
    if (open && worker) {
      form.reset({
        name: worker.name,
        phone: worker.phone || "",
        idNumber: worker.idNumber || "",
        roleId: worker.roleId || "",
        dailyRate: Number(worker.dailyRate) || 0,
        isActive: worker.isActive,
      });
    } else if (open && !worker) {
      form.reset({
        name: "",
        phone: "",
        idNumber: "",
        roleId: "",
        dailyRate: 0,
        isActive: true,
      });
    }
  }, [open, worker, form]);

  async function onSubmit(data: WorkerFormValues) {
    try {
      if (isEditing) {
        await updateWorker(worker.id, data);
        toast.success("Cập nhật nhân công thành công");
      } else {
        await createWorker(data);
        toast.success("Thêm nhân công thành công");
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
          <DialogTitle>{isEditing ? "Cập nhật nhân công" : "Thêm nhân công mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin liên hệ và chuyên môn của nhân công.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Thông tin cơ bản" description="Tên và liên hệ.">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên nhân công..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập SĐT..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CCCD / CMND</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập CCCD..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection title="Công việc & Lương" description="Chuyên môn và đơn giá ngày công.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chuyên môn</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn chuyên môn" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dailyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn giá ngày (VNĐ)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm mt-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Đang làm việc</FormLabel>
                      <DialogDescription>Nhân công này đang có thể phân bổ dự án.</DialogDescription>
                    </div>
                  </FormItem>
                )}
              />
            </FormSection>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm nhân công"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
