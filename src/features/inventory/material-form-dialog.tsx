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
import { materialSchema, type MaterialFormValues } from "@/lib/validations/inventory";
import { createMaterial, updateMaterial, getMaterialCategories } from "@/actions/inventory";
import { getSupplierOptions } from "@/actions/suppliers";
import { toast } from "sonner";
import { FormSection } from "@/components/forms/form-section";
import { UNITS } from "@/lib/constants";

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: any | null;
}

const DEFAULT_VALUES: MaterialFormValues = {
  name: "",
  categoryId: "",
  supplierId: "",
  unit: "cái",
  minStock: 0,
  currentStock: 0,
  unitPrice: 0,
  description: "",
  status: "active",
};

export function MaterialDialog({ open, onOpenChange, material }: MaterialDialogProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const isEditing = !!material;

  const form = useForm({
    resolver: zodResolver(materialSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    getMaterialCategories().then(setCategories);
    getSupplierOptions().then(setSuppliers);
  }, [open]);

  useEffect(() => {
    if (open && material) {
      form.reset({
        name: material.name,
        categoryId: material.categoryId || "",
        supplierId: material.supplierId || "",
        unit: material.unit,
        minStock: Number(material.minStock) || 0,
        currentStock: Number(material.currentStock) || 0,
        unitPrice: Number(material.unitPrice) || 0,
        description: material.description || "",
        status: material.status || "active",
      });
    } else if (open && !material) {
      form.reset(DEFAULT_VALUES);
    }
  }, [open, material, form]);

  async function onSubmit(data: MaterialFormValues) {
    try {
      if (isEditing) {
        await updateMaterial(material.id, data);
        toast.success("Cập nhật vật tư thành công");
      } else {
        await createMaterial(data);
        toast.success("Thêm vật tư thành công");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Cập nhật vật tư" : "Thêm vật tư mới"}</DialogTitle>
          <DialogDescription>Thông tin danh mục, đơn vị tính và tồn kho tối thiểu.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormSection title="Thông tin vật tư" description="Tên, danh mục, nhà cung cấp mặc định.">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Tên vật tư *</FormLabel><FormControl><Input placeholder="VD: Tấm Alu 1.2mm" {...field} /></FormControl><FormMessage /></FormItem>
              )} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">-- Không xác định --</SelectItem>
                        {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="supplierId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà cung cấp mặc định</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Chọn nhà cung cấp" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="">-- Không xác định --</SelectItem>
                        {suppliers.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn vị tính *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {UNITS.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="minStock" render={({ field }) => (
                  <FormItem><FormLabel>Tồn tối thiểu</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="unitPrice" render={({ field }) => (
                  <FormItem><FormLabel>Đơn giá (VNĐ)</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {!isEditing && (
                <FormField control={form.control} name="currentStock" render={({ field }) => (
                  <FormItem><FormLabel>Tồn kho ban đầu</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )}

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Mô tả</FormLabel><FormControl><Textarea className="h-20" {...field} value={field.value || ""} /></FormControl><FormMessage /></FormItem>
              )} />
            </FormSection>

            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm vật tư"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
