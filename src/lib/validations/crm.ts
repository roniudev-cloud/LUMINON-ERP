import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Tên khách hàng là bắt buộc"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  zalo: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  taxCode: z.string().optional(),
  contactPerson: z.string().optional(),
  sourceId: z.string().uuid("Nguồn khách hàng không hợp lệ").optional().nullable().or(z.literal("")),
  statusId: z.string().uuid("Trạng thái không hợp lệ").optional().nullable().or(z.literal("")),
  assignedToId: z.string().uuid("Người phụ trách không hợp lệ").optional().nullable().or(z.literal("")),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

export const leadSchema = z.object({
  name: z.string().min(1, "Tên lead là bắt buộc"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").optional().or(z.literal("")),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  sourceId: z.string().uuid("Nguồn không hợp lệ").optional().nullable().or(z.literal("")),
  description: z.string().optional(),
  status: z.string(),
  assignedToId: z.string().uuid("Người phụ trách không hợp lệ").optional().nullable().or(z.literal("")),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

export const noteSchema = z.object({
  content: z.string().min(1, "Nội dung ghi chú là bắt buộc"),
});

export type NoteFormValues = z.infer<typeof noteSchema>;
