import { PageHeader } from "@/components/shared/page-header";
import { requireAuth } from "@/actions/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@db/schema/auth";
import { ShieldCheck, Phone, Mail, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export const metadata = {
  title: "Hồ sơ cá nhân | LUMINON ERP",
};

export default async function ProfilePage() {
  const authUser = await requireAuth("profile.view");
  const user = await db.query.users.findFirst({
    where: eq(users.id, authUser.id)
  });

  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Thông tin tài khoản và phân quyền của bạn trên hệ thống."
        action={{ label: "Chỉnh sửa hồ sơ", href: "/profile/edit" }}
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cột trái: Avatar & Basic Info */}
        <div className="border rounded-xl bg-card p-6 flex flex-col items-center text-center shadow-sm">
          <div className="h-24 w-24 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
            {user.fullName.charAt(0)}
          </div>
          <h2 className="text-xl font-bold">{user.fullName}</h2>
          <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
          
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full mb-6">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Tài khoản Active</span>
          </div>

          <div className="w-full space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/profile/security">
                <ShieldAlert className="h-4 w-4 mr-2" /> Bảo mật & Mật khẩu
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/profile/preferences">Cài đặt hiển thị (Preferences)</Link>
            </Button>
          </div>
        </div>

        {/* Cột phải: Detail Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="border rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4 border-b pb-2">Thông tin liên lạc</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email đăng nhập</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{user.phone || "Chưa cập nhật"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl bg-card p-6 shadow-sm">
            <h3 className="font-semibold mb-4 border-b pb-2">Thông tin hệ thống</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ngày tham gia</p>
                <div className="flex items-center gap-1.5 font-medium text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatDateTime(user.createdAt)}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Vai trò hiện tại</p>
                <div className="flex items-center gap-1.5 font-medium text-sm">
                  {authUser.roles.map((role) => (
                    <span key={role} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs uppercase font-bold">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
