import { z } from "zod";

export const workerSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  phone: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  roleId: z.string().uuid("Chức vụ không hợp lệ").optional().nullable().or(z.literal("")),
  dailyRate: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type WorkerFormValues = z.infer<typeof workerSchema>;

export const attendanceSchema = z.object({
  date: z.string().min(1, "Vui lòng chọn ngày"),
  status: z.enum(["present", "absent", "half_day"]),
  projectId: z.string().uuid().optional().nullable().or(z.literal("")),
  note: z.string().optional().nullable(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export const advanceSchema = z.object({
  amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  note: z.string().optional().nullable(),
});

export type AdvanceFormValues = z.infer<typeof advanceSchema>;

export const workerPaymentSchema = z.object({
  period: z.string().min(1, "Vui lòng nhập kỳ lương (VD: 2026-06)"),
  projectId: z.string().uuid().optional().nullable().or(z.literal("")),
  paymentType: z.enum(["daily", "lump_sum"]),
  totalDays: z.coerce.number().min(0).default(0),
  dailyRate: z.coerce.number().min(0).default(0),
  totalAmount: z.coerce.number().min(0).default(0),
  advances: z.coerce.number().min(0).default(0),
});

export type WorkerPaymentFormValues = z.infer<typeof workerPaymentSchema>;
