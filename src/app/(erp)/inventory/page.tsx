import { getMaterials, getStockTickets, getLowStockMaterials } from "@/actions/inventory";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleTabs } from "@/components/common/ModuleTabs";
import { ClientMaterialsTable } from "@/features/inventory/client-materials-table";
import { ClientStockTicketsTable } from "@/features/inventory/client-stock-tickets-table";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Kho vật tư | LUMINON ERP",
};

export default async function InventoryPage() {
  const [materials, stockInTickets, stockOutTickets, lowStock] = await Promise.all([
    getMaterials(),
    getStockTickets({ type: "IN" }),
    getStockTickets({ type: "OUT" }),
    getLowStockMaterials(),
  ]);

  const tabs = [
    {
      id: "materials",
      label: "Vật tư",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <ClientMaterialsTable data={materials} />
        </div>
      ),
    },
    {
      id: "stock-in",
      label: "Phiếu nhập kho",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <ClientStockTicketsTable data={stockInTickets} type="IN" />
        </div>
      ),
    },
    {
      id: "stock-out",
      label: "Phiếu xuất kho",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <ClientStockTicketsTable data={stockOutTickets} type="OUT" />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kho vật tư"
        description="Danh mục vật tư, nhập/xuất kho, tồn kho tự động cập nhật."
      />

      {lowStock.length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700">{lowStock.length} vật tư sắp hết hàng</p>
            <p className="text-sm text-red-600">
              {lowStock.map((m) => `${m.name} (còn ${m.currentStock} ${m.unit})`).join(", ")}
            </p>
          </div>
        </div>
      )}

      <ModuleTabs tabs={tabs} defaultTab="materials" />
    </div>
  );
}
