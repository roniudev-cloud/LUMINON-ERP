"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Key } from "lucide-react";

export default function ProfileSecurityPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Bảo mật tài khoản"
        description="Quản lý mật khẩu và các thiết bị đang đăng nhập."
      />

      <div className="grid gap-6">
        <Card className="border-red-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-red-600" />
              <CardTitle>Mật khẩu</CardTitle>
            </div>
            <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 mb-4 flex gap-3 text-red-800 text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <p>Hệ thống hiện tại đang tích hợp Supabase Auth. Bạn chỉ có thể đổi mật khẩu qua luồng Gửi Email Quên Mật Khẩu ở màn hình Đăng Nhập.</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto" disabled>
              Yêu cầu đổi mật khẩu (Sắp ra mắt)
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
