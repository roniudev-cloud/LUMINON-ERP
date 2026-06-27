import { getContract } from "@/actions/contracts";
import { getCurrentUser } from "@/actions/auth";
import { PageHeader } from "@/components/shared/page-header";
import { ContractDetail } from "@/features/contracts/contract-detail";
import { notFound } from "next/navigation";
import { PERMISSIONS, ROLES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const contract = await getContract(id);
    return { title: `${contract.code} | Hợp Đồng` };
  } catch {
    return { title: "Không tìm thấy hợp đồng" };
  }
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let contract;
  let isAdmin;
  let canEdit;
  let canConvert;
  try {
    const [user, contractData] = await Promise.all([getCurrentUser(), getContract(id)]);
    contract = contractData;
    isAdmin = user?.roles.includes(ROLES.ADMIN);
    
    canEdit =
      isAdmin ||
      (user?.permissions.includes(PERMISSIONS.CONTRACTS_UPDATE) &&
        contract.createdBy === user?.id);

    canConvert =
      isAdmin ||
      (user?.permissions.includes(PERMISSIONS.PROJECTS_CREATE));
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chi tiết Hợp đồng"
        action={
          canEdit
            ? {
                label: "Chỉnh sửa",
                href: `/contracts/${id}/edit`,
              }
            : undefined
        }
      />

      <ContractDetail 
        contract={contract} 
        canEdit={!!canEdit} 
        canConvert={!!canConvert} 
      />
    </div>
  );
}
