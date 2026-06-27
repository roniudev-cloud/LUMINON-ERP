-- Hàm helper để lấy company_id hiện tại của user an toàn, tránh infinite recursion
CREATE OR REPLACE FUNCTION get_current_company_id() RETURNS uuid AS $$
  SELECT company_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Bật RLS và tạo policy cho các bảng nghiệp vụ
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY[
        'customers', 'leads', 'contracts', 'quotations', 'projects', 'project_tasks', 
        'workers', 'receipts', 'payments', 'customer_debts', 'supplier_debts', 
        'vat_invoices', 'suppliers', 'materials', 'products', 'reminders'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Enable RLS
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        
        -- Drop existing policies if any
        EXECUTE format('DROP POLICY IF EXISTS "Users can view their company data" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert their company data" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update their company data" ON %I;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete their company data" ON %I;', t);
        
        -- Create new policies
        EXECUTE format('CREATE POLICY "Users can view their company data" ON %I FOR SELECT USING (company_id = get_current_company_id());', t);
        EXECUTE format('CREATE POLICY "Users can insert their company data" ON %I FOR INSERT WITH CHECK (company_id = get_current_company_id());', t);
        EXECUTE format('CREATE POLICY "Users can update their company data" ON %I FOR UPDATE USING (company_id = get_current_company_id());', t);
        EXECUTE format('CREATE POLICY "Users can delete their company data" ON %I FOR DELETE USING (company_id = get_current_company_id());', t);
    END LOOP;
END $$;
