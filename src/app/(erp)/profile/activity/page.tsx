import { PageHeader } from "@/components/shared/page-header";
import { requireAuth } from "@/actions/auth";
import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import { auditLogs } from "@db/schema/auth";
import { History, CalendarDays } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = {
  title: "Lịch sử Hoạt động | LUMINON ERP",
};

export default async function ProfileActivityPage() {
  const user = await requireAuth("profile.activity.view");

  const logs = await db.query.auditLogs.findMany({
    where: eq(auditLogs.userId, user.id),
    orderBy: [desc(auditLogs.createdAt)],
    limit: 50,
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Lịch sử Hoạt động"
        description="Xem lại các thao tác gần đây của bạn trên hệ thống."
      />

      <div className="border rounded-xl bg-card overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState 
            title="Chưa có lịch sử hoạt động"
            description="Mọi thao tác thêm/sửa/xoá của bạn trên hệ thống sẽ được ghi lại tại đây."
            icon={<History className="h-6 w-6" />}
          />
        ) : (
          <div className="divide-y">
            {logs.map(log => (
              <div key={log.id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="mt-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${
                    log.action === "CREATE" ? "bg-green-500" :
                    log.action === "UPDATE" ? "bg-blue-500" :
                    log.action === "DELETE" ? "bg-red-500" :
                    "bg-slate-500"
                  }`}>
                    <span className="text-xs font-bold">{log.action.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">
                    {log.action} <span className="font-normal text-muted-foreground">trên module</span> {log.module}
                  </h4>
                  {log.entityId && (
                    <p className="text-xs text-muted-foreground mt-0.5">Record ID: <span className="font-mono">{log.entityId}</span></p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDateTime(log.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
