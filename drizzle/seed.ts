import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import {
  users,
  roles,
  permissions,
  rolePermissions,
  userRoles,
} from "./schema/auth";
import { customerSources, customerStatuses } from "./schema/crm";
import { projectStatuses } from "./schema/projects";
import { workerRoles } from "./schema/workers";
import { materialCategories } from "./schema/inventory";
import { DEFAULT_ROLE_PERMISSIONS, ROLES } from "../src/lib/constants";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Unique Permission Codes ────────────────────────────────────────
const ALL_PERMISSIONS = [
  // Dashboard
  { code: "dashboard.view", name: "Xem Dashboard", module: "dashboard" },
  { code: "dashboard.view_finance", name: "Xem tài chính Dashboard", module: "dashboard" },
  { code: "dashboard.view_profit", name: "Xem lợi nhuận Dashboard", module: "dashboard" },
  // Customers
  { code: "customers.view", name: "Xem khách hàng", module: "customers" },
  { code: "customers.view_own", name: "Xem KH được giao", module: "customers" },
  { code: "customers.create", name: "Tạo khách hàng", module: "customers" },
  { code: "customers.update", name: "Sửa khách hàng", module: "customers" },
  { code: "customers.delete", name: "Xóa khách hàng", module: "customers" },
  // Leads
  { code: "leads.view", name: "Xem lead", module: "leads" },
  { code: "leads.create", name: "Tạo lead", module: "leads" },
  { code: "leads.update", name: "Sửa lead", module: "leads" },
  { code: "leads.delete", name: "Xóa lead", module: "leads" },
  // Quotations
  { code: "quotations.view", name: "Xem báo giá", module: "quotations" },
  { code: "quotations.view_own", name: "Xem BG của mình", module: "quotations" },
  { code: "quotations.create", name: "Tạo báo giá", module: "quotations" },
  { code: "quotations.update", name: "Sửa báo giá", module: "quotations" },
  { code: "quotations.delete", name: "Xóa báo giá", module: "quotations" },
  // Contracts
  { code: "contracts.view", name: "Xem hợp đồng", module: "contracts" },
  { code: "contracts.view_own", name: "Xem HĐ của mình", module: "contracts" },
  { code: "contracts.create", name: "Tạo hợp đồng", module: "contracts" },
  { code: "contracts.update", name: "Sửa hợp đồng", module: "contracts" },
  { code: "contracts.delete", name: "Xóa hợp đồng", module: "contracts" },
  // Projects
  { code: "projects.view", name: "Xem công trình", module: "projects" },
  { code: "projects.view_own", name: "Xem CT được giao", module: "projects" },
  { code: "projects.create", name: "Tạo công trình", module: "projects" },
  { code: "projects.update", name: "Sửa công trình", module: "projects" },
  { code: "projects.delete", name: "Xóa công trình", module: "projects" },
  // Project Costs
  { code: "project_costs.view", name: "Xem chi phí CT", module: "project_costs" },
  { code: "project_costs.create", name: "Tạo chi phí CT", module: "project_costs" },
  { code: "project_costs.view_profit", name: "Xem lợi nhuận CT", module: "project_costs" },
  // Finance
  { code: "receipts.view", name: "Xem phiếu thu", module: "receipts" },
  { code: "receipts.create", name: "Tạo phiếu thu", module: "receipts" },
  { code: "receipts.update", name: "Sửa phiếu thu", module: "receipts" },
  { code: "receipts.delete", name: "Xóa phiếu thu", module: "receipts" },
  { code: "payments.view", name: "Xem phiếu chi", module: "payments" },
  { code: "payments.create", name: "Tạo phiếu chi", module: "payments" },
  { code: "payments.update", name: "Sửa phiếu chi", module: "payments" },
  { code: "payments.delete", name: "Xóa phiếu chi", module: "payments" },
  { code: "customer_debts.view", name: "Xem công nợ KH", module: "customer_debts" },
  { code: "supplier_debts.view", name: "Xem công nợ NCC", module: "supplier_debts" },
  { code: "vat_invoices.view", name: "Xem hóa đơn VAT", module: "vat_invoices" },
  { code: "vat_invoices.create", name: "Tạo hóa đơn VAT", module: "vat_invoices" },
  // Inventory
  { code: "inventory.view", name: "Xem kho", module: "inventory" },
  { code: "inventory.create", name: "Nhập/Xuất kho", module: "inventory" },
  { code: "inventory.update", name: "Sửa vật tư", module: "inventory" },
  { code: "inventory.delete", name: "Xóa vật tư", module: "inventory" },
  { code: "suppliers.view", name: "Xem NCC", module: "suppliers" },
  { code: "suppliers.create", name: "Tạo NCC", module: "suppliers" },
  { code: "suppliers.update", name: "Sửa NCC", module: "suppliers" },
  // Products
  { code: "products.view", name: "Xem sản phẩm", module: "products" },
  { code: "products.create", name: "Tạo sản phẩm", module: "products" },
  { code: "products.update", name: "Sửa sản phẩm", module: "products" },
  { code: "products.delete", name: "Xóa sản phẩm", module: "products" },
  // Online Orders
  { code: "online_orders.view", name: "Xem đơn hàng", module: "online_orders" },
  { code: "online_orders.create", name: "Tạo đơn hàng", module: "online_orders" },
  { code: "online_orders.update", name: "Sửa đơn hàng", module: "online_orders" },
  // Workers
  { code: "workers.view", name: "Xem nhân công", module: "workers" },
  { code: "workers.create", name: "Tạo nhân công", module: "workers" },
  { code: "workers.update", name: "Sửa nhân công", module: "workers" },
  { code: "workers.delete", name: "Xóa nhân công", module: "workers" },
  // Reports
  { code: "reports.view", name: "Xem báo cáo", module: "reports" },
  { code: "reports.view_finance", name: "Xem BC tài chính", module: "reports" },
  { code: "reports.view_profit", name: "Xem BC lợi nhuận", module: "reports" },
  // Admin
  { code: "users.view", name: "Xem người dùng", module: "users" },
  { code: "users.manage", name: "Quản lý người dùng", module: "users" },
  { code: "roles.manage", name: "Quản lý vai trò", module: "roles" },
  { code: "settings.manage", name: "Quản lý cài đặt", module: "settings" },
  { code: "audit_logs.view", name: "Xem nhật ký", module: "audit_logs" },
];

// ─── User Definitions ──────────────────────────────────────────────
const SEED_USERS = [
  { email: "admin@luminon.vn", password: "Admin@123456", fullName: "Nguyễn Quản Trị", role: ROLES.ADMIN },
  { email: "sales1@luminon.vn", password: "Sales@123456", fullName: "Trần Thị Bán Hàng", role: ROLES.SALES },
  { email: "sales2@luminon.vn", password: "Sales@123456", fullName: "Lê Văn Kinh Doanh", role: ROLES.SALES },
  { email: "accountant@luminon.vn", password: "Acct@123456", fullName: "Phạm Thị Kế Toán", role: ROLES.ACCOUNTANT },
  { email: "pm@luminon.vn", password: "PM@123456", fullName: "Hoàng Văn Quản Lý", role: ROLES.PRODUCTION_MANAGER },
  { email: "worker1@luminon.vn", password: "Worker@123456", fullName: "Đỗ Văn Thợ Một", role: ROLES.CONSTRUCTION_TEAM },
  { email: "worker2@luminon.vn", password: "Worker@123456", fullName: "Vũ Văn Thợ Hai", role: ROLES.CONSTRUCTION_TEAM },
  { email: "warehouse@luminon.vn", password: "WH@123456", fullName: "Bùi Văn Kho", role: ROLES.WAREHOUSE_STAFF },
];

async function seed() {
  console.log("🌱 Starting seed...\n");

  // ─── 1. Create Permissions ──────────────────────────────────────
  console.log("📋 Creating permissions...");
  const insertedPermissions = await db
    .insert(permissions)
    .values(ALL_PERMISSIONS)
    .onConflictDoNothing()
    .returning();
  console.log(`   ✅ ${insertedPermissions.length} permissions created\n`);

  // Get all permissions from DB (including any that already existed)
  const allDbPerms = await db.select().from(permissions);
  const permMap = new Map(allDbPerms.map((p) => [p.code, p.id]));

  // ─── 2. Create Roles ────────────────────────────────────────────
  console.log("👥 Creating roles...");
  const roleDefinitions = [
    { name: ROLES.ADMIN, description: "Quản trị viên - Toàn quyền", isSystem: true },
    { name: ROLES.SALES, description: "Nhân viên kinh doanh", isSystem: true },
    { name: ROLES.ACCOUNTANT, description: "Kế toán", isSystem: true },
    { name: ROLES.PRODUCTION_MANAGER, description: "Quản lý sản xuất", isSystem: true },
    { name: ROLES.CONSTRUCTION_TEAM, description: "Đội thi công", isSystem: true },
    { name: ROLES.WAREHOUSE_STAFF, description: "Nhân viên kho", isSystem: true },
  ];

  const insertedRoles = await db
    .insert(roles)
    .values(roleDefinitions)
    .onConflictDoNothing()
    .returning();
  console.log(`   ✅ ${insertedRoles.length} roles created\n`);

  const allDbRoles = await db.select().from(roles);
  const roleMap = new Map(allDbRoles.map((r) => [r.name, r.id]));

  // ─── 3. Assign Permissions to Roles ─────────────────────────────
  console.log("🔗 Assigning permissions to roles...");
  for (const [roleName, permCodes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    const rpValues = permCodes
      .map((code) => {
        const permId = permMap.get(code);
        if (!permId) return null;
        return { roleId, permissionId: permId };
      })
      .filter(Boolean) as { roleId: string; permissionId: string }[];

    if (rpValues.length > 0) {
      await db.insert(rolePermissions).values(rpValues).onConflictDoNothing();
    }
    console.log(`   ✅ ${roleName}: ${rpValues.length} permissions`);
  }
  console.log();

  // ─── 4. Create Users via Supabase Auth ──────────────────────────
  console.log("👤 Creating users...");
  for (const seedUser of SEED_USERS) {
    // Create auth user in Supabase
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: seedUser.email,
        password: seedUser.password,
        email_confirm: true,
        user_metadata: { full_name: seedUser.fullName },
      });

    if (authError) {
      if (authError.message?.includes("already been registered")) {
        console.log(`   ⏭️  ${seedUser.email} already exists, skipping...`);
        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
          (u) => u.email === seedUser.email
        );
        if (existingUser) {
          // Ensure profile exists
          await db
            .insert(users)
            .values({
              id: existingUser.id,
              email: seedUser.email,
              fullName: seedUser.fullName,
            })
            .onConflictDoNothing();

          // Assign role
          const roleId = roleMap.get(seedUser.role);
          if (roleId) {
            await db
              .insert(userRoles)
              .values({ userId: existingUser.id, roleId })
              .onConflictDoNothing();
          }
        }
        continue;
      }
      console.error(`   ❌ Error creating ${seedUser.email}:`, authError.message);
      continue;
    }

    if (authData.user) {
      // Create profile in public.users
      await db
        .insert(users)
        .values({
          id: authData.user.id,
          email: seedUser.email,
          fullName: seedUser.fullName,
        })
        .onConflictDoNothing();

      // Assign role
      const roleId = roleMap.get(seedUser.role);
      if (roleId) {
        await db
          .insert(userRoles)
          .values({ userId: authData.user.id, roleId })
          .onConflictDoNothing();
      }

      console.log(`   ✅ ${seedUser.email} (${seedUser.role})`);
    }
  }
  console.log();

  // ─── 5. Create Lookup Data ──────────────────────────────────────
  console.log("📚 Creating lookup data...");

  // Customer Sources
  await db
    .insert(customerSources)
    .values([
      { name: "Facebook" },
      { name: "Zalo" },
      { name: "Website" },
      { name: "Giới thiệu" },
      { name: "Walk-in" },
      { name: "Google Ads" },
      { name: "Khác" },
    ])
    .onConflictDoNothing();
  console.log("   ✅ Customer sources");

  // Customer Statuses
  await db
    .insert(customerStatuses)
    .values([
      { name: "Mới", color: "#3B82F6", sortOrder: 1 },
      { name: "Đã liên hệ", color: "#F59E0B", sortOrder: 2 },
      { name: "Đang đàm phán", color: "#8B5CF6", sortOrder: 3 },
      { name: "Đã chốt", color: "#16A34A", sortOrder: 4 },
      { name: "Đã mất", color: "#DC2626", sortOrder: 5 },
    ])
    .onConflictDoNothing();
  console.log("   ✅ Customer statuses");

  // Project Statuses
  await db
    .insert(projectStatuses)
    .values([
      { name: "Mới tạo", color: "#6B7280", sortOrder: 1 },
      { name: "Đang thi công", color: "#3B82F6", sortOrder: 2 },
      { name: "Tạm dừng", color: "#F59E0B", sortOrder: 3 },
      { name: "Hoàn thành", color: "#16A34A", sortOrder: 4 },
      { name: "Đã hủy", color: "#DC2626", sortOrder: 5 },
    ])
    .onConflictDoNothing();
  console.log("   ✅ Project statuses");

  // Worker Roles
  await db
    .insert(workerRoles)
    .values([
      { name: "Thợ chính" },
      { name: "Thợ phụ" },
      { name: "Thợ sơn" },
      { name: "Thợ điện" },
      { name: "Thợ nước" },
      { name: "Thợ hàn" },
    ])
    .onConflictDoNothing();
  console.log("   ✅ Worker roles");

  // Material Categories
  await db
    .insert(materialCategories)
    .values([
      { name: "Gỗ", description: "Các loại gỗ tự nhiên và công nghiệp" },
      { name: "Kim loại", description: "Inox, sắt, nhôm" },
      { name: "Kính", description: "Kính cường lực, kính màu" },
      { name: "Sơn", description: "Sơn tường, sơn gỗ, sơn kim loại" },
      { name: "Phụ kiện", description: "Bản lề, tay nắm, ốc vít" },
      { name: "Đá", description: "Đá granite, đá marble" },
      { name: "Vải", description: "Vải bọc, rèm cửa" },
      { name: "Khác", description: "Vật tư khác" },
    ])
    .onConflictDoNothing();
  console.log("   ✅ Material categories");

  console.log("\n🎉 Seed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
