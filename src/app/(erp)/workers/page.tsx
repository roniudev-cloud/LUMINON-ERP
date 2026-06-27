import { getWorkers } from "@/actions/workers";
import { PageHeader } from "@/components/shared/page-header";
import { ClientWorkersTable } from "@/features/workers/client-workers-table";

export const metadata = {
  title: "Quản lý Nhân công | LUMINON ERP",
};

export default async function WorkersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const search = typeof params.search === "string" ? params.search : undefined;

  const result = await getWorkers({ page, search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhân công"
        description="Quản lý danh sách thợ, tổ đội và chấm công."
      />
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <ClientWorkersTable data={result.data} />
      </div>
    </div>
  );
}
