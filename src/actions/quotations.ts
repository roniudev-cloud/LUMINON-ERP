"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import {  eq, desc, ilike, or, and, count, sql , isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { QuotationFormValues } from "@/lib/validations/quotations";
import { quotations, quotationItems, contracts, contractItems } from "@db/schema/sales";
import { customerActivities, customers } from "@db/schema/crm";
import { auditLogs } from "@db/schema/auth";

export async function getQuotations(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const user = await requireAuth(PERMISSIONS.QUOTATIONS_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions: any[] = [isNull(quotations.deletedAt)];

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin) {
    // Only see quotes created by them, or quotes for customers assigned to them
    // Note: To join with customers efficiently for filtering, we would normally do an inner join.
    // For simplicity with drizzle query builder without full joins, we limit to createdBy for now,
    // or we can just fetch customer IDs they own and use `inArray`.
    conditions.push(eq(quotations.createdBy, user.id));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(quotations.code, `%${params.search}%`),
        ilike(quotations.title, `%${params.search}%`)
      )
    );
  }

  if (params.status) {
    conditions.push(eq(quotations.status, params.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count(quotations.id) })
    .from(quotations)
    .where(where);

  const data = await db.query.quotations.findMany({
    where,
    with: {
      customer: {
        columns: {
          id: true,
          name: true,
          phone: true,
        },
      },
      createdByUser: {
        columns: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [desc(quotations.createdAt)],
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

export const getQuotation = cache(async function getQuotation(id: string) {
  const user = await requireAuth(PERMISSIONS.QUOTATIONS_VIEW);

  const quotation = await db.query.quotations.findFirst({
    where: eq(quotations.id, id),
    with: {
      customer: {
        columns: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
        },
      },
      createdByUser: {
        columns: {
          id: true,
          fullName: true,
        },
      },
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });

  if (!quotation) throw new Error("Quotation not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && quotation.createdBy !== user.id) {
    throw new Error("Forbidden: You can only view your own quotations");
  }

  return quotation;
});

export async function createQuotation(data: QuotationFormValues) {
  const user = await requireAuth(PERMISSIONS.QUOTATIONS_CREATE);

  // Use a transaction
  return await db.transaction(async (tx) => {
    // Generate Code
    const [{ count: currentCount }] = await tx
      .select({ count: count(quotations.id) })
      .from(quotations);
    const code = `BG${String(currentCount + 1).padStart(5, "0")}`;

    // 1. Create Quotation
    const [quotation] = await tx
      .insert(quotations)
      .values({
        code,
        customerId: data.customerId,
        title: data.title,
        subtotal: data.subtotal.toString(),
        discount: data.discount.toString(),
        discountType: data.discountType,
        vatRate: data.vatRate.toString(),
        vatAmount: data.vatAmount.toString(),
        otherFees: data.otherFees.toString(),
        totalAmount: data.totalAmount.toString(),
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
        notes: data.notes,
        templateId: data.templateId,
        createdBy: user.id,
      })
      .returning();

    // 2. Create Items
    if (data.items.length > 0) {
      await tx.insert(quotationItems).values(
        data.items.map((item, index) => ({
          quotationId: quotation.id,
          name: item.name,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          amount: item.amount.toString(),
          sortOrder: index,
        }))
      );
    }

    // 3. Customer Activity
    await tx.insert(customerActivities).values({
      customerId: data.customerId,
      userId: user.id,
      type: "quote",
      description: `Đã tạo báo giá mới: ${code} - ${data.title}`,
    });

    // 4. Audit Log
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE",
      module: "quotations",
      entityId: quotation.id,
      entityType: "quotation",
      newData: quotation,
    });

    revalidatePath("/quotations");
    revalidatePath(`/customers/${data.customerId}`);
    return quotation;
  });
}

export async function updateQuotation(id: string, data: QuotationFormValues) {
  const user = await requireAuth(PERMISSIONS.QUOTATIONS_UPDATE);

  return await db.transaction(async (tx) => {
    const existing = await tx.query.quotations.findFirst({
      where: eq(quotations.id, id),
    });

    if (!existing) throw new Error("Quotation not found");

    const isAdmin = user.roles.includes(ROLES.ADMIN);
    if (!isAdmin && existing.createdBy !== user.id) {
      throw new Error("Forbidden");
    }

    // 1. Update Quotation
    const [updated] = await tx
      .update(quotations)
      .set({
        customerId: data.customerId,
        title: data.title,
        subtotal: data.subtotal.toString(),
        discount: data.discount.toString(),
        discountType: data.discountType,
        vatRate: data.vatRate.toString(),
        vatAmount: data.vatAmount.toString(),
        otherFees: data.otherFees.toString(),
        totalAmount: data.totalAmount.toString(),
        status: data.status,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
        notes: data.notes,
        templateId: data.templateId,
        updatedAt: sql`now()`,
      })
      .where(eq(quotations.id, id))
      .returning();

    // 2. Replace Items
    await tx.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    if (data.items.length > 0) {
      await tx.insert(quotationItems).values(
        data.items.map((item, index) => ({
          quotationId: id,
          name: item.name,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity.toString(),
          unitPrice: item.unitPrice.toString(),
          amount: item.amount.toString(),
          sortOrder: index,
        }))
      );
    }

    // 3. Customer Activity
    await tx.insert(customerActivities).values({
      customerId: data.customerId,
      userId: user.id,
      type: "quote",
      description: `Đã cập nhật báo giá: ${existing.code}`,
    });

    // 4. Audit Log
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "UPDATE",
      module: "quotations",
      entityId: id,
      entityType: "quotation",
      oldData: existing,
      newData: updated,
    });

    revalidatePath(`/quotations/${id}`);
    revalidatePath("/quotations");
    return updated;
  });
}

export async function deleteQuotation(id: string) {
  const user = await requireAuth(PERMISSIONS.QUOTATIONS_DELETE);
  
  const existing = await db.query.quotations.findFirst({
    where: eq(quotations.id, id),
  });

  if (!existing) throw new Error("Quotation not found");

  await db.update(quotations).set({ deletedAt: new Date() }).where(eq(quotations.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "quotations",
    entityId: id,
    entityType: "quotation",
  });

  revalidatePath("/quotations");
  return { success: true };
}

export async function convertQuotationToContract(id: string) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_CREATE);

  return await db.transaction(async (tx) => {
    const quotation = await tx.query.quotations.findFirst({
      where: eq(quotations.id, id),
      with: { items: true },
    });

    if (!quotation) throw new Error("Quotation not found");
    if (quotation.status !== "approved") throw new Error("Only approved quotations can be converted");

    // Generate Contract Code
    const [{ count: currentCount }] = await tx
      .select({ count: count(contracts.id) })
      .from(contracts);
    const code = `HD${String(currentCount + 1).padStart(5, "0")}`;

    // Create Contract
    const [contract] = await tx
      .insert(contracts)
      .values({
        code,
        customerId: quotation.customerId,
        quotationId: quotation.id,
        title: `HĐ: ${quotation.title}`,
        totalAmount: quotation.totalAmount,
        status: "draft",
        notes: quotation.notes,
        createdBy: user.id,
      })
      .returning();

    // Create Contract Items
    if (quotation.items.length > 0) {
      await tx.insert(contractItems).values(
        quotation.items.map(item => ({
          contractId: contract.id,
          name: item.name,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          sortOrder: item.sortOrder,
        }))
      );
    }

    // Update Quotation Status
    await tx
      .update(quotations)
      .set({ status: "converted", updatedAt: sql`now()` })
      .where(eq(quotations.id, id));

    // Log Activity
    await tx.insert(customerActivities).values({
      customerId: quotation.customerId,
      userId: user.id,
      type: "note",
      description: `Báo giá ${quotation.code} đã được chuyển thành Hợp đồng ${code}`,
    });

    // Audit Log
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CONVERT",
      module: "quotations",
      entityId: id,
      entityType: "quotation",
      newData: contract,
    });

    revalidatePath(`/quotations/${id}`);
    revalidatePath("/quotations");
    
    return contract;
  });
}
