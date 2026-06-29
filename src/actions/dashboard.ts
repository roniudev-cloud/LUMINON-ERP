"use server";

import { db } from "@/lib/db";
import { count, eq, sum, sql, desc, or, isNull, and, lte } from "drizzle-orm";
import { requireAuth } from "./auth";
import { ROLES } from "@/lib/constants";
import { customers, leads } from "@db/schema/crm";
import { quotations, contracts } from "@db/schema/sales";
import { projects, projectCosts } from "@db/schema/projects";
import { receipts, payments, customerDebts, supplierDebts } from "@db/schema/finance";
import { materials, stockTickets, stockTicketItems } from "@db/schema/inventory";
import { workerPayments } from "@db/schema/workers";
import { tasks } from "@db/schema/productivity";
import { auditLogs } from "@db/schema/auth";
import { after } from "next/server";
import { runOverdueChecks } from "@/lib/services/notifications";

export async function triggerDashboardBackgroundTasks() {
  after(() => runOverdueChecks());
}

export async function getCrmStats() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isManager = user.roles.includes(ROLES.MANAGER);
  const isSales = user.roles.includes(ROLES.SALES);

  if (!(isAdmin || isManager || isSales)) return null;

  const custBaseParams = isSales && !isAdmin && !isManager
    ? or(eq(customers.assignedToId, user.id), eq(customers.createdBy, user.id))
    : undefined;
  const leadBaseParams = isSales && !isAdmin && !isManager
    ? or(eq(leads.assignedToId, user.id), eq(leads.createdBy, user.id))
    : undefined;
  const quoteBaseParams = isSales && !isAdmin && !isManager
    ? eq(quotations.createdBy, user.id)
    : undefined;

  const [[{ totalCustomers }], [{ newLeads }], [{ totalQuotations }], [{ totalContracts }]] = await Promise.all([
    db.select({ totalCustomers: count(customers.id) }).from(customers)
      .where(custBaseParams ? and(isNull(customers.deletedAt), custBaseParams) : isNull(customers.deletedAt)),
    db.select({ newLeads: count(leads.id) }).from(leads)
      .where(leadBaseParams
        ? and(isNull(leads.deletedAt), eq(leads.status, "new"), leadBaseParams)
        : and(isNull(leads.deletedAt), eq(leads.status, "new"))),
    db.select({ totalQuotations: count(quotations.id) }).from(quotations)
      .where(quoteBaseParams ? and(isNull(quotations.deletedAt), quoteBaseParams) : isNull(quotations.deletedAt)),
    db.select({ totalContracts: count(contracts.id) }).from(contracts).where(isNull(contracts.deletedAt)),
  ]);

  return { totalCustomers, newLeads, totalQuotations, totalContracts };
}

export async function getFinanceStats() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isManager = user.roles.includes(ROLES.MANAGER);
  const isAccountant = user.roles.includes(ROLES.ACCOUNTANT);

  if (!(isAdmin || isManager || isAccountant)) return null;

  const monthCol = sql<string>`to_char(${receipts.date}, 'YYYY-MM')`.as("month");
  const expenseMonthCol = sql<string>`to_char(${payments.date}, 'YYYY-MM')`.as("month");

  const [
    [{ totalReceipts }],
    [{ totalPayments }],
    [{ totalCustomerDebt }],
    [{ totalSupplierDebt }],
    recentReceipts,
    revenueByMonth,
    expenseByMonth,
  ] = await Promise.all([
    db.select({ totalReceipts: sum(receipts.amount) }).from(receipts).where(isNull(receipts.deletedAt)),
    db.select({ totalPayments: sum(payments.amount) }).from(payments).where(isNull(payments.deletedAt)),
    db.select({ totalCustomerDebt: sum(customerDebts.remainingAmount) }).from(customerDebts).where(isNull(customerDebts.deletedAt)),
    db.select({ totalSupplierDebt: sum(supplierDebts.remainingAmount) }).from(supplierDebts).where(isNull(supplierDebts.deletedAt)),
    db.query.receipts.findMany({
      where: isNull(receipts.deletedAt),
      orderBy: [desc(receipts.createdAt)],
      limit: 5,
    }),
    db.select({ month: monthCol, total: sql<string>`coalesce(sum(${receipts.amount}), 0)`.as("total") })
      .from(receipts).where(isNull(receipts.deletedAt)).groupBy(monthCol).orderBy(monthCol),
    db.select({ month: expenseMonthCol, total: sql<string>`coalesce(sum(${payments.amount}), 0)`.as("total") })
      .from(payments).where(isNull(payments.deletedAt)).groupBy(expenseMonthCol).orderBy(expenseMonthCol),
  ]);

  const monthSet = new Set<string>([...revenueByMonth.map((r) => r.month), ...expenseByMonth.map((r) => r.month)]);
  const revenueMap = new Map(revenueByMonth.map((r) => [r.month, Number(r.total)]));
  const expenseMap = new Map(expenseByMonth.map((r) => [r.month, Number(r.total)]));
  const monthlyRevenue = Array.from(monthSet)
    .sort()
    .slice(-6)
    .map((month) => ({ month, revenue: revenueMap.get(month) || 0, expense: expenseMap.get(month) || 0 }));

  return {
    totalReceipts: Number(totalReceipts) || 0,
    totalPayments: Number(totalPayments) || 0,
    totalCustomerDebt: Number(totalCustomerDebt) || 0,
    totalSupplierDebt: Number(totalSupplierDebt) || 0,
    monthlyRevenue,
    recentReceipts,
  };
}

export async function getProfitStats() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isManager = user.roles.includes(ROLES.MANAGER);

  if (!(isAdmin || isManager)) return null;

  const [activeProjectList, revenueByProject, materialsByProject, laborByProject, otherCostsByProject, paymentsByProject] = await Promise.all([
    db.query.projects.findMany({
      where: isNull(projects.deletedAt),
      columns: { id: true, code: true, name: true },
    }),
    db.select({ projectId: receipts.projectId, total: sql<string>`sum(${receipts.amount})` })
      .from(receipts)
      .where(and(isNull(receipts.deletedAt), sql`${receipts.projectId} is not null`))
      .groupBy(receipts.projectId),
    db.select({ projectId: stockTickets.projectId, total: sql<string>`sum(${stockTicketItems.totalAmount})` })
      .from(stockTicketItems)
      .innerJoin(stockTickets, eq(stockTicketItems.ticketId, stockTickets.id))
      .where(and(isNull(stockTickets.deletedAt), eq(stockTickets.type, "OUT"), sql`${stockTickets.projectId} is not null`))
      .groupBy(stockTickets.projectId),
    db.select({ projectId: workerPayments.projectId, total: sql<string>`sum(${workerPayments.totalAmount})` })
      .from(workerPayments)
      .where(and(isNull(workerPayments.deletedAt), sql`${workerPayments.projectId} is not null`))
      .groupBy(workerPayments.projectId),
    db.select({ projectId: projectCosts.projectId, total: sql<string>`sum(${projectCosts.amount})` })
      .from(projectCosts)
      .where(isNull(projectCosts.deletedAt))
      .groupBy(projectCosts.projectId),
    db.select({ projectId: payments.projectId, total: sql<string>`sum(${payments.amount})` })
      .from(payments)
      .where(and(isNull(payments.deletedAt), sql`${payments.projectId} is not null`))
      .groupBy(payments.projectId),
  ]);

  const revenueMap2 = new Map(revenueByProject.map((r) => [r.projectId, Number(r.total)]));
  const materialsMap = new Map(materialsByProject.map((r) => [r.projectId, Number(r.total)]));
  const laborMap = new Map(laborByProject.map((r) => [r.projectId, Number(r.total)]));
  const otherCostsMap = new Map(otherCostsByProject.map((r) => [r.projectId, Number(r.total)]));
  const paymentsMap = new Map(paymentsByProject.map((r) => [r.projectId, Number(r.total)]));

  const projectProfits = activeProjectList.map((p) => {
    const revenue = revenueMap2.get(p.id) || 0;
    const costs = (materialsMap.get(p.id) || 0) + (laborMap.get(p.id) || 0) + (otherCostsMap.get(p.id) || 0) + (paymentsMap.get(p.id) || 0);
    return { id: p.id, code: p.code, name: p.name, estimatedProfit: revenue - costs };
  });

  const totalEstimatedProfit = projectProfits.reduce((sum, p) => sum + p.estimatedProfit, 0);
  const topProjectsByProfit = [...projectProfits].sort((a, b) => b.estimatedProfit - a.estimatedProfit).slice(0, 5);

  return { totalEstimatedProfit, topProjectsByProfit };
}

export async function getInventoryStats() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isManager = user.roles.includes(ROLES.MANAGER);

  if (!(isAdmin || isManager || user.roles.includes(ROLES.WAREHOUSE_STAFF))) return null;

  const [[{ totalMaterials }], [{ lowStockCount }], [{ totalInventoryValue }]] = await Promise.all([
    db.select({ totalMaterials: count(materials.id) }).from(materials).where(isNull(materials.deletedAt)),
    db.select({ lowStockCount: count(materials.id) }).from(materials)
      .where(and(isNull(materials.deletedAt), lte(materials.currentStock, materials.minStock))),
    db.select({ totalInventoryValue: sql<string>`coalesce(sum(${materials.currentStock} * ${materials.unitPrice}), 0)` })
      .from(materials).where(isNull(materials.deletedAt)),
  ]);

  return {
    totalMaterials,
    lowStockCount,
    totalInventoryValue: Number(totalInventoryValue) || 0,
  };
}

export async function getOperationsStats() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isManager = user.roles.includes(ROLES.MANAGER);
  const isConstruction = user.roles.includes(ROLES.CONSTRUCTION_TEAM);
  const isProduction = user.roles.includes(ROLES.PRODUCTION_MANAGER);

  if (!(isAdmin || isManager || isConstruction || isProduction)) return null;

  const projBaseParams = isConstruction && !isAdmin && !isManager && !isProduction
    ? or(eq(projects.managerId, user.id), eq(projects.constructionTeamId, user.id))
    : undefined;

  const [[{ activeProjects }], [{ overdueTasks }]] = await Promise.all([
    db.select({ activeProjects: count(projects.id) }).from(projects)
      .where(projBaseParams
        ? and(isNull(projects.deletedAt), eq(projects.status, "in_progress"), projBaseParams)
        : and(isNull(projects.deletedAt), eq(projects.status, "in_progress"))),
    db.select({ overdueTasks: count(tasks.id) }).from(tasks)
      .where(and(
        isNull(tasks.deletedAt),
        eq(tasks.status, "overdue"),
        isConstruction && !isAdmin && !isManager && !isProduction ? eq(tasks.assignedTo, user.id) : undefined
      )),
  ]);

  return { activeProjects, overdueTasks };
}

export async function getRecentActivities() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isManager = user.roles.includes(ROLES.MANAGER);

  if (!(isAdmin || isManager)) return null;
  const recentActivities = await db.query.auditLogs.findMany({
    with: { user: true },
    orderBy: [desc(auditLogs.createdAt)],
    limit: 5,
  });

  return recentActivities.map((log: any) => ({
    id: log.id,
    action: log.action,
    user: log.user?.fullName || log.user?.email || "System",
    time: log.createdAt,
  }));
}

