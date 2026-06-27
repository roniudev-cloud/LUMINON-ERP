"use server";

import { db } from "@/lib/db";
import { ilike, isNull, and, or } from "drizzle-orm";
import { requireAuth } from "./auth";
import { customers, leads } from "@db/schema/crm";
import { projects } from "@db/schema/projects";

export async function globalSearch(query: string) {
  await requireAuth();

  const term = query.trim();
  if (term.length < 2) return { customers: [], leads: [], projects: [] };

  const pattern = `%${term}%`;

  const [customerResults, leadResults, projectResults] = await Promise.all([
    db.query.customers.findMany({
      where: and(
        isNull(customers.deletedAt),
        or(ilike(customers.name, pattern), ilike(customers.phone, pattern), ilike(customers.email, pattern))
      ),
      limit: 5,
    }),
    db.query.leads.findMany({
      where: and(
        isNull(leads.deletedAt),
        or(ilike(leads.name, pattern), ilike(leads.phone, pattern))
      ),
      limit: 5,
    }),
    db.query.projects.findMany({
      where: and(
        isNull(projects.deletedAt),
        or(ilike(projects.name, pattern), ilike(projects.code, pattern))
      ),
      limit: 5,
    }),
  ]);

  return { customers: customerResults, leads: leadResults, projects: projectResults };
}
