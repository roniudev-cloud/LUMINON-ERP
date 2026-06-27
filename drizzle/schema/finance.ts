import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./auth";
import { customers } from "./crm";
import { contracts } from "./sales";
import { projects } from "./projects";
import { suppliers } from "./inventory";

// ─── Receipts (Phiếu thu) ──────────────────────────────────────────
export const receipts = pgTable("receipts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  customerId: uuid("customer_id").references(() => customers.id),
  projectId: uuid("project_id").references(() => projects.id),
  contractId: uuid("contract_id").references(() => contracts.id),
  paymentTermId: uuid("payment_term_id"), // Đợt thanh toán nếu có
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  type: text("type").notNull().default("deposit"), // deposit, installment, final, extra, warranty, online_order, other
  paymentMethod: text("payment_method").notNull().default("cash"), // cash, bank_transfer, pos, e_wallet, other
  date: date("date").notNull(),
  submitterName: text("submitter_name"), // Người nộp tiền
  description: text("description"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Finance Files ──────────────────────────────────────────────────
export const financeFiles = pgTable("finance_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  receiptId: uuid("receipt_id").references(() => receipts.id, { onDelete: "cascade" }),
  paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "cascade" }),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  fileType: text("file_type").notNull().default("image"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Payments (Phiếu chi) ──────────────────────────────────────────
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  projectId: uuid("project_id").references(() => projects.id),
  supplierId: uuid("supplier_id"), // Liên kết supplier nếu có (từ bảng inventory)
  supplierName: text("supplier_name"), // Fallback nếu chưa có bảng
  receiverName: text("receiver_name"),
  category: text("category").notNull(), // material, labor, subcontract, transport, utility, marketing, office, tool, extra, other
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  date: date("date").notNull(),
  description: text("description"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Customer Debts ─────────────────────────────────────────────────
export const customerDebts = pgTable("customer_debts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  contractId: uuid("contract_id").references(() => contracts.id),
  projectId: uuid("project_id").references(() => projects.id),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  remainingAmount: numeric("remaining_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("pending"), // pending, partial, paid, overdue
  dueDate: date("due_date"),
  lastPaymentDate: date("last_payment_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Supplier Debts ─────────────────────────────────────────────────
export const supplierDebts = pgTable("supplier_debts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  supplierId: uuid("supplier_id"), // Liên kết id nếu có
  supplierName: text("supplier_name").notNull(), // Tên nhà cung cấp
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  remainingAmount: numeric("remaining_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── VAT Invoices ───────────────────────────────────────────────────
export const vatInvoices = pgTable("vat_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  customerId: uuid("customer_id").references(() => customers.id),
  supplierId: uuid("supplier_id"),
  type: text("type").notNull(), // inbound, outbound
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  vatRate: numeric("vat_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("10"),
  vatAmount: numeric("vat_amount", { precision: 15, scale: 0 }).notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 }).notNull(),
  issueDate: date("issue_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, issued, cancelled
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  customer: one(customers, {
    fields: [receipts.customerId],
    references: [customers.id],
  }),
  project: one(projects, {
    fields: [receipts.projectId],
    references: [projects.id],
  }),
  contract: one(contracts, {
    fields: [receipts.contractId],
    references: [contracts.id],
  }),
  createdByUser: one(users, {
    fields: [receipts.createdBy],
    references: [users.id],
  }),
  files: many(financeFiles),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  project: one(projects, {
    fields: [payments.projectId],
    references: [projects.id],
  }),
  createdByUser: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
  files: many(financeFiles),
}));

export const financeFilesRelations = relations(financeFiles, ({ one }) => ({
  receipt: one(receipts, {
    fields: [financeFiles.receiptId],
    references: [receipts.id],
  }),
  payment: one(payments, {
    fields: [financeFiles.paymentId],
    references: [payments.id],
  }),
  uploadedBy: one(users, {
    fields: [financeFiles.uploadedById],
    references: [users.id],
  }),
}));

export const customerDebtsRelations = relations(customerDebts, ({ one }) => ({
  customer: one(customers, {
    fields: [customerDebts.customerId],
    references: [customers.id],
  }),
  contract: one(contracts, {
    fields: [customerDebts.contractId],
    references: [contracts.id],
  }),
  project: one(projects, {
    fields: [customerDebts.projectId],
    references: [projects.id],
  }),
}));

export const supplierDebtsRelations = relations(supplierDebts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierDebts.supplierId],
    references: [suppliers.id],
  }),
}));

export const vatInvoicesRelations = relations(vatInvoices, ({ one }) => ({
  customer: one(customers, {
    fields: [vatInvoices.customerId],
    references: [customers.id],
  }),
  createdByUser: one(users, {
    fields: [vatInvoices.createdBy],
    references: [users.id],
  }),
}));
