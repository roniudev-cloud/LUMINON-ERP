import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";

// ─── Customer Sources ───────────────────────────────────────────────
export const customerSources = pgTable("customer_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull().unique(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Customer Statuses ──────────────────────────────────────────────
export const customerStatuses = pgTable("customer_statuses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#6B7280"),
  sortOrder: integer("sort_order").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Customers ──────────────────────────────────────────────────────
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  zalo: text("zalo"),
  facebook: text("facebook"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  district: text("district"),
  ward: text("ward"),
  taxCode: text("tax_code"),
  contactPerson: text("contact_person"),
  sourceId: uuid("source_id").references(() => customerSources.id),
  statusId: uuid("status_id").references(() => customerStatuses.id),
  assignedToId: uuid("assigned_to_id").references(() => users.id),
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

// ─── Customer Notes ─────────────────────────────────────────────────
export const customerNotes = pgTable("customer_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Customer Activities ────────────────────────────────────────────
export const customerActivities = pgTable("customer_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(), // call, email, meeting, note, status_change
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Lead Sources ───────────────────────────────────────────────────
export const leadSources = pgTable("lead_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull().unique(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Leads ──────────────────────────────────────────────────────────
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  sourceId: uuid("source_id").references(() => leadSources.id),
  description: text("description"),
  status: text("status").notNull().default("new"), // new, contacted, qualified, converted, lost
  assignedToId: uuid("assigned_to_id").references(() => users.id),
  convertedCustomerId: uuid("converted_customer_id").references(
    () => customers.id
  ),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Lead Assignments ───────────────────────────────────────────────
export const leadAssignments = pgTable("lead_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const customersRelations = relations(customers, ({ one, many }) => ({
  source: one(customerSources, {
    fields: [customers.sourceId],
    references: [customerSources.id],
  }),
  status: one(customerStatuses, {
    fields: [customers.statusId],
    references: [customerStatuses.id],
  }),
  assignedTo: one(users, {
    fields: [customers.assignedToId],
    references: [users.id],
    relationName: "assignedCustomers",
  }),
  createdByUser: one(users, {
    fields: [customers.createdBy],
    references: [users.id],
    relationName: "createdCustomers",
  }),
  notes: many(customerNotes),
  activities: many(customerActivities),
}));

export const customerNotesRelations = relations(
  customerNotes,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerNotes.customerId],
      references: [customers.id],
    }),
    user: one(users, {
      fields: [customerNotes.userId],
      references: [users.id],
    }),
  })
);

export const customerActivitiesRelations = relations(
  customerActivities,
  ({ one }) => ({
    customer: one(customers, {
      fields: [customerActivities.customerId],
      references: [customers.id],
    }),
    user: one(users, {
      fields: [customerActivities.userId],
      references: [users.id],
    }),
  })
);

export const leadsRelations = relations(leads, ({ one, many }) => ({
  source: one(leadSources, {
    fields: [leads.sourceId],
    references: [leadSources.id],
  }),
  assignedTo: one(users, {
    fields: [leads.assignedToId],
    references: [users.id],
  }),
  convertedCustomer: one(customers, {
    fields: [leads.convertedCustomerId],
    references: [customers.id],
  }),
  assignments: many(leadAssignments),
}));

export const leadAssignmentsRelations = relations(
  leadAssignments,
  ({ one }) => ({
    lead: one(leads, {
      fields: [leadAssignments.leadId],
      references: [leads.id],
    }),
    user: one(users, {
      fields: [leadAssignments.userId],
      references: [users.id],
    }),
  })
);
