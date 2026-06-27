import { getTasks } from "@/actions/tasks";
import { PageHeader } from "@/components/shared/page-header";
import { ClientTasksTable } from "@/features/tasks/client-tasks-table";
import { CheckSquare, Clock, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Giao việc (Tasks) | LUMINON ERP",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const search = typeof params.search === "string" ? params.search : undefined;

  const result = await getTasks({ page, search });

  // Compute stats from data
  const inProgress = result.data.filter((t) => t.status !== "completed").length;
  const overdue = result.data.filter((t) => t.status === "overdue").length;
  const completed = result.data.filter((t) => t.status === "completed").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Công việc"
        description="Giao việc và theo dõi tiến độ công việc hàng ngày."
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="border bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="h-10 w-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{inProgress}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Đang thực hiện</p>
          </div>
        </div>
        <div className="border bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="h-10 w-10 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{overdue}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Quá hạn</p>
          </div>
        </div>
        <div className="border bg-card p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completed}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
        <ClientTasksTable data={result.data} />
      </div>
    </div>
  );
}
