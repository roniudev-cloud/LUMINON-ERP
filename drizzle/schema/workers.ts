import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { projects, projectWorkers } from "./projects";

// ─── Worker Roles ───────────────────────────────────────────────────
export const workerRoles = pgTable("worker_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull().unique(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Workers ────────────────────────────────────────────────────────
export const workers = pgTable("workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  idNumber: text("id_number"),
  roleId: uuid("role_id").references(() => workerRoles.id),
  dailyRate: numeric("daily_rate", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Worker Attendances ─────────────────────────────────────────────
export const workerAttendances = pgTable("worker_attendances", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workers.id, { onDelete: "cascade" }),
  projectId: uuid("project_id"),
  date: date("date").notNull(),
  status: text("status").notNull().default("present"), // present, absent, half_day
  note: text("note"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Worker Advances ────────────────────────────────────────────────
export const workerAdvances = pgTable("worker_advances", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workers.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  date: date("date").notNull(),
  note: text("note"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Worker Payments ────────────────────────────────────────────────
export const workerPayments = pgTable("worker_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  workerId: uuid("worker_id")
    .notNull()
    .references(() => workers.id, { onDelete: "cascade" }),
  projectId: uuid("project_id"),
  period: text("period").notNull(), // e.g., "2026-06"
  paymentType: text("payment_type").notNull().default("daily"), // daily (công nhật) | lump_sum (khoán việc)
  totalDays: numeric("total_days", { precision: 5, scale: 1 })
    .notNull()
    .default("0"),
  dailyRate: numeric("daily_rate", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  advances: numeric("advances", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  netAmount: numeric("net_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("pending"), // pending, paid
  paidDate: date("paid_date"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const workersRelations = relations(workers, ({ one, many }) => ({
  role: one(workerRoles, {
    fields: [workers.roleId],
    references: [workerRoles.id],
  }),
  attendances: many(workerAttendances),
  advances: many(workerAdvances),
  payments: many(workerPayments),
  projectAssignments: many(projectWorkers),
}));

// `projectWorkers` (bảng thợ tham gia công trình) được khai báo ở drizzle/schema/projects.ts
// (đã có sẵn từ trước, chưa từng nối UI). Quan hệ ngược về `workers` đặt ở đây để tránh
// import vòng (projects.ts không import workers.ts).
export const projectWorkersRelations = relations(projectWorkers, ({ one }) => ({
  project: one(projects, {
    fields: [projectWorkers.projectId],
    references: [projects.id],
  }),
  worker: one(workers, {
    fields: [projectWorkers.workerId],
    references: [workers.id],
  }),
}));

export const workerAttendancesRelations = relations(
  workerAttendances,
  ({ one }) => ({
    worker: one(workers, {
      fields: [workerAttendances.workerId],
      references: [workers.id],
    }),
    project: one(projects, {
      fields: [workerAttendances.projectId],
      references: [projects.id],
    }),
  })
);

export const workerAdvancesRelations = relations(
  workerAdvances,
  ({ one }) => ({
    worker: one(workers, {
      fields: [workerAdvances.workerId],
      references: [workers.id],
    }),
    createdByUser: one(users, {
      fields: [workerAdvances.createdBy],
      references: [users.id],
    }),
  })
);

export const workerPaymentsRelations = relations(
  workerPayments,
  ({ one }) => ({
    worker: one(workers, {
      fields: [workerPayments.workerId],
      references: [workers.id],
    }),
    project: one(projects, {
      fields: [workerPayments.projectId],
      references: [projects.id],
    }),
    createdByUser: one(users, {
      fields: [workerPayments.createdBy],
      references: [users.id],
    }),
  })
);
