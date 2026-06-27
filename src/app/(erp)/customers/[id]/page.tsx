import { getCustomer } from "@/actions/customers";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerDetail } from "@/features/customers/customer-detail";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const customer = await getCustomer(id);
    return {
      title: `${customer.name} | Khách Hàng`,
    };
  } catch {
    return { title: "Không tìm thấy khách hàng" };
  }
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let customer;
  let canEdit;
  try {
    const [user, customerData] = await Promise.all([getCurrentUser(), getCustomer(id)]);
    customer = customerData;
    canEdit =
      user?.roles.includes(ROLES.ADMIN) ||
      (user?.permissions.includes(PERMISSIONS.CUSTOMERS_UPDATE) &&
        (user.permissions.includes(PERMISSIONS.CUSTOMERS_VIEW) || customer.assignedToId === user.id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hồ sơ khách hàng"
        action={
          canEdit
            ? {
                label: "Chỉnh sửa",
                href: `/customers/${id}/edit`,
              }
            : undefined
        }
      />

      <CustomerDetail customer={customer} />
    </div>
  );
}
