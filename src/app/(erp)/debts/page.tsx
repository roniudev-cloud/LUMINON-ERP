import { getCustomerDebts, getSupplierDebts } from "@/actions/debts";
import { PageHeader } from "@/components/shared/page-header";
import { ClientDebtsTable } from "@/features/finance/client-debts-table";
import { ModuleTabs } from "@/components/common/ModuleTabs";

export const metadata = {
  title: "Quản lý Công nợ | LUMINON ERP",
};

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const search = typeof params.search === "string" ? params.search : undefined;

  // We fetch both in parallel for the initial server render
  const [customerDebts, supplierDebts] = await Promise.all([
    getCustomerDebts({ page, search }),
    getSupplierDebts({ page, search }),
  ]);

  const tabs = [
    {
      id: "customer",
      label: "Công nợ khách hàng",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <ClientDebtsTable data={customerDebts.data} type="customer" />
        </div>
      ),
    },
    {
      id: "supplier",
      label: "Công nợ nhà cung cấp",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <ClientDebtsTable data={supplierDebts.data} type="supplier" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Công nợ"
        description="Theo dõi tình hình thanh toán của khách hàng và nhà cung cấp."
      />

      <ModuleTabs tabs={tabs} defaultTab="customer" />
    </div>
  );
}
