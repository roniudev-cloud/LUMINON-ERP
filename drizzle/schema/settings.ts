import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Settings ───────────────────────────────────────────────────────
// Lưu cấu hình chung dạng Key - Value để dễ mở rộng
export const settings = pgTable("settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  group: text("group").notNull(), // company, finance, sales, projects, inventory, documents, notifications, security
  key: text("key").notNull().unique(), // e.g. company_name, vat_default
  value: jsonb("value"), // Có thể là string, object, array, number, boolean
  description: text("description"),
  updatedBy: uuid("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ─── User Preferences ───────────────────────────────────────────────
export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id"),
  userId: uuid("user_id").notNull().unique(), // Mỗi user 1 record preferences
  theme: text("theme").notNull().default("light"), // light, dark, system
  language: text("language").notNull().default("vi"), // vi, en
  sidebarState: text("sidebar_state").notNull().default("expanded"), // expanded, collapsed
  density: text("density").notNull().default("comfortable"), // comfortable, compact
  defaultPage: text("default_page").notNull().default("/"), // trang chủ sau khi login
  notifications: jsonb("notifications").default({
    email: false,
    inApp: true,
    push: false,
  }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
