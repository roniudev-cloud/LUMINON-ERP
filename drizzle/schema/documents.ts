import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { projects } from "./projects";
import { contracts } from "./sales";

// ─── Files ──────────────────────────────────────────────────────────
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  originalName: text("original_name").notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: text("mime_type"),
  size: integer("size"),
  bucket: text("bucket").notNull().default("files"),
  uploadedBy: uuid("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Acceptance Reports (Biên bản nghiệm thu) ──────────────────────
export const acceptanceReports = pgTable("acceptance_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  content: text("content"),
  status: text("status").notNull().default("draft"), // draft, signed, approved
  signedAt: timestamp("signed_at", { withTimezone: true }),
  customerSignature: text("customer_signature"), // Base64 or file reference
  companySignature: text("company_signature"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Liquidation Reports (Biên bản thanh lý) ───────────────────────
export const liquidationReports = pgTable("liquidation_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  contractId: uuid("contract_id").references(() => contracts.id),
  content: text("content"),
  finalAmount: numeric("final_amount", { precision: 15, scale: 0 }),
  status: text("status").notNull().default("draft"), // draft, signed, approved
  signedAt: timestamp("signed_at", { withTimezone: true }),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Document Templates ─────────────────────────────────────────────
export const documentTemplates = pgTable("document_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull(),
  type: text("type").notNull(), // quotation, contract, receipt, payment, acceptance, liquidation
  description: text("description"),
  fileUrl: text("file_url"), // URL of the uploaded DOCX template in Supabase Storage
  variables: text("variables").array(), // List of supported variables
  isDefault: integer("is_default").notNull().default(0), // 1 = default, 0 = not default
  status: text("status").notNull().default("active"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const filesRelations = relations(files, ({ one }) => ({
  uploadedByUser: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
}));

export const acceptanceReportsRelations = relations(
  acceptanceReports,
  ({ one }) => ({
    project: one(projects, {
      fields: [acceptanceReports.projectId],
      references: [projects.id],
    }),
    createdByUser: one(users, {
      fields: [acceptanceReports.createdBy],
      references: [users.id],
    }),
  })
);

export const liquidationReportsRelations = relations(
  liquidationReports,
  ({ one }) => ({
    project: one(projects, {
      fields: [liquidationReports.projectId],
      references: [projects.id],
    }),
    contract: one(contracts, {
      fields: [liquidationReports.contractId],
      references: [contracts.id],
    }),
    createdByUser: one(users, {
      fields: [liquidationReports.createdBy],
      references: [users.id],
    }),
  })
);

export const documentTemplatesRelations = relations(
  documentTemplates,
  ({ one }) => ({
    createdByUser: one(users, {
      fields: [documentTemplates.createdBy],
      references: [users.id],
    }),
  })
);
