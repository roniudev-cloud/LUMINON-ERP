"use server";

import { db } from "@/lib/db";
import { eq, desc, ilike, or, and, count, sql, isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { tasks } from "@db/schema/productivity";
import { auditLogs } from "@db/schema/auth";
import { createNotification } from "@/lib/services/notifications";

export async function getTasks(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  priority?: string;
}) {
  const user = await requireAuth();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions: any[] = [isNull(tasks.deletedAt)];

  // SaaS RLS Bypass fix
  if (user.companyId) {
    conditions.push(eq(tasks.companyId, user.companyId));
  }

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  // If not admin, maybe they can only see tasks assigned to them or created by them
  if (!isAdmin) {
    conditions.push(
      or(
        eq(tasks.assignedTo, user.id),
        eq(tasks.createdBy, user.id)
      )
    );
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${params.search}%`),
        ilike(tasks.description, `%${params.search}%`)
      )
    );
  }

  if (params.status) {
    conditions.push(eq(tasks.status, params.status));
  }

  if (params.priority) {
    conditions.push(eq(tasks.priority, params.priority));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count(tasks.id) })
    .from(tasks)
    .where(where);

  const data = await db.query.tasks.findMany({
    where,
    with: {
      assignedUser: {
        columns: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      createdUser: {
        columns: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [desc(tasks.createdAt)],
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

export async function getTask(id: string) {
  const user = await requireAuth();

  const conditions = [eq(tasks.id, id), isNull(tasks.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(tasks.companyId, user.companyId));
  }

  const task = await db.query.tasks.findFirst({
    where: and(...conditions),
    with: {
      assignedUser: {
        columns: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      createdUser: {
        columns: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  if (!task) throw new Error("Task not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && task.assignedTo !== user.id && task.createdBy !== user.id) {
    throw new Error("Forbidden: You do not have access to this task");
  }

  return task;
}

export async function createTask(data: any) {
  const user = await requireAuth();

  const [task] = await db
    .insert(tasks)
    .values({
      companyId: user.companyId,
      title: data.title,
      description: data.description,
      priority: data.priority || "normal",
      status: data.status || "new",
      progress: data.progress || 0,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedTo: data.assignedTo || user.id,
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "tasks",
    entityId: task.id,
    entityType: "task",
    newData: task,
  });

  if (task.assignedTo && task.assignedTo !== user.id) {
    await createNotification({
      title: "Công việc mới được giao",
      content: `Bạn được giao công việc "${task.title}".`,
      type: "task_assigned",
      module: "tasks",
      recordId: task.id,
      link: "/tasks",
      userId: task.assignedTo,
      createdBy: user.id,
    });
  }

  revalidatePath("/tasks");
  return task;
}

export async function updateTask(id: string, data: any) {
  const user = await requireAuth();

  const conditions = [eq(tasks.id, id), isNull(tasks.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(tasks.companyId, user.companyId));
  }

  const existing = await db.query.tasks.findFirst({
    where: and(...conditions),
  });

  if (!existing) throw new Error("Task not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && existing.assignedTo !== user.id && existing.createdBy !== user.id) {
    throw new Error("Forbidden");
  }

  const [updated] = await db
    .update(tasks)
    .set({
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      progress: data.progress,
      startDate: data.startDate ? new Date(data.startDate) : null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedTo: data.assignedTo,
      updatedAt: sql`now()`,
      completedAt: data.status === "completed" && existing.status !== "completed" ? sql`now()` : existing.completedAt,
    })
    .where(eq(tasks.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "tasks",
    entityId: id,
    entityType: "task",
    oldData: existing,
    newData: updated,
  });

  if (updated.assignedTo && updated.assignedTo !== existing.assignedTo && updated.assignedTo !== user.id) {
    await createNotification({
      title: "Công việc mới được giao",
      content: `Bạn được giao công việc "${updated.title}".`,
      type: "task_assigned",
      module: "tasks",
      recordId: updated.id,
      link: "/tasks",
      userId: updated.assignedTo,
      createdBy: user.id,
    });
  }

  revalidatePath(`/tasks/${id}`);
  revalidatePath("/tasks");
  return updated;
}

export async function deleteTask(id: string) {
  const user = await requireAuth();
  
  const conditions = [eq(tasks.id, id), isNull(tasks.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(tasks.companyId, user.companyId));
  }

  const existing = await db.query.tasks.findFirst({
    where: and(...conditions),
  });

  if (!existing) throw new Error("Task not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && existing.createdBy !== user.id) {
    throw new Error("Forbidden: Only creator can delete");
  }

  // Soft delete
  await db.update(tasks).set({ deletedAt: sql`now()` }).where(eq(tasks.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "tasks",
    entityId: id,
    entityType: "task",
  });

  revalidatePath("/tasks");
  return { success: true };
}
