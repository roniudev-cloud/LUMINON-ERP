import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "@/lib/db/index";

async function run() {
  console.log("Connecting to database and running ALTER TABLE users...");
  try {
    await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;`);
    console.log("Success! Added deleted_at column to users table.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to run SQL:", err);
    process.exit(1);
  }
}

run();
