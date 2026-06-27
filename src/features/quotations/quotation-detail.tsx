"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatVND, formatDateTime, formatDate, formatNumber, numberToWords } from "@/lib/utils";
import { convertQuotationToContract } from "@/actions/quotations";
import { ExportWordButton } from "@/features/documents/export-word-button";
import { toast } from "sonner";
import { Loader2, FileText, Send, CheckCircle, Edit } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function QuotationDetail({ quotation, canEdit, canConvert }: { quotation: any, canEdit: boolean, canConvert: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConvert = () => {
    startTransition(async () => {
      try {
        const contract = await convertQuotationToContract(quotation.id);
        toast.success("Đã chuyển báo giá thành hợp đồng");
        // router.push(`/contracts/${contract.id}`); // For Phase 7
      } catch (error: any) {
        toast.error("Lỗi chuyển đổi", { description: error.message });
      }
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleSendClient = () => {
    toast("Chức năng gửi khách hàng", {
      description: "Sẽ được hoàn thiện ở Phase tiếp theo.",
      icon: <Send className="h-4 w-4 text-primary" />,
    });
  };

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between bg-card p-4 rounded-xl border">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3">
              {quotation.code}
              <StatusBadge status={quotation.status} />
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tạo bởi: {quotation.createdByUser?.fullName} lúc {formatDateTime(quotation.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" /> Xuất PDF
            </Button>
            <ExportWordButton
              type="quotation"
              code={quotation.code}
              title={quotation.title}
              totalAmount={quotation.totalAmount}
              notes={quotation.notes}
              createdAt={quotation.createdAt}
              customer={quotation.customer}
              items={quotation.items}
            />
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" asChild size="sm">
                  <Link href={`/quotations/${quotation.id}/edit`}>
                    <Edit className="w-4 h-4 mr-2" /> Sửa
                  </Link>
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSendClient}>
              <Send className="mr-2 h-4 w-4" /> Gửi khách hàng
            </Button>
            {canConvert && quotation.status === "approved" && (
              <Button size="sm" onClick={handleConvert} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Tạo Hợp Đồng
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground mr-2">Tên:</span> {quotation.customer.name}</p>
              <p><span className="text-muted-foreground mr-2">SĐT:</span> {quotation.customer.phone || "—"}</p>
              <p><span className="text-muted-foreground mr-2">Email:</span> {quotation.customer.email || "—"}</p>
              <p><span className="text-muted-foreground mr-2">Địa chỉ:</span> {quotation.customer.address || "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin báo giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-muted-foreground mr-2">Tiêu đề:</span> {quotation.title}</p>
              <p><span className="text-muted-foreground mr-2">Trạng thái:</span> <StatusBadge status={quotation.status} /></p>
              <p><span className="text-muted-foreground mr-2">Hiệu lực đến:</span> {quotation.validUntil ? formatDateTime(quotation.validUntil) : "—"}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hạng mục báo giá</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Tên hạng mục</TableHead>
                  <TableHead>ĐVT</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.items.map((item: any, index: number) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                      {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatVND(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatVND(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6">
              <div className="w-full md:w-1/3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tổng tiền hàng:</span>
                  <span>{formatVND(quotation.subtotal)}</span>
                </div>
                
                {Number(quotation.discount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Chiết khấu ({quotation.discountType === "percent" ? `${quotation.discount}%` : "VND"}):
                    </span>
                    <span className="text-destructive">
                      -{formatVND(
                        quotation.discountType === "percent" 
                          ? (quotation.subtotal * quotation.discount / 100) 
                          : quotation.discount
                      )}
                    </span>
                  </div>
                )}

                {Number(quotation.otherFees) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí vận chuyển/thi công/khác:</span>
                    <span>+{formatVND(quotation.otherFees)}</span>
                  </div>
                )}

                {Number(quotation.vatAmount) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thuế VAT ({quotation.vatRate}%):</span>
                    <span>+{formatVND(quotation.vatAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                  <span>Tổng thanh toán:</span>
                  <span className="text-primary">{formatVND(quotation.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {quotation.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ghi chú & Điều khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{quotation.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bản in chuyên nghiệp dành cho Báo giá (Print Invoice Template) */}
      <div className="hidden print:block p-10 max-w-4xl mx-auto text-black font-sans text-sm space-y-8">
        {/* Header Công Ty */}
        <div className="flex justify-between items-start border-b pb-6 border-gray-300">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-gray-800 tracking-wider">CÔNG TY CỔ PHẦN NỘI THẤT LUMINON</h1>
            <p className="text-xs text-gray-500">Địa chỉ: 128 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh</p>
            <p className="text-xs text-gray-500">Hotline: 1900 6868 | Email: contact@luminon.vn</p>
            <p className="text-xs text-gray-500">MST: 0312224445</p>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-md font-bold text-gray-700">Mã Báo Giá: {quotation.code}</h2>
            <p className="text-xs text-gray-500">Ngày lập: {formatDate(quotation.createdAt)}</p>
            <p className="text-xs text-gray-500">Có hiệu lực đến: {formatDate(quotation.validUntil)}</p>
          </div>
        </div>

        {/* Tiêu đề chính */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-gray-900">BẢNG BÁO GIÁ THI CÔNG NỘI THẤT</h1>
          <p className="text-sm font-medium italic text-gray-600">Dự án: {quotation.title}</p>
        </div>

        {/* Thông tin Khách hàng */}
        <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-wider">Thông tin chủ đầu tư (Bên A):</h3>
            <p><span className="font-semibold text-gray-600">Tên đơn vị/Khách hàng:</span> {quotation.customer.name}</p>
            <p><span className="font-semibold text-gray-600">Người đại diện:</span> {quotation.customer.contactPerson || quotation.customer.name}</p>
            <p><span className="font-semibold text-gray-600">Số điện thoại:</span> {quotation.customer.phone || "—"}</p>
            <p><span className="font-semibold text-gray-600">Email:</span> {quotation.customer.email || "—"}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-wider">Địa điểm & Đơn vị lập (Bên B):</h3>
            <p><span className="font-semibold text-gray-600">Địa chỉ công trình:</span> {quotation.customer.address || "—"}</p>
            {quotation.customer.taxCode && <p><span className="font-semibold text-gray-600">Mã số thuế:</span> {quotation.customer.taxCode}</p>}
            <p><span className="font-semibold text-gray-600">Nhân viên phụ trách:</span> {quotation.createdByUser?.fullName}</p>
          </div>
        </div>

        {/* Bảng hạng mục vật tư */}
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700 uppercase text-[10px] tracking-wider">Chi tiết các hạng mục thi công:</h3>
          <table className="w-full border-collapse border border-gray-300 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-2 text-center font-bold w-[40px]">STT</th>
                <th className="border border-gray-300 px-3 py-2 text-left font-bold">Hạng mục & Quy cách vật liệu</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-bold w-[60px]">ĐVT</th>
                <th className="border border-gray-300 px-2 py-2 text-right font-bold w-[60px]">SL</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-bold w-[120px]">Đơn giá (đ)</th>
                <th className="border border-gray-300 px-3 py-2 text-right font-bold w-[130px]">Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-2 py-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 px-3 py-2">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    {item.description && <p className="text-[10px] text-gray-500 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{item.unit}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right">{formatNumber(item.unitPrice)}</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-medium">{formatNumber(item.amount)}</td>
                </tr>
              ))}
              {/* Phần tổng tiền cộng dồn */}
              <tr>
                <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right font-semibold">Cộng tiền hàng:</td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold">{formatNumber(quotation.subtotal)}</td>
              </tr>
              {Number(quotation.discount) > 0 && (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right font-semibold text-red-600">
                    Chiết khấu ({quotation.discountType === "percent" ? `${quotation.discount}%` : "VND"}):
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold text-red-600">
                    -{formatNumber(
                      quotation.discountType === "percent" 
                        ? (quotation.subtotal * quotation.discount / 100) 
                        : quotation.discount
                    )}
                  </td>
                </tr>
              )}
              {Number(quotation.otherFees) > 0 && (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right font-semibold">Chi phí khác/vận chuyển:</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">+{formatNumber(quotation.otherFees)}</td>
                </tr>
              )}
              {Number(quotation.vatAmount) > 0 && (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-3 py-2 text-right font-semibold">Thuế GTGT (VAT {quotation.vatRate}%):</td>
                  <td className="border border-gray-300 px-3 py-2 text-right font-bold">+{formatNumber(quotation.vatAmount)}</td>
                </tr>
              )}
              <tr className="bg-gray-50">
                <td colSpan={5} className="border border-gray-300 px-3 py-2.5 text-right font-bold uppercase text-xs">Tổng cộng thanh toán:</td>
                <td className="border border-gray-300 px-3 py-2.5 text-right font-bold text-primary text-xs bg-gray-100">{formatVND(quotation.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Đọc chữ số tiền */}
        <p className="text-xs font-semibold italic text-gray-700 bg-gray-50 p-2.5 rounded border border-gray-200">
          Bằng chữ: {numberToWords(quotation.totalAmount)}
        </p>

        {/* Điều khoản */}
        {quotation.notes && (
          <div className="space-y-1.5 border-t pt-4">
            <h4 className="font-bold text-gray-700 text-[10px] uppercase tracking-wider">Ghi chú & Điều khoản thanh toán:</h4>
            <p className="text-[11px] text-gray-600 whitespace-pre-wrap leading-relaxed">{quotation.notes}</p>
          </div>
        )}

        {/* Ký tên các bên */}
        <div className="grid grid-cols-2 text-center pt-8 gap-10">
          <div className="space-y-16">
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wider">ĐẠI DIỆN KHÁCH HÀNG (BÊN A)</p>
              <p className="text-[10px] text-gray-400 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
            </div>
            <div className="h-10"></div>
          </div>
          <div className="space-y-16">
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wider">ĐẠI DIỆN LẬP BÁO GIÁ (BÊN B)</p>
              <p className="text-[10px] text-gray-400 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
            </div>
            <div className="h-10 text-gray-800 font-semibold">{quotation.createdByUser?.fullName}</div>
          </div>
        </div>
      </div>
    </>
  );
}
