"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/types";
import { ROLES } from "@/lib/constants";
import { users, userRoles } from "@db/schema/auth";

/**
 * Get the current authenticated user with their roles and permissions.
 * This is the primary function for server-side auth checks.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  // Get user profile
  let userProfile;
  try {
    userProfile = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, authUser.id),
    });
  } catch (error) {
    console.error("Database error when fetching user profile:", error);
    return null;
  }

  // Auto-sync: if auth user exists but public.users doesn't, create it
  if (!userProfile) {
    try {
      const defaultName = authUser.email?.split('@')[0] || "User";
      await db.insert(users).values({
        id: authUser.id,
        email: authUser.email || "",
        fullName: authUser.user_metadata?.full_name || defaultName,
        avatarUrl: authUser.user_metadata?.avatar_url || null,
        isActive: true,
      });
      
      // Fetch again after sync
      userProfile = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, authUser.id),
      });
    } catch (error) {
      console.error("Failed to auto-sync user profile:", error);
      return null;
    }
  }

  if (!userProfile || !userProfile.isActive) return null;

  // Get user roles
  const userRoleRows = await db.query.userRoles.findMany({
    where: (userRoles, { eq }) => eq(userRoles.userId, authUser.id),
    with: {
      role: {
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const roleNames = userRoleRows.map((ur) => ur.role.name);
  const permissionCodes = [
    ...new Set(
      userRoleRows.flatMap((ur) =>
        ur.role.rolePermissions.map((rp) => rp.permission.code)
      )
    ),
  ];

  return {
    id: authUser.id,
    companyId: userProfile.companyId,
    email: userProfile.email,
    fullName: userProfile.fullName,
    phone: userProfile.phone,
    avatarUrl: userProfile.avatarUrl,
    roles: roleNames,
    permissions: permissionCodes,
  };
});

/**
 * Check if the current user has a specific permission.
 * Admins always return true.
 */
export async function checkPermission(
  permissionCode: string
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (user.roles.includes(ROLES.ADMIN)) return true;
  return user.permissions.includes(permissionCode);
}

/**
 * Check if the current user has any of the specified roles.
 */
export async function checkRole(...roleNames: string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return user.roles.some((r) => roleNames.includes(r));
}

/**
 * Require authentication and optionally a permission.
 * Throws an error if the user is not authenticated or lacks permission.
 * Returns the current user if authorized.
 */
export async function requireAuth(
  permissionCode?: string
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Please log in.");
  }

  if (permissionCode) {
    const isAdmin = user.roles.includes(ROLES.ADMIN);
    if (!isAdmin && !user.permissions.includes(permissionCode)) {
      throw new Error(
        "Forbidden: You do not have permission to perform this action."
      );
    }
  }

  return user;
}
