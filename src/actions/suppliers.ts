"use server";

import { db } from "@/lib/db";
import { eq, desc, ilike, or, and, count, sql, isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { suppliers } from "@db/schema/inventory";
import { auditLogs } from "@db/schema/auth";
import type { SupplierFormValues } from "@/lib/validations/suppliers";
import { generateCode, emptyToNull } from "@/lib/utils";

export async function getSuppliers(params: { page?: number; pageSize?: number; search?: string }) {
  const user = await requireAuth(PERMISSIONS.SUPPLIERS_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const conditions = [isNull(suppliers.deletedAt)];

  if (user.companyId) {
    conditions.push(eq(suppliers.companyId, user.companyId));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(suppliers.name, `%${params.search}%`),
        ilike(suppliers.code, `%${params.search}%`),
        ilike(suppliers.phone, `%${params.search}%`)
      )!
    );
  }

  const where = and(...conditions);

  const [{ value: totalCount }] = await db
    .select({ value: count(suppliers.id) })
    .from(suppliers)
    .where(where);

  const data = await db.query.suppliers.findMany({
    where,
    orderBy: [desc(suppliers.createdAt)],
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

/** Danh sách gọn cho dropdown chọn nhà cung cấp ở các form khác (Phiếu chi, Kho vật tư). */
export async function getSupplierOptions() {
  await requireAuth();
  const conditions = [isNull(suppliers.deletedAt), eq(suppliers.status, "active")];
  return db.query.suppliers.findMany({
    where: and(...conditions),
    columns: { id: true, name: true, code: true },
    orderBy: [desc(suppliers.createdAt)],
  });
}

export async function createSupplier(data: SupplierFormValues) {
  const user = await requireAuth(PERMISSIONS.SUPPLIERS_CREATE);

  const [{ count: currentCount }] = await db
    .select({ count: count(suppliers.id) })
    .from(suppliers);
  const code = generateCode("NCC", currentCount + 1);

  const [supplier] = await db
    .insert(suppliers)
    .values({
      ...data,
      code,
      companyId: user.companyId,
      email: emptyToNull(data.email),
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "suppliers",
    entityId: supplier.id,
    entityType: "supplier",
    newData: supplier,
  });

  revalidatePath("/suppliers");
  return supplier;
}

export async function updateSupplier(id: string, data: SupplierFormValues) {
  const user = await requireAuth(PERMISSIONS.SUPPLIERS_UPDATE);

  const existing = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
  if (!existing) throw new Error("Không tìm thấy nhà cung cấp");

  const [updated] = await db
    .update(suppliers)
    .set({
      ...data,
      email: emptyToNull(data.email),
      updatedAt: sql`now()`,
    })
    .where(eq(suppliers.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "suppliers",
    entityId: id,
    entityType: "supplier",
    oldData: existing,
    newData: updated,
  });

  revalidatePath("/suppliers");
  return updated;
}

export async function deleteSupplier(id: string) {
  const user = await requireAuth(PERMISSIONS.SUPPLIERS_DELETE);

  await db.update(suppliers).set({ deletedAt: sql`now()` }).where(eq(suppliers.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "suppliers",
    entityId: id,
    entityType: "supplier",
  });

  revalidatePath("/suppliers");
  return { success: true };
}
