import { getContracts } from "@/actions/contracts";
import { PageHeader } from "@/components/shared/page-header";
import { ClientContractsTable } from "@/features/contracts/client-contracts-table";

export const metadata = {
  title: "Danh sách Hợp đồng | LUMINON ERP",
};

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const search = typeof params.search === "string" ? params.search : undefined;

  const result = await getContracts({ page, search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hợp đồng"
        description="Quản lý danh sách hợp đồng của khách hàng."
        action={{
          label: "Tạo Hợp đồng",
          href: "/contracts/new",
        }}
      />

      <div className="bg-card rounded-xl border">
        <ClientContractsTable data={result.data} />
      </div>
    </div>
  );
}
