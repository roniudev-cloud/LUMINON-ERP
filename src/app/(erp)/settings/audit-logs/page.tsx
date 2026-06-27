import { PageHeader } from "@/components/shared/page-header";
import { requireAuth } from "@/actions/auth";
import { db } from "@/lib/db";
import { Search, MonitorSmartphone, CalendarDays, History } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Nhật ký Hệ thống (Audit Logs) | LUMINON ERP",
};

export default async function AuditLogsPage() {
  await requireAuth("audit_logs.view");

  const logs = await db.query.auditLogs.findMany({
    orderBy: (log, { desc }) => [desc(log.createdAt)],
    limit: 100,
    with: { user: true }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhật ký Hệ thống (Audit Logs)"
        description="Xem toàn bộ lịch sử thao tác của các thành viên trong hệ thống."
        action={{ label: "Xuất Excel", href: "#" }}
      />

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="p-4 border-b flex justify-between gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Tìm hành động hoặc Record ID..." 
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="border rounded-md px-3 py-2 text-sm bg-background">
              <option>Tất cả Module</option>
              <option>Customers</option>
              <option>Settings</option>
            </select>
            <select className="border rounded-md px-3 py-2 text-sm bg-background">
              <option>Tất cả Hành động</option>
              <option>CREATE</option>
              <option>UPDATE</option>
              <option>DELETE</option>
            </select>
          </div>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Thời gian</th>
              <th className="p-4 font-medium">Nhân viên</th>
              <th className="p-4 font-medium">Thao tác</th>
              <th className="p-4 font-medium">Module / ID</th>
              <th className="p-4 font-medium">IP / Thiết bị</th>
              <th className="p-4 font-medium text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  Chưa có nhật ký hoạt động nào.
                </td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50/50">
                <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateTime(log.createdAt)}
                  </div>
                </td>
                <td className="p-4 font-medium">{log.user?.fullName || "System/Unknown"}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    log.action === "CREATE" ? "bg-green-100 text-green-700" :
                    log.action === "UPDATE" ? "bg-blue-100 text-blue-700" :
                    log.action === "DELETE" ? "bg-red-100 text-red-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-4">
                  <p className="font-semibold">{log.module}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">{log.entityId || "N/A"}</p>
                </td>
                <td className="p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MonitorSmartphone className="h-3.5 w-3.5" />
                    {log.ipAddress || "Unknown IP"}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:underline text-xs font-medium">
                    Xem JSON
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
