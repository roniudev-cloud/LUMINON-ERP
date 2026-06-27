import { getQuotations } from "@/actions/quotations";
import { PageHeader } from "@/components/shared/page-header";
import { ClientQuotationsTable } from "@/features/quotations/client-quotations-table";

export const metadata = {
  title: "Danh sách Báo giá | LUMINON ERP",
};

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const search = typeof params.search === "string" ? params.search : undefined;

  const result = await getQuotations({ page, search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo giá"
        description="Quản lý danh sách báo giá của khách hàng."
        action={{
          label: "Tạo Báo giá",
          href: "/quotations/new",
        }}
      />

      <div className="bg-card rounded-xl border">
        <ClientQuotationsTable data={result.data} />
      </div>
    </div>
  );
}
