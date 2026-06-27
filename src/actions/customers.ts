"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import {  eq, desc, ilike, or, and, count, sql , isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { CustomerFormValues } from "@/lib/validations/crm";
import { generateCode, emptyToNull } from "@/lib/utils";
import { createNotification } from "@/lib/services/notifications";
import { customers, customerSources, customerStatuses, customerActivities, customerNotes } from "@db/schema/crm";
import { users, auditLogs } from "@db/schema/auth";
import { quotations, contracts } from "@db/schema/sales";
import { projects } from "@db/schema/projects";
import { receipts, customerDebts, vatInvoices } from "@db/schema/finance";
import { conversations } from "@db/schema/omnichannel";

export async function getCustomers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  statusId?: string;
}) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Build conditions
  const conditions: any[] = [isNull(customers.deletedAt)];

  // If not admin and only has VIEW_OWN permission (not full VIEW), restrict to assigned
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const hasFullView = user.permissions.includes(PERMISSIONS.CUSTOMERS_VIEW);
  const hasViewOwn = user.permissions.includes(PERMISSIONS.CUSTOMERS_VIEW_OWN);

  if (!isAdmin && !hasFullView && hasViewOwn) {
    conditions.push(eq(customers.assignedToId, user.id));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(customers.name, `%${params.search}%`),
        ilike(customers.code, `%${params.search}%`),
        ilike(customers.phone, `%${params.search}%`),
        ilike(customers.email, `%${params.search}%`)
      )
    );
  }

  if (params.statusId) {
    conditions.push(eq(customers.statusId, params.statusId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch total count
  const [{ value: totalCount }] = await db
    .select({ value: count(customers.id) })
    .from(customers)
    .where(where);

  // Fetch paginated data
  const data = await db.query.customers.findMany({
    where,
    with: {
      status: true,
      source: true,
      assignedTo: {
        columns: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [desc(customers.createdAt)],
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

export const getCustomer = cache(async function getCustomer(id: string) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_VIEW);

  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, id),
    with: {
      status: true,
      source: true,
      assignedTo: {
        columns: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      notes: {
        with: {
          user: {
            columns: { fullName: true, avatarUrl: true },
          },
        },
        orderBy: (notes, { desc }) => [desc(notes.createdAt)],
      },
      activities: {
        with: {
          user: {
            columns: { fullName: true, avatarUrl: true },
          },
        },
        orderBy: (activities, { desc }) => [desc(activities.createdAt)],
      },
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Check access for non-admins
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const hasFullView = user.permissions.includes(PERMISSIONS.CUSTOMERS_VIEW);
  
  if (!isAdmin && !hasFullView && customer.assignedToId !== user.id) {
    throw new Error("Forbidden: You do not have access to this customer");
  }

  // Fetch associated records (độc lập với nhau — chạy song song thay vì tuần tự)
  const [customerQuotations, customerContracts, customerProjects] = await Promise.all([
    db.query.quotations.findMany({
      where: and(eq(quotations.customerId, id), isNull(quotations.deletedAt)),
      orderBy: [desc(quotations.createdAt)],
    }),
    db.query.contracts.findMany({
      where: and(eq(contracts.customerId, id), isNull(contracts.deletedAt)),
      orderBy: [desc(contracts.createdAt)],
    }),
    db.query.projects.findMany({
      where: and(eq(projects.customerId, id), isNull(projects.deletedAt)),
      orderBy: [desc(projects.createdAt)],
    }),
  ]);

  return {
    ...customer,
    quotations: customerQuotations,
    contracts: customerContracts,
    projects: customerProjects,
  };
});

export async function createCustomer(data: CustomerFormValues) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_CREATE);

  // Generate customer code (e.g., KH00001)
  const [{ count: currentCount }] = await db
    .select({ count: count(customers.id) })
    .from(customers);
  const code = generateCode("KH", currentCount + 1);

  // Insert customer
  const [customer] = await db
    .insert(customers)
    .values({
      ...data,
      code,
      createdBy: user.id,
      sourceId: emptyToNull(data.sourceId),
      statusId: emptyToNull(data.statusId),
      assignedToId: data.assignedToId || user.id, // default assign to creator
    })
    .returning();

  // Log activity
  await db.insert(customerActivities).values({
    customerId: customer.id,
    userId: user.id,
    type: "create",
    description: "Tạo mới khách hàng",
  });

  // System Audit Log
  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "customers",
    entityId: customer.id,
    entityType: "customer",
    newData: customer,
  });

  // Thông báo cho người được giao (nếu khác người tạo)
  if (customer.assignedToId && customer.assignedToId !== user.id) {
    await createNotification({
      title: "Khách hàng mới được giao",
      content: `Bạn được giao phụ trách khách hàng "${customer.name}".`,
      type: "customer_assigned",
      module: "customers",
      recordId: customer.id,
      link: `/customers/${customer.id}`,
      userId: customer.assignedToId,
      createdBy: user.id,
    });
  }

  revalidatePath("/customers");
  return customer;
}

export async function updateCustomer(id: string, data: CustomerFormValues) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_UPDATE);

  const existing = await db.query.customers.findFirst({
    where: eq(customers.id, id),
  });

  if (!existing) throw new Error("Customer not found");

  // Only admin or assigned user can update
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && existing.assignedToId !== user.id) {
    throw new Error("Forbidden: Only assigned user can update this customer");
  }

  const [updated] = await db
    .update(customers)
    .set({
      ...data,
      sourceId: emptyToNull(data.sourceId),
      statusId: emptyToNull(data.statusId),
      assignedToId: emptyToNull(data.assignedToId),
      updatedAt: sql`now()`,
    })
    .where(eq(customers.id, id))
    .returning();

  await db.insert(customerActivities).values({
    customerId: id,
    userId: user.id,
    type: "update",
    description: "Cập nhật thông tin khách hàng",
  });

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "customers",
    entityId: id,
    entityType: "customer",
    oldData: existing,
    newData: updated,
  });

  // Thông báo nếu người phụ trách vừa đổi
  if (updated.assignedToId && updated.assignedToId !== existing.assignedToId && updated.assignedToId !== user.id) {
    await createNotification({
      title: "Khách hàng mới được giao",
      content: `Bạn được giao phụ trách khách hàng "${updated.name}".`,
      type: "customer_assigned",
      module: "customers",
      recordId: updated.id,
      link: `/customers/${updated.id}`,
      userId: updated.assignedToId,
      createdBy: user.id,
    });
  }

  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
  return updated;
}

export async function deleteCustomer(id: string) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_DELETE);

  await db.update(customers).set({ deletedAt: new Date() }).where(eq(customers.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "customers",
    entityId: id,
    entityType: "customer",
  });

  revalidatePath("/customers");
  return { success: true };
}

export async function getCustomerLookups() {
  await requireAuth();

  const [sources, statuses, assignees] = await Promise.all([
    db.query.customerSources.findMany({ orderBy: (s, { asc }) => [asc(s.name)] }),
    db.query.customerStatuses.findMany({ orderBy: (s, { asc }) => [asc(s.sortOrder)] }),
    db.query.users.findMany({
      where: eq(users.isActive, true),
      columns: { id: true, fullName: true, email: true },
      orderBy: (u, { asc }) => [asc(u.fullName)],
    }),
  ]);

  return { sources, statuses, assignees };
}

/** Tìm các nhóm khách hàng có khả năng trùng nhau (cùng số điện thoại đã chuẩn hóa). */
export async function getDuplicateCustomers() {
  await requireAuth(PERMISSIONS.CUSTOMERS_VIEW);

  const rows = await db
    .select({
      id: customers.id,
      code: customers.code,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      createdAt: customers.createdAt,
      normalizedPhone: sql<string>`regexp_replace(${customers.phone}, '[^0-9]', '', 'g')`.as("normalized_phone"),
    })
    .from(customers)
    .where(and(isNull(customers.deletedAt), sql`${customers.phone} is not null and ${customers.phone} <> ''`));

  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!row.normalizedPhone || row.normalizedPhone.length < 9) continue;
    const arr = groups.get(row.normalizedPhone) || [];
    arr.push(row);
    groups.set(row.normalizedPhone, arr);
  }

  return Array.from(groups.entries())
    .filter(([, arr]) => arr.length > 1)
    .map(([phone, items]) => ({ phone, customers: items }));
}

/**
 * Gộp khách hàng trùng: chuyển toàn bộ dữ liệu liên quan (báo giá, hợp đồng, công trình,
 * phiếu thu, công nợ, hóa đơn VAT, hội thoại, ghi chú, hoạt động) từ `duplicateId` sang
 * `keepId`, sau đó xóa mềm bản ghi trùng.
 */
export async function mergeCustomers(keepId: string, duplicateId: string) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_DELETE);

  if (keepId === duplicateId) {
    throw new Error("Không thể gộp một khách hàng với chính nó");
  }

  const [keep, duplicate] = await Promise.all([
    db.query.customers.findFirst({ where: eq(customers.id, keepId) }),
    db.query.customers.findFirst({ where: eq(customers.id, duplicateId) }),
  ]);
  if (!keep || !duplicate) throw new Error("Không tìm thấy khách hàng");

  await db.transaction(async (tx) => {
    await tx.update(quotations).set({ customerId: keepId }).where(eq(quotations.customerId, duplicateId));
    await tx.update(contracts).set({ customerId: keepId }).where(eq(contracts.customerId, duplicateId));
    await tx.update(projects).set({ customerId: keepId }).where(eq(projects.customerId, duplicateId));
    await tx.update(receipts).set({ customerId: keepId }).where(eq(receipts.customerId, duplicateId));
    await tx.update(customerDebts).set({ customerId: keepId }).where(eq(customerDebts.customerId, duplicateId));
    await tx.update(vatInvoices).set({ customerId: keepId }).where(eq(vatInvoices.customerId, duplicateId));
    await tx.update(conversations).set({ customerId: keepId }).where(eq(conversations.customerId, duplicateId));
    await tx.update(customerNotes).set({ customerId: keepId }).where(eq(customerNotes.customerId, duplicateId));
    await tx.update(customerActivities).set({ customerId: keepId }).where(eq(customerActivities.customerId, duplicateId));

    await tx.update(customers).set({ deletedAt: sql`now()` }).where(eq(customers.id, duplicateId));

    await tx.insert(customerActivities).values({
      customerId: keepId,
      userId: user.id,
      type: "merge",
      description: `Gộp khách hàng trùng "${duplicate.name}" (${duplicate.code}) vào khách hàng này.`,
    });

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "MERGE",
      module: "customers",
      entityId: keepId,
      entityType: "customer",
      oldData: duplicate,
      newData: { mergedInto: keepId },
    });
  });

  revalidatePath("/customers");
  revalidatePath(`/customers/${keepId}`);
  return { success: true };
}

export async function addCustomerActivity(customerId: string, data: { type: string; description: string }) {
  const user = await requireAuth();

  const [activity] = await db.insert(customerActivities).values({
    customerId,
    userId: user.id,
    type: data.type,
    description: data.description,
  }).returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "customers.activities",
    entityId: activity.id,
    entityType: "activity",
    newData: activity,
  });

  revalidatePath(`/customers/${customerId}`);
  return activity;
}
