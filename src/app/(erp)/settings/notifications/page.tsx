"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function NotificationsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    enableInApp: true,
    enableEmail: false,
    digestReports: "daily",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("notifications_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình thông báo: " + err.message);
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
        await saveSettings("notifications", "notifications_settings", formState);
        toast.success("Đã lưu cấu hình thông báo thành công!");
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
        title="Thông báo & Nhắc nhở"
        description="Quản lý kênh nhận thông báo và lịch trình gửi báo cáo tổng hợp qua email."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-pink-600" />
              <CardTitle>Cấu hình thông báo</CardTitle>
            </div>
            <CardDescription>Bật/tắt các thông báo hệ thống và báo cáo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Thông báo trong ứng dụng (In-App)</Label>
                <p className="text-xs text-muted-foreground">
                  Hiện thông báo đẩy trực tiếp trên chuông thông báo góc phải màn hình.
                </p>
              </div>
              <Switch
                checked={formState.enableInApp}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, enableInApp: checked }))}
              />
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label className="text-base">Gửi thông báo qua Email</Label>
                <p className="text-xs text-muted-foreground">
                  Gửi bản sao thông báo công việc, nhắc nhợ nợ trực tiếp về hòm thư nhân viên.
                </p>
              </div>
              <Switch
                checked={formState.enableEmail}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, enableEmail: checked }))}
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Tần suất gửi Báo cáo hoạt động (Email Digest)</Label>
              <Select
                value={formState.digestReports}
                onValueChange={(val) => setFormState((prev) => ({ ...prev, digestReports: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tần suất..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Hàng ngày (Daily)</SelectItem>
                  <SelectItem value="weekly">Hàng tuần (Weekly)</SelectItem>
                  <SelectItem value="none">Không gửi (None)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-pink-600 hover:bg-pink-700 text-white">
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
