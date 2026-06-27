import { getProjects } from "@/actions/projects";
import { PageHeader } from "@/components/shared/page-header";
import { ClientProjectsTable } from "@/features/projects/client-projects-table";
import { getCurrentUser } from "@/actions/auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { ProjectDialog } from "@/features/projects/project-form-dialog";
import { db } from "@/lib/db";

export const metadata = {
  title: "Quản lý Công trình | LUMINON ERP",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const status = params.status || "";

  const response = await getProjects({ page, search, status });
  const user = await getCurrentUser();
  const canCreate = user?.roles.includes(ROLES.ADMIN) || user?.permissions.includes(PERMISSIONS.PROJECTS_CREATE);

  const customers = await db.query.customers.findMany({
    columns: { id: true, name: true },
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  const usersData = await db.query.users.findMany({
    columns: { id: true, fullName: true },
    with: {
      userRoles: {
        with: { role: { columns: { name: true } } }
      }
    },
    orderBy: (u, { asc }) => [asc(u.fullName)],
  });
  
  const users = usersData.map(u => ({
    id: u.id,
    fullName: u.fullName,
    roles: u.userRoles.map((ur: any) => ur.role.name)
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Công trình"
        description="Theo dõi tiến độ, nhật ký và công việc thi công."
      >
        {canCreate && <ProjectDialog customers={customers} users={users as any[]} />}
      </PageHeader>

      <div className="flex gap-4">
        {/* Placeholder for future specific filters */}
      </div>

      <ClientProjectsTable data={response.data} />
    </div>
  );
}
