import { getPayment } from "@/actions/finance";
import { PaymentDetail } from "@/features/finance/payment-detail";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const payment = await getPayment(id);
    return {
      title: `Phiếu Chi ${payment.code} | LUMINON ERP`,
    };
  } catch {
    return { title: "Không tìm thấy phiếu chi" };
  }
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let payment;
  try {
    payment = await getPayment(id);
  } catch (error) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PaymentDetail payment={payment} />
    </div>
  );
}
