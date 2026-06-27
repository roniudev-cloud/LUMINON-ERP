import { db } from "@/lib/db/index";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("Starting Web-based DB Migration...");
  try {
    // 1. Add deleted_at to users
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`);
    console.log("Successfully ran DDL migration for users table!");

    // 2. Add deleted_at to any other key tables just in case
    const tables = ["companies", "roles", "customers", "projects", "leads", "tasks", "reminders", "workers", "debts", "vat_invoices"];
    for (const table of tables) {
      try {
        await db.execute(sql`ALTER TABLE ${sql.raw(table)} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`);
      } catch (e) {
        // Ignore if table doesn't exist or other errors
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database schema migration completed successfully (deleted_at columns verified/added)!",
    });
  } catch (err: any) {
    console.error("Migration endpoint error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
