import * as z from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên công trình"),
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  contractId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  managerId: z.string().optional().nullable(),
  constructionTeamId: z.string().optional().nullable(),
  status: z.enum([
    "new", "design", "design_review", "production", "waiting_materials", 
    "in_progress", "paused", "waiting_acceptance", "accepted", "completed", 
    "paid", "warranty", "cancelled"
  ]).default("new"),
  progress: z.coerce.number().min(0).max(100).default(0),
  startDate: z.string().optional().nullable(),
  expectedEndDate: z.string().optional().nullable(),
  expectedCost: z.coerce.number().min(0).optional().default(0),
  actualCost: z.coerce.number().min(0).optional().default(0),
  estimatedProfit: z.coerce.number().optional().default(0),
  notes: z.string().optional().nullable(),
  workerIds: z.array(z.string().uuid()).optional().default([]),
});

export const projectLogSchema = z.object({
  projectId: z.string().min(1),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  phase: z.enum([
    "pre_construction", "in_progress", "post_construction", "materials", 
    "issues", "acceptance", "warranty"
  ]).default("in_progress"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  content: z.string().min(1, "Vui lòng nhập nội dung"),
  issues: z.string().optional().nullable(),
  proposal: z.string().optional().nullable(),
  status: z.enum(["open", "in_progress", "resolved"]).default("resolved"),
  weather: z.string().optional().nullable(),
  images: z.array(z.string()).optional().default([]), // Base64 or URLs
});

export const projectTaskSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, "Vui lòng nhập tên công việc"),
  description: z.string().optional().nullable(),
  assignedToId: z.string().optional().nullable(),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  status: z.enum(["new", "in_progress", "waiting_feedback", "paused", "completed", "overdue", "cancelled"]).default("new"),
  progress: z.coerce.number().min(0).max(100).default(0),
  startDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const projectCostSchema = z.object({
  projectId: z.string().min(1),
  category: z.enum(["material", "labor", "subcontract", "transport", "other"]).default("other"),
  description: z.string().min(1, "Vui lòng nhập nội dung chi phí"),
  amount: z.coerce.number().min(1, "Số tiền phải lớn hơn 0"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  supplierId: z.string().uuid().optional().nullable().or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
export type ProjectLogFormValues = z.infer<typeof projectLogSchema>;
export type ProjectTaskFormValues = z.infer<typeof projectTaskSchema>;
export type ProjectCostFormValues = z.infer<typeof projectCostSchema>;
