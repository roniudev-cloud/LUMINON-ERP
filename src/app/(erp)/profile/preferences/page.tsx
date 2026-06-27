"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Monitor, Moon, Sun, Globe } from "lucide-react";

export default function PreferencesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Cài đặt hiển thị (Preferences)"
        description="Sắp ra mắt — giao diện hiện cố định Sáng/Tiếng Việt/VNĐ."
      />

      <div className="space-y-6 opacity-60 pointer-events-none">
        <Card>
          <CardHeader>
            <CardTitle>Giao diện & Chủ đề</CardTitle>
            <CardDescription>Chọn màu sắc và ngôn ngữ yêu thích</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Chế độ sáng tối (Theme)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="border-2 border-blue-600 rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-slate-50">
                  <Sun className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium">Sáng (Light)</span>
                </div>
                <div className="border-2 border-transparent rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-slate-900 text-slate-400">
                  <Moon className="h-6 w-6" />
                  <span className="text-sm font-medium">Tối (Dark)</span>
                </div>
                <div className="border-2 border-transparent rounded-lg p-4 flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500">
                  <Monitor className="h-6 w-6" />
                  <span className="text-sm font-medium">Theo hệ thống</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Ngôn ngữ (Language)</Label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <Select defaultValue="vi" disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt (Mặc định)</SelectItem>
                      <SelectItem value="en">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Định dạng tiền tệ</Label>
                <Select defaultValue="vnd" disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn định dạng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vnd">VND (VD: 1.000.000 ₫)</SelectItem>
                    <SelectItem value="usd">USD (VD: $1,000.00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bố cục (Layout)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trang mặc định sau khi đăng nhập</Label>
              <Select defaultValue="dashboard" disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard">Tổng quan (Dashboard)</SelectItem>
                  <SelectItem value="crm">CRM Khách hàng</SelectItem>
                  <SelectItem value="tasks">Công việc của tôi</SelectItem>
                  <SelectItem value="omnichannel">Hộp thư Omnichannel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Trạng thái thanh bên (Sidebar)</Label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="sidebar" defaultChecked disabled className="text-blue-600" />
                  <span className="text-sm">Luôn mở rộng</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="sidebar" disabled className="text-blue-600" />
                  <span className="text-sm">Thu gọn (Chỉ hiện Icon)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>Đóng</Button>
      </div>
    </div>
  );
}
