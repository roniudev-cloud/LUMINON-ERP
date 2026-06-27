import { getPayments } from "@/actions/finance";
import { PageHeader } from "@/components/shared/page-header";
import { ClientPaymentsTable } from "@/features/finance/client-payments-table";
import { getCurrentUser } from "@/actions/auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { PaymentDialog } from "@/features/finance/payment-form-dialog";
import { getSupplierOptions } from "@/actions/suppliers";
import { db } from "@/lib/db";

export const metadata = {
  title: "Danh sách Phiếu Chi | LUMINON ERP",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";

  const response = await getPayments({ page, search });
  const user = await getCurrentUser();
  const canCreate = user?.roles.includes(ROLES.ADMIN) || user?.permissions.includes("payments.create");

  const projects = await db.query.projects.findMany({
    columns: { id: true, code: true, name: true },
    orderBy: (c, { desc }) => [desc(c.createdAt)],
  });
  const suppliers = await getSupplierOptions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh sách Phiếu Chi"
        description="Quản lý và theo dõi các khoản chi phí của doanh nghiệp."
      >
        {canCreate && <PaymentDialog projects={projects} suppliers={suppliers} />}
      </PageHeader>

      <ClientPaymentsTable data={response.data} />
    </div>
  );
}
