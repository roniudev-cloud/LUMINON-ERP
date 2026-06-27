"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function FinanceSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    vatRate: "10",
    currency: "VND",
    debtLimit: "100000000",
    paymentTerms: "30",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("finance_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình tài chính: " + err.message);
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
        await saveSettings("finance", "finance_settings", formState);
        toast.success("Đã lưu cấu hình tài chính thành công!");
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
        title="Cài đặt Tài chính"
        description="Cấu hình thuế VAT mặc định, đồng tiền mặc định, hạn mức công nợ và điều khoản thanh toán."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              <CardTitle>Tham số tài chính</CardTitle>
            </div>
            <CardDescription>Các thông số tính toán mặc định cho hóa đơn và công nợ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Thuế suất VAT mặc định (%)</Label>
                <Input
                  type="number"
                  value={formState.vatRate}
                  onChange={(e) => setFormState((prev) => ({ ...prev, vatRate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Đồng tiền hiển thị</Label>
                <Select
                  value={formState.currency}
                  onValueChange={(val) => setFormState((prev) => ({ ...prev, currency: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đồng tiền..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VND">VND (Việt Nam Đồng)</SelectItem>
                    <SelectItem value="USD">USD (Đô la Mỹ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hạn mức cảnh báo nợ tối đa (VNĐ)</Label>
                <Input
                  type="number"
                  value={formState.debtLimit}
                  onChange={(e) => setFormState((prev) => ({ ...prev, debtLimit: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Hạn thanh toán mặc định (ngày)</Label>
                <Input
                  type="number"
                  value={formState.paymentTerms}
                  onChange={(e) => setFormState((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
