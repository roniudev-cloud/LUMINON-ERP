import { PageHeader } from "@/components/shared/page-header";
import { ContractForm } from "@/features/contracts/contract-form";
import { db } from "@/lib/db";
import { requireAuth } from "@/actions/auth";

export const metadata = {
  title: "Tạo Hợp đồng | LUMINON ERP",
};

export default async function NewContractPage() {
  await requireAuth();

  const allCustomers = await db.query.customers.findMany({
    columns: { id: true, name: true },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Hợp đồng mới"
        description="Nhập thông tin hợp đồng và các đợt thanh toán."
      />

      <div className="max-w-5xl">
        <ContractForm customers={allCustomers} />
      </div>
    </div>
  );
}
