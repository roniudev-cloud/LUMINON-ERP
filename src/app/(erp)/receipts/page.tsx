import { getReceipts } from "@/actions/finance";
import { PageHeader } from "@/components/shared/page-header";
import { ClientReceiptsTable } from "@/features/finance/client-receipts-table";
import { getCurrentUser } from "@/actions/auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { ReceiptDialog } from "@/features/finance/receipt-form-dialog";
import { db } from "@/lib/db";

export const metadata = {
  title: "Danh sách Phiếu Thu | LUMINON ERP",
};

export default async function ReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const response = await getReceipts({ page, search });
  const user = await getCurrentUser();
  const canCreate = user?.roles.includes(ROLES.ADMIN) || user?.permissions.includes("receipts.create");

  const customers = await db.query.customers.findMany({
    columns: { id: true, name: true },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  const contracts = await db.query.contracts.findMany({
    columns: { id: true, code: true },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  const projects = await db.query.projects.findMany({
    columns: { id: true, code: true, name: true },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Phiếu Thu"
        description="Quản lý và tra cứu các khoản thu tiền."
      >
        {canCreate && (
          <ReceiptDialog
            customers={customers}
            projects={projects}
            contracts={contracts}
          />
        )}
      </PageHeader>

      <ClientReceiptsTable data={response.data} />
    </div>
  );
}
