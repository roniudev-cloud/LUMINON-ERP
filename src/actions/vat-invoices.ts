"use server";

import { db } from "@/lib/db";
import { eq, desc, ilike, and, count, isNull, sql } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { vatInvoices } from "@db/schema/finance";
import { auditLogs } from "@db/schema/auth";
import { generateCode, emptyToNull } from "@/lib/utils";
import type { VatInvoiceFormValues } from "@/lib/validations/vat-invoices";

export async function getVatInvoices(params: { page?: number; pageSize?: number; search?: string } = {}) {
  await requireAuth(PERMISSIONS.VAT_INVOICES_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const conditions = [isNull(vatInvoices.deletedAt)];
  if (params.search) {
    conditions.push(ilike(vatInvoices.code, `%${params.search}%`));
  }
  const where = and(...conditions);

  const [{ value: totalCount }] = await db
    .select({ value: count(vatInvoices.id) })
    .from(vatInvoices)
    .where(where);

  const data = await db.query.vatInvoices.findMany({
    where,
    with: { customer: { columns: { id: true, name: true } } },
    orderBy: [desc(vatInvoices.issueDate)],
    limit: pageSize,
    offset,
  });

  return { data, total: totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function createVatInvoice(data: VatInvoiceFormValues) {
  const user = await requireAuth(PERMISSIONS.VAT_INVOICES_CREATE);

  const [invoice] = await db
    .insert(vatInvoices)
    .values({
      ...data,
      customerId: emptyToNull(data.customerId),
      supplierId: emptyToNull(data.supplierId),
      amount: data.amount.toString(),
      vatRate: data.vatRate.toString(),
      vatAmount: data.vatAmount.toString(),
      totalAmount: data.totalAmount.toString(),
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "vat_invoices",
    entityId: invoice.id,
    entityType: "vat_invoice",
    newData: invoice,
  });

  revalidatePath("/vat-invoices");
  return invoice;
}

export async function updateVatInvoice(id: string, data: VatInvoiceFormValues) {
  const user = await requireAuth(PERMISSIONS.VAT_INVOICES_CREATE);

  const existing = await db.query.vatInvoices.findFirst({ where: eq(vatInvoices.id, id) });
  if (!existing) throw new Error("Không tìm thấy hóa đơn VAT");

  const [updated] = await db
    .update(vatInvoices)
    .set({
      ...data,
      customerId: emptyToNull(data.customerId),
      supplierId: emptyToNull(data.supplierId),
      amount: data.amount.toString(),
      vatRate: data.vatRate.toString(),
      vatAmount: data.vatAmount.toString(),
      totalAmount: data.totalAmount.toString(),
    })
    .where(eq(vatInvoices.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "vat_invoices",
    entityId: id,
    entityType: "vat_invoice",
    oldData: existing,
    newData: updated,
  });

  revalidatePath("/vat-invoices");
  return updated;
}

export async function deleteVatInvoice(id: string) {
  const user = await requireAuth(PERMISSIONS.VAT_INVOICES_CREATE);

  await db.update(vatInvoices).set({ deletedAt: sql`now()` }).where(eq(vatInvoices.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "vat_invoices",
    entityId: id,
    entityType: "vat_invoice",
  });

  revalidatePath("/vat-invoices");
  return { success: true };
}
