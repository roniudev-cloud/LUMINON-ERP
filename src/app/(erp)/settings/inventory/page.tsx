"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Package, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function InventorySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    measurementUnits: "cái, bộ, mét, m2, kg, thùng, cuộn",
    lowStockThreshold: "15",
    weightedAverage: true,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("inventory_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình vật tư: " + err.message);
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
        await saveSettings("inventory", "inventory_settings", formState);
        toast.success("Đã lưu cấu hình kho vật tư thành công!");
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
        title="Cài đặt Kho vật tư"
        description="Định nghĩa đơn vị tính, ngưỡng tồn tối thiểu cảnh báo và phương pháp định giá vật tư."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-600" />
              <CardTitle>Tham số quản lý kho</CardTitle>
            </div>
            <CardDescription>Cấu hình đơn vị tính và cảnh báo hết hàng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Các đơn vị tính hợp lệ (Phân tách bằng dấu phẩy)</Label>
              <Input
                value={formState.measurementUnits}
                onChange={(e) => setFormState((prev) => ({ ...prev, measurementUnits: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Ví dụ: cái, mét, m2, kg, thùng...</p>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Mức cảnh báo tồn kho tối thiểu (%)</Label>
              <Input
                type="number"
                value={formState.lowStockThreshold}
                onChange={(e) => setFormState((prev) => ({ ...prev, lowStockThreshold: e.target.value }))}
                required
              />
              <p className="text-xs text-muted-foreground">Nhắc nhở nhập hàng khi số lượng tồn kho giảm xuống dưới tỷ lệ này.</p>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <Label className="text-base">Tự động tính giá trung bình gia quyền</Label>
                <p className="text-xs text-muted-foreground">
                  Khi nhập kho hàng mới với giá khác biệt, tự tính lại đơn giá của mã vật tư.
                </p>
              </div>
              <Switch
                checked={formState.weightedAverage}
                onCheckedChange={(checked) => setFormState((prev) => ({ ...prev, weightedAverage: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-cyan-600 hover:bg-cyan-700 text-white">
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
