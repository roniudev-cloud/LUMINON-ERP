"use server";

import { db } from "@/lib/db";
import { and, gte, lte, isNull, sql } from "drizzle-orm";
import { requireAuth } from "./auth";
import { tasks } from "@db/schema/productivity";
import { quotations, contracts, contractPaymentTerms } from "@db/schema/sales";
import { projects } from "@db/schema/projects";
import { customerDebts } from "@db/schema/finance";

export type CalendarEventType =
  | "task"
  | "quotation_expiry"
  | "contract_sign"
  | "contract_payment_term"
  | "project_start"
  | "project_end"
  | "customer_debt_due";

export interface CalendarEvent {
  id: string;
  date: string; // yyyy-mm-dd
  type: CalendarEventType;
  title: string;
  link: string;
}

/** Tổng hợp mốc thời gian từ nhiều module trong khoảng [from, to] (yyyy-mm-dd) thành 1 danh sách sự kiện lịch. */
export async function getCalendarEvents(from: string, to: string): Promise<CalendarEvent[]> {
  await requireAuth();

  const events: CalendarEvent[] = [];

  const taskRows = await db.query.tasks.findMany({
    where: and(isNull(tasks.deletedAt), gte(tasks.dueDate, new Date(from)), lte(tasks.dueDate, new Date(to))),
    columns: { id: true, title: true, dueDate: true },
  });
  for (const t of taskRows) {
    if (!t.dueDate) continue;
    events.push({
      id: `task-${t.id}`,
      date: t.dueDate.toISOString().slice(0, 10),
      type: "task",
      title: t.title,
      link: "/tasks",
    });
  }

  const quoteRows = await db.query.quotations.findMany({
    where: and(isNull(quotations.deletedAt), gte(quotations.validUntil, from), lte(quotations.validUntil, to)),
    columns: { id: true, code: true, validUntil: true },
  });
  for (const q of quoteRows) {
    if (!q.validUntil) continue;
    events.push({
      id: `quote-${q.id}`,
      date: q.validUntil,
      type: "quotation_expiry",
      title: `Báo giá ${q.code} hết hiệu lực`,
      link: `/quotations/${q.id}`,
    });
  }

  const contractRows = await db.query.contracts.findMany({
    where: and(isNull(contracts.deletedAt), gte(contracts.signDate, from), lte(contracts.signDate, to)),
    columns: { id: true, code: true, signDate: true },
  });
  for (const c of contractRows) {
    if (!c.signDate) continue;
    events.push({
      id: `contract-sign-${c.id}`,
      date: c.signDate,
      type: "contract_sign",
      title: `Ký hợp đồng ${c.code}`,
      link: `/contracts/${c.id}`,
    });
  }

  const paymentTermRows = await db.query.contractPaymentTerms.findMany({
    where: and(isNull(contractPaymentTerms.deletedAt), gte(contractPaymentTerms.dueDate, from), lte(contractPaymentTerms.dueDate, to)),
    with: { contract: { columns: { id: true, code: true } } },
  });
  for (const p of paymentTermRows) {
    if (!p.dueDate || !p.contract) continue;
    events.push({
      id: `payment-term-${p.id}`,
      date: p.dueDate,
      type: "contract_payment_term",
      title: `${p.contract.code} — ${p.name} (${Number(p.amount).toLocaleString()}đ)`,
      link: `/contracts/${p.contract.id}`,
    });
  }

  const projectRows = await db.query.projects.findMany({
    where: and(
      isNull(projects.deletedAt),
      sql`(${projects.startDate} between ${from} and ${to}) or (${projects.expectedEndDate} between ${from} and ${to})`
    ),
    columns: { id: true, code: true, name: true, startDate: true, expectedEndDate: true },
  });
  for (const p of projectRows) {
    if (p.startDate && p.startDate >= from && p.startDate <= to) {
      events.push({
        id: `project-start-${p.id}`,
        date: p.startDate,
        type: "project_start",
        title: `Khởi công ${p.code} - ${p.name}`,
        link: `/projects/${p.id}`,
      });
    }
    if (p.expectedEndDate && p.expectedEndDate >= from && p.expectedEndDate <= to) {
      events.push({
        id: `project-end-${p.id}`,
        date: p.expectedEndDate,
        type: "project_end",
        title: `Dự kiến hoàn thành ${p.code} - ${p.name}`,
        link: `/projects/${p.id}`,
      });
    }
  }

  const debtRows = await db.query.customerDebts.findMany({
    where: and(isNull(customerDebts.deletedAt), gte(customerDebts.dueDate, from), lte(customerDebts.dueDate, to)),
    with: { customer: { columns: { id: true, name: true } } },
  });
  for (const d of debtRows) {
    if (!d.dueDate) continue;
    events.push({
      id: `debt-${d.id}`,
      date: d.dueDate,
      type: "customer_debt_due",
      title: `Hạn thu nợ — ${d.customer?.name || "Khách hàng"} (${Number(d.remainingAmount).toLocaleString()}đ)`,
      link: "/debts",
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
