-- Thêm bảng companies
CREATE TABLE IF NOT EXISTS "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tax_code" text,
	"address" text,
	"phone" text,
	"email" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

-- Thêm company_id và deleted_at vào users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "company_id" uuid;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Tạo bảng personal_reminders nếu chưa có
CREATE TABLE IF NOT EXISTS "personal_reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"reminder_date" timestamp with time zone NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"module" text,
	"record_id" text,
	"notes" text,
	"assigned_to" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "deleted_at" timestamp with time zone
);

DO $$ BEGIN
 ALTER TABLE "personal_reminders" ADD CONSTRAINT "personal_reminders_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "personal_reminders" ADD CONSTRAINT "personal_reminders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Helper macro để thêm company_id và deleted_at vào các bảng
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY[
        'customers', 'leads', 'contracts', 'quotations', 'projects', 'project_tasks', 
        'workers', 'receipts', 'payments', 'customer_debts', 'supplier_debts', 
        'vat_invoices', 'suppliers', 'materials', 'products', 'lead_sources', 
        'customer_sources', 'customer_statuses', 'customer_notes', 'customer_activities',
        'contract_templates', 'quotation_templates', 'project_statuses', 'worker_roles',
        'worker_attendances', 'worker_payments', 'worker_advances', 'stock_entries',
        'stock_movements', 'material_categories', 'calendar_events', 'tasks', 'notifications'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Kiểm tra xem bảng có tồn tại không
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = t) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS company_id uuid', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone', t);
        END IF;
    END LOOP;
END $$;
