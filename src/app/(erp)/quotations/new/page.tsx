import { PageHeader } from "@/components/shared/page-header";
import { QuotationForm } from "@/features/quotations/quotation-form";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { customers } from "@db/schema/crm";
import { requireAuth } from "@/actions/auth";

export const metadata = {
  title: "Tạo Báo giá | LUMINON ERP",
};

export default async function NewQuotationPage() {
  const user = await requireAuth();

  // For Admin, fetch all. For Sales, we might restrict. Keep it simple for now or fetch based on permissions.
  // We'll fetch all active customers for simplicity in this phase.
  const allCustomers = await db.query.customers.findMany({
    columns: { id: true, name: true },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo báo giá mới"
        description="Nhập thông tin chi tiết các hạng mục báo giá."
      />

      <div className="max-w-5xl">
        <QuotationForm customers={allCustomers} />
      </div>
    </div>
  );
}
