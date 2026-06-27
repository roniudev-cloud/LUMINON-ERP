import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../src/lib/db/index";
import { vatInvoices } from "../drizzle/schema/finance";
import { users } from "../drizzle/schema/auth";

async function main() {
  console.log("Seeding dummy data (VAT only)...");
  
  const adminUser = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, "admin@luminon.vn")
  });
  
  if (!adminUser) {
    console.error("Admin user not found.");
    process.exit(1);
  }

  const customer = await db.query.customers.findFirst({
    where: (c, { eq }) => eq(c.code, "KH-DUMMY-003")
  });

  if (!customer) {
    console.error("Customer not found.");
    process.exit(1);
  }

  // 8. VAT Invoice
  const [vat] = await db.insert(vatInvoices).values({
    companyId: adminUser.companyId,
    code: "VAT-003",
    customerId: customer.id,
    type: "outbound",
    amount: "150000000",
    vatRate: "10",
    vatAmount: "15000000",
    totalAmount: "165000000",
    issueDate: new Date().toISOString().split("T")[0],
    status: "issued",
    createdBy: adminUser.id,
  }).returning();

  console.log(`Created VAT invoice: ${vat.code}`);

  console.log("Done!");
  process.exit(0);
}

main();
