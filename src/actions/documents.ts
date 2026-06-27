"use server";

import { db } from "@/lib/db";
import { eq, desc, isNull, count, and } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { generateCode, emptyToNull } from "@/lib/utils";
import { acceptanceReports, liquidationReports } from "@db/schema/documents";
import { auditLogs } from "@db/schema/auth";
import type { AcceptanceReportFormValues, LiquidationReportFormValues } from "@/lib/validations/documents";

// ─── Acceptance Reports (Biên bản nghiệm thu) ────────────────────────

export async function getAcceptanceReports() {
  await requireAuth(PERMISSIONS.ACCEPTANCE_REPORTS_VIEW);

  return db.query.acceptanceReports.findMany({
    where: isNull(acceptanceReports.deletedAt),
    with: {
      project: { columns: { id: true, code: true, name: true } },
      createdByUser: { columns: { id: true, fullName: true } },
    },
    orderBy: [desc(acceptanceReports.createdAt)],
  });
}

export async function createAcceptanceReport(data: AcceptanceReportFormValues) {
  const user = await requireAuth(PERMISSIONS.ACCEPTANCE_REPORTS_CREATE);

  const [{ value: currentCount }] = await db.select({ value: count(acceptanceReports.id) }).from(acceptanceReports);
  const code = generateCode("BBNT", currentCount + 1);

  const [report] = await db
    .insert(acceptanceReports)
    .values({
      projectId: data.projectId,
      content: data.content,
      status: "draft",
      code,
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "acceptance_reports",
    entityId: report.id,
    entityType: "acceptance_report",
    newData: report,
  });

  revalidatePath("/acceptance-reports");
  return report;
}

export async function saveAcceptanceSignature(reportId: string, signatureType: "customer" | "company", imageData: string) {
  const user = await requireAuth(PERMISSIONS.ACCEPTANCE_REPORTS_UPDATE);

  const report = await db.query.acceptanceReports.findFirst({ where: eq(acceptanceReports.id, reportId) });
  if (!report) throw new Error("Không tìm thấy biên bản nghiệm thu");

  const updateData =
    signatureType === "customer"
      ? { customerSignature: imageData }
      : { companySignature: imageData };

  const nextHasCustomer = signatureType === "customer" ? true : !!report.customerSignature;
  const nextHasCompany = signatureType === "company" ? true : !!report.companySignature;
  const fullySigned = nextHasCustomer && nextHasCompany;

  const [updated] = await db
    .update(acceptanceReports)
    .set({
      ...updateData,
      ...(fullySigned ? { status: "signed", signedAt: new Date() } : {}),
    })
    .where(eq(acceptanceReports.id, reportId))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "SIGN",
    module: "acceptance_reports",
    entityId: reportId,
    entityType: "acceptance_report",
    newData: { signatureType },
  });

  revalidatePath("/acceptance-reports");
  return updated;
}

export async function deleteAcceptanceReport(id: string) {
  const user = await requireAuth(PERMISSIONS.ACCEPTANCE_REPORTS_DELETE);

  await db.update(acceptanceReports).set({ deletedAt: new Date() }).where(eq(acceptanceReports.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "acceptance_reports",
    entityId: id,
    entityType: "acceptance_report",
  });

  revalidatePath("/acceptance-reports");
  return { success: true };
}

// ─── Liquidation Reports (Biên bản thanh lý) ─────────────────────────

export async function getLiquidationReports() {
  await requireAuth(PERMISSIONS.LIQUIDATION_REPORTS_VIEW);

  return db.query.liquidationReports.findMany({
    where: isNull(liquidationReports.deletedAt),
    with: {
      project: { columns: { id: true, code: true, name: true } },
      contract: { columns: { id: true, code: true } },
      createdByUser: { columns: { id: true, fullName: true } },
    },
    orderBy: [desc(liquidationReports.createdAt)],
  });
}

export async function createLiquidationReport(data: LiquidationReportFormValues) {
  const user = await requireAuth(PERMISSIONS.LIQUIDATION_REPORTS_CREATE);

  const [{ value: currentCount }] = await db.select({ value: count(liquidationReports.id) }).from(liquidationReports);
  const code = generateCode("BBTL", currentCount + 1);

  const [report] = await db
    .insert(liquidationReports)
    .values({
      projectId: data.projectId,
      contractId: emptyToNull(data.contractId),
      content: data.content,
      finalAmount: String(data.finalAmount),
      status: "draft",
      code,
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "liquidation_reports",
    entityId: report.id,
    entityType: "liquidation_report",
    newData: report,
  });

  revalidatePath("/liquidation-reports");
  return report;
}

export async function signLiquidationReport(reportId: string) {
  const user = await requireAuth(PERMISSIONS.LIQUIDATION_REPORTS_UPDATE);

  const [updated] = await db
    .update(liquidationReports)
    .set({ status: "signed", signedAt: new Date() })
    .where(eq(liquidationReports.id, reportId))
    .returning();

  if (!updated) throw new Error("Không tìm thấy biên bản thanh lý");

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "SIGN",
    module: "liquidation_reports",
    entityId: reportId,
    entityType: "liquidation_report",
  });

  revalidatePath("/liquidation-reports");
  return updated;
}

export async function deleteLiquidationReport(id: string) {
  const user = await requireAuth(PERMISSIONS.LIQUIDATION_REPORTS_DELETE);

  await db.update(liquidationReports).set({ deletedAt: new Date() }).where(eq(liquidationReports.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "liquidation_reports",
    entityId: id,
    entityType: "liquidation_report",
  });

  revalidatePath("/liquidation-reports");
  return { success: true };
}
