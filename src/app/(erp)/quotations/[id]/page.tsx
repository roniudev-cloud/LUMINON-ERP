import { getQuotation } from "@/actions/quotations";
import { getCurrentUser } from "@/actions/auth";
import { PageHeader } from "@/components/shared/page-header";
import { QuotationDetail } from "@/features/quotations/quotation-detail";
import { notFound } from "next/navigation";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const quotation = await getQuotation(id);
    return { title: `${quotation.code} | Báo Giá` };
  } catch {
    return { title: "Không tìm thấy báo giá" };
  }
}

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let quotation;
  let canEdit;
  let canConvert;
  try {
    const [user, quotationData] = await Promise.all([getCurrentUser(), getQuotation(id)]);
    quotation = quotationData;
    const isAdmin = user?.roles.includes(ROLES.ADMIN);

    canEdit =
      isAdmin ||
      (user?.permissions.includes(PERMISSIONS.QUOTATIONS_UPDATE) &&
        quotation.createdBy === user?.id);

    canConvert =
      isAdmin ||
      (user?.permissions.includes(PERMISSIONS.CONTRACTS_CREATE) &&
        quotation.createdBy === user?.id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết báo giá"
        action={
          canEdit
            ? {
              label: "Chỉnh sửa",
              href: `/quotations/${id}/edit`,
            }
            : undefined
        }
      />

      <QuotationDetail
        quotation={quotation}
        canEdit={!!canEdit}
        canConvert={!!canConvert}
      />
    </div>
  );
}
