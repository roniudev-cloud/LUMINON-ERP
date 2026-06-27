import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { 
  users, roles, rolePermissions, permissions 
} from "../drizzle/schema/auth";
import {
  customers, leads,
} from "../drizzle/schema/crm";
import {
  materials, suppliers, stockMovements
} from "../drizzle/schema/inventory";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Bắt đầu seed data cho LUMINON ERP...");

  try {
    // 1. Tìm hoặc tạo Roles
    console.log("Tạo Roles cơ bản...");
    const roleAdmin = await db.insert(roles).values({ name: "Admin", description: "Quản trị viên" }).returning().onConflictDoUpdate({ target: roles.name, set: { name: "Admin" } });
    const roleSales = await db.insert(roles).values({ name: "Sales", description: "Nhân viên kinh doanh" }).returning().onConflictDoUpdate({ target: roles.name, set: { name: "Sales" } });
    const roleAccountant = await db.insert(roles).values({ name: "Accountant", description: "Kế toán" }).returning().onConflictDoUpdate({ target: roles.name, set: { name: "Accountant" } });

    // 2. Tạo Users (Chỉ tạo placeholder data trên DB, không insert qua Supabase Auth để tránh dính email logic thật)
    // Lưu ý: User ID ở đây sẽ sinh random UUID, khi Demo login thực tế thì phải dùng Auth của Supabase.
    // Script này chỉ giả lập data.
    console.log("Tạo Khách hàng (Customers) & Leads...");
    await db.insert(customers).values([
      { code: "CUS001", name: "Công ty TNHH XYZ", phone: "0901234567", email: "contact@xyz.vn" },
      { code: "CUS002", name: "Nguyễn Văn B", phone: "0987654321", email: "nguyenvanb@gmail.com" },
      { code: "CUS003", name: "Nội thất Đại Phát", phone: "0909090909", email: "info@daiphat.com" },
    ]).onConflictDoNothing();

    await db.insert(leads).values([
      { name: "Trần Thị C", phone: "0911222333", status: "new" },
      { name: "Lê Văn D", phone: "0922333444", status: "contacted" },
    ]).onConflictDoNothing();

    console.log("Tạo Vật tư (Materials) & Nhà cung cấp...");
    const supplier = await db.insert(suppliers).values({
      code: "SUP001",
      name: "Nhà cung cấp Gỗ Công Nghiệp An Cường",
      phone: "19001234",
    }).returning().onConflictDoNothing();

    await db.insert(materials).values([
      { code: "MDF-18", name: "Gỗ MDF lõi xanh 18mm", unit: "tấm", currentStock: 150 },
      { code: "VNR-01", name: "Veneer Sồi", unit: "cuộn", currentStock: 50 },
    ]).onConflictDoNothing();

    console.log("✅ Seed data thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi seed data:", error);
  } finally {
    process.exit(0);
  }
}

main();
