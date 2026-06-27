"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatabaseBackup, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function BackupsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    autoBackup: "daily",
    retentionCount: "30",
    storageProvider: "supabase",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("backups_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình sao lưu: " + err.message);
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
        await saveSettings("backups", "backups_settings", formState);
        toast.success("Đã lưu cấu hình sao lưu thành công!");
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
        title="Sao lưu Dữ liệu"
        description="Quản lý lịch trình tự động sao lưu dữ liệu hệ thống, tệp tin và quy tắc lưu trữ."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DatabaseBackup className="h-5 w-5 text-teal-600" />
              <CardTitle>Cấu hình sao lưu</CardTitle>
            </div>
            <CardDescription>Thiết lập chu kỳ tự động backup dữ liệu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Chu kỳ tự động sao lưu</Label>
                <Select
                  value={formState.autoBackup}
                  onValueChange={(val) => setFormState((prev) => ({ ...prev, autoBackup: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn chu kỳ..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Hàng ngày (Daily)</SelectItem>
                    <SelectItem value="weekly">Hàng tuần (Weekly)</SelectItem>
                    <SelectItem value="monthly">Hàng tháng (Monthly)</SelectItem>
                    <SelectItem value="none">Tắt tự động (None)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nơi lưu trữ bản sao</Label>
                <Select
                  value={formState.storageProvider}
                  onValueChange={(val) => setFormState((prev) => ({ ...prev, storageProvider: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nơi lưu..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supabase">Supabase Storage Bucket</SelectItem>
                    <SelectItem value="local">Local Storage (Máy chủ)</SelectItem>
                    <SelectItem value="gdrive">Google Drive (API)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Số lượng bản sao lưu giữ tối đa</Label>
                <Input
                  type="number"
                  value={formState.retentionCount}
                  onChange={(e) => setFormState((prev) => ({ ...prev, retentionCount: e.target.value }))}
                  required
                />
                <p className="text-xs text-muted-foreground">Bản sao lưu cũ hơn số ngày này sẽ tự động bị xóa.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700 text-white">
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
