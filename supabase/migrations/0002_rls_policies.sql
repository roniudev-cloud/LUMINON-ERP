-- Enable RLS on all tables

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lead_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contract_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contract_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contract_payment_terms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contract_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contracts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quotation_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quotation_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quotations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_costs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_log_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_statuses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_workers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customer_debts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "receipt_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "receipts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supplier_debts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vat_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "material_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "materials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "online_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "online_order_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "online_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "worker_advances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "worker_attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "worker_payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "worker_roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "acceptance_reports" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "liquidation_reports" ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- BASELINE POLICIES (Super Admin)
-- Admin role can do everything
-- ==========================================

CREATE POLICY "Admins have full access to audit_logs" ON "audit_logs"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to permissions" ON "permissions"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to role_permissions" ON "role_permissions"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to roles" ON "roles"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to user_roles" ON "user_roles"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to users" ON "users"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to customer_activities" ON "customer_activities"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to customer_notes" ON "customer_notes"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to customer_sources" ON "customer_sources"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to customer_statuses" ON "customer_statuses"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to customers" ON "customers"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to lead_assignments" ON "lead_assignments"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to lead_sources" ON "lead_sources"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to leads" ON "leads"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to contract_files" ON "contract_files"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to contract_items" ON "contract_items"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to contract_payment_terms" ON "contract_payment_terms"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to contract_templates" ON "contract_templates"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to contracts" ON "contracts"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to quotation_items" ON "quotation_items"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to quotation_templates" ON "quotation_templates"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to quotations" ON "quotations"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to project_costs" ON "project_costs"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to project_log_files" ON "project_log_files"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to project_logs" ON "project_logs"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to project_statuses" ON "project_statuses"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to project_tasks" ON "project_tasks"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to project_workers" ON "project_workers"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to projects" ON "projects"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to customer_debts" ON "customer_debts"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to payment_files" ON "payment_files"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to payments" ON "payments"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to receipt_files" ON "receipt_files"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to receipts" ON "receipts"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to supplier_debts" ON "supplier_debts"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to vat_invoices" ON "vat_invoices"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to material_categories" ON "material_categories"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to materials" ON "materials"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to stock_entries" ON "stock_entries"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to stock_movements" ON "stock_movements"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to suppliers" ON "suppliers"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to online_order_items" ON "online_order_items"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to online_order_payments" ON "online_order_payments"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to online_orders" ON "online_orders"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to product_variants" ON "product_variants"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to products" ON "products"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to worker_advances" ON "worker_advances"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to worker_attendances" ON "worker_attendances"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to worker_payments" ON "worker_payments"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to worker_roles" ON "worker_roles"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to workers" ON "workers"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to acceptance_reports" ON "acceptance_reports"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to files" ON "files"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );

CREATE POLICY "Admins have full access to liquidation_reports" ON "liquidation_reports"
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT u.id FROM users u 
      JOIN user_roles ur ON u.id = ur.user_id 
      JOIN roles r ON ur.role_id = r.id 
      WHERE r.name = 'Admin' AND u.is_active = true
    )
  );


-- ==========================================
-- COMMON POLICIES
-- Users can read their own profile
-- ==========================================
CREATE POLICY "Users can view own profile" ON "users" FOR SELECT TO authenticated USING (auth.uid() = id);

-- ==========================================
-- CRM & SALES POLICIES
-- Sales can view/edit assigned customers and leads
-- ==========================================
CREATE POLICY "Sales view assigned customers" ON "customers" FOR SELECT TO authenticated USING (
  assigned_to_id = auth.uid() OR created_by = auth.uid()
);
CREATE POLICY "Sales view assigned leads" ON "leads" FOR SELECT TO authenticated USING (
  assigned_to_id = auth.uid()
);
CREATE POLICY "Sales view assigned quotations" ON "quotations" FOR SELECT TO authenticated USING (
  created_by = auth.uid()
);
CREATE POLICY "Sales view assigned contracts" ON "contracts" FOR SELECT TO authenticated USING (
  created_by = auth.uid()
);

-- ==========================================
-- PRODUCTION & CONSTRUCTION
-- PM views all projects, Construction views assigned
-- ==========================================
CREATE POLICY "Construction view assigned projects" ON "projects" FOR SELECT TO authenticated USING (
  manager_id = auth.uid()
);
CREATE POLICY "Construction view assigned tasks" ON "project_tasks" FOR SELECT TO authenticated USING (
  assigned_to_id = auth.uid()
);
CREATE POLICY "Construction can create logs" ON "project_logs" FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid()
);

-- Note: The application layer uses service_role key for critical operations.
-- For the MVP, if users use the application UI, Server Actions with service_role will bypass RLS.
-- RLS is provided here as defense-in-depth and for client-side queries if used.
