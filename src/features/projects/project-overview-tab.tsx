"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatVND, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { updateProjectProgress, cancelProject } from "@/actions/projects";
import { CancelWithReasonDialog } from "@/components/shared/cancel-with-reason-dialog";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

const NON_CANCELLABLE = ["completed", "paid", "warranty", "cancelled"];

interface ProjectOverviewTabProps {
  project: any;
  canEdit: boolean;
  canViewFinance: boolean;
  onSwitchTab?: (tab: string) => void;
  financials?: { revenue: number; costsOther: number; costsMaterials: number; costsLabor: number; totalCosts: number; profit: number } | null;
}

export function ProjectOverviewTab({ project, canEdit, canViewFinance, onSwitchTab, financials }: ProjectOverviewTabProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [localProgress, setLocalProgress] = useState([project.progress || 0]);

  const handleUpdateProgress = () => {
    startTransition(async () => {
      try {
        const p = localProgress[0];
        let status = project.status;
        if (p === 100 && status !== "waiting_acceptance" && status !== "completed" && status !== "paid" && status !== "warranty") {
          status = "waiting_acceptance"; // Auto suggest
        } else if (p > 0 && status === "new") {
          status = "in_progress";
        }
        await updateProjectProgress(project.id, p, status);
        toast.success("Đã cập nhật tiến độ");
      } catch (e: any) {
        toast.error("Lỗi", { description: e.message });
      }
    });
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Thông tin chung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-1">Tên công trình</p>
              <p className="font-medium text-lg">{project.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Mã</p>
              <p className="font-medium">{project.code}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Khách hàng</p>
              <p className="font-medium">{project.customer?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Hợp đồng liên kết</p>
              <p className="font-medium text-primary">{project.contract?.code || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Địa chỉ thi công</p>
              <p className="font-medium">{project.address || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Trạng thái</p>
              <StatusBadge status={project.status} />
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Người phụ trách</p>
              <p className="font-medium">{project.manager?.fullName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Giám sát thi công</p>
              <p className="font-medium">{project.constructionTeam?.fullName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Ngày bắt đầu</p>
              <p className="font-medium">{project.startDate ? formatDateTime(project.startDate).split(' ')[0] : "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Hạn dự kiến</p>
              <p className="font-medium">{project.expectedEndDate ? formatDateTime(project.expectedEndDate).split(' ')[0] : "—"}</p>
            </div>
          </div>

          {canEdit && !NON_CANCELLABLE.includes(project.status) && (
            <div className="pt-4 border-t">
              <CancelWithReasonDialog
                triggerLabel="Hủy công trình"
                title="Hủy công trình"
                description={`Công trình "${project.name}" sẽ chuyển sang trạng thái Đã hủy. Hành động này không thể tự hoàn tác qua UI.`}
                onConfirm={async (reason) => { await cancelProject(project.id, reason); router.refresh(); }}
                successMessage="Đã hủy công trình"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Nhân công tham gia</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={() => onSwitchTab?.("workers")}>
            <Users className="mr-1.5 h-3.5 w-3.5" /> Quản lý nhân công
          </Button>
        </CardHeader>
        <CardContent>
          {project.workers?.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-2">
              {project.workers.map((a: any) => (
                <Link
                  key={a.workerId}
                  href={`/workers/${a.worker.id}`}
                  className="flex items-center justify-between text-sm border rounded-md p-2 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium">{a.worker.name}</span>
                  <span className="text-xs text-muted-foreground">{a.worker.role?.name || "Chưa phân loại"}{a.role ? ` · ${a.role}` : ""}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Chưa có thợ nào được gán cho công trình này.{" "}
              <button onClick={() => onSwitchTab?.("workers")} className="text-primary hover:underline font-medium">
                Thêm nhân công ngay
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật Tiến độ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Tiến độ thực tế</span>
                <span className="text-primary">{localProgress[0]}%</span>
              </div>
              <Progress value={localProgress[0]} className="h-3" />
            </div>

            {canEdit && (
              <div className="space-y-4 pt-4 border-t">
                <Slider 
                  value={localProgress} 
                  max={100} 
                  step={1} 
                  onValueChange={setLocalProgress}
                  disabled={isPending}
                />
                <Button 
                  className="w-full" 
                  onClick={handleUpdateProgress}
                  disabled={isPending || localProgress[0] === project.progress}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu tiến độ mới
                </Button>
                {localProgress[0] === 100 && project.status !== "waiting_acceptance" && project.status !== "completed" && (
                  <p className="text-xs text-muted-foreground text-center">
                    Lưu tiến độ 100% sẽ tự động chuyển trạng thái sang <b>Chờ nghiệm thu</b>.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {canViewFinance && (
          <Card>
            <CardHeader>
              <CardTitle>Dự toán ban đầu</CardTitle>
              <CardDescription>Số liệu nhập tay khi lập công trình — chỉ mang tính kế hoạch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Giá trị HĐ:</span>
                <span className="font-bold">{formatVND(project.contract?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chi phí dự kiến:</span>
                <span className="font-medium text-orange-600">{formatVND(project.expectedCost)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span>Lợi nhuận dự kiến:</span>
                <span className="text-muted-foreground">{formatVND(project.estimatedProfit)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {canViewFinance && (
          <Card>
            <CardHeader>
              <CardTitle>Thực tế</CardTitle>
              <CardDescription>Tính từ phiếu thu, phiếu chi, chi phí ghi nhận, vật tư xuất kho và lương thợ gắn công trình này — dữ liệu thật, không gõ tay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!financials ? (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đã thu (phiếu thu):</span>
                    <span className="font-bold text-green-600">{formatVND(financials.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vật tư đã dùng:</span>
                    <span className="font-medium text-destructive">{formatVND(financials.costsMaterials)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lương thợ đã trả:</span>
                    <span className="font-medium text-destructive">{formatVND(financials.costsLabor)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phiếu chi + chi phí khác:</span>
                    <span className="font-medium text-destructive">{formatVND(financials.costsOther)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Lợi nhuận thực tế:</span>
                    <span className={financials.profit >= 0 ? "text-green-600" : "text-destructive"}>{formatVND(financials.profit)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
