"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { eq, desc, ilike, or, and, count, sql, sum } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import type { ReceiptFormValues, PaymentFormValues } from "@/lib/validations/finance";
import { receipts, payments, financeFiles, customerDebts, supplierDebts } from "@db/schema/finance";
import { contracts } from "@db/schema/sales";
import { customerActivities } from "@db/schema/crm";
import { auditLogs } from "@db/schema/auth";

export async function getReceipts(params: { page?: number; pageSize?: number; search?: string }) {
  const user = await requireAuth("receipts.view");
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(receipts.code, `%${params.search}%`),
        ilike(receipts.submitterName, `%${params.search}%`),
        ilike(receipts.description, `%${params.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db.select({ value: count(receipts.id) }).from(receipts).where(where);

  const data = await db.query.receipts.findMany({
    where,
    with: {
      customer: { columns: { id: true, name: true, phone: true } },
      project: { columns: { id: true, code: true, name: true } },
      createdByUser: { columns: { id: true, fullName: true } },
    },
    orderBy: [desc(receipts.createdAt)],
    limit: pageSize,
    offset,
  });

  return { data, total: totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function createReceipt(data: ReceiptFormValues) {
  const user = await requireAuth("receipts.create");

  return await db.transaction(async (tx) => {
    const [{ count: currentCount }] = await tx.select({ count: count(receipts.id) }).from(receipts);
    const code = `PT${String(currentCount + 1).padStart(5, "0")}`;

    const [receipt] = await tx.insert(receipts).values({
      code,
      customerId: data.customerId,
      projectId: data.projectId || null,
      contractId: data.contractId || null,
      paymentTermId: data.paymentTermId || null,
      amount: data.amount.toString(),
      type: data.type,
      paymentMethod: data.paymentMethod,
      date: data.date,
      submitterName: data.submitterName,
      description: data.description,
      createdBy: user.id,
    }).returning();

    // Lọc bỏ prefix "data:image/jpeg;base64," và xử lý upload base64 vào DB
    if (data.files && data.files.length > 0) {
      await tx.insert(financeFiles).values(
        data.files.map((imgUrl) => ({
          receiptId: receipt.id,
          uploadedById: user.id,
          fileType: imgUrl.startsWith("data:image") ? "image" : "document",
          fileUrl: imgUrl,
          fileName: "Chứng từ Phiếu Thu",
        }))
      );
    }

    // Cập nhật Customer Debts
    const existingDebt = await tx.query.customerDebts.findFirst({
      where: eq(customerDebts.customerId, data.customerId),
    });

    if (existingDebt) {
      const newPaidAmount = Number(existingDebt.paidAmount) + Number(data.amount);
      const newRemainingAmount = Number(existingDebt.totalAmount) - newPaidAmount;
      const newStatus = newRemainingAmount <= 0 ? "paid" : "partial";

      await tx.update(customerDebts)
        .set({
          paidAmount: newPaidAmount.toString(),
          remainingAmount: newRemainingAmount.toString(),
          status: newStatus,
          lastPaymentDate: data.date,
          updatedAt: sql`now()`,
        })
        .where(eq(customerDebts.id, existingDebt.id));
    } else if (data.contractId || data.projectId) {
      // Logic khởi tạo công nợ có thể đã có khi tạo Hợp đồng, nhưng dự phòng:
      await tx.insert(customerDebts).values({
        customerId: data.customerId,
        contractId: data.contractId || null,
        projectId: data.projectId || null,
        totalAmount: "0",
        paidAmount: data.amount.toString(),
        remainingAmount: `-${data.amount}`,
        status: "partial",
        lastPaymentDate: data.date,
      });
    }

    // Ghi Log Customer Activity
    await tx.insert(customerActivities).values({
      customerId: data.customerId,
      userId: user.id,
      type: "receipt",
      description: `Đã thu tiền (Phiếu thu: ${code}): ${Number(data.amount).toLocaleString()} VNĐ`,
    });

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE",
      module: "receipts",
      entityId: receipt.id,
      entityType: "receipt",
    });

    revalidatePath("/receipts");
    revalidatePath("/finance/overview");
    return receipt;
  });
}

export async function getPayments(params: { page?: number; pageSize?: number; search?: string }) {
  const user = await requireAuth("payments.view");
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        ilike(payments.code, `%${params.search}%`),
        ilike(payments.receiverName, `%${params.search}%`),
        ilike(payments.description, `%${params.search}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ value: totalCount }] = await db.select({ value: count(payments.id) }).from(payments).where(where);

  const data = await db.query.payments.findMany({
    where,
    with: {
      project: { columns: { id: true, code: true, name: true } },
      createdByUser: { columns: { id: true, fullName: true } },
    },
    orderBy: [desc(payments.createdAt)],
    limit: pageSize,
    offset,
  });

  return { data, total: totalCount, page, pageSize, totalPages: Math.ceil(totalCount / pageSize) };
}

export async function createPayment(data: PaymentFormValues) {
  const user = await requireAuth("payments.create");

  return await db.transaction(async (tx) => {
    const [{ count: currentCount }] = await tx.select({ count: count(payments.id) }).from(payments);
    const code = `PC${String(currentCount + 1).padStart(5, "0")}`;

    const [payment] = await tx.insert(payments).values({
      code,
      projectId: data.projectId || null,
      supplierId: data.supplierId || null,
      supplierName: data.supplierName || null,
      receiverName: data.receiverName,
      category: data.category,
      amount: data.amount.toString(),
      paymentMethod: data.paymentMethod,
      date: data.date,
      description: data.description,
      createdBy: user.id,
    }).returning();

    if (data.files && data.files.length > 0) {
      await tx.insert(financeFiles).values(
        data.files.map((imgUrl) => ({
          paymentId: payment.id,
          uploadedById: user.id,
          fileType: imgUrl.startsWith("data:image") ? "image" : "document",
          fileUrl: imgUrl,
          fileName: "Chứng từ Phiếu Chi",
        }))
      );
    }

    // Lưu ý: chi phí thực tế công trình KHÔNG lưu vào cột `projects.actualCost` nữa —
    // tính real-time từ payments/project_costs/vật tư/lương thợ qua getProjectFinancials()
    // để tránh trôi số liệu khi phiếu chi bị sửa/xóa sau này.

    // Cập nhật Công nợ Nhà cung cấp (nếu phiếu chi gắn với một NCC)
    if (data.supplierId || data.supplierName) {
      const existingSupplierDebt = await tx.query.supplierDebts.findFirst({
        where: data.supplierId
          ? eq(supplierDebts.supplierId, data.supplierId)
          : eq(supplierDebts.supplierName, data.supplierName!),
      });

      if (existingSupplierDebt) {
        const newPaidAmount = Number(existingSupplierDebt.paidAmount) + Number(data.amount);
        const newTotalAmount = Number(existingSupplierDebt.totalAmount) + Number(data.amount);

        await tx.update(supplierDebts)
          .set({
            totalAmount: newTotalAmount.toString(),
            paidAmount: newPaidAmount.toString(),
            remainingAmount: "0",
            status: "paid",
            updatedAt: sql`now()`,
          })
          .where(eq(supplierDebts.id, existingSupplierDebt.id));
      } else {
        await tx.insert(supplierDebts).values({
          supplierId: data.supplierId || null,
          supplierName: data.supplierName || "Không xác định",
          totalAmount: data.amount.toString(),
          paidAmount: data.amount.toString(),
          remainingAmount: "0",
          status: "paid",
        });
      }
    }

    await tx.insert(auditLogs).values({
      userId: user.id,
      action: "CREATE",
      module: "payments",
      entityId: payment.id,
      entityType: "payment",
    });

    revalidatePath("/payments");
    revalidatePath("/finance/overview");
    revalidatePath("/debts");
    return payment;
  });
}

export async function getCustomerDebts() {
  await requireAuth("customer_debts.view");
  
  const debts = await db.query.customerDebts.findMany({
    with: {
      customer: { columns: { id: true, name: true, phone: true } },
      contract: { columns: { id: true, code: true } },
      project: { columns: { id: true, code: true, name: true } },
    },
    orderBy: [desc(customerDebts.remainingAmount)],
  });
  
  return debts;
}

export async function getFinanceOverview() {
  await requireAuth("finance.view");
  
  // Tính tổng thu
  const [{ value: totalReceipts }] = await db.select({ value: sum(receipts.amount) }).from(receipts);
  
  // Tính tổng chi
  const [{ value: totalPayments }] = await db.select({ value: sum(payments.amount) }).from(payments);
  
  // Tính công nợ phải thu
  const [{ value: totalReceivables }] = await db.select({ value: sum(customerDebts.remainingAmount) }).from(customerDebts);
  
  // 5 phiếu thu gần nhất
  const recentReceipts = await db.query.receipts.findMany({
    with: { customer: { columns: { name: true } } },
    orderBy: [desc(receipts.createdAt)],
    limit: 5,
  });

  // 5 phiếu chi gần nhất
  const recentPayments = await db.query.payments.findMany({
    orderBy: [desc(payments.createdAt)],
    limit: 5,
  });

  return {
    totalReceipts: Number(totalReceipts || 0),
    totalPayments: Number(totalPayments || 0),
    totalReceivables: Number(totalReceivables || 0),
    recentReceipts,
    recentPayments,
  };
}

export const getReceipt = cache(async function getReceipt(id: string) {
  const user = await requireAuth("receipts.view");
  const data = await db.query.receipts.findFirst({
    where: eq(receipts.id, id),
    with: {
      customer: true,
      project: true,
      contract: true,
      createdByUser: true,
      files: true,
    },
  });
  if (!data) throw new Error("Không tìm thấy phiếu thu");
  return data;
});

export const getPayment = cache(async function getPayment(id: string) {
  const user = await requireAuth("payments.view");
  const data = await db.query.payments.findFirst({
    where: eq(payments.id, id),
    with: {
      project: true,
      createdByUser: true,
      files: true,
    },
  });
  if (!data) throw new Error("Không tìm thấy phiếu chi");
  return data;
});

// --- Cascade lookups: lấy HĐ / CT theo khách hàng ---

export async function getContractsByCustomer(customerId: string) {
  await requireAuth();
  const data = await db.query.contracts.findMany({
    where: eq(contracts.customerId, customerId),
    columns: { id: true, code: true },
    orderBy: [desc(contracts.createdAt)],
  });
  return data;
}

export async function getProjectsByCustomer(customerId: string) {
  const { projects } = await import("@db/schema/projects");
  await requireAuth();
  const data = await db.query.projects.findMany({
    where: eq(projects.customerId, customerId),
    columns: { id: true, name: true, code: true },
    orderBy: [desc(projects.createdAt)],
  });
  return data;
}
