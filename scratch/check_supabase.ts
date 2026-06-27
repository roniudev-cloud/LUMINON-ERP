import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

async function checkConnection() {
  console.log("🔍 Kiểm tra kết nối Supabase...\n");

  // 1. Kiểm tra kết nối Supabase Data API (REST/Auth)
  console.log("1️⃣ Kiểm tra Supabase API (Data/Auth)...");
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("❌ Kết nối Supabase API thất bại:", error.message);
    } else {
      console.log("✅ Kết nối Supabase API thành công! (URL:", supabaseUrl, ")");
    }
  } catch (err: any) {
    console.error("❌ Lỗi cấu hình Supabase API:", err.message);
  }

  console.log("\n-----------------------------------\n");

  // 2. Kiểm tra kết nối Database trực tiếp (PostgreSQL)
  console.log("2️⃣ Kiểm tra Database Connection (Postgres)...");
  let queryClient;
  try {
    // Đang thử kết nối tới pooler 6543 thay vì 5432
    const connectionString = process.env.DATABASE_URL!;
    if (!connectionString) {
      throw new Error("Thiếu biến môi trường DATABASE_URL");
    }
    
    console.log("Đang thử kết nối tới:", connectionString.replace(/:[^:@]+@/, ':***@')); // Ẩn password
    
    // Connect to postgres and set timeout to 10s to not hang forever
    queryClient = postgres(connectionString, { max: 1, connect_timeout: 10 });
    const db = drizzle(queryClient);
    
    const start = Date.now();
    const result = await db.execute(sql`SELECT 1 as connected`);
    const ms = Date.now() - start;
    
    if (result && result.length > 0) {
      console.log(`✅ Kết nối Database thành công! (Mất ${ms}ms)`);
    } else {
      console.error("❌ Kết nối Database thất bại (Không trả về kết quả).");
    }
  } catch (err: any) {
    console.error("❌ Kết nối Database thất bại:");
    console.error(err.message);
  } finally {
    if (queryClient) {
      await queryClient.end();
    }
  }
}

checkConnection().catch(console.error);
