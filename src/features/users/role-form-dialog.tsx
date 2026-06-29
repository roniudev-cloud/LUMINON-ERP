"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from "lucide-react";
import { roleFormSchema, type RoleFormValues } from "@/lib/validations/users";
import { createRole } from "@/actions/roles";
import { toast } from "sonner";

export function RoleFormDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit(data: RoleFormValues) {
    try {
      await createRole(data);
      toast.success("Tạo vai trò thành công");
      setOpen(false);
      form.reset({ name: "", description: "" });
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Tạo vai trò</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo vai trò mới</DialogTitle>
          <DialogDescription>Sau khi tạo, hãy gán quyền hạn cho vai trò này.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Tên vai trò *</FormLabel>
                <FormControl><Input placeholder="VD: telesales" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : "Tạo vai trò"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
