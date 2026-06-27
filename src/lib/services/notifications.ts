import { db } from "@/lib/db";
import { notifications } from "@db/schema/productivity";
import { users } from "@db/schema/auth";
import { customerDebts, supplierDebts } from "@db/schema/finance";
import { projects } from "@db/schema/projects";
import { eq, and, lt, isNull, gt, sql, gte } from "drizzle-orm";

interface CreateNotificationParams {
  title: string;
  content: string;
  type: string;
  module?: string;
  recordId?: string;
  link?: string;
  userId: string;
  createdBy?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const [notification] = await db.insert(notifications).values({
      title: params.title,
      content: params.content,
      type: params.type,
      module: params.module,
      recordId: params.recordId,
      link: params.link,
      userId: params.userId,
      createdBy: params.createdBy,
    }).returning();
    return notification;
  } catch (error) {
    console.error("Lỗi tạo notification:", error);
    return null;
  }
}

export async function createSystemNotification(params: Omit<CreateNotificationParams, "userId"> & { targetRole?: string }) {
  try {
    // Nếu truyền targetRole, gửi cho tất cả user thực sự có role đó (join user_roles + roles)
    if (params.targetRole) {
      const targetUsers = await db.query.userRoles.findMany({
        where: (ur, { eq, exists, sql }) =>
          sql`${ur.roleId} in (select id from roles where name = ${params.targetRole})`,
        columns: { userId: true },
      });

      const uniqueUserIds = [...new Set(targetUsers.map((u) => u.userId))];
      if (uniqueUserIds.length === 0) return true;

      const { title, content, type, module, recordId, link, createdBy } = params;
      const insertData = uniqueUserIds.map((userId) => ({
        title,
        content,
        type,
        module,
        recordId,
        link,
        createdBy,
        userId,
      }));

      await db.insert(notifications).values(insertData);
      return true;
    }
  } catch (error) {
    console.error("Lỗi tạo system notification:", error);
    return false;
  }
}

/**
 * Quét công nợ khách hàng quá hạn, công nợ nhà cung cấp quá hạn, và công trình trễ tiến độ,
 * tạo notification cho người phụ trách nếu CHƯA có thông báo loại này trong 24h gần nhất (chống spam).
 * Không có cron job trong stack hiện tại — hàm này được gọi mỗi khi Dashboard load (đủ nhẹ, idempotent).
 */
export async function runOverdueChecks() {
  try {
    const since24h = sql`now() - interval '24 hours'`;

    // 1. Công nợ khách hàng quá hạn (dueDate đã qua, còn nợ > 0)
    const overdueCustomerDebts = await db.query.customerDebts.findMany({
      where: and(
        isNull(customerDebts.deletedAt),
        lt(customerDebts.dueDate, sql`current_date`),
        gt(customerDebts.remainingAmount, "0")
      ),
      with: { customer: { columns: { id: true, name: true, assignedToId: true } } },
    });

    for (const debt of overdueCustomerDebts) {
      const assignedToId = debt.customer?.assignedToId;
      if (!assignedToId) continue;

      const existing = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.module, "customer_debts"),
          eq(notifications.recordId, debt.id),
          eq(notifications.userId, assignedToId),
          gte(notifications.createdAt, since24h)
        ),
      });
      if (existing) continue;

      await createNotification({
        title: "Công nợ khách hàng quá hạn",
        content: `Khách hàng "${debt.customer?.name}" còn nợ ${Number(debt.remainingAmount).toLocaleString()}đ đã quá hạn thanh toán.`,
        type: "debt_overdue",
        module: "customer_debts",
        recordId: debt.id,
        link: "/debts",
        userId: assignedToId,
      });
    }

    // 2. Công nợ nhà cung cấp sắp/đã quá hạn — supplierDebts không có dueDate riêng theo schema hiện tại,
    // bỏ qua cho tới khi có field dueDate (xem matrix/registry).

    // 3. Công trình trễ tiến độ (quá ngày dự kiến hoàn thành, chưa hoàn thành)
    const overdueProjects = await db.query.projects.findMany({
      where: and(
        isNull(projects.deletedAt),
        lt(projects.expectedEndDate, sql`current_date`),
        sql`${projects.status} not in ('completed', 'paid', 'warranty', 'cancelled')`
      ),
      columns: { id: true, code: true, name: true, managerId: true, expectedEndDate: true },
    });

    for (const project of overdueProjects) {
      if (!project.managerId) continue;

      const existing = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.module, "projects"),
          eq(notifications.recordId, project.id),
          eq(notifications.userId, project.managerId),
          gte(notifications.createdAt, since24h)
        ),
      });
      if (existing) continue;

      await createNotification({
        title: "Công trình trễ tiến độ",
        content: `Công trình "${project.name}" (${project.code}) đã qua ngày dự kiến hoàn thành.`,
        type: "project_overdue",
        module: "projects",
        recordId: project.id,
        link: `/projects/${project.id}`,
        userId: project.managerId,
      });
    }

    return { customerDebtsChecked: overdueCustomerDebts.length, projectsChecked: overdueProjects.length };
  } catch (error) {
    console.error("Lỗi quét cảnh báo quá hạn:", error);
    return null;
  }
}
