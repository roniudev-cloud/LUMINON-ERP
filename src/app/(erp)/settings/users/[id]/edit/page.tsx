import { getRoles } from "@/actions/roles";
import { getUserById } from "@/actions/users";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/features/users/user-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Sửa tài khoản | LUMINON ERP",
};

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [roles, user] = await Promise.all([getRoles(), getUserById(id).catch(() => null)]);

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Sửa tài khoản" description={`Cập nhật thông tin của ${user.fullName}.`} />
      <UserForm
        mode="edit"
        roles={roles}
        userId={user.id}
        initialData={{ email: user.email, fullName: user.fullName, phone: user.phone, roleIds: user.roleIds }}
      />
    </div>
  );
}
