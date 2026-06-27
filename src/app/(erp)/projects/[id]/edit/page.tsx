import { getProject } from "@/actions/projects";
import { requireAuth } from "@/actions/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/features/projects/project-form";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PERMISSIONS } from "@/lib/constants";

export const metadata = {
  title: "Sửa Công trình | LUMINON ERP",
};

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth(PERMISSIONS.PROJECTS_UPDATE);

  let project;
  let customers;
  let users;
  try {
    project = await getProject(id);
    
    customers = await db.query.customers.findMany({
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

    users = usersData.map(u => ({
      id: u.id,
      fullName: u.fullName,
      roles: u.userRoles.map((ur: any) => ur.role.name)
    }));
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa Công trình: ${project.code}`}
        description="Cập nhật thông tin chi tiết công trình."
      />

      <div className="max-w-4xl">
        <ProjectForm initialData={project} customers={customers} users={users as any[]} />
      </div>
    </div>
  );
}
