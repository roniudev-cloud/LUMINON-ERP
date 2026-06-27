"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellRing, Mail, Smartphone } from "lucide-react";

export default function NotificationPreferencesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Tùy chọn Thông báo"
        description="Quyết định bạn muốn nhận thông báo qua kênh nào và loại thông báo nào."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Kênh nhận thông báo</CardTitle>
            <CardDescription>Chọn cách hệ thống gửi thông báo cho bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-sm">Thông báo trên Ứng dụng (In-app)</h4>
                  <p className="text-xs text-muted-foreground">Nhận qua biểu tượng chuông trên ERP</p>
                </div>
              </div>
              <input type="checkbox" defaultChecked disabled className="h-4 w-4" />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 opacity-60">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-sm">Gửi Email <span className="text-xs font-normal text-muted-foreground">(Chưa khả dụng)</span></h4>
                  <p className="text-xs text-muted-foreground">Nhận bản tóm tắt các thông báo quan trọng qua email — sẽ mở ở phase tiếp theo</p>
                </div>
              </div>
              <input type="checkbox" disabled className="h-4 w-4" />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50 opacity-60">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-sm">Push Notification Mobile <span className="text-xs font-normal text-muted-foreground">(Chưa khả dụng)</span></h4>
                  <p className="text-xs text-muted-foreground">Nhận thông báo đẩy lên màn hình điện thoại — sẽ mở ở phase tiếp theo</p>
                </div>
              </div>
              <input type="checkbox" disabled className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loại thông báo (Events)</CardTitle>
            <CardDescription>Hiện tại bạn nhận đầy đủ thông báo trong ứng dụng cho mọi sự kiện dưới đây. Tắt riêng từng loại sẽ mở ở phase tiếp theo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 opacity-60">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <input type="checkbox" id="n1" defaultChecked disabled className="mt-1" />
                <label htmlFor="n1" className="text-sm">
                  <span className="font-medium block">Lead mới được giao</span>
                  <span className="text-xs text-muted-foreground">Khi Admin giao 1 Lead mới cho bạn</span>
                </label>
              </div>
              <div className="flex gap-2">
                <input type="checkbox" id="n2" defaultChecked disabled className="mt-1" />
                <label htmlFor="n2" className="text-sm">
                  <span className="font-medium block">Công việc / Nhắc nhở quá hạn</span>
                  <span className="text-xs text-muted-foreground">Khi 1 Task của bạn vượt qua deadline</span>
                </label>
              </div>
              <div className="flex gap-2">
                <input type="checkbox" id="n3" defaultChecked disabled className="mt-1" />
                <label htmlFor="n3" className="text-sm">
                  <span className="font-medium block">Hợp đồng đã ký</span>
                  <span className="text-xs text-muted-foreground">Khi 1 hợp đồng chuyển trạng thái thành công</span>
                </label>
              </div>
              <div className="flex gap-2">
                <input type="checkbox" id="n4" defaultChecked disabled className="mt-1" />
                <label htmlFor="n4" className="text-sm">
                  <span className="font-medium block">Thông báo Công nợ (Kế toán)</span>
                  <span className="text-xs text-muted-foreground">Báo cáo thu/chi tự động mỗi ngày</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
