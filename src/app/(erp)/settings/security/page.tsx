"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function SecuritySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    sessionTimeout: "60",
    ipWhitelist: "",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("security_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình bảo mật: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveSettings("security", "security_settings", formState);
        toast.success("Đã lưu cấu hình bảo mật thành công!");
      } catch (err: any) {
        toast.error("Không thể lưu: " + err.message);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Bảo mật Hệ thống"
        description="Quản lý cấu hình thời gian phiên làm việc và danh sách IP được phép truy cập."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <CardTitle>Tham số bảo mật</CardTitle>
            </div>
            <CardDescription>Thiết lập thời gian hết hạn phiên và bảo vệ địa chỉ truy cập</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thời gian hết hạn phiên (phút)</Label>
              <Input
                type="number"
                value={formState.sessionTimeout}
                onChange={(e) => setFormState((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Hệ thống tự động đăng xuất nếu không phát sinh hoạt động sau khoảng thời gian này.</p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Danh sách IP Whitelist (Ngăn cách bằng dấu phẩy, để trống nếu cho phép mọi IP)</Label>
              <Input
                value={formState.ipWhitelist}
                onChange={(e) => setFormState((prev) => ({ ...prev, ipWhitelist: e.target.value }))}
                placeholder="Ví dụ: 192.168.1.1, 203.162.0.1"
              />
              <p className="text-xs text-muted-foreground">Chỉ cho phép các địa chỉ IP này đăng nhập vào hệ thống ERP.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Lưu cấu hình
          </Button>
        </div>
      </form>
    </div>
  );
}
