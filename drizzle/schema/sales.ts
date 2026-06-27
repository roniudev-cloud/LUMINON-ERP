import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  date,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { customers } from "./crm";

// ─── Quotation Templates ───────────────────────────────────────────
export const quotationTemplates = pgTable("quotation_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull(),
  description: text("description"),
  content: jsonb("content"), // Template structure
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Quotations ─────────────────────────────────────────────────────
export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  title: text("title").notNull(),
  subtotal: numeric("subtotal", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  discount: numeric("discount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  discountType: text("discount_type").notNull().default("amount"), // amount | percent
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("10"),
  vatAmount: numeric("vat_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  otherFees: numeric("other_fees", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("draft"), // draft, sent, approved, rejected, converted
  validUntil: date("valid_until"),
  notes: text("notes"),
  templateId: uuid("template_id").references(() => quotationTemplates.id),
  createdBy: uuid("created_by").references(() => users.id),
  approvedBy: uuid("approved_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Quotation Items ────────────────────────────────────────────────
export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit").notNull().default("bộ"),
  quantity: numeric("quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("1"),
  unitPrice: numeric("unit_price", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  amount: numeric("amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Contract Templates ─────────────────────────────────────────────
export const contractTemplates = pgTable("contract_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull(),
  type: text("type"), // thi_cong, noi_that, gia_cong, phu_luc, nghiem_thu...
  serviceGroup: text("service_group"),
  description: text("description"),
  content: jsonb("content"),
  defaultTerms: text("default_terms"),
  paymentTerms: text("payment_terms"),
  warrantyTerms: text("warranty_terms"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Contracts ──────────────────────────────────────────────────────
export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  quotationId: uuid("quotation_id").references(() => quotations.id),
  title: text("title").notNull(),
  type: text("type"), // construction, interior, etc
  constructionAddress: text("construction_address"),
  subtotal: numeric("subtotal", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  discount: numeric("discount", { precision: 15, scale: 0 }).notNull().default("0"),
  discountType: text("discount_type").notNull().default("amount"), // amount, percent
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 }).notNull().default("10"),
  vatAmount: numeric("vat_amount", { precision: 15, scale: 0 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("draft"), // draft, pending_sign, signed, in_progress, paused, completed, liquidated, cancelled
  signDate: date("sign_date"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  paymentTermsContent: text("payment_terms_content"),
  executionTerms: text("execution_terms"),
  warrantyTerms: text("warranty_terms"),
  acceptanceTerms: text("acceptance_terms"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  templateId: uuid("template_id").references(() => contractTemplates.id),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Contract Items ─────────────────────────────────────────────────
export const contractItems = pgTable("contract_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  unit: text("unit").notNull().default("bộ"),
  quantity: numeric("quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("1"),
  unitPrice: numeric("unit_price", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  amount: numeric("amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  sortOrder: integer("sort_order").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Contract Payment Terms ─────────────────────────────────────────
export const contractPaymentTerms = pgTable("contract_payment_terms", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }),
  amount: numeric("amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  dueDate: date("due_date"),
  status: text("status").notNull().default("pending"), // pending, paid, overdue,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Contract Files ─────────────────────────────────────────────────
export const contractFiles = pgTable("contract_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  fileId: uuid("file_id").notNull(),
  type: text("type").notNull().default("attachment"), // attachment, signed_copy
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Contract Signatures ──────────────────────────────────────────────
export const contractSignatures = pgTable("contract_signatures", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  contractId: uuid("contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id),
  type: text("type").notNull(), // customer, representative, company_stamp
  imageData: text("image_data").notNull(), // base64 string
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotations.customerId],
    references: [customers.id],
  }),
  createdByUser: one(users, {
    fields: [quotations.createdBy],
    references: [users.id],
    relationName: "createdQuotations",
  }),
  items: many(quotationItems),
}));

export const quotationItemsRelations = relations(
  quotationItems,
  ({ one }) => ({
    quotation: one(quotations, {
      fields: [quotationItems.quotationId],
      references: [quotations.id],
    }),
  })
);

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [contracts.customerId],
    references: [customers.id],
  }),
  quotation: one(quotations, {
    fields: [contracts.quotationId],
    references: [quotations.id],
  }),
  createdByUser: one(users, {
    fields: [contracts.createdBy],
    references: [users.id],
    relationName: "createdContracts",
  }),
  items: many(contractItems),
  paymentTerms: many(contractPaymentTerms),
  files: many(contractFiles),
  signatures: many(contractSignatures),
}));

export const contractItemsRelations = relations(contractItems, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractItems.contractId],
    references: [contracts.id],
  }),
}));

export const contractFilesRelations = relations(contractFiles, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractFiles.contractId],
    references: [contracts.id],
  }),
}));

export const contractSignaturesRelations = relations(contractSignatures, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractSignatures.contractId],
    references: [contracts.id],
  }),
  user: one(users, {
    fields: [contractSignatures.userId],
    references: [users.id],
  }),
}));

export const contractPaymentTermsRelations = relations(
  contractPaymentTerms,
  ({ one }) => ({
    contract: one(contracts, {
      fields: [contractPaymentTerms.contractId],
      references: [contracts.id],
    }),
  })
);
