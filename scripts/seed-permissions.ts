/**
 * Đồng bộ bảng `roles` / `permissions` / `role_permissions` trong DB với
 * ROLES / PERMISSIONS / DEFAULT_ROLE_PERMISSIONS trong src/lib/constants.ts
 * (nguồn sự thật cho RBAC runtime). An toàn để chạy lại nhiều lần (idempotent).
 *
 * Chạy: npx tsx scripts/seed-permissions.ts
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { db } = await import("../src/lib/db");
  const { roles, permissions, rolePermissions } = await import("../drizzle/schema/auth");
  const { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } = await import("../src/lib/constants");
  const { eq, sql } = await import("drizzle-orm");

  // 1. Roles — giữ "admin" hệ thống có sẵn, bổ sung các role còn thiếu (1 lần ghi duy nhất).
  await db
    .insert(roles)
    .values(Object.values(ROLES).map((roleName) => ({ name: roleName, isSystem: true })))
    .onConflictDoNothing({ target: roles.name });

  // 2. Permissions — module suy ra từ tiền tố trước dấu chấm đầu tiên trong code.
  await db
    .insert(permissions)
    .values(
      Object.entries(PERMISSIONS).map(([key, code]) => ({
        code,
        name: key.replace(/_/g, " "),
        module: code.split(".")[0],
      }))
    )
    .onConflictDoNothing({ target: permissions.code });

  // 3. Role <-> Permission mapping theo DEFAULT_ROLE_PERMISSIONS (1 lần ghi duy nhất).
  const allRoles = await db.query.roles.findMany();
  const allPermissions = await db.query.permissions.findMany();
  const roleIdByName = new Map(allRoles.map((r) => [r.name, r.id]));
  const permissionIdByCode = new Map(allPermissions.map((p) => [p.code, p.id]));

  const links: { roleId: string; permissionId: string }[] = [];
  for (const [roleName, permissionCodes] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    const roleId = roleIdByName.get(roleName);
    if (!roleId) continue;
    for (const code of permissionCodes as string[]) {
      const permissionId = permissionIdByCode.get(code);
      if (!permissionId) continue;
      links.push({ roleId, permissionId });
    }
  }

  if (links.length > 0) {
    await db.insert(rolePermissions).values(links).onConflictDoNothing();
  }

  console.log(`Đồng bộ xong: ${allRoles.length} roles, ${allPermissions.length} permissions, ${links.length} role-permission links.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
