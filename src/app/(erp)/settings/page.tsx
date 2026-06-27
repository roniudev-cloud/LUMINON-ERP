import { PageHeader } from "@/components/shared/page-header";
import { requireAuth } from "@/actions/auth";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Wallet, 
  ShoppingCart, 
  HardHat, 
  Package, 
  FileText, 
  BellRing, 
  ShieldAlert, 
  History, 
  DatabaseBackup 
} from "lucide-react";

export const metadata = {
  title: "Cài đặt Hệ thống | LUMINON ERP",
};

const SETTING_GROUPS = [
  {
    title: "Thông tin công ty",
    description: "Tên công ty, Logo, Mã số thuế, Chữ ký...",
    icon: Building2,
    href: "/settings/company",
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Người dùng",
    description: "Danh sách nhân viên, tài khoản đăng nhập...",
    icon: Users,
    href: "/settings/users",
    color: "text-green-600 bg-green-100",
  },
  {
    title: "Phân quyền (Roles)",
    description: "Tạo và cấu hình vai trò cho nhân viên...",
    icon: ShieldCheck,
    href: "/settings/roles",
    color: "text-purple-600 bg-purple-100",
  },
  {
    title: "Cài đặt Tài chính",
    description: "Thuế VAT, đồng tiền mặc định, hạn mức công nợ...",
    icon: Wallet,
    href: "/settings/finance",
    color: "text-amber-600 bg-amber-100",
  },
  {
    title: "Cài đặt Bán hàng (Sales)",
    description: "Nguồn khách hàng, quy tắc tự động hóa Lead...",
    icon: ShoppingCart,
    href: "/settings/sales",
    color: "text-orange-600 bg-orange-100",
  },
  {
    title: "Cài đặt Công trình / Dự án",
    description: "Giai đoạn thi công chuẩn, mức độ ưu tiên dự án...",
    icon: HardHat,
    href: "/settings/projects",
    color: "text-cyan-600 bg-cyan-100",
  },
  {
    title: "Cài đặt Kho vật tư",
    description: "Đơn vị tính, ngưỡng tồn tối thiểu, định giá vật tư...",
    icon: Package,
    href: "/settings/inventory",
    color: "text-lime-600 bg-lime-100",
  },
  {
    title: "Biểu mẫu Tài liệu",
    description: "Điều khoản báo giá mặc định, cấu trúc Hợp đồng...",
    icon: FileText,
    href: "/settings/documents",
    color: "text-indigo-600 bg-indigo-100",
  },
  {
    title: "Thông báo & Nhắc nhở",
    description: "Kênh nhận thông báo, lịch gửi báo cáo qua email...",
    icon: BellRing,
    href: "/settings/notifications",
    color: "text-pink-600 bg-pink-100",
  },
  {
    title: "Bảo mật Hệ thống",
    description: "Thời gian phiên làm việc, danh sách IP truy cập...",
    icon: ShieldAlert,
    href: "/settings/security",
    color: "text-red-600 bg-red-100",
  },
  {
    title: "Nhật ký Hệ thống (Audit Logs)",
    description: "Lịch sử thao tác của các thành viên trong hệ thống...",
    icon: History,
    href: "/settings/audit-logs",
    color: "text-slate-600 bg-slate-100",
  },
  {
    title: "Sao lưu Dữ liệu",
    description: "Lịch trình tự động sao lưu dữ liệu và quy tắc lưu trữ...",
    icon: DatabaseBackup,
    href: "/settings/backups",
    color: "text-teal-600 bg-teal-100",
  },
];

export default async function SettingsPage() {
  await requireAuth("settings.view");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cài đặt Hệ thống"
        description="Quản lý toàn bộ cấu hình lõi của LUMINON ERP."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SETTING_GROUPS.map((group) => (
          <Link href={group.href} key={group.href} className="group block h-full">
            <div className="border rounded-xl p-5 bg-card hover:bg-slate-50 transition-colors h-full flex flex-col items-start shadow-sm hover:shadow">
              <div className={`p-3 rounded-xl mb-4 ${group.color}`}>
                <group.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-base mb-1 group-hover:text-blue-600 transition-colors">{group.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{group.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
