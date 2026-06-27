import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser, requireAuth } from "@/actions/auth";
import { getUsers } from "@/actions/users";
import { ClientUsersTable } from "@/features/users/client-users-table";

export const metadata = {
  title: "Quản lý Người dùng | LUMINON ERP",
};

export default async function UsersSettingsPage() {
  await requireAuth("settings.users.view");
  const currentUser = await getCurrentUser();
  const { data } = await getUsers({ pageSize: 100 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Người dùng"
        description="Danh sách tài khoản nhân viên có thể truy cập hệ thống LUMINON."
        action={{ label: "Tạo tài khoản mới", href: "/settings/users/new" }}
      />

      <ClientUsersTable data={data} currentUserId={currentUser?.id || ""} />
    </div>
  );
}
