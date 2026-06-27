import { getRoles } from "@/actions/roles";
import { PageHeader } from "@/components/shared/page-header";
import { RoleFormDialog } from "@/features/users/role-form-dialog";
import { ClientRolesGrid } from "@/features/users/client-roles-grid";

export const metadata = {
  title: "Quản lý Vai Trò (Roles)",
};

export default async function RolesPage() {
  const roles = await getRoles();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vai trò & Quyền hạn"
        description="Danh sách các vai trò (Roles) trong hệ thống và các quyền hạn (Permissions) tương ứng."
      >
        <RoleFormDialog />
      </PageHeader>

      <ClientRolesGrid roles={roles} />
    </div>
  );
}
