import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
async function main() {
  const { db } = await import("./src/lib/db");
  const { sql } = await import("drizzle-orm");
  const tables = [
    "customers","leads","quotations","contracts","projects","project_logs","project_tasks",
    "project_workers","project_costs","workers","material_categories","materials","stock_tickets",
    "suppliers","receipts","payments","customer_debts","supplier_debts","vat_invoices",
    "acceptance_reports","liquidation_reports","tasks","notifications","users"
  ];
  for (const t of tables) {
    const r = await db.execute(sql.raw(`select count(*) as c from ${t}`));
    console.log(t.padEnd(22), (r as any)[0].c);
  }
  process.exit(0);
}
main();
