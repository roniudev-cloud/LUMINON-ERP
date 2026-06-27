"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import {  eq, desc, ilike, or, and, count, sql , isNull } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { ContractFormValues } from "@/lib/validations/contracts";
import { contracts, contractItems, contractPaymentTerms, contractSignatures } from "@db/schema/sales";
import { customerActivities } from "@db/schema/crm";
import { auditLogs } from "@db/schema/auth";
import { projects } from "@db/schema/projects";

export async function getContractOptions() {
  await requireAuth();
  return db.query.contracts.findMany({
    where: isNull(contracts.deletedAt),
    columns: { id: true, code: true },
    orderBy: [desc(contracts.createdAt)],
  });
}

export async function getContracts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_VIEW);
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions: any[] = [isNull(contracts.deletedAt)];

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin) {
    conditions.push(eq(contracts.createdBy, user.id));
  }

  if (params.search) {
    conditions.push(
      or(
        ilike(contracts.code, `%${params.search}%`),
        ilike(contracts.title, `%${params.search}%`)
      )
    );
  }

  if (params.status) {
    conditions.push(eq(contracts.status, params.status));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db
    .select({ value: count(contracts.id) })
    .from(contracts)
    .where(where);

  const data = await db.query.contracts.findMany({
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
    orderBy: [desc(contracts.createdAt)],
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

export const getContract = cache(async function getContract(id: string) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_VIEW);

  const contract = await db.query.contracts.findFirst({
    where: eq(contracts.id, id),
    with: {
      customer: {
        columns: {
          id: true,
          name: true,
          phone: true,
          email: true,
          address: true,
          taxCode: true,
        },
      },
      quotation: {
        columns: {
          id: true,
          code: true,
        }
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
      paymentTerms: {
        orderBy: (terms, { asc }) => [asc(terms.dueDate), asc(terms.id)], // Fallback order
      },
      signatures: true,
    },
  });

  if (!contract) throw new Error("Contract not found");

  const isAdmin = user.roles.includes(ROLES.ADMIN);
  if (!isAdmin && contract.createdBy !== user.id) {
    throw new Error("Forbidden: You can only view your own contracts");
  }

  return contract;
});

export async function createContract(data: ContractFormValues) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_CREATE);

  return await db.transaction(async (tx) => {
    // Generate Code
    const [{ count: currentCount }] = await tx
      .select({ count: count(contracts.id) })
      .from(contracts);
    const code = `HD${String(currentCount + 1).padStart(5, "0")}`;

    // 1. Create Contract
    const [contract] = await tx
      .insert(contracts)
      .values({
        code,
        customerId: data.customerId,
        quotationId: data.quotationId || null,
        title: data.title,
        type: data.type,
        constructionAddress: data.constructionAddress,
        subtotal: data.subtotal.toString(),
        discount: data.discount.toString(),
        discountType: data.discountType,
        vatRate: data.vatRate.toString(),
        vatAmount: data.vatAmount.toString(),
        totalAmount: data.totalAmount.toString(),
        paidAmount: data.paidAmount.toString(),
        status: data.status,
        signDate: data.signDate || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        paymentTermsContent: data.paymentTermsContent,
        executionTerms: data.executionTerms,
        warrantyTerms: data.warrantyTerms,
        acceptanceTerms: data.acceptanceTerms,
        notes: data.notes,
        internalNotes: data.internalNotes,
        templateId: data.templateId || null,
        createdBy: user.id,
      })
      .returning();

    // 2. Create Items
    if (data.items.length > 0) {
      await tx.insert(contractItems).values(
        data.items.map((item, index) => ({
          contractId: contract.id,
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

    // 3. Create Payment Terms
    if (data.paymentTerms && data.paymentTerms.length > 0) {
      await tx.insert(contractPaymentTerms).values(
        data.paymentTerms.map((term) => ({
          contractId: contract.id,
          name: term.name,
          percentage: term.percentage ? term.percentage.toString() : null,
          amount: term.amount.toString(),
          dueDate: term.dueDate || null,
          status: term.status,
        }))
      );
    }

    // 4. Customer Activity
    await tx.insert(customerActivities).values({
      customerId: data.customerId,
      userId: user.id,
      type: "contract",
      description: `Đã tạo hợp đồng mới: ${code} - ${data.title}`,
    });

    // 5. Audit Log
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE",
      module: "contracts",
      entityId: contract.id,
      entityType: "contract",
      newData: contract,
    });

    revalidatePath("/contracts");
    revalidatePath(`/customers/${data.customerId}`);
    return contract;
  });
}

export async function updateContract(id: string, data: ContractFormValues) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_UPDATE);

  return await db.transaction(async (tx) => {
    const existing = await tx.query.contracts.findFirst({
      where: eq(contracts.id, id),
    });

    if (!existing) throw new Error("Contract not found");

    const isAdmin = user.roles.includes(ROLES.ADMIN);
    if (!isAdmin && existing.createdBy !== user.id) {
      throw new Error("Forbidden");
    }

    // 1. Update Contract
    const [updated] = await tx
      .update(contracts)
      .set({
        customerId: data.customerId,
        quotationId: data.quotationId || null,
        title: data.title,
        type: data.type,
        constructionAddress: data.constructionAddress,
        subtotal: data.subtotal.toString(),
        discount: data.discount.toString(),
        discountType: data.discountType,
        vatRate: data.vatRate.toString(),
        vatAmount: data.vatAmount.toString(),
        totalAmount: data.totalAmount.toString(),
        paidAmount: data.paidAmount.toString(),
        status: data.status,
        signDate: data.signDate || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        paymentTermsContent: data.paymentTermsContent,
        executionTerms: data.executionTerms,
        warrantyTerms: data.warrantyTerms,
        acceptanceTerms: data.acceptanceTerms,
        notes: data.notes,
        internalNotes: data.internalNotes,
        templateId: data.templateId || null,
        updatedAt: sql`now()`,
      })
      .where(eq(contracts.id, id))
      .returning();

    // 2. Replace Items
    await tx.delete(contractItems).where(eq(contractItems.contractId, id));
    if (data.items.length > 0) {
      await tx.insert(contractItems).values(
        data.items.map((item, index) => ({
          contractId: id,
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

    // 3. Replace Payment Terms
    await tx.delete(contractPaymentTerms).where(eq(contractPaymentTerms.contractId, id));
    if (data.paymentTerms && data.paymentTerms.length > 0) {
      await tx.insert(contractPaymentTerms).values(
        data.paymentTerms.map((term) => ({
          contractId: id,
          name: term.name,
          percentage: term.percentage ? term.percentage.toString() : null,
          amount: term.amount.toString(),
          dueDate: term.dueDate || null,
          status: term.status,
        }))
      );
    }

    // 4. Customer Activity
    await tx.insert(customerActivities).values({
      customerId: data.customerId,
      userId: user.id,
      type: "contract",
      description: `Đã cập nhật hợp đồng: ${existing.code}`,
    });

    // 5. Audit Log
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "UPDATE",
      module: "contracts",
      entityId: id,
      entityType: "contract",
      oldData: existing,
      newData: updated,
    });

    revalidatePath(`/contracts/${id}`);
    revalidatePath("/contracts");
    return updated;
  });
}

export async function deleteContract(id: string) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_DELETE);
  
  const existing = await db.query.contracts.findFirst({
    where: eq(contracts.id, id),
  });

  if (!existing) throw new Error("Contract not found");

  await db.update(contracts).set({ deletedAt: new Date() }).where(eq(contracts.id, id));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "contracts",
    entityId: id,
    entityType: "contract",
  });

  revalidatePath("/contracts");
  return { success: true };
}

/** Hủy hợp đồng — bắt buộc lý do, không cho hủy lại hợp đồng đã hủy. */
export async function cancelContract(id: string, reason: string) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_UPDATE);

  const existing = await db.query.contracts.findFirst({ where: eq(contracts.id, id) });
  if (!existing) throw new Error("Không tìm thấy hợp đồng");
  if (existing.status === "cancelled") throw new Error("Hợp đồng này đã bị hủy trước đó");

  const cancelNote = `[HỦY ${new Date().toLocaleDateString("vi-VN")}] Lý do: ${reason}`;
  const [updated] = await db
    .update(contracts)
    .set({
      status: "cancelled",
      notes: existing.notes ? `${existing.notes}\n${cancelNote}` : cancelNote,
      updatedAt: sql`now()`,
    })
    .where(eq(contracts.id, id))
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CANCEL",
    module: "contracts",
    entityId: id,
    entityType: "contract",
    oldData: { status: existing.status },
    newData: { status: "cancelled", reason },
  });

  revalidatePath(`/contracts/${id}`);
  revalidatePath("/contracts");
  return updated;
}

export async function saveContractSignature(
  contractId: string,
  type: string,
  imageData: string,
  notes?: string
) {
  const user = await requireAuth(PERMISSIONS.CONTRACTS_VIEW); // Adjust permission if needed, maybe sign?

  return await db.transaction(async (tx) => {
    const contract = await tx.query.contracts.findFirst({
      where: eq(contracts.id, contractId),
    });

    if (!contract) throw new Error("Contract not found");

    const [signature] = await tx.insert(contractSignatures).values({
      contractId,
      userId: user.id,
      type,
      imageData,
      notes,
    }).returning();

    // Optionally update contract status to signed if all required signatures are present
    // For now we just log it
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "SIGN_CONTRACT",
      module: "contracts",
      entityId: contractId,
      entityType: "contract",
      newData: signature,
    });

    await tx.insert(customerActivities).values({
      customerId: contract.customerId,
      userId: user.id,
      type: "contract",
      description: `Đã ký điện tử hợp đồng: ${contract.code} (Loại: ${type})`,
    });

    revalidatePath(`/contracts/${contractId}`);
    return signature;
  });
}

export async function convertContractToProject(id: string) {
  const user = await requireAuth(PERMISSIONS.PROJECTS_CREATE);

  return await db.transaction(async (tx) => {
    const contract = await tx.query.contracts.findFirst({
      where: eq(contracts.id, id),
    });

    if (!contract) throw new Error("Contract not found");
    if (contract.status !== "signed" && contract.status !== "in_progress") {
      throw new Error("Only signed or in-progress contracts can be converted to a project");
    }

    // Generate Project Code
    const [{ count: currentCount }] = await tx
      .select({ count: count(projects.id) })
      .from(projects);
    const code = `CT${String(currentCount + 1).padStart(5, "0")}`;

    // Create Project
    const [project] = await tx
      .insert(projects)
      .values({
        code,
        name: `CT: ${contract.title}`,
        customerId: contract.customerId,
        contractId: contract.id,
        address: contract.constructionAddress,
        totalValue: contract.totalAmount,
        startDate: contract.startDate,
        expectedEndDate: contract.endDate,
        managerId: user.id, // Assign to current user or leave null
        createdBy: user.id,
      })
      .returning();

    // Log Activity
    await tx.insert(customerActivities).values({
      customerId: contract.customerId,
      userId: user.id,
      type: "project",
      description: `Hợp đồng ${contract.code} đã được chuyển thành Công trình ${code}`,
    });

    // Audit Log
    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CONVERT_TO_PROJECT",
      module: "contracts",
      entityId: id,
      entityType: "contract",
      newData: project,
    });

    revalidatePath(`/contracts/${id}`);
    revalidatePath("/projects");
    
    return project;
  });
}
