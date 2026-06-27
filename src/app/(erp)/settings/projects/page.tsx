"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HardHat, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function ProjectsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    stages: "Khảo sát, Thiết kế, Gia công, Thi công, Nghiệm thu, Bàn giao",
    defaultPriority: "medium",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("projects_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình dự án: " + err.message);
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
        await saveSettings("projects", "projects_settings", formState);
        toast.success("Đã lưu cấu hình dự án thành công!");
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
        title="Cài đặt Công trình / Dự án"
        description="Cấu hình các giai đoạn thi công chuẩn, mức độ ưu tiên mặc định cho các dự án quảng cáo và nội thất."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HardHat className="h-5 w-5 text-yellow-600" />
              <CardTitle>Tham số quản lý thi công</CardTitle>
            </div>
            <CardDescription>Cấu hình các giai đoạn của quy trình triển khai công trình</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Các giai đoạn thi công (Phân tách bằng dấu phẩy)</Label>
              <Input
                value={formState.stages}
                onChange={(e) => setFormState((prev) => ({ ...prev, stages: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Ví dụ: Khảo sát, Thiết kế, Thi công, Bàn giao...</p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Mức độ ưu tiên mặc định khi khởi tạo dự án</Label>
              <Select
                value={formState.defaultPriority}
                onValueChange={(val) => setFormState((prev) => ({ ...prev, defaultPriority: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn độ ưu tiên..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp (Low)</SelectItem>
                  <SelectItem value="medium">Trung bình (Medium)</SelectItem>
                  <SelectItem value="high">Cao (High)</SelectItem>
                  <SelectItem value="urgent">Khẩn cấp (Urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold">
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
