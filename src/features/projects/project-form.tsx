"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { projectSchema, type ProjectFormValues } from "@/lib/validations/projects";
import { createProject, updateProject } from "@/actions/projects";
import { getWorkerOptions } from "@/actions/workers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormSection } from "@/components/forms/form-section";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  initialData?: any;
  customers: { id: string; name: string }[];
  users: { id: string; fullName: string, roles: string[] }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ initialData, customers, users, onSuccess, onCancel }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [workerOptions, setWorkerOptions] = useState<{ id: string; code: string; name: string }[]>([]);

  const constructionTeams = users.filter(u => u.roles.includes("construction_team") || u.roles.includes("production_manager") || u.roles.includes("admin"));

  useEffect(() => {
    if (initialData) return; // chỉ cần chọn nhân công khi tạo mới — sửa thì dùng tab Nhân công
    getWorkerOptions().then(setWorkerOptions);
  }, [initialData]);

  const defaultValues: Partial<ProjectFormValues> = initialData
    ? {
        ...initialData,
        progress: Number(initialData.progress),
        expectedCost: Number(initialData.expectedCost),
        estimatedProfit: Number(initialData.estimatedProfit),
        address: initialData.address || "",
        notes: initialData.notes || "",
        managerId: initialData.managerId || "",
        constructionTeamId: initialData.constructionTeamId || "",
        startDate: initialData.startDate || "",
        expectedEndDate: initialData.expectedEndDate || "",
      }
    : {
        name: "",
        customerId: "",
        status: "new",
        progress: 0,
        address: "",
        notes: "",
        managerId: "",
        constructionTeamId: "",
        startDate: "",
        expectedEndDate: "",
        expectedCost: 0,
        estimatedProfit: 0,
        workerIds: [],
      };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues,
  });

  const onSubmit = (values: ProjectFormValues) => {
    startTransition(async () => {
      try {
        if (initialData) {
          await updateProject(initialData.id, values);
          toast.success("Đã cập nhật công trình");
          router.push(`/projects/${initialData.id}`);
        } else {
          const created = await createProject(values);
          toast.success("Đã tạo công trình thành công");
          router.refresh();
          if (onSuccess) {
            onSuccess();
          } else {
            router.push(`/projects/${created.id}`);
          }
        }
      } catch (error: any) {
        toast.error("Lỗi cập nhật", { description: error.message });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Thông tin chung" description="Thông tin cơ bản về công trình.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }: { field: any }) => (
              <FormItem className="sm:col-span-2"><FormLabel>Tên công trình</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="customerId" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Khách hàng</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Chọn" /></SelectTrigger></FormControl><SelectContent>{customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Trạng thái</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                <SelectItem value="new">Mới tạo</SelectItem>
                <SelectItem value="design">Thiết kế</SelectItem>
                <SelectItem value="design_review">Chờ duyệt thiết kế</SelectItem>
                <SelectItem value="production">Sản xuất</SelectItem>
                <SelectItem value="waiting_materials">Chờ vật tư</SelectItem>
                <SelectItem value="in_progress">Đang thi công</SelectItem>
                <SelectItem value="paused">Tạm dừng</SelectItem>
                <SelectItem value="waiting_acceptance">Chờ nghiệm thu</SelectItem>
                <SelectItem value="accepted">Nghiệm thu</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="warranty">Bảo hành</SelectItem>
              </SelectContent></Select><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="managerId" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Người phụ trách</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Chọn quản lý" /></SelectTrigger></FormControl><SelectContent><SelectItem value="">Không có</SelectItem>{users.map((c) => (<SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="constructionTeamId" render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Giám sát thi công</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}><FormControl><SelectTrigger><SelectValue placeholder="Chọn tài khoản giám sát" /></SelectTrigger></FormControl><SelectContent><SelectItem value="">Không có</SelectItem>{constructionTeams.map((c) => (<SelectItem key={c.id} value={c.id}>{c.fullName}</SelectItem>))}</SelectContent></Select>
                <p className="text-xs text-muted-foreground">Tài khoản hệ thống được xem công trình này. Danh sách thợ thực tế thêm ở tab &quot;Nhân công&quot; sau khi lưu.</p>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="startDate" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Ngày bắt đầu</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl></FormItem>
            )} />

            <FormField control={form.control} name="expectedEndDate" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Ngày hoàn thành (Dự kiến)</FormLabel><FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl></FormItem>
            )} />

            <FormField control={form.control} name="progress" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Tiến độ (%)</FormLabel><FormControl><Input type="number" min="0" max="100" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }: { field: any }) => (
              <FormItem className="sm:col-span-2"><FormLabel>Địa chỉ thi công</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <FormField control={form.control} name="notes" render={({ field }: { field: any }) => (
              <FormItem className="sm:col-span-2"><FormLabel>Ghi chú</FormLabel><FormControl><Textarea className="h-20" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </FormSection>

        <FormSection title="Dự toán ban đầu" description="Chỉ mang tính kế hoạch — chi phí/lợi nhuận thực tế được tự tính từ phiếu thu, phiếu chi, vật tư và lương thợ, xem ở tab Tổng quan sau khi tạo.">
          <div className="grid gap-4 md:grid-cols-2">
             <FormField control={form.control} name="expectedCost" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Chi phí dự kiến</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="estimatedProfit" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Lợi nhuận dự kiến</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
            )} />
          </div>
        </FormSection>

        {!initialData && (
          <FormSection title="Nhân công tham gia" description="Chọn thợ tham gia công trình ngay khi tạo. Có thể thêm/gỡ thợ và chốt lương sau ở tab Nhân công.">
            <FormField control={form.control} name="workerIds" render={({ field }: { field: any }) => (
              <FormItem>
                {workerOptions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có thợ nào trong hệ thống. Vào trang Nhân công để thêm thợ trước.</p>
                ) : (
                  <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                    {workerOptions.map((w) => {
                      const selected: string[] = field.value || [];
                      const checked = selected.includes(w.id);
                      return (
                        <label key={w.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => {
                              field.onChange(value ? [...selected, w.id] : selected.filter((id) => id !== w.id));
                            }}
                          />
                          <span className="text-sm font-medium">{w.name}</span>
                          <span className="text-xs text-muted-foreground">({w.code})</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )} />
          </FormSection>
        )}

        <div className="flex justify-end gap-4 border-t pt-6">
          <Button type="button" variant="outline" onClick={onCancel || (() => router.back())} disabled={isPending}>Hủy</Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu Công trình
          </Button>
        </div>
      </form>
    </Form>
  );
}
