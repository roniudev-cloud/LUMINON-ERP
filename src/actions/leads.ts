"use server";

import { db } from "@/lib/db";
import {  eq, desc, ilike, or, and, count, sql , isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { LeadFormValues } from "@/lib/validations/crm";
import { emptyToNull } from "@/lib/utils";
import { leads } from "@db/schema/crm";
import { users, auditLogs } from "@db/schema/auth";
import { createNotification } from "@/lib/services/notifications";

export async function getLeads(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const user = await requireAuth(PERMISSIONS.LEADS_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions: any[] = [isNull(leads.deletedAt)];

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin) {
    conditions.push(eq(leads.assignedToId, user.id));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(leads.name, `%${params.search}%`),
        ilike(leads.phone, `%${params.search}%`),
        ilike(leads.email, `%${params.search}%`)
      )
    );
  }

  if (params.status) {
    conditions.push(eq(leads.status, params.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count(leads.id) })
    .from(leads)
    .where(where);

  const data = await db.query.leads.findMany({
    where,
    with: {
      source: true,
      assignedTo: {
        columns: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [desc(leads.createdAt)],
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

export async function createLead(data: LeadFormValues) {
  const user = await requireAuth(PERMISSIONS.LEADS_CREATE);

  const [lead] = await db
    .insert(leads)
    .values({
      ...data,
      sourceId: emptyToNull(data.sourceId),
      assignedToId: data.assignedToId || user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "leads",
    entityId: lead.id,
    entityType: "lead",
    newData: lead,
  });

  if (lead.assignedToId && lead.assignedToId !== user.id) {
    await createNotification({
      title: "Lead mới được giao",
      content: `Bạn được giao chăm sóc lead "${lead.name}".`,
      type: "lead_assigned",
      module: "leads",
      recordId: lead.id,
      link: "/leads",
      userId: lead.assignedToId,
      createdBy: user.id,
    });
  }

  revalidatePath("/leads");
  return lead;
}

export async function updateLead(id: string, data: LeadFormValues) {
  const user = await requireAuth(PERMISSIONS.LEADS_UPDATE);

  const existing = await db.query.leads.findFirst({
    where: eq(leads.id, id),
  });

  if (!existing) throw new Error("Lead not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && existing.assignedToId !== user.id) {
    throw new Error("Forbidden: Only assigned user can update this lead");
  }

  const [updated] = await db
    .update(leads)
    .set({
      ...data,
      sourceId: emptyToNull(data.sourceId),
      assignedToId: emptyToNull(data.assignedToId),
      updatedAt: sql`now()`,
    })
    .where(eq(leads.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "leads",
    entityId: id,
    entityType: "lead",
    oldData: existing,
    newData: updated,
  });

  revalidatePath("/leads");
  return updated;
}

export async function deleteLead(id: string) {
  const user = await requireAuth(PERMISSIONS.LEADS_DELETE);
  await db.update(leads).set({ deletedAt: new Date() }).where(eq(leads.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "leads",
    entityId: id,
    entityType: "lead",
  });

  revalidatePath("/leads");
  return { success: true };
}

export async function convertLeadToCustomer(leadId: string) {
  const user = await requireAuth(PERMISSIONS.CUSTOMERS_CREATE);

  const lead = await db.query.leads.findFirst({
    where: eq(leads.id, leadId),
  });

  if (!lead) throw new Error("Lead not found");
  if (lead.status === "converted") throw new Error("Lead is already converted");

  const { customers, customerStatuses, customerActivities } = await import("@db/schema/crm");

  // 1. Get default status (e.g. 'Mới')
  const defaultStatus = await db.query.customerStatuses.findFirst({
    orderBy: (s, { asc }) => [asc(s.sortOrder)],
  });

  // 2. Generate Customer Code
  const [{ count: currentCount }] = await db
    .select({ count: count(customers.id) })
    .from(customers);
  const code = `KH${String(currentCount + 1).padStart(5, "0")}`;

  // 3. Create Customer
  const [customer] = await db
    .insert(customers)
    .values({
      code,
      name: lead.name,
      phone: lead.phone || "",
      email: lead.email,
      sourceId: lead.sourceId,
      notes: lead.description,
      statusId: defaultStatus?.id,
      assignedToId: lead.assignedToId || user.id,
      createdBy: user.id,
    })
    .returning();

  // 4. Update Lead status
  await db
    .update(leads)
    .set({ status: "converted", updatedAt: sql`now()` })
    .where(eq(leads.id, leadId));

  // 5. Log Activity
  await db.insert(customerActivities).values({
    customerId: customer.id,
    userId: user.id,
    type: "create",
    description: "Khách hàng được chuyển đổi từ Lead",
  });

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CONVERT",
    module: "leads",
    entityId: leadId,
    entityType: "lead",
    newData: customer,
  });

  revalidatePath("/leads");
  revalidatePath("/customers");
  
  return customer;
}
