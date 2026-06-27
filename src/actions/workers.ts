"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { eq, desc, ilike, or, and, count, sql, isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { workers, workerRoles, workerAttendances, workerAdvances, workerPayments } from "@db/schema/workers";
import { projectWorkers } from "@db/schema/projects";
import { auditLogs } from "@db/schema/auth";
import { emptyToNull } from "@/lib/utils";
import type { AttendanceFormValues, AdvanceFormValues, WorkerPaymentFormValues } from "@/lib/validations/workers";

export async function getWorkerOptions() {
  await requireAuth();
  return db.query.workers.findMany({
    where: and(eq(workers.isActive, true), isNull(workers.deletedAt)),
    columns: { id: true, code: true, name: true },
    orderBy: (w, { asc }) => [asc(w.name)],
  });
}

export async function getWorkers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}) {
  const user = await requireAuth();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions: any[] = [isNull(workers.deletedAt)];

  if (user.companyId) {
    conditions.push(eq(workers.companyId, user.companyId));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(workers.name, `%${params.search}%`),
        ilike(workers.code, `%${params.search}%`),
        ilike(workers.phone, `%${params.search}%`)
      )
    );
  }

  if (params.roleId) {
    conditions.push(eq(workers.roleId, params.roleId));
  }

  if (params.isActive !== undefined) {
    conditions.push(eq(workers.isActive, params.isActive));
  }

  const where = and(...conditions);

  const [{ value: totalCount }] = await db
    .select({ value: count(workers.id) })
    .from(workers)
    .where(where);

  const data = await db.query.workers.findMany({
    where,
    with: {
      role: true,
    },
    orderBy: [desc(workers.createdAt)],
    limit: pageSize,
    offset,
  });

  return {
    data,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export const getWorker = cache(async function getWorker(id: string) {
  const user = await requireAuth();

  const conditions = [eq(workers.id, id), isNull(workers.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(workers.companyId, user.companyId));
  }

  const worker = await db.query.workers.findFirst({
    where: and(...conditions),
    with: {
      role: true,
      attendances: {
        with: { project: { columns: { id: true, code: true, name: true } } },
        orderBy: (att, { desc }) => [desc(att.date)],
        limit: 60,
      },
      advances: {
        orderBy: (adv, { desc }) => [desc(adv.date)],
        limit: 60,
      },
      payments: {
        with: { project: { columns: { id: true, code: true, name: true } } },
        orderBy: (pay, { desc }) => [desc(pay.period)],
        limit: 60,
      },
      projectAssignments: {
        with: { project: { columns: { id: true, code: true, name: true, status: true } } },
      },
    },
  });

  if (!worker) throw new Error("Worker not found");

  return worker;
});

export async function createWorker(data: any) {
  const user = await requireAuth();

  const [{ count: currentCount }] = await db
    .select({ count: count(workers.id) })
    .from(workers);
  const code = `NC${String(currentCount + 1).padStart(4, "0")}`;

  const [worker] = await db
    .insert(workers)
    .values({
      companyId: user.companyId,
      code,
      name: data.name,
      phone: data.phone,
      idNumber: data.idNumber,
      roleId: emptyToNull(data.roleId),
      dailyRate: data.dailyRate?.toString() || "0",
      isActive: data.isActive ?? true,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "workers",
    entityId: worker.id,
    entityType: "worker",
    newData: worker,
  });

  revalidatePath("/workers");
  return worker;
}

export async function updateWorker(id: string, data: any) {
  const user = await requireAuth();

  const conditions = [eq(workers.id, id), isNull(workers.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(workers.companyId, user.companyId));
  }

  const existing = await db.query.workers.findFirst({
    where: and(...conditions),
  });

  if (!existing) throw new Error("Worker not found");

  const [updated] = await db
    .update(workers)
    .set({
      name: data.name,
      phone: data.phone,
      idNumber: data.idNumber,
      roleId: emptyToNull(data.roleId),
      dailyRate: data.dailyRate?.toString(),
      isActive: data.isActive,
      updatedAt: sql`now()`,
    })
    .where(eq(workers.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "workers",
    entityId: id,
    entityType: "worker",
    oldData: existing,
    newData: updated,
  });

  revalidatePath(`/workers/${id}`);
  revalidatePath("/workers");
  return updated;
}

export async function deleteWorker(id: string) {
  const user = await requireAuth();
  
  const conditions = [eq(workers.id, id), isNull(workers.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(workers.companyId, user.companyId));
  }

  const existing = await db.query.workers.findFirst({
    where: and(...conditions),
  });

  if (!existing) throw new Error("Worker not found");

  await db.update(workers).set({ deletedAt: sql`now()` }).where(eq(workers.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "workers",
    entityId: id,
    entityType: "worker",
  });

  revalidatePath("/workers");
  return { success: true };
}

export async function getWorkerRoles() {
  await requireAuth();
  return await db.query.workerRoles.findMany({
    orderBy: (r, { asc }) => [asc(r.name)],
  });
}

// ─── Chấm công (Attendance) ──────────────────────────────────────────

export async function createAttendance(workerId: string, data: AttendanceFormValues) {
  const user = await requireAuth();

  const [attendance] = await db
    .insert(workerAttendances)
    .values({
      workerId,
      date: data.date,
      status: data.status,
      projectId: emptyToNull(data.projectId),
      note: data.note,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "worker_attendances",
    entityId: attendance.id,
    entityType: "worker_attendance",
    newData: attendance,
  });

  revalidatePath(`/workers/${workerId}`);
  return attendance;
}

export async function deleteAttendance(workerId: string, attendanceId: string) {
  const user = await requireAuth();
  await db.update(workerAttendances).set({ deletedAt: sql`now()` }).where(eq(workerAttendances.id, attendanceId));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "worker_attendances",
    entityId: attendanceId,
    entityType: "worker_attendance",
  });

  revalidatePath(`/workers/${workerId}`);
  return { success: true };
}

// ─── Ứng lương (Advances) ────────────────────────────────────────────

export async function createAdvance(workerId: string, data: AdvanceFormValues) {
  const user = await requireAuth();

  const [advance] = await db
    .insert(workerAdvances)
    .values({
      workerId,
      amount: data.amount.toString(),
      date: data.date,
      note: data.note,
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "worker_advances",
    entityId: advance.id,
    entityType: "worker_advance",
    newData: advance,
  });

  revalidatePath(`/workers/${workerId}`);
  return advance;
}

export async function deleteAdvance(workerId: string, advanceId: string) {
  const user = await requireAuth();
  await db.update(workerAdvances).set({ deletedAt: sql`now()` }).where(eq(workerAdvances.id, advanceId));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "worker_advances",
    entityId: advanceId,
    entityType: "worker_advance",
  });

  revalidatePath(`/workers/${workerId}`);
  return { success: true };
}

// ─── Chốt lương (Payments / payroll settlement) ──────────────────────

export async function createWorkerPayment(workerId: string, data: WorkerPaymentFormValues) {
  const user = await requireAuth();

  const totalAmount =
    data.paymentType === "daily" ? data.totalDays * data.dailyRate : data.totalAmount;
  const netAmount = totalAmount - data.advances;

  const [payment] = await db
    .insert(workerPayments)
    .values({
      workerId,
      projectId: emptyToNull(data.projectId),
      period: data.period,
      paymentType: data.paymentType,
      totalDays: data.totalDays.toString(),
      dailyRate: data.dailyRate.toString(),
      totalAmount: totalAmount.toString(),
      advances: data.advances.toString(),
      netAmount: netAmount.toString(),
      status: "pending",
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "worker_payments",
    entityId: payment.id,
    entityType: "worker_payment",
    newData: payment,
  });

  revalidatePath(`/workers/${workerId}`);
  return payment;
}

export async function markWorkerPaymentPaid(workerId: string, paymentId: string) {
  const user = await requireAuth();

  const [updated] = await db
    .update(workerPayments)
    .set({ status: "paid", paidDate: sql`current_date` })
    .where(eq(workerPayments.id, paymentId))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "worker_payments",
    entityId: paymentId,
    entityType: "worker_payment",
    newData: { status: "paid" },
  });

  revalidatePath(`/workers/${workerId}`);
  return updated;
}

// ─── Thợ tham gia công trình (Project assignment) ────────────────────

export async function getProjectWorkers(projectId: string) {
  await requireAuth();
  return db.query.projectWorkers.findMany({
    where: and(eq(projectWorkers.projectId, projectId), isNull(projectWorkers.deletedAt)),
    with: { worker: { with: { role: true } } },
  });
}

/** Lương đã chốt cho từng thợ trên 1 công trình cụ thể — để hiển thị ngay trong tab Nhân công của công trình. */
export async function getProjectWorkerCosts(projectId: string) {
  await requireAuth();
  const rows = await db
    .select({ workerId: workerPayments.workerId, total: sql<string>`sum(${workerPayments.totalAmount})` })
    .from(workerPayments)
    .where(and(eq(workerPayments.projectId, projectId), isNull(workerPayments.deletedAt)))
    .groupBy(workerPayments.workerId);

  return Object.fromEntries(rows.map((r) => [r.workerId, Number(r.total)]));
}

export async function assignWorkerToProject(projectId: string, workerId: string, role?: string) {
  const user = await requireAuth();

  const existing = await db.query.projectWorkers.findFirst({
    where: and(eq(projectWorkers.projectId, projectId), eq(projectWorkers.workerId, workerId), isNull(projectWorkers.deletedAt)),
  });
  if (existing) throw new Error("Thợ này đã được gán vào công trình này");

  const [assignment] = await db
    .insert(projectWorkers)
    .values({ projectId, workerId, role: role || null, startDate: sql`current_date` })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "project_workers",
    entityId: assignment.id,
    entityType: "project_worker",
    newData: assignment,
  });

  revalidatePath(`/projects/${projectId}`);
  return assignment;
}

export async function removeWorkerFromProject(projectId: string, workerId: string) {
  const user = await requireAuth();

  await db
    .update(projectWorkers)
    .set({ deletedAt: sql`now()`, endDate: sql`current_date` })
    .where(and(eq(projectWorkers.projectId, projectId), eq(projectWorkers.workerId, workerId), isNull(projectWorkers.deletedAt)));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "project_workers",
    entityId: projectId,
    entityType: "project_worker",
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}
