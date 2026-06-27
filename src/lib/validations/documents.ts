import { z } from "zod";

export const acceptanceReportSchema = z.object({
  projectId: z.string().uuid("Vui lòng chọn công trình"),
  content: z.string().optional().nullable(),
});

export type AcceptanceReportFormValues = z.infer<typeof acceptanceReportSchema>;

export const liquidationReportSchema = z.object({
  projectId: z.string().uuid("Vui lòng chọn công trình"),
  contractId: z.string().uuid().optional().nullable().or(z.literal("")),
  content: z.string().optional().nullable(),
  finalAmount: z.coerce.number().min(0),
});

export type LiquidationReportFormValues = z.infer<typeof liquidationReportSchema>;
