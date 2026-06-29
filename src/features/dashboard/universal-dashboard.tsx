"use client";

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
  CheckSquare,
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

interface DashboardProps {
  data: any;
  userRoles: string[];
}

export function UniversalDashboard({ data, userRoles }: DashboardProps) {
  const { stats, recentActivities, recentReceipts } = data;

  const isAdmin = userRoles.includes("admin");
  const isManager = userRoles.includes("manager");
  const isSales = userRoles.includes("sales");
  const isAccountant = userRoles.includes("accountant");
  const isProduction = userRoles.includes("production_manager");
  const isConstruction = userRoles.includes("construction_team");

  // Doanh thu/chi phí thật theo tháng (tính ở server, xem src/actions/dashboard.ts)
  const revenueData = stats.monthlyRevenue?.length > 0
    ? stats.monthlyRevenue
    : [{ month: "Chưa có dữ liệu", revenue: 0, expense: 0 }];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* ── CRM & Sales Stats ── */}
      {(isAdmin || isManager || isSales) && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-2">Kinh doanh</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Tổng khách hàng"
              value={stats.totalCustomers?.toString() || "0"}
              icon={Users}
            />
            <StatCard
              title="Lead mới"
              value={stats.newLeads?.toString() || "0"}
              icon={Users}
              description="Đang chờ xử lý"
            />
            <StatCard
              title="Báo giá"
              value={stats.totalQuotations?.toString() || "0"}
              icon={FileText}
            />
            <StatCard
              title="Hợp đồng"
              value={stats.totalContracts?.toString() || "0"}
              icon={FileSignature}
            />
          </div>
        </>
      )}

      {/* ── Operations Stats ── */}
      {(isAdmin || isManager || isProduction || isConstruction) && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Vận hành & Thi công</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
            <StatCard
              title="Công trình đang thi công"
              value={stats.activeProjects?.toString() || "0"}
              icon={Building2}
            />
            <StatCard
              title="Công việc quá hạn"
              value={stats.overdueTasks?.toString() || "0"}
              icon={AlertTriangle}
              description="Cần xử lý gấp"
            />
          </div>
        </>
      )}

      {/* ── Finance Stats ── */}
      {(isAdmin || isManager || isAccountant) && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Tài chính</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Tổng đã thu"
              value={formatCurrencyVND(stats.totalReceipts)}
              icon={TrendingUp}
            />
            <StatCard
              title="Tổng đã chi"
              value={formatCurrencyVND(stats.totalPayments)}
              icon={CreditCard}
            />
            <StatCard
              title="Phải thu (KH)"
              value={formatCurrencyVND(stats.totalCustomerDebt)}
              icon={Wallet}
              description="Công nợ khách hàng"
            />
            <StatCard
              title="Phải trả (NCC)"
              value={formatCurrencyVND(stats.totalSupplierDebt)}
              icon={Wallet}
              description="Công nợ nhà cung cấp"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
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
                  {recentReceipts?.length > 0 ? (
                    recentReceipts.map((r: any) => (
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
      )}

      {/* ── Profit Stats (chỉ Admin/Manager) ── */}
      {(isAdmin || isManager) && (
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
      )}

      {/* ── Inventory Stats (Admin/Manager/Warehouse) ── */}
      {(isAdmin || isManager || userRoles.includes("warehouse_staff")) && (
        <>
          <h2 className="text-lg font-semibold tracking-tight text-foreground/80 mt-6">Kho</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Tổng vật tư"
              value={stats.totalMaterials?.toString() || "0"}
              icon={Package}
            />
            <StatCard
              title="Sắp hết hàng"
              value={stats.lowStockCount?.toString() || "0"}
              icon={AlertTriangle}
              description="Dưới mức tồn tối thiểu"
            />
            <StatCard
              title="Giá trị tồn kho"
              value={formatCurrencyVND(stats.totalInventoryValue)}
              icon={Wallet}
            />
          </div>
        </>
      )}

      {/* ── Admin Logs ── */}
      {(isAdmin || isManager) && (
        <Card className="mt-6 transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            <CardDescription>Nhật ký hệ thống (Audit Logs)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities?.length > 0 ? (
                recentActivities.map((activity: any) => (
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
      )}
    </div>
  );
}
