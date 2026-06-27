import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(1, "Tên vật tư là bắt buộc"),
  categoryId: z.string().uuid().optional().nullable().or(z.literal("")),
  supplierId: z.string().uuid().optional().nullable().or(z.literal("")),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc"),
  minStock: z.coerce.number().min(0),
  currentStock: z.coerce.number().min(0),
  unitPrice: z.coerce.number().min(0),
  description: z.string().optional().nullable(),
  status: z.string().min(1),
});

export type MaterialFormValues = z.infer<typeof materialSchema>;

export const materialCategorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  description: z.string().optional().nullable(),
});

export type MaterialCategoryFormValues = z.infer<typeof materialCategorySchema>;

export const stockTicketItemSchema = z.object({
  materialId: z.string().uuid("Vui lòng chọn vật tư"),
  quantity: z.coerce.number().min(1, "Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0),
});

export const stockTicketSchema = z.object({
  type: z.enum(["IN", "OUT"]),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  supplierId: z.string().uuid().optional().nullable().or(z.literal("")),
  projectId: z.string().uuid().optional().nullable().or(z.literal("")),
  delivererName: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(stockTicketItemSchema).min(1, "Phiếu phải có ít nhất 1 vật tư"),
});

export type StockTicketFormValues = z.infer<typeof stockTicketSchema>;
