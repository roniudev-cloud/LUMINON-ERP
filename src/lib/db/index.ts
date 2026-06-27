import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";

const connectionString = process.env.DATABASE_URL!;

// Use connection pooling for serverless environments
const client = postgres(connectionString, {
  prepare: false, // Required for Supabase connection pooling
  ssl: "require", // Required for local connection to Supabase
  // Mở connection mới tới Supabase tốn ~3.5s (khoảng cách địa lý + TLS handshake) trong khi
  // 1 query trên connection đã mở chỉ ~170ms — đo thực tế bằng script benchmark. idle_timeout
  // càng ngắn thì càng hay phải mở lại connection mới (trả giá 3.5s) giữa các lượt thao tác
  // bình thường của người dùng. Tăng lên 5 phút để giữ connection ấm lâu hơn; nếu sau này gặp
  // lỗi ECONNRESET/ETIMEDOUT do Supabase/network tự đóng connection nhàn rỗi, giảm số này lại.
  idle_timeout: 300,
  max_lifetime: 60 * 30,
  connect_timeout: 10,
  // Nhiều trang giờ gọi hàng chục query song song qua Promise.all — tăng pool để chúng
  // không phải xếp hàng chờ connection rảnh (mặc định của postgres-js chỉ là 10).
  max: 20,
});

export const db = drizzle(client, { schema });
