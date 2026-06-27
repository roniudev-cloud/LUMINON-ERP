import * as z from "zod";

export const quotationItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Vui lòng nhập tên hạng mục"),
  description: z.string().optional(),
  unit: z.string().min(1, "Vui lòng nhập đơn vị"),
  quantity: z.coerce.number().min(0.01, "Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0, "Đơn giá không được âm"),
  amount: z.coerce.number().min(0, "Thành tiền không được âm"),
  sortOrder: z.number().int().default(0),
});

export const quotationSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề báo giá"),
  subtotal: z.coerce.number().min(0, "Tổng tiền hàng không hợp lệ"),
  discount: z.coerce.number().min(0, "Chiết khấu không được âm"),
  discountType: z.enum(["amount", "percent"]).default("amount"),
  vatRate: z.coerce.number().min(0, "VAT không hợp lệ").max(100),
  vatAmount: z.coerce.number().min(0, "Tiền VAT không hợp lệ"),
  otherFees: z.coerce.number().min(0, "Phí khác không được âm"),
  totalAmount: z.coerce.number().min(0, "Tổng thanh toán không hợp lệ"),
  status: z.enum([
    "draft",
    "sent",
    "reviewing",
    "revising",
    "approved",
    "rejected",
    "converted",
    "cancelled",
  ]).default("draft"),
  validUntil: z.string().optional().nullable(),
  notes: z.string().optional(),
  templateId: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, "Vui lòng thêm ít nhất 1 hạng mục báo giá"),
});

export type QuotationFormValues = z.infer<typeof quotationSchema>;
export type QuotationItemValues = z.infer<typeof quotationItemSchema>;
