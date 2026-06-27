import { getVatInvoices } from "@/actions/vat-invoices";
import { PageHeader } from "@/components/shared/page-header";
import { ClientVatInvoicesTable } from "@/features/finance/client-vat-invoices-table";

export const metadata = {
  title: "Hóa đơn VAT | LUMINON ERP",
};

export default async function VatInvoicesPage() {
  const result = await getVatInvoices({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hóa đơn VAT"
        description="Quản lý hóa đơn GTGT đầu ra (bán hàng) và đầu vào (mua hàng), liên kết khách hàng/hợp đồng."
      />
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <ClientVatInvoicesTable data={result.data} />
      </div>
    </div>
  );
}
