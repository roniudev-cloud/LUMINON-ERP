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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Plus } from "lucide-react";
import { acceptanceReportSchema, type AcceptanceReportFormValues } from "@/lib/validations/documents";
import { createAcceptanceReport } from "@/actions/documents";
import { getProjectOptions } from "@/actions/projects";
import { toast } from "sonner";

export function AcceptanceReportDialog() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(acceptanceReportSchema),
    defaultValues: { projectId: "", content: "" },
  });

  useEffect(() => {
    if (!open) return;
    getProjectOptions().then(setProjects);
    form.reset({ projectId: "", content: "" });
  }, [open, form]);

  async function onSubmit(data: AcceptanceReportFormValues) {
    try {
      await createAcceptanceReport(data);
      toast.success("Tạo biên bản nghiệm thu thành công");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Lập biên bản nghiệm thu</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lập biên bản nghiệm thu</DialogTitle>
          <DialogDescription>Sinh biên bản nghiệm thu từ công trình, ký điện tử sau khi tạo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="projectId" render={({ field }) => (
              <FormItem>
                <FormLabel>Công trình *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn công trình" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung nghiệm thu</FormLabel>
                <FormControl><Textarea className="h-32" placeholder="Mô tả khối lượng/chất lượng công việc đã hoàn thành..." {...field} value={field.value || ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : "Tạo biên bản"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
