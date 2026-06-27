import { getReceipt } from "@/actions/finance";
import { ReceiptDetail } from "@/features/finance/receipt-detail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const receipt = await getReceipt(id);
    return {
      title: `Phiếu Thu ${receipt.code} | LUMINON ERP`,
    };
  } catch {
    return { title: "Không tìm thấy phiếu thu" };
  }
}

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let receipt;
  try {
    receipt = await getReceipt(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <ReceiptDetail receipt={receipt} />
    </div>
  );
}
