import { getQuotation } from "@/actions/quotations";
import { requireAuth } from "@/actions/auth";
import { PageHeader } from "@/components/shared/page-header";
import { QuotationForm } from "@/features/quotations/quotation-form";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { customers } from "@db/schema/crm";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Sửa Báo giá | LUMINON ERP",
};

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();

  let quotation;
  let allCustomers;
  try {
    quotation = await getQuotation(id);
    
    allCustomers = await db.query.customers.findMany({
      columns: { id: true, name: true },
      orderBy: (c, { asc }) => [asc(c.name)],
    });
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa báo giá: ${quotation.code}`}
        description="Cập nhật chi tiết các hạng mục báo giá."
      />

      <div className="max-w-5xl">
        <QuotationForm initialData={quotation} customers={allCustomers} />
      </div>
    </div>
  );
}
