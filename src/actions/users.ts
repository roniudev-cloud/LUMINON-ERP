"use server";

import { db } from "@/lib/db";
import { eq, desc, count, ilike, or, sql } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { users, userRoles, auditLogs } from "@db/schema/auth";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CreateUserFormValues, UpdateUserFormValues } from "@/lib/validations/users";

export async function getUsers(params: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  await requireAuth(PERMISSIONS.USERS_VIEW);
  
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  let where;
  if (params.search) {
    where = or(
      ilike(users.fullName, `%${params.search}%`),
      ilike(users.email, `%${params.search}%`),
      ilike(users.phone, `%${params.search}%`)
    );
  }

  const [{ value: totalCount }] = await db
    .select({ value: count(users.id) })
    .from(users)
    .where(where);

  const dataRows = await db.query.users.findMany({
    where,
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
    orderBy: [desc(users.createdAt)],
    limit: pageSize,
    offset,
  });

  const data = dataRows.map((user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
    roles: user.userRoles.map((ur) => ur.role.name),
  }));

  return {
    data,
    total: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function updateMyProfile(data: { fullName: string; phone?: string | null }) {
  const user = await requireAuth();

  const [updated] = await db
    .update(users)
    .set({ fullName: data.fullName, phone: data.phone || null, updatedAt: sql`now()` })
    .where(eq(users.id, user.id))
    .returning();

  revalidatePath("/profile/edit");
  return updated;
}

export async function getUserById(id: string) {
  await requireAuth(PERMISSIONS.USERS_VIEW);

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: { userRoles: { with: { role: true } } },
  });
  if (!user) throw new Error("Không tìm thấy người dùng");

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    isActive: user.isActive,
    roleIds: user.userRoles.map((ur) => ur.roleId),
  };
}

/** Tạo tài khoản Supabase Auth thật + bản ghi public.users + gán vai trò. */
export async function createUserAccount(data: CreateUserFormValues) {
  const currentUser = await requireAuth(PERMISSIONS.USERS_MANAGE);

  const existing = await db.query.users.findFirst({ where: eq(users.email, data.email) });
  if (existing) throw new Error("Email này đã được sử dụng trong hệ thống");

  const admin = createAdminClient();
  const tempPassword = `Luminon@${Math.random().toString(36).slice(2, 8)}${Date.now().toString().slice(-4)}`;

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: data.fullName },
  });
  if (authError || !authData.user) {
    throw new Error(authError?.message || "Không thể tạo tài khoản đăng nhập");
  }

  try {
    await db.insert(users).values({
      id: authData.user.id,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || null,
      isActive: true,
    });

    await db.insert(userRoles).values(data.roleIds.map((roleId) => ({ userId: authData.user.id, roleId })));

    await db.insert(auditLogs).values({
      userId: currentUser.id,
      action: "CREATE",
      module: "users",
      entityId: authData.user.id,
      entityType: "user",
      newData: { email: data.email, fullName: data.fullName },
    });
  } catch (dbError) {
    // Dọn lại tài khoản Auth nếu phần ghi DB thất bại, tránh tài khoản "mồ côi".
    await admin.auth.admin.deleteUser(authData.user.id).catch(() => {});
    throw dbError;
  }

  revalidatePath("/settings/users");
  return { success: true, tempPassword, email: data.email };
}

export async function updateUserAccount(id: string, data: UpdateUserFormValues) {
  const currentUser = await requireAuth(PERMISSIONS.USERS_MANAGE);

  const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!existing) throw new Error("Không tìm thấy người dùng");

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ fullName: data.fullName, phone: data.phone || null })
      .where(eq(users.id, id));

    await tx.delete(userRoles).where(eq(userRoles.userId, id));
    await tx.insert(userRoles).values(data.roleIds.map((roleId) => ({ userId: id, roleId })));
  });

  await db.insert(auditLogs).values({
    userId: currentUser.id,
    action: "UPDATE",
    module: "users",
    entityId: id,
    entityType: "user",
    oldData: existing,
    newData: data,
  });

  revalidatePath("/settings/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string) {
  const currentUser = await requireAuth(PERMISSIONS.USERS_MANAGE);
  
  if (currentUser.id === userId) {
    throw new Error("Không thể tự khóa tài khoản của chính mình.");
  }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!existingUser) {
    throw new Error("User not found");
  }

  await db
    .update(users)
    .set({ isActive: !existingUser.isActive })
    .where(eq(users.id, userId));

  revalidatePath("/settings/users");
  return { success: true, isActive: !existingUser.isActive };
}
