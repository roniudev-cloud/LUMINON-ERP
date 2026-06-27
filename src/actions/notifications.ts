"use server";

import { db } from "@/lib/db";
import { eq, and, isNull, desc, count } from "drizzle-orm";
import { requireAuth } from "./auth";
import { revalidatePath } from "next/cache";
import { notifications } from "@db/schema/productivity";

export async function getMyNotifications() {
  const user = await requireAuth();

  const [data, [{ value: unreadCount }]] = await Promise.all([
    db.query.notifications.findMany({
      where: and(eq(notifications.userId, user.id), isNull(notifications.deletedAt)),
      orderBy: [desc(notifications.createdAt)],
      limit: 10,
    }),
    db
      .select({ value: count(notifications.id) })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, user.id),
          eq(notifications.isRead, false),
          isNull(notifications.deletedAt)
        )
      ),
  ]);

  return { data, unreadCount };
}

export async function markNotificationRead(id: string) {
  const user = await requireAuth();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const user = await requireAuth();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  revalidatePath("/dashboard");
  return { success: true };
}
