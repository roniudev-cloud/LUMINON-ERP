"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatVND, formatDateTime, formatDate, numberToWords } from "@/lib/utils";
import { ArrowLeft, Printer, Calendar, DollarSign, User, FileText, CreditCard, Receipt } from "lucide-react";
import Link from "next/link";

interface ReceiptDetailProps {
  receipt: any;
}

export function ReceiptDetail({ receipt }: ReceiptDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldPrint = searchParams.get("print") === "true";

  useEffect(() => {
    if (shouldPrint) {
      // Small timeout to allow render completion
      const timer = setTimeout(() => {
        window.print();
        // Clean URL parameter after printing
        const params = new URLSearchParams(searchParams.toString());
        params.delete("print");
        router.replace(`/receipts/${receipt.id}`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, receipt.id, router, searchParams]);

  const methodLabels: Record<string, string> = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản ngân hàng",
    pos: "Quẹt thẻ máy POS",
    e_wallet: "Ví điện tử",
    other: "Hình thức khác"
  };

  const typeLabels: Record<string, string> = {
    deposit: "Tạm ứng / Đặt cọc",
    installment: "Thanh toán đợt / Tiến độ",
    final: "Quyết toán hợp đồng",
    extra: "Thu phí phát sinh",
    warranty: "Thu tiền bảo hành",
    online_order: "Thu tiền đơn hàng bán lẻ",
    other: "Thu khác"
  };

  const amountNumber = Number(receipt.amount) || 0;

  return (
    <>
      <div className="space-y-6 print:hidden">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-card p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" asChild>
              <Link href="/receipts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-3">
                {receipt.code}
                <span className="text-sm font-normal text-muted-foreground">({typeLabels[receipt.type] || receipt.type})</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Thời gian lập: {formatDateTime(receipt.date)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> In Phiếu Thu
            </Button>
          </div>
        </div>

        {/* Main Details */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader className="bg-muted/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Thông tin phiếu thu tiền
              </CardTitle>
              <CardDescription>Chi tiết giao dịch thu tiền từ khách hàng</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><User className="w-3.5 h-3.5" /> Người nộp tiền</p>
                  <p className="font-semibold text-foreground">{receipt.submitterName || receipt.customer?.name || "Khách vãng lai"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Ngày thực hiện</p>
                  <p className="font-semibold text-foreground">{formatDate(receipt.date)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Phương thức</p>
                  <p className="font-semibold text-foreground">{methodLabels[receipt.paymentMethod] || receipt.paymentMethod}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Người lập phiếu</p>
                  <p className="font-semibold text-foreground">{receipt.createdByUser?.fullName || "Hệ thống"}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-muted-foreground text-xs flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Số tiền thu</p>
                <div className="flex flex-col sm:flex-row justify-between sm:items-baseline gap-1">
                  <span className="text-2xl font-bold text-green-600">{formatVND(receipt.amount)}</span>
                  <span className="text-xs font-semibold italic text-muted-foreground">Bằng chữ: {numberToWords(amountNumber)}</span>
                </div>
              </div>

              {receipt.description && (
                <div className="border-t pt-4">
                  <p className="text-muted-foreground text-xs mb-1">Nội dung thu / Ghi chú</p>
                  <div className="bg-muted/40 p-3 rounded-lg whitespace-pre-wrap leading-relaxed text-foreground">
                    {receipt.description}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right sidebar links */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Liên kết nghiệp vụ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Khách hàng</p>
                  {receipt.customer ? (
                    <Link href={`/customers/${receipt.customer.id}`} className="font-semibold text-primary hover:underline block mt-0.5">
                      {receipt.customer.name}
                    </Link>
                  ) : (
                    <p className="font-medium mt-0.5">—</p>
                  )}
                </div>
                {receipt.contract && (
                  <div>
                    <p className="text-muted-foreground text-xs">Hợp đồng</p>
                    <Link href={`/contracts/${receipt.contract.id}`} className="font-semibold text-primary hover:underline font-mono block mt-0.5">
                      {receipt.contract.code}
                    </Link>
                  </div>
                )}
                {receipt.project && (
                  <div>
                    <p className="text-muted-foreground text-xs">Công trình / Dự án</p>
                    <Link href={`/projects/${receipt.project.id}`} className="font-semibold text-primary hover:underline block mt-0.5">
                      [{receipt.project.code}] {receipt.project.name}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {receipt.files && receipt.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Chứng từ đính kèm ({receipt.files.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {receipt.files.map((file: any) => (
                    <div key={file.id} className="border rounded-lg overflow-hidden bg-muted/10">
                      {file.fileType === "image" || file.fileUrl.startsWith("data:image") ? (
                        <div className="p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={file.fileUrl} alt={file.fileName || "Chứng từ"} className="max-h-48 w-full object-contain rounded" />
                        </div>
                      ) : (
                        <div className="p-3 text-xs flex justify-between items-center">
                          <span className="truncate max-w-[150px] font-medium">{file.fileName || "File đính kèm"}</span>
                          <a href={file.fileUrl} download className="text-primary hover:underline font-semibold" target="_blank" rel="noreferrer">
                            Tải về
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bản in chuyên nghiệp dành cho Phiếu Thu (Print Voucher Template) */}
      <div className="hidden print:block p-8 max-w-4xl mx-auto text-black font-sans text-xs space-y-6 leading-relaxed">
        {/* Header Thông tin công ty */}
        <div className="flex justify-between items-start border-b pb-4 border-gray-300">
          <div className="space-y-1">
            <h1 className="text-xs font-bold uppercase">CÔNG TY CỔ PHẦN NỘI THẤT LUMINON</h1>
            <p className="text-[10px] text-gray-500">ĐC: 128 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh</p>
            <p className="text-[10px] text-gray-500">Hotline: 1900 6868 | MST: 0312224445</p>
          </div>
          <div className="text-right space-y-1">
            <p className="font-bold text-gray-700">Mẫu số 01 - TT</p>
            <p className="text-[9px] text-gray-400 italic">(Ban hành theo Thông tư số 200/2014/TT-BTC)</p>
          </div>
        </div>

        {/* Tiêu đề chính */}
        <div className="text-center space-y-1.5 py-2">
          <h1 className="text-xl font-bold uppercase tracking-wider">PHIẾU THU TIỀN</h1>
          <p className="font-mono text-[10px] text-gray-600">Số: {receipt.code}</p>
          <p className="italic text-[10px] text-gray-500">Ngày lập phiếu: {formatDate(receipt.date)}</p>
        </div>

        {/* Thông tin Chi tiết */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-4 gap-2">
            <p className="font-semibold text-gray-600 col-span-1">Họ tên người nộp tiền:</p>
            <p className="text-gray-900 col-span-3 border-b border-dashed border-gray-400 pb-0.5">{receipt.submitterName || receipt.customer?.name || "Khách lẻ"}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <p className="font-semibold text-gray-600 col-span-1">Điện thoại / Địa chỉ:</p>
            <p className="text-gray-900 col-span-3 border-b border-dashed border-gray-400 pb-0.5">{receipt.customer?.phone || receipt.customer?.address || "—"}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <p className="font-semibold text-gray-600 col-span-1">Lý do nộp tiền:</p>
            <p className="text-gray-900 col-span-3 border-b border-dashed border-gray-400 pb-0.5">{receipt.description || typeLabels[receipt.type] || "Thanh toán dịch vụ nội thất"}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <p className="font-semibold text-gray-600 col-span-1">Phương thức thanh toán:</p>
            <p className="text-gray-900 col-span-3 border-b border-dashed border-gray-400 pb-0.5">{methodLabels[receipt.paymentMethod] || receipt.paymentMethod}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <p className="font-semibold text-gray-600 col-span-1">Số tiền thu:</p>
            <p className="text-gray-900 col-span-3 font-bold border-b border-dashed border-gray-400 pb-0.5 text-sm">{formatVND(receipt.amount)}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <p className="font-semibold text-gray-600 col-span-1">Viết bằng chữ:</p>
            <p className="text-gray-950 col-span-3 italic border-b border-dashed border-gray-400 pb-0.5 font-medium">{numberToWords(amountNumber)}</p>
          </div>
          {receipt.contract && (
            <div className="grid grid-cols-4 gap-2">
              <p className="font-semibold text-gray-600 col-span-1">Kèm theo Hợp đồng:</p>
              <p className="text-gray-900 col-span-3 font-mono border-b border-dashed border-gray-400 pb-0.5">{receipt.contract.code} {receipt.project ? `(Dự án: ${receipt.project.name})` : ""}</p>
            </div>
          )}
        </div>

        {/* Chữ ký các bên */}
        <div className="pt-8 grid grid-cols-5 text-center gap-1 text-[10px]">
          <div className="space-y-12">
            <div>
              <p className="font-bold uppercase">Giám đốc</p>
              <p className="text-[8px] text-gray-400 italic">(Ký, họ tên, đóng dấu)</p>
            </div>
            <div className="h-10"></div>
          </div>
          <div className="space-y-12">
            <div>
              <p className="font-bold uppercase">Kế toán trưởng</p>
              <p className="text-[8px] text-gray-400 italic">(Ký, họ tên)</p>
            </div>
            <div className="h-10"></div>
          </div>
          <div className="space-y-12">
            <div>
              <p className="font-bold uppercase">Thủ quỹ</p>
              <p className="text-[8px] text-gray-400 italic">(Ký, họ tên)</p>
            </div>
            <div className="h-10"></div>
          </div>
          <div className="space-y-12">
            <div>
              <p className="font-bold uppercase">Người nộp tiền</p>
              <p className="text-[8px] text-gray-400 italic">(Ký, họ tên)</p>
            </div>
            <div className="h-10 text-gray-800 font-semibold">{receipt.submitterName || receipt.customer?.name}</div>
          </div>
          <div className="space-y-12">
            <div>
              <p className="font-bold uppercase">Người lập phiếu</p>
              <p className="text-[8px] text-gray-400 italic">(Ký, họ tên)</p>
            </div>
            <div className="h-10 text-gray-800 font-semibold">{receipt.createdByUser?.fullName || "Hệ thống"}</div>
          </div>
        </div>
      </div>
    </>
  );
}
