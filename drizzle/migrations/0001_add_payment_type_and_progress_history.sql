-- Viết tay (không dùng `drizzle-kit generate`) vì snapshot migration 0000 đã lệch so với
-- DB thật (project này đồng bộ schema bằng `npm run db:push`, không qua chuỗi migration).
-- Chỉ CỘNG THÊM cột/bảng mới — không sửa/xóa gì trên dữ liệu hiện có. An toàn để chạy lại
-- (IF NOT EXISTS) nếu đã áp dụng một phần.

-- 1. Phân biệt "công nhật" (daily) vs "khoán việc" (lump_sum) khi chốt lương nhân công.
ALTER TABLE "worker_payments"
  ADD COLUMN IF NOT EXISTS "payment_type" text NOT NULL DEFAULT 'daily';
--> statement-breakpoint

-- 2. Lịch sử % tiến độ công trình theo thời gian (trước đây chỉ có 1 cột tĩnh `projects.progress`).
CREATE TABLE IF NOT EXISTS "project_progress_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"project_id" uuid NOT NULL,
	"progress" integer NOT NULL,
	"note" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "project_progress_updates" ADD CONSTRAINT "project_progress_updates_project_id_projects_id_fk"
   FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "project_progress_updates" ADD CONSTRAINT "project_progress_updates_created_by_users_id_fk"
   FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 3. Liên hệ Zalo/Facebook/Website riêng trên hồ sơ khách hàng (đặc tả mục 5.1).
ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "zalo" text,
  ADD COLUMN IF NOT EXISTS "facebook" text,
  ADD COLUMN IF NOT EXISTS "website" text;
