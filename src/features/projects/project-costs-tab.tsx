"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Trash2 } from "lucide-react";
import { projectCostSchema, type ProjectCostFormValues } from "@/lib/validations/projects";
import { createProjectCost, deleteProjectCost } from "@/actions/projects";
import { formatVND, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  material: "Vật tư",
  labor: "Nhân công",
  subcontract: "Thầu phụ",
  transport: "Vận chuyển",
  other: "Khác",
};

interface ProjectCostsTabProps {
  projectId: string;
  costs: any[];
  suppliers: { id: string; name: string }[];
}

export function ProjectCostsTab({ projectId, costs, suppliers }: ProjectCostsTabProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm({
    resolver: zodResolver(projectCostSchema),
    defaultValues: {
      projectId,
      category: "other" as const,
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      supplierId: "",
    },
  });

  async function onSubmit(data: ProjectCostFormValues) {
    try {
      await createProjectCost(data);
      toast.success("Đã thêm chi phí");
      form.reset({ projectId, category: "other", description: "", amount: 0, date: new Date().toISOString().split("T")[0], supplierId: "" });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProjectCost(deleteTarget.id, projectId);
      toast.success("Đã xóa chi phí");
      setDeleteTarget(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  }

  const total = costs.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-2 border rounded-lg p-3 bg-muted/30">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem><FormControl><Input type="date" className="w-36" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="w-36"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([v, l]) => (<SelectItem key={v} value={v}>{l}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem className="flex-1 min-w-[180px]"><FormControl><Input placeholder="Nội dung chi phí..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="supplierId" render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl><SelectTrigger className="w-40"><SelectValue placeholder="Nhà cung cấp" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="">-- Không có --</SelectItem>
                  {suppliers.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="amount" render={({ field }) => (
            <FormItem><FormControl><Input type="number" min="0" placeholder="Số tiền" className="w-32" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Plus className="mr-2 h-4 w-4" /> Thêm
          </Button>
        </form>
      </Form>

      {costs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Chưa có chi phí nào được ghi nhận cho công trình này.</p>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {costs.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{formatDate(c.date)}</TableCell>
                  <TableCell>{CATEGORY_LABELS[c.category] || c.category}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell className="text-right font-medium">{formatVND(c.amount)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end p-3 border-t text-sm font-semibold">
            Tổng chi phí khác đã ghi nhận: <span className="ml-2 text-base">{formatVND(total)}</span>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Xóa chi phí"
        description={`Xóa khoản chi "${deleteTarget?.description}"?`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </div>
  );
}
