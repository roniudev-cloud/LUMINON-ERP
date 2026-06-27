import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// ─── Notifications ──────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // system, lead_new, quote_approved, contract_signed, etc.
  module: text("module"), // leads, quotations, contracts, projects, etc.
  recordId: text("record_id"), // UUID of the related record
  link: text("link"), // Direct URL to the record
  isRead: boolean("is_read").notNull().default(false),
  userId: uuid("user_id").notNull().references(() => users.id), // Người nhận
  createdBy: uuid("created_by").references(() => users.id), // Người tạo event (nếu có)
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Tasks ──────────────────────────────────────────────────────────
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  status: text("status").notNull().default("new"), // new, in_progress, waiting, paused, completed, overdue, cancelled
  progress: integer("progress").notNull().default(0), // 0 - 100
  module: text("module"), // related module
  recordId: text("record_id"),
  startDate: timestamp("start_date", { withTimezone: true }),
  dueDate: timestamp("due_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Reminders ──────────────────────────────────────────────────────
export const reminders = pgTable("reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  title: text("title").notNull(),
  description: text("description"),
  reminderDate: timestamp("reminder_date", { withTimezone: true }).notNull(),
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  status: text("status").notNull().default("pending"), // pending, today, overdue, completed, cancelled
  module: text("module"), // related module
  recordId: text("record_id"),
  notes: text("notes"),
  assignedTo: uuid("assigned_to").notNull().references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Calendar Events ────────────────────────────────────────────────
export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull().default("other"), // meeting, survey, quote, contract, construction, etc.
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  module: text("module"), // related module
  recordId: text("record_id"),
  assignedTo: uuid("assigned_to").references(() => users.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedUser: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  createdUser: one(users, {
    fields: [tasks.createdBy],
    references: [users.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  assignedUser: one(users, {
    fields: [reminders.assignedTo],
    references: [users.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  assignedUser: one(users, {
    fields: [calendarEvents.assignedTo],
    references: [users.id],
  }),
}));
