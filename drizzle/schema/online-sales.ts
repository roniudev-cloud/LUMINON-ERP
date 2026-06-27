import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Products ───────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(), // Có thể coi là SKU nội bộ
  sku: text("sku").unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").default("other"),
  price: numeric("price", { precision: 15, scale: 0 }).notNull().default("0"),
  costPrice: numeric("cost_price", { precision: 15, scale: 0 }).notNull().default("0"),
  compareAtPrice: numeric("compare_at_price", { precision: 15, scale: 0 }),
  unit: text("unit").notNull().default("cái"),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  manageStock: boolean("manage_stock").notNull().default(true),
  images: jsonb("images").$type<string[]>().default([]),
  status: text("status").notNull().default("active"), // active, hidden, discontinued, out_of_stock
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Product Variants ───────────────────────────────────────────────
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Tên biến thể (VD: Màu Đỏ - Size M)
  sku: text("sku").unique(),
  color: text("color"),
  size: text("size"),
  material: text("material"),
  style: text("style"),
  price: numeric("price", { precision: 15, scale: 0 }).notNull().default("0"), // Nếu 0 thì lấy giá sp gốc
  costPrice: numeric("cost_price", { precision: 15, scale: 0 }).notNull().default("0"),
  stock: integer("stock").notNull().default(0),
  image: text("image"),
  status: text("status").notNull().default("active"),

  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Online Orders ──────────────────────────────────────────────────
export const onlineOrders = pgTable("online_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  code: text("code").notNull().unique(),
  customerId: uuid("customer_id").notNull(), // Liên kết bảng CRM Customers (Vì ko import từ crm.ts ở đây để tránh vòng lặp nếu cần, nhưng ta có thể add foreign key)
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  shippingAddress: text("shipping_address"),
  source: text("source").notNull().default("other"), // facebook, zalo, website...
  assignedTo: uuid("assigned_to").notNull(), // Nhân viên phụ trách
  status: text("status").notNull().default("new"), // new, pending, deposit, processing, shipping, completed, cancelled, refunded
  subtotal: numeric("subtotal", { precision: 15, scale: 0 }).notNull().default("0"),
  shippingFee: numeric("shipping_fee", { precision: 15, scale: 0 }).notNull().default("0"),
  extraFee: numeric("extra_fee", { precision: 15, scale: 0 }).notNull().default("0"),
  discount: numeric("discount", { precision: 15, scale: 0 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 15, scale: 0 }).notNull().default("0"),
  paidAmount: numeric("paid_amount", { precision: 15, scale: 0 }).notNull().default("0"),
  remainingAmount: numeric("remaining_amount", { precision: 15, scale: 0 }).notNull().default("0"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Online Order Items ─────────────────────────────────────────────
export const onlineOrderItems = pgTable("online_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  orderId: uuid("order_id")
    .notNull()
    .references(() => onlineOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  variantId: uuid("variant_id").references(() => productVariants.id),
  name: text("name").notNull(),
  unit: text("unit").notNull().default("cái"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 15, scale: 0 }).notNull().default("0"),
  discount: numeric("discount", { precision: 15, scale: 0 }).notNull().default("0"),
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull().default("0"),
  notes: text("notes"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Online Order Payments ──────────────────────────────────────────
export const onlineOrderPayments = pgTable("online_order_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  orderId: uuid("order_id")
    .notNull()
    .references(() => onlineOrders.id, { onDelete: "cascade" }),
  method: text("method").notNull(), // cod, bank_transfer, momo, vnpay
  amount: numeric("amount", { precision: 15, scale: 0 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, refunded
  paidAt: timestamp("paid_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── Relations ──────────────────────────────────────────────────────
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  })
);

export const onlineOrdersRelations = relations(
  onlineOrders,
  ({ many }) => ({
    items: many(onlineOrderItems),
    payments: many(onlineOrderPayments),
  })
);

export const onlineOrderItemsRelations = relations(
  onlineOrderItems,
  ({ one }) => ({
    order: one(onlineOrders, {
      fields: [onlineOrderItems.orderId],
      references: [onlineOrders.id],
    }),
    product: one(products, {
      fields: [onlineOrderItems.productId],
      references: [products.id],
    }),
  })
);

export const onlineOrderPaymentsRelations = relations(
  onlineOrderPayments,
  ({ one }) => ({
    order: one(onlineOrders, {
      fields: [onlineOrderPayments.orderId],
      references: [onlineOrders.id],
    }),
  })
);
