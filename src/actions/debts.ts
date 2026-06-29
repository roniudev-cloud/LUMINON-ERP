"use server";

import { db } from "@/lib/db";
import { eq, desc, ilike, or, and, count, sql, isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { customerDebts, supplierDebts } from "@db/schema/finance";
import { auditLogs } from "@db/schema/auth";

// --- Customer Debts ---

export async function getCustomerDebts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const user = await requireAuth();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [isNull(customerDebts.deletedAt)];

  if (user.companyId) {
    conditions.push(eq(customerDebts.companyId, user.companyId));
  }

  if (params.status) {
    conditions.push(eq(customerDebts.status, params.status));
  }

  const where = and(...conditions);

  const [{ value: totalCount }] = await db
    .select({ value: count(customerDebts.id) })
    .from(customerDebts)
    .where(where);

  const data = await db.query.customerDebts.findMany({
    where,
    with: {
      customer: true,
      contract: true,
      project: true,
    },
    orderBy: [desc(customerDebts.createdAt)],
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

export async function updateCustomerDebtStatus(id: string, status: string, paidAmount?: string) {
  const user = await requireAuth();

  const conditions = [eq(customerDebts.id, id), isNull(customerDebts.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(customerDebts.companyId, user.companyId));
  }

  const existing = await db.query.customerDebts.findFirst({
    where: and(...conditions),
  });

  if (!existing) throw new Error("Debt not found");

  const updates: any = { status, updatedAt: sql`now()` };
  if (paidAmount !== undefined) {
    updates.paidAmount = paidAmount;
    updates.remainingAmount = String(Number(existing.totalAmount) - Number(paidAmount));
    updates.lastPaymentDate = sql`now()`;
  }

  const [updated] = await db
    .update(customerDebts)
    .set(updates)
    .where(eq(customerDebts.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "customer_debts",
    entityId: id,
    entityType: "debt",
    oldData: existing,
    newData: updated,
  });

  revalidatePath("/debts");
  return updated;
}

// --- Supplier Debts ---

export async function getSupplierDebts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const user = await requireAuth();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [isNull(supplierDebts.deletedAt)];

  if (user.companyId) {
    conditions.push(eq(supplierDebts.companyId, user.companyId));
  }

  if (params.search) {
    conditions.push(ilike(supplierDebts.supplierName, `%${params.search}%`));
  }

  if (params.status) {
    conditions.push(eq(supplierDebts.status, params.status));
  }

  const where = and(...conditions);

  const [{ value: totalCount }] = await db
    .select({ value: count(supplierDebts.id) })
    .from(supplierDebts)
    .where(where);

  const data = await db.query.supplierDebts.findMany({
    where,
    orderBy: [desc(supplierDebts.createdAt)],
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

export async function updateSupplierDebtStatus(id: string, status: string, paidAmount?: string) {
  const user = await requireAuth();

  const conditions = [eq(supplierDebts.id, id), isNull(supplierDebts.deletedAt)];
  if (user.companyId) {
    conditions.push(eq(supplierDebts.companyId, user.companyId));
  }

  const existing = await db.query.supplierDebts.findFirst({
    where: and(...conditions),
  });

  if (!existing) throw new Error("Debt not found");

  const updates: any = { status, updatedAt: sql`now()` };
  if (paidAmount !== undefined) {
    updates.paidAmount = paidAmount;
    updates.remainingAmount = String(Number(existing.totalAmount) - Number(paidAmount));
  }

  const [updated] = await db
    .update(supplierDebts)
    .set(updates)
    .where(eq(supplierDebts.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "supplier_debts",
    entityId: id,
    entityType: "debt",
    oldData: existing,
    newData: updated,
  });

  revalidatePath("/debts");
  return updated;
}
