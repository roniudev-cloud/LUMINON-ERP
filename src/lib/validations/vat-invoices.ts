import { z } from "zod";

export const vatInvoiceSchema = z.object({
  code: z.string().min(1, "Số hóa đơn là bắt buộc"),
  type: z.enum(["outbound", "inbound"]).default("outbound"),
  customerId: z.string().uuid("Khách hàng không hợp lệ").optional().nullable().or(z.literal("")),
  supplierId: z.string().optional().nullable(),
  amount: z.coerce.number().min(1, "Giá trị trước thuế phải lớn hơn 0"),
  vatRate: z.coerce.number().min(0).max(100).default(10),
  vatAmount: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  issueDate: z.string().min(1, "Vui lòng chọn ngày xuất hóa đơn"),
  status: z.enum(["draft", "issued", "cancelled"]).default("draft"),
});

export type VatInvoiceFormValues = z.infer<typeof vatInvoiceSchema>;
