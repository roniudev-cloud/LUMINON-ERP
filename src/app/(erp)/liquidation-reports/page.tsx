import { getLiquidationReports } from "@/actions/documents";
import { PageHeader } from "@/components/shared/page-header";
import { LiquidationReportDialog } from "@/features/documents/liquidation-report-form-dialog";
import { ClientLiquidationReportsTable } from "@/features/documents/client-liquidation-reports-table";

export const metadata = {
  title: "Biên bản thanh lý | LUMINON ERP",
};

export default async function LiquidationReportsPage() {
  const reports = await getLiquidationReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biên bản thanh lý"
        description="Sinh biên bản thanh lý hợp đồng/công trình khi kết thúc dự án."
      >
        <LiquidationReportDialog />
      </PageHeader>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <ClientLiquidationReportsTable data={reports} />
      </div>
    </div>
  );
}
