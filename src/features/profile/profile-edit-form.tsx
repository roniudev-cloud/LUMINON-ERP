"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { updateMyProfile } from "@/actions/users";
import { toast } from "sonner";

export function ProfileEditForm({ user }: { user: { fullName: string; email: string; phone?: string | null } }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateMyProfile({ fullName, phone });
      toast.success("Đã cập nhật hồ sơ cá nhân!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hình đại diện (Avatar)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6 items-center">
          <div className="h-32 w-32 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-4xl font-bold shrink-0">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm text-muted-foreground">
            Tải ảnh đại diện sẽ mở ở phase tiếp theo (cần tích hợp lưu trữ file).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Email (Không thể thay đổi)</Label>
              <Input defaultValue={user.email} disabled className="bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>Hủy</Button>
        <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
