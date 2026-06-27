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
import { Plus } from "lucide-react";
import { liquidationReportSchema, type LiquidationReportFormValues } from "@/lib/validations/documents";
import { createLiquidationReport } from "@/actions/documents";
import { getProjectOptions } from "@/actions/projects";
import { getContractOptions } from "@/actions/contracts";
import { toast } from "sonner";

export function LiquidationReportDialog() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(liquidationReportSchema),
    defaultValues: { projectId: "", contractId: "", content: "", finalAmount: 0 },
  });

  useEffect(() => {
    if (!open) return;
    getProjectOptions().then(setProjects);
    getContractOptions().then(setContracts);
    form.reset({ projectId: "", contractId: "", content: "", finalAmount: 0 });
  }, [open, form]);

  function handleProjectChange(projectId: string) {
    form.setValue("projectId", projectId);
    const project = projects.find((p) => p.id === projectId);
    if (project?.contractId) form.setValue("contractId", project.contractId);
  }

  async function onSubmit(data: LiquidationReportFormValues) {
    try {
      await createLiquidationReport(data);
      toast.success("Tạo biên bản thanh lý thành công");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> Lập biên bản thanh lý</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lập biên bản thanh lý</DialogTitle>
          <DialogDescription>Sinh biên bản thanh lý hợp đồng/công trình, ký điện tử sau khi tạo.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="projectId" render={({ field }) => (
              <FormItem>
                <FormLabel>Công trình *</FormLabel>
                <Select onValueChange={handleProjectChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn công trình" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="contractId" render={({ field }) => (
              <FormItem>
                <FormLabel>Hợp đồng liên quan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Chọn hợp đồng" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="">-- Không có --</SelectItem>
                    {contracts.map((c) => (<SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="finalAmount" render={({ field }) => (
              <FormItem>
                <FormLabel>Giá trị thanh lý (VNĐ) *</FormLabel>
                <FormControl><Input type="number" min="0" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Nội dung thanh lý</FormLabel>
                <FormControl><Textarea className="h-32" placeholder="Ghi nhận công việc đã hoàn thành, các khoản đối trừ, cam kết bảo hành..." {...field} value={field.value || ""} /></FormControl>
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
