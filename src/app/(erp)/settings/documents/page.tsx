"use client";

import { useEffect, useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/actions/settings";

export default function DocumentsSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({
    quotationTerms: "1. Báo giá đã bao gồm chi phí thiết kế và vận chuyển nội thành.\n2. Hiệu lực báo giá: 30 ngày kể từ ngày lập.\n3. Phương thức thanh toán: Tạm ứng 50%, thanh toán 50% còn lại sau nghiệm thu.",
    contractTerms: "ĐIỀU 1: NỘI DUNG CÔNG VIỆC VÀ TIẾN ĐỘ THỰC HIỆN\nBên B thực hiện thiết kế, sản xuất và thi công lắp đặt nội thất/biển hiệu theo đúng thiết kế bản vẽ được duyệt.\n\nĐIỀU 2: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN\nGiá trị hợp đồng tạm tính theo bảng báo giá kèm theo. Thanh toán làm 3 đợt (50% - 30% - 20%).\n\nĐIỀU 3: NGHIỆM THU VÀ BÀN GIAO\nHai bên tiến hành nghiệm thu kỹ thuật và thẩm mỹ ngay sau khi hoàn thành lắp đặt tại công trình.",
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings("documents_settings");
        if (data) {
          setFormState((prev) => ({ ...prev, ...data }));
        }
      } catch (err: any) {
        toast.error("Không thể tải cấu hình tài liệu: " + err.message);
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
        await saveSettings("documents", "documents_settings", formState);
        toast.success("Đã lưu cấu hình tài liệu thành công!");
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
        title="Biểu mẫu Tài liệu"
        description="Thiết lập các điều khoản báo giá mặc định và cấu trúc nội dung điều khoản của Hợp đồng."
      />

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <CardTitle>Mẫu điều khoản mặc định</CardTitle>
            </div>
            <CardDescription>Các điều khoản này sẽ tự động điền vào khi bạn tạo Báo giá hoặc Hợp đồng mới</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Điều khoản Báo giá mặc định</Label>
              <Textarea
                rows={5}
                value={formState.quotationTerms}
                onChange={(e) => setFormState((prev) => ({ ...prev, quotationTerms: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-semibold">Điều khoản Hợp đồng mặc định</Label>
              <Textarea
                rows={8}
                value={formState.contractTerms}
                onChange={(e) => setFormState((prev) => ({ ...prev, contractTerms: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => window.location.reload()}>Hủy</Button>
          <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
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
