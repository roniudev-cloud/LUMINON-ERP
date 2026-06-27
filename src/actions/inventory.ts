"use server";

import { db } from "@/lib/db";
import { eq, desc, ilike, and, count, isNull, sql, lte } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import {
  materials,
  materialCategories,
  stockTickets,
  stockTicketItems,
  stockMovements,
} from "@db/schema/inventory";
import { auditLogs } from "@db/schema/auth";
import { generateCode, emptyToNull } from "@/lib/utils";
import type { MaterialFormValues, MaterialCategoryFormValues, StockTicketFormValues } from "@/lib/validations/inventory";

// ─── Materials ──────────────────────────────────────────────────────

export async function getMaterials(params: { search?: string } = {}) {
  await requireAuth(PERMISSIONS.INVENTORY_VIEW);
  const conditions = [isNull(materials.deletedAt)];
  if (params.search) conditions.push(ilike(materials.name, `%${params.search}%`));

  return db.query.materials.findMany({
    where: and(...conditions),
    with: { category: true, supplier: { columns: { id: true, name: true } } },
    orderBy: [desc(materials.createdAt)],
  });
}

export async function getLowStockMaterials() {
  await requireAuth(PERMISSIONS.INVENTORY_VIEW);
  return db.query.materials.findMany({
    where: and(isNull(materials.deletedAt), lte(materials.currentStock, materials.minStock)),
    orderBy: [desc(materials.currentStock)],
  });
}

export async function getMaterialCategories() {
  await requireAuth();
  return db.query.materialCategories.findMany({
    where: isNull(materialCategories.deletedAt),
    orderBy: [desc(materialCategories.name)],
  });
}

export async function createMaterialCategory(data: MaterialCategoryFormValues) {
  const user = await requireAuth(PERMISSIONS.INVENTORY_CREATE);
  const [category] = await db.insert(materialCategories).values(data).returning();
  revalidatePath("/inventory");
  return category;
}

export async function createMaterial(data: MaterialFormValues) {
  const user = await requireAuth(PERMISSIONS.INVENTORY_CREATE);

  const [{ count: currentCount }] = await db.select({ count: count(materials.id) }).from(materials);
  const code = generateCode("VT", currentCount + 1);

  const [material] = await db
    .insert(materials)
    .values({
      ...data,
      code,
      categoryId: emptyToNull(data.categoryId),
      supplierId: emptyToNull(data.supplierId),
      unitPrice: data.unitPrice.toString(),
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "inventory",
    entityId: material.id,
    entityType: "material",
    newData: material,
  });

  revalidatePath("/inventory");
  return material;
}

export async function updateMaterial(id: string, data: MaterialFormValues) {
  const user = await requireAuth(PERMISSIONS.INVENTORY_UPDATE);

  const existing = await db.query.materials.findFirst({ where: eq(materials.id, id) });
  if (!existing) throw new Error("Không tìm thấy vật tư");

  const [updated] = await db
    .update(materials)
    .set({
      ...data,
      categoryId: emptyToNull(data.categoryId),
      supplierId: emptyToNull(data.supplierId),
      unitPrice: data.unitPrice.toString(),
      updatedAt: sql`now()`,
    })
    .where(eq(materials.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "inventory",
    entityId: id,
    entityType: "material",
    oldData: existing,
    newData: updated,
  });

  revalidatePath("/inventory");
  return updated;
}

export async function deleteMaterial(id: string) {
  const user = await requireAuth(PERMISSIONS.INVENTORY_DELETE);
  await db.update(materials).set({ deletedAt: sql`now()` }).where(eq(materials.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "inventory",
    entityId: id,
    entityType: "material",
  });

  revalidatePath("/inventory");
  return { success: true };
}

// ─── Stock Tickets (Nhập / Xuất kho) ────────────────────────────────

export async function getStockTickets(params: { type?: "IN" | "OUT"; projectId?: string } = {}) {
  await requireAuth(PERMISSIONS.INVENTORY_MOVEMENTS_VIEW);
  const conditions = [isNull(stockTickets.deletedAt)];
  if (params.type) conditions.push(eq(stockTickets.type, params.type));
  if (params.projectId) conditions.push(eq(stockTickets.projectId, params.projectId));

  return db.query.stockTickets.findMany({
    where: and(...conditions),
    with: {
      supplier: { columns: { id: true, name: true } },
      project: { columns: { id: true, name: true, code: true } },
      createdByUser: { columns: { id: true, fullName: true } },
      items: { with: { material: { columns: { id: true, name: true, unit: true } } } },
    },
    orderBy: [desc(stockTickets.date)],
  });
}

/** Tổng vật tư đã xuất cho 1 công trình cụ thể — dùng để hiển thị "Vật tư đã dùng" trên trang chi tiết công trình. */
export async function getProjectMaterialUsage(projectId: string) {
  await requireAuth();

  const rows = await db
    .select({
      materialId: stockTicketItems.materialId,
      materialName: materials.name,
      unit: materials.unit,
      quantity: sql<string>`sum(${stockTicketItems.quantity})`,
      totalAmount: sql<string>`sum(${stockTicketItems.totalAmount})`,
    })
    .from(stockTicketItems)
    .innerJoin(stockTickets, eq(stockTicketItems.ticketId, stockTickets.id))
    .innerJoin(materials, eq(stockTicketItems.materialId, materials.id))
    .where(and(eq(stockTickets.projectId, projectId), eq(stockTickets.type, "OUT"), isNull(stockTickets.deletedAt)))
    .groupBy(stockTicketItems.materialId, materials.name, materials.unit);

  return rows.map((r) => ({
    materialId: r.materialId,
    materialName: r.materialName,
    unit: r.unit,
    quantity: Number(r.quantity),
    totalAmount: Number(r.totalAmount),
  }));
}

/**
 * Tạo phiếu nhập/xuất kho: ghi stock_tickets + stock_ticket_items + stock_movements (audit),
 * và cập nhật currentStock của từng vật tư trong 1 transaction.
 */
export async function createStockTicket(data: StockTicketFormValues) {
  const user = await requireAuth(
    data.type === "IN" ? PERMISSIONS.INVENTORY_STOCK_IN_CREATE : PERMISSIONS.INVENTORY_STOCK_OUT_CREATE
  );

  return await db.transaction(async (tx) => {
    const [{ count: currentCount }] = await tx.select({ count: count(stockTickets.id) }).from(stockTickets);
    const code = generateCode(data.type === "IN" ? "PNK" : "PXK", currentCount + 1);

    const totalAmount = data.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

    const [ticket] = await tx
      .insert(stockTickets)
      .values({
        code,
        type: data.type,
        date: data.date,
        supplierId: emptyToNull(data.supplierId),
        projectId: emptyToNull(data.projectId),
        delivererName: data.delivererName,
        receiverName: data.receiverName,
        totalAmount: totalAmount.toString(),
        notes: data.notes,
        createdBy: user.id,
      })
      .returning();

    for (const item of data.items) {
      const material = await tx.query.materials.findFirst({ where: eq(materials.id, item.materialId) });
      if (!material) throw new Error("Không tìm thấy vật tư trong phiếu");

      const balanceBefore = material.currentStock;
      const delta = data.type === "IN" ? item.quantity : -item.quantity;
      const balanceAfter = balanceBefore + delta;

      if (data.type === "OUT" && balanceAfter < 0) {
        throw new Error(`Vật tư "${material.name}" không đủ tồn kho (còn ${balanceBefore}, cần xuất ${item.quantity}).`);
      }

      await tx.insert(stockTicketItems).values({
        ticketId: ticket.id,
        materialId: item.materialId,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalAmount: (item.quantity * item.unitPrice).toString(),
      });

      await tx.insert(stockMovements).values({
        materialId: item.materialId,
        type: data.type,
        quantity: item.quantity,
        balanceBefore,
        balanceAfter,
        referenceId: ticket.id,
        referenceType: "stock_ticket",
        date: data.date,
      });

      await tx.update(materials).set({ currentStock: balanceAfter, updatedAt: sql`now()` }).where(eq(materials.id, item.materialId));
    }

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE",
      module: "inventory",
      entityId: ticket.id,
      entityType: "stock_ticket",
      newData: ticket,
    });

    revalidatePath("/inventory");
    return ticket;
  });
}
