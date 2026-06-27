"use client";

import { useAuth } from "@/providers/auth-provider";
import { ROLES } from "@/lib/constants";
import { useMemo } from "react";

export function usePermissions() {
  const { user } = useAuth();

  const isAdmin = useMemo(
    () => user?.roles.includes(ROLES.ADMIN) ?? false,
    [user]
  );

  const hasPermission = useMemo(() => {
    return (permissionCode: string): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      return user.permissions.includes(permissionCode);
    };
  }, [user, isAdmin]);

  const hasRole = useMemo(() => {
    return (...roleNames: string[]): boolean => {
      if (!user) return false;
      return user.roles.some((r) => roleNames.includes(r));
    };
  }, [user]);

  const hasAnyPermission = useMemo(() => {
    return (...codes: string[]): boolean => {
      if (!user) return false;
      if (isAdmin) return true;
      return codes.some((code) => user.permissions.includes(code));
    };
  }, [user, isAdmin]);

  return {
    user,
    isAdmin,
    hasPermission,
    hasRole,
    hasAnyPermission,
  };
}
