"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCompanySettings, saveCompanySettings } from "@/actions/settings";

export default function CompanySettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    companyName: "Công ty TNHH LUMINON MỚI",
    brandName: "LUMINON",
    taxCode: "0312345678",
    address: "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
    phone: "0909 123 456",
    email: "contact@luminon.vn",
    representative: "Nguyễn Văn A",
    position: "Giám đốc",
    bankName: "Vietcombank - CN Tân Thuận",
    bankAccount: "1023456789",
    bankOwner: "CÔNG TY TNHH LUMINON",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getCompanySettings();
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình công ty: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveCompanySettings(formState);
        toast.success("Đã lưu thông tin công ty thành công!");
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
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Thông tin công ty"
        description="Cấu hình thông tin chuẩn sẽ được dùng cho Báo giá, Hợp đồng và Xuất hoá đơn."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <CardTitle>Thông tin cơ bản</CardTitle>
            </div>
            <CardDescription>Cập nhật tên, địa chỉ và mã số thuế</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Tên công ty (Đầy đủ)</Label>
                <Input
                  value={formState.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="Nhập tên pháp nhân đầy đủ..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tên thương hiệu (Tên ngắn)</Label>
                <Input
                  value={formState.brandName}
                  onChange={(e) => handleChange("brandName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Mã số thuế</Label>
                <Input
                  value={formState.taxCode}
                  onChange={(e) => handleChange("taxCode", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Địa chỉ trụ sở</Label>
                <Textarea
                  value={formState.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  value={formState.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email liên hệ</Label>
                <Input
                  type="email"
                  value={formState.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tài khoản Ngân hàng & Người đại diện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Người đại diện pháp luật</Label>
                <Input
                  value={formState.representative}
                  onChange={(e) => handleChange("representative", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Chức vụ</Label>
                <Input
                  value={formState.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2 mt-2 pt-4 border-t">
                <h4 className="font-semibold text-sm mb-2">Tài khoản ngân hàng chính</h4>
              </div>
              <div className="space-y-2">
                <Label>Tên ngân hàng</Label>
                <Input
                  value={formState.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Số tài khoản</Label>
                <Input
                  value={formState.bankAccount}
                  onChange={(e) => handleChange("bankAccount", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Chủ tài khoản</Label>
                <Input
                  value={formState.bankOwner}
                  onChange={(e) => handleChange("bankOwner", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo & Nhận diện (Sử dụng cho PDF)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-medium text-sm">Upload Logo</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG (Max 2MB)</p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="mx-auto w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-medium text-sm">Upload Chữ ký</p>
                <p className="text-xs text-muted-foreground mt-1">PNG trong suốt</p>
              </div>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="font-medium text-sm">Upload Con dấu</p>
                <p className="text-xs text-muted-foreground mt-1">PNG trong suốt (Đỏ)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy thay đổi</Button>
          <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Lưu thông tin
          </Button>
        </div>
      </form>
    </div>
  );
}
