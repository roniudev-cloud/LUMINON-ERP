import {
  getRevenueReport,
  getProjectReport,
  getCustomerReport,
  getEmployeeReport,
} from "@/actions/reports";
import { PageHeader } from "@/components/shared/page-header";
import { ModuleTabs } from "@/components/common/ModuleTabs";
import { RevenueReportSection } from "@/features/reports/revenue-report-section";
import {
  ProjectReportTable,
  CustomerReportTable,
  EmployeeReportTable,
} from "@/features/reports/report-tables";

export const metadata = {
  title: "Báo cáo | LUMINON ERP",
};

export default async function ReportsPage() {
  const [monthly, projects, customers, employees] = await Promise.all([
    getRevenueReport("month"),
    getProjectReport(),
    getCustomerReport(),
    getEmployeeReport(),
  ]);

  const tabs = [
    {
      id: "monthly",
      label: "Theo thời gian",
      content: (
        <div className="mt-4">
          <RevenueReportSection initialData={monthly} />
        </div>
      ),
    },
    {
      id: "projects",
      label: "Theo công trình",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <ProjectReportTable data={projects} />
        </div>
      ),
    },
    {
      id: "customers",
      label: "Theo khách hàng",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <CustomerReportTable data={customers} />
        </div>
      ),
    },
    {
      id: "employees",
      label: "Theo nhân viên",
      content: (
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <EmployeeReportTable data={employees} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Báo cáo"
        description="Doanh thu, chi phí, lợi nhuận theo tháng — công trình — khách hàng — nhân viên."
      />
      <ModuleTabs tabs={tabs} defaultTab="monthly" />
    </div>
  );
}
