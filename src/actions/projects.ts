"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import {  eq, desc, ilike, or, and, count, sql , isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { ProjectFormValues, ProjectLogFormValues, ProjectTaskFormValues, ProjectCostFormValues } from "@/lib/validations/projects";
import { projects, projectLogs, projectTasks, projectFiles, projectCosts, projectWorkers } from "@db/schema/projects";
import { customerActivities } from "@db/schema/crm";
import { auditLogs } from "@db/schema/auth";
import { receipts, payments } from "@db/schema/finance";
import { stockTickets, stockTicketItems } from "@db/schema/inventory";
import { workerPayments } from "@db/schema/workers";
import { createNotification } from "@/lib/services/notifications";
import { emptyToNull } from "@/lib/utils";

export async function getProjectOptions() {
  await requireAuth();
  return db.query.projects.findMany({
    where: isNull(projects.deletedAt),
    columns: { id: true, code: true, name: true, contractId: true },
    orderBy: [desc(projects.createdAt)],
  });
}

export async function getProjects(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions: any[] = [isNull(projects.deletedAt)];

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isProductionManager = user.roles.includes(ROLES.PRODUCTION_MANAGER);
  const isConstruction = user.roles.includes(ROLES.CONSTRUCTION_TEAM);
  
  if (!isAdmin && !isProductionManager) {
    if (isConstruction) {
      conditions.push(or(eq(projects.constructionTeamId, user.id), eq(projects.managerId, user.id)));
    } else {
      // Sales only sees what they created or manage
      conditions.push(or(eq(projects.createdBy, user.id), eq(projects.managerId, user.id)));
    }
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(projects.code, `%${params.search}%`),
        ilike(projects.name, `%${params.search}%`),
        ilike(projects.address, `%${params.search}%`)
      )
    );
  }

  if (params.status) {
    conditions.push(eq(projects.status, params.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count(projects.id) })
    .from(projects)
    .where(where);

  const data = await db.query.projects.findMany({
    where,
    with: {
      customer: { columns: { id: true, name: true, phone: true } },
      manager: { columns: { id: true, fullName: true } },
      constructionTeam: { columns: { id: true, fullName: true } },
    },
    orderBy: [desc(projects.createdAt)],
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

export const getProject = cache(async function getProject(id: string) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_VIEW);

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      customer: { columns: { id: true, name: true, phone: true, address: true, email: true } },
      contract: { columns: { id: true, code: true, totalAmount: true } },
      manager: { columns: { id: true, fullName: true, phone: true } },
      constructionTeam: { columns: { id: true, fullName: true, phone: true } },
      tasks: {
        with: { assignedTo: { columns: { id: true, fullName: true } } },
        orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
      },
      logs: {
        with: { 
          user: { columns: { id: true, fullName: true } },
          files: true,
        },
        orderBy: (logs, { desc }) => [desc(logs.date), desc(logs.createdAt)],
      },
      files: {
        with: { uploadedBy: { columns: { id: true, fullName: true } } },
        orderBy: (files, { desc }) => [desc(files.createdAt)],
      },
      workers: {
        where: (pw, { isNull }) => isNull(pw.deletedAt),
        with: { worker: { with: { role: true } } },
      },
    },
  });

  if (!project) throw new Error("Project not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isProductionManager = user.roles.includes(ROLES.PRODUCTION_MANAGER);
  const isConstruction = user.roles.includes(ROLES.CONSTRUCTION_TEAM);

  if (!isAdmin && !isProductionManager) {
    if (isConstruction && project.constructionTeamId !== user.id && project.managerId !== user.id) {
      throw new Error("Forbidden: You are not assigned to this project");
    } else if (!isConstruction && project.createdBy !== user.id && project.managerId !== user.id) {
      throw new Error("Forbidden");
    }
  }

  return project;
});

export async function createProject(data: ProjectFormValues) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_CREATE);

  const project = await db.transaction(async (tx) => {
    const [{ count: currentCount }] = await tx
      .select({ count: count(projects.id) })
      .from(projects);
    const code = `CT${String(currentCount + 1).padStart(5, "0")}`;

    const [project] = await tx
      .insert(projects)
      .values({
        code,
        name: data.name,
        customerId: data.customerId,
        contractId: data.contractId || null,
        address: data.address,
        status: data.status,
        progress: data.progress,
        startDate: data.startDate || null,
        expectedEndDate: data.expectedEndDate || null,
        expectedCost: data.expectedCost?.toString(),
        actualCost: data.actualCost?.toString(),
        estimatedProfit: data.estimatedProfit?.toString(),
        managerId: data.managerId || null,
        constructionTeamId: data.constructionTeamId || null,
        notes: data.notes,
        createdBy: user.id,
      })
      .returning();

    await tx.insert(customerActivities).values({
      customerId: data.customerId,
      userId: user.id,
      type: "project",
      description: `Đã khởi tạo công trình mới: ${code} - ${data.name}`,
    });

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE",
      module: "projects",
      entityId: project.id,
      entityType: "project",
      newData: project,
    });

    if (data.workerIds && data.workerIds.length > 0) {
      await tx.insert(projectWorkers).values(
        data.workerIds.map((workerId) => ({
          projectId: project.id,
          workerId,
          startDate: sql`current_date`,
        }))
      );
    }

    revalidatePath("/projects");
    return project;
  });

  if (project.managerId && project.managerId !== user.id) {
    await createNotification({
      title: "Công trình mới được giao",
      content: `Bạn được giao phụ trách công trình "${project.name}" (${project.code}).`,
      type: "project_assigned",
      module: "projects",
      recordId: project.id,
      link: `/projects/${project.id}`,
      userId: project.managerId,
      createdBy: user.id,
    });
  }

  return project;
}

export async function updateProject(id: string, data: ProjectFormValues) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_UPDATE);

  const { updated, managerChanged } = await db.transaction(async (tx) => {
    const existing = await tx.query.projects.findFirst({
      where: eq(projects.id, id),
    });

    if (!existing) throw new Error("Project not found");

    const [updated] = await tx
      .update(projects)
      .set({
        name: data.name,
        customerId: data.customerId,
        contractId: data.contractId || null,
        address: data.address,
        status: data.status,
        progress: data.progress,
        startDate: data.startDate || null,
        expectedEndDate: data.expectedEndDate || null,
        expectedCost: data.expectedCost?.toString(),
        actualCost: data.actualCost?.toString(),
        estimatedProfit: data.estimatedProfit?.toString(),
        managerId: data.managerId || null,
        constructionTeamId: data.constructionTeamId || null,
        notes: data.notes,
        updatedAt: sql`now()`,
      })
      .where(eq(projects.id, id))
      .returning();

    // If progress or status changed, log to customer timeline
    if (existing.status !== updated.status || existing.progress !== updated.progress) {
       await tx.insert(customerActivities).values({
        customerId: updated.customerId,
        userId: user.id,
        type: "project",
        description: `Cập nhật công trình ${updated.code}: ${updated.progress}% - ${updated.status}`,
      });
    }

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "UPDATE",
      module: "projects",
      entityId: id,
      entityType: "project",
      oldData: existing,
      newData: updated,
    });

    revalidatePath(`/projects/${id}`);
    revalidatePath("/projects");
    return { updated, managerChanged: updated.managerId !== existing.managerId };
  });

  if (managerChanged && updated.managerId && updated.managerId !== user.id) {
    await createNotification({
      title: "Công trình mới được giao",
      content: `Bạn được giao phụ trách công trình "${updated.name}" (${updated.code}).`,
      type: "project_assigned",
      module: "projects",
      recordId: updated.id,
      link: `/projects/${updated.id}`,
      userId: updated.managerId,
      createdBy: user.id,
    });
  }

  return updated;
}

export async function updateProjectProgress(id: string, progress: number, status: string) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_UPDATE); // or specific permission

  return await db.transaction(async (tx) => {
    const existing = await tx.query.projects.findFirst({ where: eq(projects.id, id) });
    if (!existing) throw new Error("Not found");

    const [updated] = await tx
      .update(projects)
      .set({ progress, status, updatedAt: sql`now()` })
      .where(eq(projects.id, id))
      .returning();

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "UPDATE_PROGRESS",
      module: "projects",
      entityId: id,
      entityType: "project",
      newData: { progress, status },
    });

    revalidatePath(`/projects/${id}`);
    return updated;
  });
}

const NON_CANCELLABLE_STATUSES = ["completed", "paid", "warranty", "cancelled"];

/** Hủy công trình — bắt buộc lý do, không cho hủy công trình đã hoàn thành/đã thanh toán/đã hủy. */
export async function cancelProject(id: string, reason: string) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_UPDATE);

  const existing = await db.query.projects.findFirst({ where: eq(projects.id, id) });
  if (!existing) throw new Error("Không tìm thấy công trình");
  if (NON_CANCELLABLE_STATUSES.includes(existing.status)) {
    throw new Error(`Không thể hủy công trình ở trạng thái "${existing.status}"`);
  }

  const cancelNote = `[HỦY ${new Date().toLocaleDateString("vi-VN")}] Lý do: ${reason}`;
  const [updated] = await db
    .update(projects)
    .set({
      status: "cancelled",
      notes: existing.notes ? `${existing.notes}\n${cancelNote}` : cancelNote,
      updatedAt: sql`now()`,
    })
    .where(eq(projects.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CANCEL",
    module: "projects",
    entityId: id,
    entityType: "project",
    oldData: { status: existing.status },
    newData: { status: "cancelled", reason },
  });

  revalidatePath(`/projects/${id}`);
  revalidatePath("/projects");
  return updated;
}

export async function createProjectLog(data: ProjectLogFormValues) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_VIEW); // Assume anyone in project can log

  return await db.transaction(async (tx) => {
    const [log] = await tx.insert(projectLogs).values({
      projectId: data.projectId,
      userId: user.id,
      date: data.date,
      phase: data.phase,
      title: data.title,
      content: data.content,
      issues: data.issues || null,
      proposal: data.proposal || null,
      status: data.status,
      weather: data.weather || null,
    }).returning();

    if (data.images && data.images.length > 0) {
      await tx.insert(projectFiles).values(
        data.images.map((imgUrl) => ({
          projectId: data.projectId,
          projectLogId: log.id,
          uploadedById: user.id,
          fileType: "image",
          fileCategory: "in_progress",
          fileUrl: imgUrl,
          fileName: "Hình ảnh nhật ký",
        }))
      );
    }

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE_LOG",
      module: "projects",
      entityId: log.id,
      entityType: "projectLog",
    });

    revalidatePath(`/projects/${data.projectId}`);
    return log;
  });
}

export async function createProjectTask(data: ProjectTaskFormValues) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_VIEW);

  const [task] = await db.insert(projectTasks).values({
    projectId: data.projectId,
    name: data.name,
    description: data.description,
    assignedToId: data.assignedToId || null,
    priority: data.priority,
    status: data.status,
    progress: data.progress,
    startDate: data.startDate || null,
    dueDate: data.dueDate || null,
    notes: data.notes,
  }).returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE_TASK",
    module: "projects",
    entityId: task.id,
    entityType: "projectTask",
  });

  revalidatePath(`/projects/${data.projectId}`);
  return task;
}

export async function uploadProjectFile(projectId: string, fileUrl: string, fileName: string, category: string = "general") {
  const user = await requireAuth();

  const [file] = await db.insert(projectFiles).values({
    projectId,
    uploadedById: user.id,
    fileType: fileUrl.startsWith("data:image") ? "image" : "document",
    fileCategory: category,
    fileUrl,
    fileName,
  }).returning();

  revalidatePath(`/projects/${projectId}`);
  return file;
}

// ─── Chi phí công trình thực tế (project_costs) ──────────────────────

export async function getProjectCosts(projectId: string) {
  await requireAuth();
  return db.query.projectCosts.findMany({
    where: and(eq(projectCosts.projectId, projectId), isNull(projectCosts.deletedAt)),
    with: { createdByUser: { columns: { id: true, fullName: true } } },
    orderBy: [desc(projectCosts.date)],
  });
}

export async function createProjectCost(data: ProjectCostFormValues) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_UPDATE);

  const [cost] = await db.insert(projectCosts).values({
    projectId: data.projectId,
    category: data.category,
    description: data.description,
    amount: data.amount.toString(),
    date: data.date,
    supplierId: emptyToNull(data.supplierId),
    createdBy: user.id,
  }).returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "project_costs",
    entityId: cost.id,
    entityType: "project_cost",
    newData: cost,
  });

  revalidatePath(`/projects/${data.projectId}`);
  return cost;
}

export async function deleteProjectCost(id: string, projectId: string) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_UPDATE);

  await db.update(projectCosts).set({ deletedAt: sql`now()` }).where(eq(projectCosts.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "project_costs",
    entityId: id,
    entityType: "project_cost",
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

/**
 * Doanh thu/chi phí/lợi nhuận THỰC TẾ của 1 công trình — tính từ dữ liệu thật
 * (phiếu thu, chi phí ghi nhận, vật tư xuất kho, lương thợ), KHÔNG dùng số gõ tay
 * `actualCost`/`estimatedProfit` trên form công trình (đó chỉ là dự toán ban đầu).
 */
export async function getProjectFinancials(projectId: string) {
  await requireAuth();

  const [{ totalReceipts }] = await db
    .select({ totalReceipts: sql<string>`coalesce(sum(${receipts.amount}), 0)` })
    .from(receipts)
    .where(and(eq(receipts.projectId, projectId), isNull(receipts.deletedAt)));

  const [{ totalCosts }] = await db
    .select({ totalCosts: sql<string>`coalesce(sum(${projectCosts.amount}), 0)` })
    .from(projectCosts)
    .where(and(eq(projectCosts.projectId, projectId), isNull(projectCosts.deletedAt)));

  const [{ totalMaterials }] = await db
    .select({ totalMaterials: sql<string>`coalesce(sum(${stockTicketItems.totalAmount}), 0)` })
    .from(stockTicketItems)
    .innerJoin(stockTickets, eq(stockTicketItems.ticketId, stockTickets.id))
    .where(and(eq(stockTickets.projectId, projectId), eq(stockTickets.type, "OUT"), isNull(stockTickets.deletedAt)));

  const [{ totalLabor }] = await db
    .select({ totalLabor: sql<string>`coalesce(sum(${workerPayments.totalAmount}), 0)` })
    .from(workerPayments)
    .where(and(eq(workerPayments.projectId, projectId), isNull(workerPayments.deletedAt)));

  const [{ totalPayments }] = await db
    .select({ totalPayments: sql<string>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(and(eq(payments.projectId, projectId), isNull(payments.deletedAt)));

  const revenue = Number(totalReceipts);
  const costsOther = Number(totalCosts) + Number(totalPayments);
  const costs = costsOther + Number(totalMaterials) + Number(totalLabor);

  return {
    revenue,
    costsOther,
    costsMaterials: Number(totalMaterials),
    costsLabor: Number(totalLabor),
    totalCosts: costs,
    profit: revenue - costs,
  };
}
