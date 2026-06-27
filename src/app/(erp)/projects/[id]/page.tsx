import { getProject, getProjectFinancials, getProjectCosts } from "@/actions/projects";
import { getCurrentUser } from "@/actions/auth";
import { getProjectMaterialUsage } from "@/actions/inventory";
import { getProjectWorkerCosts, getWorkerOptions } from "@/actions/workers";
import { getSupplierOptions } from "@/actions/suppliers";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectDetail } from "@/features/projects/project-detail";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const project = await getProject(id);
    return { title: `${project.code} | Công Trình` };
  } catch {
    return { title: "Không tìm thấy công trình" };
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let project;
  let canEdit;
  let canViewFinance;
  let users;
  let financials;
  let materialUsage;
  let costs;
  let workerCosts;
  let workerOptions;
  let supplierOptions;
  try {
    // Tất cả độc lập với nhau — chạy song song thay vì tuần tự để trang load nhanh hơn.
    const [user, projectData, usersData, financialsData, materialUsageData, costsData, workerCostsData, workerOptionsData, supplierOptionsData] =
      await Promise.all([
        getCurrentUser(),
        getProject(id),
        db.query.users.findMany({
          columns: { id: true, fullName: true },
          orderBy: (u, { asc }) => [asc(u.fullName)],
        }),
        getProjectFinancials(id),
        getProjectMaterialUsage(id),
        getProjectCosts(id),
        getProjectWorkerCosts(id),
        getWorkerOptions(),
        getSupplierOptions(),
      ]);

    project = projectData;
    users = usersData;
    financials = financialsData;
    materialUsage = materialUsageData;
    costs = costsData;
    workerCosts = workerCostsData;
    workerOptions = workerOptionsData;
    supplierOptions = supplierOptionsData;

    const isAdmin = user?.roles.includes(ROLES.ADMIN);
    const isProductionManager = user?.roles.includes(ROLES.PRODUCTION_MANAGER);

    canEdit =
      isAdmin ||
      isProductionManager ||
      (user?.permissions.includes(PERMISSIONS.PROJECTS_UPDATE) &&
        (project.createdBy === user?.id || project.managerId === user?.id));

    canViewFinance = isAdmin || user?.permissions.includes("projects.finance.view");
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chi tiết: ${project.name}`}
        action={
          canEdit
            ? {
                label: "Chỉnh sửa",
                href: `/projects/${id}/edit`,
              }
            : undefined
        }
      />

      <ProjectDetail
        project={project}
        users={users}
        canEdit={!!canEdit}
        canViewFinance={!!canViewFinance}
        financials={financials}
        materialUsage={materialUsage}
        costs={costs}
        workerCosts={workerCosts}
        workerOptions={workerOptions}
        supplierOptions={supplierOptions}
      />
    </div>
  );
}
