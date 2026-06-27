import { Suspense } from "react";
import { getLeads } from "@/actions/leads";
import { getCustomerLookups } from "@/actions/customers";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/actions/auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";
import { ClientLeadTable } from "@/features/leads/client-lead-table";
import { LeadHeaderActions } from "@/features/leads/lead-header-actions";

export const metadata = {
  title: "Quản lý Lead",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  const canCreate =
    user?.roles.includes(ROLES.ADMIN) ||
    user?.permissions.includes(PERMISSIONS.LEADS_CREATE);

  // Await search params
  const resolvedParams = await searchParams;
  const page =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page)
      : 1;
  const search =
    typeof resolvedParams.search === "string"
      ? resolvedParams.search
      : undefined;

  // We fetch lookups from customers because leads share the same sources and assignees
  const [result, lookups] = await Promise.all([
    getLeads({ page, search }),
    getCustomerLookups(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads tiềm năng"
        description="Quản lý danh sách khách hàng tiềm năng trước khi chuyển thành khách hàng chính thức."
      >
        {canCreate && (
          <LeadHeaderActions
            sources={lookups.sources}
            assignees={lookups.assignees}
          />
        )}
      </PageHeader>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        <ClientLeadTable
          data={result.data as any}
          sources={lookups.sources}
          assignees={lookups.assignees}
        />
      </Suspense>
    </div>
  );
}
