import { getContract } from "@/actions/contracts";
import { requireAuth } from "@/actions/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ContractForm } from "@/features/contracts/contract-form";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Sửa Hợp đồng | LUMINON ERP",
};

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();

  let contract;
  let allCustomers;
  try {
    contract = await getContract(id);
    
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
        title={`Sửa Hợp đồng: ${contract.code}`}
        description="Cập nhật thông tin chi tiết và các điều khoản."
      />

      <div className="max-w-5xl">
        <ContractForm initialData={contract} customers={allCustomers} />
      </div>
    </div>
  );
}
