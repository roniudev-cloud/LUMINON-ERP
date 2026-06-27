import * as z from "zod";

export const contractItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Vui lòng nhập tên hạng mục"),
  description: z.string().optional(),
  unit: z.string().min(1, "Vui lòng nhập đơn vị"),
  quantity: z.coerce.number().min(0.01, "Số lượng phải lớn hơn 0"),
  unitPrice: z.coerce.number().min(0, "Đơn giá không được âm"),
  amount: z.coerce.number().min(0, "Thành tiền không được âm"),
  sortOrder: z.number().int().default(0),
});

export const contractPaymentTermSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Vui lòng nhập tên đợt thanh toán"),
  percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  amount: z.coerce.number().min(0, "Số tiền không được âm"),
  dueDate: z.string().optional().nullable(),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
});

export const contractSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  quotationId: z.string().optional().nullable(),
  title: z.string().min(1, "Vui lòng nhập tên hợp đồng"),
  type: z.string().optional().nullable(),
  constructionAddress: z.string().optional().nullable(),
  subtotal: z.coerce.number().min(0, "Tổng tiền hàng không hợp lệ"),
  discount: z.coerce.number().min(0, "Chiết khấu không được âm"),
  discountType: z.enum(["amount", "percent"]).default("amount"),
  vatRate: z.coerce.number().min(0, "VAT không hợp lệ").max(100),
  vatAmount: z.coerce.number().min(0, "Tiền VAT không hợp lệ"),
  totalAmount: z.coerce.number().min(0, "Tổng thanh toán không hợp lệ"),
  paidAmount: z.coerce.number().min(0).default(0),
  status: z.enum([
    "draft",
    "pending_sign",
    "signed",
    "in_progress",
    "paused",
    "completed",
    "liquidated",
    "cancelled",
  ]).default("draft"),
  signDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  paymentTermsContent: z.string().optional().nullable(),
  executionTerms: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  acceptanceTerms: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  items: z.array(contractItemSchema).min(1, "Vui lòng thêm ít nhất 1 hạng mục"),
  paymentTerms: z.array(contractPaymentTermSchema).optional().default([]),
});

export type ContractFormValues = z.infer<typeof contractSchema>;
export type ContractItemValues = z.infer<typeof contractItemSchema>;
export type ContractPaymentTermValues = z.infer<typeof contractPaymentTermSchema>;
