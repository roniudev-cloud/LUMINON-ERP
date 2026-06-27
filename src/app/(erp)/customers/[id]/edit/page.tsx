import { getCustomer, getCustomerLookups } from "@/actions/customers";
import { PageHeader } from "@/components/shared/page-header";
import { CustomerForm } from "@/features/customers/customer-form";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Cập Nhật Khách Hàng",
};

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let customer;
  let lookups;
  try {
    const results = await Promise.all([
      getCustomer(id),
      getCustomerLookups(),
    ]);
    customer = results[0];
    lookups = results[1];
  } catch (error) {
    notFound();
  }

  // Handle null values for the form defaultValues
  const initialData = {
    ...customer,
    email: customer.email || "",
    phone: customer.phone || "",
    zalo: customer.zalo || "",
    facebook: customer.facebook || "",
    website: customer.website || "",
    address: customer.address || "",
    city: customer.city || "",
    district: customer.district || "",
    ward: customer.ward || "",
    taxCode: customer.taxCode || "",
    contactPerson: customer.contactPerson || "",
    sourceId: customer.sourceId || "",
    statusId: customer.statusId || "",
    assignedToId: customer.assignedToId || "",
    notes: customer.notes || "",
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Cập nhật thông tin"
        description={`Chỉnh sửa thông tin khách hàng ${customer.name}`}
      />

      <CustomerForm
        initialData={initialData}
        sources={lookups.sources}
        statuses={lookups.statuses}
        assignees={lookups.assignees}
      />
    </div>
  );
}
