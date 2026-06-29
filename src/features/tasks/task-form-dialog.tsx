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
import { taskSchema, type TaskFormValues } from "@/lib/validations/tasks";
import { createTask, updateTask } from "@/actions/tasks";
import { toast } from "sonner";
import { DatePicker } from "@/components/forms/date-picker";
import { FormSection } from "@/components/forms/form-section";
import { getCustomerLookups } from "@/actions/customers"; // Reusing for users list

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: any | null;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  const [users, setUsers] = useState<any[]>([]);
  const isEditing = !!task;

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "normal",
      status: "new",
      progress: 0,
      assignedTo: "",
      startDate: null,
      dueDate: null,
    },
  });

  useEffect(() => {
    async function loadLookups() {
      const { assignees } = await getCustomerLookups();
      setUsers(assignees);
    }
    if (open) loadLookups();
  }, [open]);

  useEffect(() => {
    if (open && task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        progress: task.progress,
        assignedTo: task.assignedTo,
        startDate: task.startDate,
        dueDate: task.dueDate,
      });
    } else if (open && !task) {
      form.reset({
        title: "",
        description: "",
        priority: "normal",
        status: "new",
        progress: 0,
        assignedTo: "",
        startDate: null,
        dueDate: null,
      });
    }
  }, [open, task, form]);

  async function onSubmit(data: TaskFormValues) {
    try {
      if (isEditing) {
        await updateTask(task.id, data);
        toast.success("Cập nhật công việc thành công");
      } else {
        await createTask(data);
        toast.success("Tạo công việc thành công");
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
          <DialogTitle>{isEditing ? "Cập nhật công việc" : "Thêm công việc mới"}</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin công việc và giao cho người phụ trách.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Thông tin cơ bản" description="Tiêu đề và nội dung công việc.">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả chi tiết</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Nhập mô tả..." className="min-h-[100px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Phân công & Trạng thái" description="Người thực hiện, tiến độ.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người phụ trách *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn người phụ trách" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.fullName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mức độ ưu tiên</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Chọn ưu tiên" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Thấp</SelectItem>
                          <SelectItem value="normal">Bình thường</SelectItem>
                          <SelectItem value="high">Cao</SelectItem>
                          <SelectItem value="urgent">Khẩn cấp</SelectItem>
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
                          <SelectItem value="new">Mới</SelectItem>
                          <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                          <SelectItem value="waiting">Đang chờ</SelectItem>
                          <SelectItem value="paused">Tạm dừng</SelectItem>
                          <SelectItem value="completed">Hoàn thành</SelectItem>
                          <SelectItem value="overdue">Quá hạn</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiến độ (%)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            <FormSection title="Thời gian" description="Thời gian bắt đầu và kết thúc dự kiến.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày bắt đầu</FormLabel>
                      <FormControl>
                        <DatePicker date={field.value ? new Date(field.value) : undefined} setDate={(date) => field.onChange(date?.toISOString())} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày kết thúc dự kiến (Due Date)</FormLabel>
                      <FormControl>
                        <DatePicker date={field.value ? new Date(field.value) : undefined} setDate={(date) => field.onChange(date?.toISOString())} />
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
                {form.formState.isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo công việc"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
