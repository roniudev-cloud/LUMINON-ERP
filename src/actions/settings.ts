"use server";

import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "./auth";
import { PERMISSIONS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { settings } from "@db/schema/settings";
import { auditLogs } from "@db/schema/auth";

export async function saveSettings(group: string, key: string, data: any) {
  const user = await requireAuth("settings.view"); // general check, or key-based check

  // Find if exists
  const existing = await db.query.settings.findFirst({
    where: and(
      eq(settings.key, key),
      user.companyId ? eq(settings.companyId, user.companyId) : undefined
    )
  });

  let result;
  if (existing) {
    [result] = await db.update(settings)
      .set({ value: data, group, updatedAt: new Date() })
      .where(eq(settings.id, existing.id))
      .returning();
  } else {
    [result] = await db.insert(settings)
      .values({
        companyId: user.companyId,
        group,
        key,
        value: data
      })
      .returning();
  }

  await db.insert(auditLogs).values({
    userId: user.id,
    action: "UPDATE",
    module: "settings",
    entityId: result.id,
    entityType: key,
    newData: data,
  });

  revalidatePath(`/settings/${group}`);
  revalidatePath("/settings");
  return { success: true };
}

export async function getSettings(key: string) {
  const user = await requireAuth("settings.view");
  
  const existing = await db.query.settings.findFirst({
    where: and(
      eq(settings.key, key),
      user.companyId ? eq(settings.companyId, user.companyId) : undefined
    )
  });

  return existing?.value || null;
}

export async function saveCompanySettings(data: any) {
  return saveSettings("company", "company_profile", data);
}

export async function getCompanySettings() {
  return getSettings("company_profile");
}

