import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { customers } from "./crm";
import { contracts } from "./sales";

// ─── Project Statuses ───────────────────────────────────────────────
export const projectStatuses = pgTable("project_statuses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6B7280"),
  sortOrder: integer("sort_order").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Projects ───────────────────────────────────────────────────────
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  contractId: uuid("contract_id").references(() => contracts.id),
  address: text("address"),
  totalValue: numeric("total_value", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  expectedCost: numeric("expected_cost", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  actualCost: numeric("actual_cost", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  estimatedProfit: numeric("estimated_profit", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("new"), // new, design, design_review, production, waiting_materials, in_progress, paused, waiting_acceptance, accepted, completed, paid, warranty, cancelled
  progress: integer("progress").notNull().default(0),
  startDate: date("start_date"),
  expectedEndDate: date("expected_end_date"),
  actualEndDate: date("actual_end_date"),
  managerId: uuid("manager_id").references(() => users.id),
  constructionTeamId: uuid("construction_team_id").references(() => users.id),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Project Tasks ──────────────────────────────────────────────────
export const projectTasks = pgTable("project_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  status: text("status").notNull().default("new"), // new, in_progress, waiting_feedback, paused, completed, overdue, cancelled
  progress: integer("progress").notNull().default(0),
  notes: text("notes"),
  startDate: date("start_date"),
  dueDate: date("due_date"),
  completedDate: date("completed_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Project Logs (Construction Diary) ──────────────────────────────
export const projectLogs = pgTable("project_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  date: date("date").notNull(),
  phase: text("phase").notNull().default("in_progress"), // pre_construction, in_progress, post_construction, materials, issues, acceptance, warranty
  title: text("title").notNull(),
  content: text("content").notNull(),
  issues: text("issues"),
  proposal: text("proposal"),
  status: text("status").notNull().default("resolved"), // open, in_progress, resolved
  weather: text("weather"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Project Files ──────────────────────────────────────────────────
export const projectFiles = pgTable("project_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  projectLogId: uuid("project_log_id").references(() => projectLogs.id, { onDelete: "cascade" }),
  projectTaskId: uuid("project_task_id").references(() => projectTasks.id, { onDelete: "cascade" }),
  fileType: text("file_type").notNull().default("image"), // image, video, document
  fileCategory: text("file_category").notNull().default("general"), // survey, pre_construction, in_progress, post_construction, design, contract, acceptance, other
  fileUrl: text("file_url").notNull(), // Base64 or external URL
  fileName: text("file_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Project Costs ──────────────────────────────────────────────────
export const projectCosts = pgTable("project_costs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // material, labor, subcontract, transport, other
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  date: date("date").notNull(),
  supplierId: uuid("supplier_id"),
  receiptId: uuid("receipt_id"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Project Workers ────────────────────────────────────────────────
export const projectWorkers = pgTable("project_workers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  workerId: uuid("worker_id").notNull(),
  role: text("role"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Project Progress Updates (lịch sử % tiến độ theo thời gian) ────
export const projectProgressUpdates = pgTable("project_progress_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  progress: integer("progress").notNull(),
  note: text("note"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
  customer: one(customers, {
    fields: [projects.customerId],
    references: [customers.id],
  }),
  contract: one(contracts, {
    fields: [projects.contractId],
    references: [contracts.id],
  }),
  manager: one(users, {
    fields: [projects.managerId],
    references: [users.id],
    relationName: "managedProjects",
  }),
  constructionTeam: one(users, {
    fields: [projects.constructionTeamId],
    references: [users.id],
    relationName: "constructionTeamProjects",
  }),
  tasks: many(projectTasks),
  logs: many(projectLogs),
  costs: many(projectCosts),
  workers: many(projectWorkers),
  files: many(projectFiles),
  progressUpdates: many(projectProgressUpdates),
}));

export const projectProgressUpdatesRelations = relations(
  projectProgressUpdates,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectProgressUpdates.projectId],
      references: [projects.id],
    }),
    createdByUser: one(users, {
      fields: [projectProgressUpdates.createdBy],
      references: [users.id],
    }),
  })
);

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [projectTasks.assignedToId],
    references: [users.id],
  }),
}));

export const projectLogsRelations = relations(projectLogs, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectLogs.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectLogs.userId],
    references: [users.id],
  }),
  files: many(projectFiles),
}));

export const projectFilesRelations = relations(projectFiles, ({ one }) => ({
  project: one(projects, {
    fields: [projectFiles.projectId],
    references: [projects.id],
  }),
  log: one(projectLogs, {
    fields: [projectFiles.projectLogId],
    references: [projectLogs.id],
  }),
  task: one(projectTasks, {
    fields: [projectFiles.projectTaskId],
    references: [projectTasks.id],
  }),
  uploadedBy: one(users, {
    fields: [projectFiles.uploadedById],
    references: [users.id],
  }),
}));

export const projectCostsRelations = relations(projectCosts, ({ one }) => ({
  project: one(projects, {
    fields: [projectCosts.projectId],
    references: [projects.id],
  }),
  createdByUser: one(users, {
    fields: [projectCosts.createdBy],
    references: [users.id],
  }),
}));
