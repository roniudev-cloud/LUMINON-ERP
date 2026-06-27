import * as z from "zod";

export const receiptSchema = z.object({
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  projectId: z.string().optional().nullable(),
  contractId: z.string().optional().nullable(),
  paymentTermId: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
  type: z.enum([
    "deposit", "installment", "final", "extra", "warranty", "online_order", "other"
  ]).default("deposit"),
  paymentMethod: z.enum(["cash", "bank_transfer", "pos", "e_wallet", "other"]).default("cash"),
  date: z.string().min(1, "Vui lòng chọn ngày thu"),
  submitterName: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  files: z.array(z.string()).optional().default([]), // Base64 files
});

export const paymentSchema = z.object({
  projectId: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  supplierName: z.string().optional().nullable(),
  receiverName: z.string().optional().nullable(),
  category: z.enum([
    "material", "labor", "subcontract", "transport", "utility", 
    "marketing", "office", "tool", "extra", "other"
  ]).default("material"),
  amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
  paymentMethod: z.enum(["cash", "bank_transfer", "pos", "e_wallet", "other"]).default("cash"),
  date: z.string().min(1, "Vui lòng chọn ngày chi"),
  description: z.string().optional().nullable(),
  files: z.array(z.string()).optional().default([]), // Base64 files
});

export type ReceiptFormValues = z.infer<typeof receiptSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
