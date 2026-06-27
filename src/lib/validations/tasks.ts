import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  status: z.enum(["new", "in_progress", "waiting", "paused", "completed", "overdue", "cancelled"]).default("new"),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  assignedTo: z.string().uuid("Người phụ trách không hợp lệ"),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
