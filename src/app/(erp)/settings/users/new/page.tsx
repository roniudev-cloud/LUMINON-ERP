import { getRoles } from "@/actions/roles";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/features/users/user-form";

export const metadata = {
  title: "Tạo tài khoản | LUMINON ERP",
};

export default async function NewUserPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <PageHeader title="Tạo tài khoản mới" description="Tạo tài khoản đăng nhập thật cho nhân viên." />
      <UserForm mode="create" roles={roles} />
    </div>
  );
}
