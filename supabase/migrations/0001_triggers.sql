-- Auto-update updated_at triggers

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON "users"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_customers_modtime
BEFORE UPDATE ON "customers"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_leads_modtime
BEFORE UPDATE ON "leads"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_contracts_modtime
BEFORE UPDATE ON "contracts"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_quotations_modtime
BEFORE UPDATE ON "quotations"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_projects_modtime
BEFORE UPDATE ON "projects"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_customer_debts_modtime
BEFORE UPDATE ON "customer_debts"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_supplier_debts_modtime
BEFORE UPDATE ON "supplier_debts"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_materials_modtime
BEFORE UPDATE ON "materials"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_suppliers_modtime
BEFORE UPDATE ON "suppliers"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_online_orders_modtime
BEFORE UPDATE ON "online_orders"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_modtime
BEFORE UPDATE ON "products"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_workers_modtime
BEFORE UPDATE ON "workers"
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

