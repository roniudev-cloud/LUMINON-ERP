"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShoppingCart, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function SalesSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    leadSources: "Facebook, Zalo, Website, Hotline, Trực tiếp",
    autoCreateLead: true,
    defaultStatus: "new",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("sales_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình bán hàng: " + err.message);
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
        await saveSettings("sales", "sales_settings", formState);
        toast.success("Đã lưu cấu hình bán hàng thành công!");
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
        title="Cài đặt Bán hàng (Sales)"
        description="Cấu hình nguồn khách hàng, quy tắc tự động hóa Lead từ các kênh Omnichannel."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
              <CardTitle>Quy tắc bán hàng & CRM</CardTitle>
            </div>
            <CardDescription>Cấu hình luồng khách hàng đầu vào và trạng thái</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Danh sách nguồn khách hàng (Phân tách bằng dấu phẩy)</Label>
              <Input
                value={formState.leadSources}
                onChange={(e) => setFormState((prev) => ({ ...prev, leadSources: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Các nguồn này sẽ hiển thị ở ô chọn (Select) khi tạo mới Lead.</p>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label className="text-base">Tự động tạo Lead từ Web Forms</Label>
                <p className="text-xs text-muted-foreground">
                  Khi có khách gửi yêu cầu qua website, hệ thống sẽ tự động tạo một Lead nháp.
                </p>
              </div>
              <Switch
                checked={formState.autoCreateLead}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, autoCreateLead: checked }))}
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Trạng thái mặc định của Lead mới tạo</Label>
              <Input
                value={formState.defaultStatus}
                onChange={(e) => setFormState((prev) => ({ ...prev, defaultStatus: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
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
