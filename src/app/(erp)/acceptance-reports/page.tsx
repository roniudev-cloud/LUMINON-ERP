import { getAcceptanceReports } from "@/actions/documents";
import { PageHeader } from "@/components/shared/page-header";
import { AcceptanceReportDialog } from "@/features/documents/acceptance-report-form-dialog";
import { ClientAcceptanceReportsTable } from "@/features/documents/client-acceptance-reports-table";

export const metadata = {
  title: "Biên bản nghiệm thu | LUMINON ERP",
};

export default async function AcceptanceReportsPage() {
  const reports = await getAcceptanceReports();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biên bản nghiệm thu"
        description="Sinh biên bản nghiệm thu từ công trình, ký điện tử khách hàng & công ty."
      >
        <AcceptanceReportDialog />
      </PageHeader>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <ClientAcceptanceReportsTable data={reports} />
      </div>
    </div>
  );
}
