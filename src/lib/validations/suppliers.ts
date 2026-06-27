import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Tên nhà cung cấp là bắt buộc"),
  category: z.string().min(1, "Vui lòng chọn nhóm nhà cung cấp"),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")).nullable(),
  address: z.string().optional().nullable(),
  taxCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().min(1),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
