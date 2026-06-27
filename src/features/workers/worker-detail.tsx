"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { Wallet, CalendarCheck, HandCoins, Receipt } from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { AttendanceTab } from "./attendance-tab";
import { AdvancesTab } from "./advances-tab";
import { PaymentsTab } from "./payments-tab";

export function WorkerDetail({ worker, projects }: { worker: any; projects: any[] }) {
  const [activeTab, setActiveTab] = useState("overview");

  const totalAdvances = (worker.advances || []).reduce((sum: number, a: any) => sum + Number(a.amount), 0);
  const totalPaid = (worker.payments || []).filter((p: any) => p.status === "paid").reduce((sum: number, p: any) => sum + Number(p.netAmount), 0);
  const totalPending = (worker.payments || []).filter((p: any) => p.status === "pending").reduce((sum: number, p: any) => sum + Number(p.netAmount), 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Lương/ngày" value={formatVND(worker.dailyRate)} icon={Wallet} />
        <StatCard title="Đã ứng (chưa chốt)" value={formatVND(totalAdvances)} icon={HandCoins} />
        <StatCard title="Đã thanh toán" value={formatVND(totalPaid)} icon={Receipt} />
        <StatCard title="Chờ thanh toán" value={formatVND(totalPending)} icon={CalendarCheck} description={totalPending > 0 ? "Cần xử lý" : undefined} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="py-2.5">Tổng quan</TabsTrigger>
          <TabsTrigger value="attendance" className="py-2.5">Chấm công ({worker.attendances?.length || 0})</TabsTrigger>
          <TabsTrigger value="advances" className="py-2.5">Ứng lương ({worker.advances?.length || 0})</TabsTrigger>
          <TabsTrigger value="payments" className="py-2.5">Chốt lương ({worker.payments?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Thông tin liên hệ</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="text-muted-foreground mr-2">SĐT:</span>{worker.phone || "—"}</p>
              <p><span className="text-muted-foreground mr-2">CMND/CCCD:</span>{worker.idNumber || "—"}</p>
              <p><span className="text-muted-foreground mr-2">Chuyên môn:</span>{worker.role?.name || "Chưa phân loại"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Công trình tham gia</CardTitle></CardHeader>
            <CardContent>
              {worker.projectAssignments?.length > 0 ? (
                <div className="space-y-2">
                  {worker.projectAssignments.map((pa: any) => (
                    <div key={pa.project.id} className="flex items-center justify-between text-sm border rounded-md p-2">
                      <span>{pa.project.name} <span className="text-xs text-muted-foreground">({pa.project.code})</span></span>
                      {pa.role && <span className="text-xs text-muted-foreground">{pa.role}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa được gán vào công trình nào. Vào trang Công trình → tab Nhân công để gán.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <AttendanceTab workerId={worker.id} attendances={worker.attendances || []} projects={projects} />
        </TabsContent>

        <TabsContent value="advances" className="mt-4">
          <AdvancesTab workerId={worker.id} advances={worker.advances || []} />
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <PaymentsTab workerId={worker.id} payments={worker.payments || []} projects={projects} suggestedAdvances={totalAdvances} dailyRate={Number(worker.dailyRate)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
