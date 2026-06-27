"use server";

import { db } from "@/lib/db";
import { sql, isNull, desc, eq, and, gte, lte } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { receipts, payments } from "@db/schema/finance";
import { projects, projectCosts } from "@db/schema/projects";
import { contracts, quotations } from "@db/schema/sales";
import { customers } from "@db/schema/crm";
import { users } from "@db/schema/auth";
import { stockTickets, stockTicketItems } from "@db/schema/inventory";
import { workerPayments } from "@db/schema/workers";

export type ReportGranularity = "day" | "week" | "month";

const GRANULARITY_LIMIT: Record<ReportGranularity, number> = {
  day: 30,
  week: 12,
  month: 12,
};

const GRANULARITY_FORMAT: Record<ReportGranularity, string> = {
  day: "YYYY-MM-DD",
  week: "IYYY-IW", // ISO năm-tuần, vd 2026-W26
  month: "YYYY-MM",
};

/**
 * Doanh thu/chi phí/lợi nhuận theo ngày/tuần/tháng. Dùng SQL aggregate, không load full row.
 * Nếu truyền `fromDate`/`toDate` (yyyy-mm-dd) thì lọc đúng khoảng đó, bỏ qua giới hạn N kỳ gần nhất.
 */
export async function getRevenueReport(
  granularity: ReportGranularity = "month",
  range?: { fromDate?: string; toDate?: string }
) {
  await requireAuth(PERMISSIONS.REPORTS_VIEW);
  const fmt = GRANULARITY_FORMAT[granularity];

  const receiptConditions = [isNull(receipts.deletedAt)];
  if (range?.fromDate) receiptConditions.push(gte(receipts.date, range.fromDate));
  if (range?.toDate) receiptConditions.push(lte(receipts.date, range.toDate));

  const paymentConditions = [isNull(payments.deletedAt)];
  if (range?.fromDate) paymentConditions.push(gte(payments.date, range.fromDate));
  if (range?.toDate) paymentConditions.push(lte(payments.date, range.toDate));

  const periodCol = sql<string>`to_char(${receipts.date}, ${fmt})`.as("period");
  const revenueByPeriod = await db
    .select({
      period: periodCol,
      total: sql<string>`coalesce(sum(${receipts.amount}), 0)`.as("total"),
    })
    .from(receipts)
    .where(and(...receiptConditions))
    .groupBy(periodCol)
    .orderBy(periodCol);

  const expensePeriodCol = sql<string>`to_char(${payments.date}, ${fmt})`.as("period");
  const expenseByPeriod = await db
    .select({
      period: expensePeriodCol,
      total: sql<string>`coalesce(sum(${payments.amount}), 0)`.as("total"),
    })
    .from(payments)
    .where(and(...paymentConditions))
    .groupBy(expensePeriodCol)
    .orderBy(expensePeriodCol);

  const periods = new Set<string>([
    ...revenueByPeriod.map((r) => r.period),
    ...expenseByPeriod.map((r) => r.period),
  ]);

  const revenueMap = new Map(revenueByPeriod.map((r) => [r.period, Number(r.total)]));
  const expenseMap = new Map(expenseByPeriod.map((r) => [r.period, Number(r.total)]));

  const sortedPeriods = Array.from(periods).sort();
  const limited = range?.fromDate || range?.toDate ? sortedPeriods : sortedPeriods.slice(-GRANULARITY_LIMIT[granularity]);

  return limited.map((period) => {
    const revenue = revenueMap.get(period) || 0;
    const expense = expenseMap.get(period) || 0;
    return { month: period, revenue, expense, profit: revenue - expense };
  });
}

/** @deprecated dùng getRevenueReport("month") — giữ lại để tương thích code cũ. */
export async function getMonthlyReport() {
  return getRevenueReport("month");
}

/** Lời/lỗ theo công trình — chi phí tính từ dữ liệu thật (phiếu chi, vật tư xuất kho, lương thợ, chi phí khác), không dùng `actualCost` gõ tay. */
export async function getProjectReport() {
  await requireAuth(PERMISSIONS.REPORTS_PROJECTS_VIEW);

  const rows = await db
    .select({
      id: projects.id,
      code: projects.code,
      name: projects.name,
      status: projects.status,
      progress: projects.progress,
      totalValue: projects.totalValue,
      customerName: customers.name,
    })
    .from(projects)
    .leftJoin(customers, eq(projects.customerId, customers.id))
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.createdAt));

  const [materialsByProject, laborByProject, otherCostsByProject, paymentsByProject] = await Promise.all([
    db
      .select({ projectId: stockTickets.projectId, total: sql<string>`sum(${stockTicketItems.totalAmount})` })
      .from(stockTicketItems)
      .innerJoin(stockTickets, eq(stockTicketItems.ticketId, stockTickets.id))
      .where(and(isNull(stockTickets.deletedAt), eq(stockTickets.type, "OUT"), sql`${stockTickets.projectId} is not null`))
      .groupBy(stockTickets.projectId),
    db
      .select({ projectId: workerPayments.projectId, total: sql<string>`sum(${workerPayments.totalAmount})` })
      .from(workerPayments)
      .where(and(isNull(workerPayments.deletedAt), sql`${workerPayments.projectId} is not null`))
      .groupBy(workerPayments.projectId),
    db
      .select({ projectId: projectCosts.projectId, total: sql<string>`sum(${projectCosts.amount})` })
      .from(projectCosts)
      .where(isNull(projectCosts.deletedAt))
      .groupBy(projectCosts.projectId),
    db
      .select({ projectId: payments.projectId, total: sql<string>`sum(${payments.amount})` })
      .from(payments)
      .where(and(isNull(payments.deletedAt), sql`${payments.projectId} is not null`))
      .groupBy(payments.projectId),
  ]);

  const materialsMap = new Map(materialsByProject.map((r) => [r.projectId, Number(r.total)]));
  const laborMap = new Map(laborByProject.map((r) => [r.projectId, Number(r.total)]));
  const otherCostsMap = new Map(otherCostsByProject.map((r) => [r.projectId, Number(r.total)]));
  const paymentsMap = new Map(paymentsByProject.map((r) => [r.projectId, Number(r.total)]));

  return rows.map((p) => {
    const actualCost = (materialsMap.get(p.id) || 0) + (laborMap.get(p.id) || 0) + (otherCostsMap.get(p.id) || 0) + (paymentsMap.get(p.id) || 0);
    const totalValue = Number(p.totalValue) || 0;
    return { ...p, totalValue, actualCost, profit: totalValue - actualCost };
  });
}

/** Tổng doanh số theo khách hàng (dựa trên giá trị hợp đồng). */
export async function getCustomerReport() {
  await requireAuth(PERMISSIONS.REPORTS_CUSTOMERS_VIEW);

  const rows = await db
    .select({
      customerId: contracts.customerId,
      customerName: customers.name,
      contractCount: sql<string>`count(${contracts.id})`.as("contract_count"),
      totalValue: sql<string>`coalesce(sum(${contracts.totalAmount}), 0)`.as("total_value"),
      totalPaid: sql<string>`coalesce(sum(${contracts.paidAmount}), 0)`.as("total_paid"),
    })
    .from(contracts)
    .leftJoin(customers, eq(contracts.customerId, customers.id))
    .where(isNull(contracts.deletedAt))
    .groupBy(contracts.customerId, customers.name)
    .orderBy(sql`coalesce(sum(${contracts.totalAmount}), 0) desc`);

  return rows.map((r) => ({
    customerId: r.customerId,
    customerName: r.customerName || "—",
    contractCount: Number(r.contractCount),
    totalValue: Number(r.totalValue),
    totalPaid: Number(r.totalPaid),
  }));
}

/** Doanh số và tỷ lệ chốt theo nhân viên kinh doanh. */
export async function getEmployeeReport() {
  await requireAuth(PERMISSIONS.REPORTS_EMPLOYEES_VIEW);

  const quoteStats = await db
    .select({
      employeeId: quotations.createdBy,
      totalQuotes: sql<string>`count(${quotations.id})`.as("total_quotes"),
      convertedQuotes: sql<string>`count(${quotations.id}) filter (where ${quotations.status} = 'converted')`.as(
        "converted_quotes"
      ),
    })
    .from(quotations)
    .where(isNull(quotations.deletedAt))
    .groupBy(quotations.createdBy);

  const contractStats = await db
    .select({
      employeeId: contracts.createdBy,
      totalValue: sql<string>`coalesce(sum(${contracts.totalAmount}), 0)`.as("total_value"),
    })
    .from(contracts)
    .where(isNull(contracts.deletedAt))
    .groupBy(contracts.createdBy);

  const employeeIds = new Set<string>(
    [...quoteStats.map((q) => q.employeeId), ...contractStats.map((c) => c.employeeId)].filter(
      (id): id is string => !!id
    )
  );

  if (employeeIds.size === 0) return [];

  const employees = await db.query.users.findMany({
    where: (u, { inArray }) => inArray(u.id, Array.from(employeeIds)),
    columns: { id: true, fullName: true, email: true },
  });

  const quoteMap = new Map(quoteStats.map((q) => [q.employeeId, q]));
  const contractMap = new Map(contractStats.map((c) => [c.employeeId, c]));

  return employees
    .map((e) => {
      const q = quoteMap.get(e.id);
      const c = contractMap.get(e.id);
      const totalQuotes = Number(q?.totalQuotes) || 0;
      const convertedQuotes = Number(q?.convertedQuotes) || 0;
      return {
        employeeId: e.id,
        employeeName: e.fullName || e.email,
        totalQuotes,
        convertedQuotes,
        conversionRate: totalQuotes > 0 ? Math.round((convertedQuotes / totalQuotes) * 100) : 0,
        totalContractValue: Number(c?.totalValue) || 0,
      };
    })
    .sort((a, b) => b.totalContractValue - a.totalContractValue);
}
