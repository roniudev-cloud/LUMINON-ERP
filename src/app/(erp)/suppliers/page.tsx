import { getSuppliers } from "@/actions/suppliers";
import { PageHeader } from "@/components/shared/page-header";
import { ClientSuppliersTable } from "@/features/suppliers/client-suppliers-table";

export const metadata = {
  title: "Nhà cung cấp | LUMINON ERP",
};

export default async function SuppliersPage() {
  const result = await getSuppliers({});

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhà cung cấp"
        description="Danh sách nhà cung cấp vật tư, dịch vụ — nền tảng cho công nợ phải trả và kho vật tư."
      />
      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <ClientSuppliersTable data={result.data} />
      </div>
    </div>
  );
}
