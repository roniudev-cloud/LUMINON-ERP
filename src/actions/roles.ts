"use server";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { roles, permissions, rolePermissions, auditLogs } from "@db/schema/auth";
import { revalidatePath } from "next/cache";
import type { RoleFormValues } from "@/lib/validations/users";

export async function getRoles() {
  await requireAuth(PERMISSIONS.ROLES_MANAGE);

  const rolesList = await db.query.roles.findMany({
    with: {
      rolePermissions: {
        with: {
          permission: true,
        },
      },
      userRoles: {
        columns: {
          userId: true,
        },
      },
    },
    orderBy: (roles, { asc }) => [asc(roles.name)],
  });

  return rolesList.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role.userRoles.length,
    permissions: role.rolePermissions.map((rp) => rp.permission),
  }));
}

export async function getAllPermissions() {
  await requireAuth(PERMISSIONS.ROLES_MANAGE);

  const allPermissions = await db.query.permissions.findMany({
    orderBy: (p, { asc }) => [asc(p.module), asc(p.code)],
  });

  const grouped = new Map<string, typeof allPermissions>();
  for (const perm of allPermissions) {
    const arr = grouped.get(perm.module) || [];
    arr.push(perm);
    grouped.set(perm.module, arr);
  }
  return Array.from(grouped.entries()).map(([module, items]) => ({ module, items }));
}

export async function createRole(data: RoleFormValues) {
  const user = await requireAuth(PERMISSIONS.ROLES_MANAGE);

  const existing = await db.query.roles.findFirst({ where: eq(roles.name, data.name) });
  if (existing) throw new Error("Tên vai trò này đã tồn tại");

  const [role] = await db
    .insert(roles)
    .values({ name: data.name, description: data.description, isSystem: false })
    .returning();

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "CREATE",
    module: "roles",
    entityId: role.id,
    entityType: "role",
    newData: role,
  });

  revalidatePath("/settings/roles");
  return role;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const user = await requireAuth(PERMISSIONS.ROLES_MANAGE);

  const role = await db.query.roles.findFirst({ where: eq(roles.id, roleId) });
  if (!role) throw new Error("Không tìm thấy vai trò");

  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissionIds.length > 0) {
      await tx.insert(rolePermissions).values(permissionIds.map((permissionId) => ({ roleId, permissionId })));
    }
  });

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "roles",
    entityId: roleId,
    entityType: "role_permissions",
    newData: { permissionIds },
  });

  revalidatePath("/settings/roles");
  return { success: true };
}

export async function deleteRole(roleId: string) {
  const user = await requireAuth(PERMISSIONS.ROLES_MANAGE);

  const role = await db.query.roles.findFirst({
    where: eq(roles.id, roleId),
    with: { userRoles: { columns: { userId: true } } },
  });
  if (!role) throw new Error("Không tìm thấy vai trò");
  if (role.isSystem) throw new Error("Không thể xóa vai trò hệ thống");
  if (role.userRoles.length > 0) throw new Error("Không thể xóa vai trò đang được gán cho người dùng");

  await db.delete(roles).where(eq(roles.id, roleId));

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "DELETE",
    module: "roles",
    entityId: roleId,
    entityType: "role",
  });

  revalidatePath("/settings/roles");
  return { success: true };
}
