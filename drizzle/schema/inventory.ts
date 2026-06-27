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
import { projects } from "./projects";

// ─── Material Categories ────────────────────────────────────────────
export const materialCategories = pgTable("material_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  name: text("name").notNull().unique(),
  description: text("description"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Materials ──────────────────────────────────────────────────────
export const materials = pgTable("materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => materialCategories.id),
  supplierId: uuid("supplier_id"), // Liên kết nhà cung cấp mặc định
  unit: text("unit").notNull().default("cái"),
  minStock: integer("min_stock").notNull().default(0),
  currentStock: integer("current_stock").notNull().default(0),
  unitPrice: numeric("unit_price", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Suppliers ──────────────────────────────────────────────────────
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default("other"), // Nhóm nhà cung cấp
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  taxCode: text("tax_code"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Stock Entries ──────────────────────────────────────────────────
// ─── Stock Tickets ──────────────────────────────────────────────────
export const stockTickets = pgTable("stock_tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // IN, OUT
  date: date("date").notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  projectId: uuid("project_id"), // nếu xuất cho công trình
  delivererName: text("deliverer_name"), // Người giao hàng
  receiverName: text("receiver_name"), // Người nhận hàng
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  createdBy: uuid("created_by").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Stock Ticket Items ─────────────────────────────────────────────
export const stockTicketItems = pgTable("stock_ticket_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => stockTickets.id, { onDelete: "cascade" }),
  materialId: uuid("material_id")
    .notNull()
    .references(() => materials.id),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Inventory Files ────────────────────────────────────────────────
export const inventoryFiles = pgTable("inventory_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  ticketId: uuid("ticket_id")
    .notNull()
    .references(() => stockTickets.id, { onDelete: "cascade" }),
  uploadedById: uuid("uploaded_by_id").references(() => users.id),
  fileType: text("file_type").notNull().default("image"),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Stock Movements ────────────────────────────────────────────────
export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  materialId: uuid("material_id")
    .notNull()
    .references(() => materials.id),
  type: text("type").notNull(), // IN, OUT
  quantity: integer("quantity").notNull(),
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  referenceId: uuid("reference_id"),
  referenceType: text("reference_type"), // stock_entry, project_cost
  date: date("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
// ─── Relations ──────────────────────────────────────────────────────
export const materialsRelations = relations(materials, ({ one, many }) => ({
  category: one(materialCategories, {
    fields: [materials.categoryId],
    references: [materialCategories.id],
  }),
  supplier: one(suppliers, {
    fields: [materials.supplierId],
    references: [suppliers.id],
  }),
  ticketItems: many(stockTicketItems),
  movements: many(stockMovements),
}));

export const stockTicketsRelations = relations(stockTickets, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [stockTickets.supplierId],
    references: [suppliers.id],
  }),
  project: one(projects, {
    fields: [stockTickets.projectId],
    references: [projects.id],
  }),
  createdByUser: one(users, {
    fields: [stockTickets.createdBy],
    references: [users.id],
  }),
  items: many(stockTicketItems),
  files: many(inventoryFiles),
}));

export const stockTicketItemsRelations = relations(stockTicketItems, ({ one }) => ({
  ticket: one(stockTickets, {
    fields: [stockTicketItems.ticketId],
    references: [stockTickets.id],
  }),
  material: one(materials, {
    fields: [stockTicketItems.materialId],
    references: [materials.id],
  }),
}));

export const stockMovementsRelations = relations(
  stockMovements,
  ({ one }) => ({
    material: one(materials, {
      fields: [stockMovements.materialId],
      references: [materials.id],
    }),
  })
);

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  materials: many(materials),
  stockTickets: many(stockTickets),
}));

export const inventoryFilesRelations = relations(inventoryFiles, ({ one }) => ({
  ticket: one(stockTickets, {
    fields: [inventoryFiles.ticketId],
    references: [stockTickets.id],
  }),
  uploadedBy: one(users, {
    fields: [inventoryFiles.uploadedById],
    references: [users.id],
  }),
}));
