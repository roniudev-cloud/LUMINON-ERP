import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCrmStats,
  getFinanceStats,
  getProfitStats,
  getInventoryStats,
  getOperationsStats,
  getRecentActivities,
} from "@/actions/dashboard";
import { StatCard } from "@/components/shared/stat-card";
import { formatCurrencyVND } from "@/lib/formatters";
import {
  Users,
  FileText,
  FileSignature,
  Building2,
  TrendingUp,
  CreditCard,
  Wallet,
  AlertTriangle,
  Package,
  Coins,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueChart } from "./revenue-chart";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function SectionSkeleton({ count = 4, title = "" }: { count?: number, title?: string }) {
  return (
    <div className="animate-pulse">
      {title && <div className="h-6 w-32 bg-muted rounded mb-4 mt-6"></div>}
      <div className={`grid gap-4 md:grid-cols-2 ${count >= 3 ? 'xl:grid-cols-' + Math.min(count, 4) : ''}`}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export async function CrmSection() {
  const stats = await getCrmStats();
  if (!stats) return null;

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-2">Kinh doanh</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng khách hàng" value={stats.totalCustomers?.toString() || "0"} icon={Users} />
        <StatCard title="Lead mới" value={stats.newLeads?.toString() || "0"} icon={Users} description="Đang chờ xử lý" />
        <StatCard title="Báo giá" value={stats.totalQuotations?.toString() || "0"} icon={FileText} />
        <StatCard title="Hợp đồng" value={stats.totalContracts?.toString() || "0"} icon={FileSignature} />
      </div>
    </>
  );
}

export async function OperationsSection() {
  const stats = await getOperationsStats();
  if (!stats) return null;

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Vận hành & Thi công</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:max-w-2xl">
        <StatCard title="Công trình đang thi công" value={stats.activeProjects?.toString() || "0"} icon={Building2} />
        <StatCard title="Công việc quá hạn" value={stats.overdueTasks?.toString() || "0"} icon={AlertTriangle} description="Cần xử lý gấp" />
      </div>
    </>
  );
}

export async function FinanceSection() {
  const data = await getFinanceStats();
  if (!data) return null;

  const revenueData = data.monthlyRevenue?.length > 0
    ? data.monthlyRevenue
    : [{ month: "Chưa có dữ liệu", revenue: 0, expense: 0 }];

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Tài chính</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Tổng đã thu" value={formatCurrencyVND(data.totalReceipts)} icon={TrendingUp} />
        <StatCard title="Tổng đã chi" value={formatCurrencyVND(data.totalPayments)} icon={CreditCard} />
        <StatCard title="Phải thu (KH)" value={formatCurrencyVND(data.totalCustomerDebt)} icon={Wallet} description="Công nợ khách hàng" />
        <StatCard title="Phải trả (NCC)" value={formatCurrencyVND(data.totalSupplierDebt)} icon={Wallet} description="Công nợ nhà cung cấp" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-4">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tài chính tổng quan</CardTitle>
            <CardDescription>Thu & Chi hiện tại</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Giao dịch thu gần đây</CardTitle>
            <CardDescription>Các phiếu thu mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentReceipts?.length > 0 ? (
                data.recentReceipts.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium">{r.code || "N/A"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(r.createdAt), {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </p>
                    </div>
                    <div className="text-green-600 font-medium">
                      +{formatCurrencyVND(r.amount)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có giao dịch thu nào.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export async function ProfitSection() {
  const stats = await getProfitStats();
  if (!stats) return null;

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Lợi nhuận</h2>
      <div className="grid gap-4 sm:max-w-xs">
        <StatCard
          title="Lợi nhuận thực tế"
          value={formatCurrencyVND(stats.totalEstimatedProfit)}
          icon={Coins}
          description="Thu thật trừ chi phí thật, tất cả công trình"
        />
      </div>
      <Card className="mt-4 transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Công trình theo lợi nhuận</CardTitle>
          <CardDescription>Top 5 công trình lời/lỗ nhiều nhất — tính từ dữ liệu thật</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.topProjectsByProfit?.length > 0 ? (
              stats.topProjectsByProfit.map((p: any) => {
                const profit = Number(p.estimatedProfit) || 0;
                return (
                  <div key={p.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.code}</p>
                    </div>
                    <div className={profit >= 0 ? "text-green-600 font-medium shrink-0" : "text-red-600 font-medium shrink-0"}>
                      {formatCurrencyVND(profit)}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu công trình.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export async function InventorySection() {
  const stats = await getInventoryStats();
  if (!stats) return null;

  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Kho</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard title="Tổng vật tư" value={stats.totalMaterials?.toString() || "0"} icon={Package} />
        <StatCard title="Sắp hết hàng" value={stats.lowStockCount?.toString() || "0"} icon={AlertTriangle} description="Dưới mức tồn tối thiểu" />
        <StatCard title="Giá trị tồn kho" value={formatCurrencyVND(stats.totalInventoryValue)} icon={Wallet} />
      </div>
    </>
  );
}

export async function AdminLogsSection() {
  const logs = await getRecentActivities();
  if (!logs) return null;

  return (
    <Card className="mt-6 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
        <CardDescription>Nhật ký hệ thống (Audit Logs)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.length > 0 ? (
            logs.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-foreground leading-snug">{activity.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activity.user} ·{" "}
                    {formatDistanceToNow(new Date(activity.time), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có hoạt động nào.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSectionsWrapper() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Suspense fallback={<SectionSkeleton count={4} title="Kinh doanh" />}>
        <CrmSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton count={2} title="Vận hành & Thi công" />}>
        <OperationsSection />
      </Suspense>

      <Suspense fallback={
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-muted rounded mb-4 mt-6"></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2 mt-4">
             <Skeleton className="h-[300px] rounded-xl" />
             <Skeleton className="h-[300px] rounded-xl" />
          </div>
        </div>
      }>
        <FinanceSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton count={1} title="Lợi nhuận" />}>
        <ProfitSection />
      </Suspense>

      <Suspense fallback={<SectionSkeleton count={3} title="Kho" />}>
        <InventorySection />
      </Suspense>

      <Suspense fallback={
        <div className="mt-6">
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      }>
        <AdminLogsSection />
      </Suspense>
    </div>
  );
}
