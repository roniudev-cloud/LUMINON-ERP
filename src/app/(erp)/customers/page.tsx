import { Suspense } from "react";
import { getCustomers, getCustomerLookups, getDuplicateCustomers } from "@/actions/customers";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerDialog } from "@/features/customers/customer-form-dialog";
import { DuplicateCustomersPanel } from "@/features/customers/duplicate-customers-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/actions/auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export const metadata = {
  title: "Khách hàng",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  const canCreate = user?.roles.includes(ROLES.ADMIN) || user?.permissions.includes(PERMISSIONS.CUSTOMERS_CREATE);

  // Await search params
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : undefined;

  const result = await getCustomers({ page, search });
  const lookups = await getCustomerLookups();
  const duplicateGroups = await getDuplicateCustomers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khách hàng"
        description="Quản lý danh sách khách hàng của công ty."
      >
        {canCreate && <CustomerDialog lookups={lookups} />}
      </PageHeader>

      <DuplicateCustomersPanel groups={duplicateGroups} />

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
        {/* We have to do a small trick to pass down the result data to the client component. 
            TanStack Table is completely headless but we use Client Components for it */}
        <CustomerTableWrapper data={result.data} />
      </Suspense>
    </div>
  );
}

// Inline wrapper since it's just passing columns
import { ClientCustomerTable } from "@/features/customers/client-customer-table";
function CustomerTableWrapper({ data }: { data: any[] }) {
  return <ClientCustomerTable data={data} />;
}
