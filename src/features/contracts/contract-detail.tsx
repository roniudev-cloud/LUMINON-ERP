"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatVND, formatDateTime, formatDate, formatNumber, numberToWords } from "@/lib/utils";
import { convertContractToProject, cancelContract } from "@/actions/contracts";
import { CancelWithReasonDialog } from "@/components/shared/cancel-with-reason-dialog";
import { toast } from "sonner";
import { Loader2, FileText, CheckCircle, HardHat, FileSignature, ArrowLeft, Edit, PenTool, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DigitalSignatureDialog } from "./digital-signature-dialog";
import { ExportWordButton } from "@/features/documents/export-word-button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export function ContractDetail({ contract, canEdit, canConvert }: { contract: any, canEdit: boolean, canConvert: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleConvert = () => {
    startTransition(async () => {
      try {
        const project = await convertContractToProject(contract.id);
        toast.success("Đã khởi tạo công trình từ hợp đồng");
        // router.push(`/projects/${project.id}`);
      } catch (error: any) {
        toast.error("Lỗi chuyển đổi", { description: error.message });
      }
    });
  };

  const totalPaid = Number(contract.paidAmount) || 0;
  const totalAmount = Number(contract.totalAmount) || 0;
  const paidPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between bg-card p-4 rounded-xl border">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-3">
              {contract.code} - {contract.title}
              <StatusBadge status={contract.status} />
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tạo bởi: {contract.createdByUser?.fullName} lúc {formatDateTime(contract.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2">
              <DigitalSignatureDialog contractId={contract.id} />
              <Button variant="outline" size="sm" asChild>
                <Link href={`/contracts/${contract.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" /> Sửa
                </Link>
              </Button>
              <ExportWordButton
                type="contract"
                code={contract.code}
                title={contract.title}
                totalAmount={contract.totalAmount}
                constructionAddress={contract.constructionAddress}
                signDate={contract.signDate}
                createdAt={contract.createdAt}
                customer={contract.customer}
              />
              <Button size="sm" onClick={() => window.print()}>
                <FileDown className="w-4 h-4 mr-2" /> In Hợp Đồng
              </Button>
            </div>
            {canConvert && (contract.status === "signed" || contract.status === "in_progress") && (
              <Button size="sm" onClick={handleConvert} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HardHat className="mr-2 h-4 w-4" />}
                Tạo Công Trình
              </Button>
            )}
            {canEdit && !["cancelled", "completed", "liquidated"].includes(contract.status) && (
              <CancelWithReasonDialog
                triggerLabel="Hủy hợp đồng"
                title="Hủy hợp đồng"
                description={`Hợp đồng "${contract.code}" sẽ chuyển sang trạng thái Đã hủy. Hành động này không thể tự hoàn tác qua UI.`}
                onConfirm={async (reason) => { await cancelContract(contract.id, reason); router.refresh(); }}
                successMessage="Đã hủy hợp đồng"
              />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1">Khách hàng</p>
                  <p className="font-medium">{contract.customer.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Địa chỉ thi công</p>
                  <p className="font-medium">{contract.constructionAddress || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Ngày ký</p>
                  <p className="font-medium">{contract.signDate ? formatDateTime(contract.signDate) : "Chưa ký"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Thời gian thi công dự kiến</p>
                  <p className="font-medium">
                    {contract.startDate ? formatDateTime(contract.startDate).split(' ')[0] : "?"} - {contract.endDate ? formatDateTime(contract.endDate).split(' ')[0] : "?"}
                  </p>
                </div>
                {contract.quotation && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground mb-1">Báo giá liên kết</p>
                    <p className="font-medium text-primary font-mono">{contract.quotation.code}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giá trị hợp đồng:</span>
                  <span className="font-bold">{formatVND(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Đã thu:</span>
                  <span className="text-green-600 font-medium">{formatVND(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Còn lại:</span>
                  <span className="text-destructive font-medium">{formatVND(totalAmount - totalPaid)}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span>Tiến độ thu tiền</span>
                  <span>{paidPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={paidPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tiến độ thanh toán (Payment Terms)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đợt</TableHead>
                  <TableHead>Tỷ lệ</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Dự kiến</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contract.paymentTerms.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Chưa có dữ liệu</TableCell></TableRow>
                )}
                {contract.paymentTerms.map((term: any) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.name}</TableCell>
                    <TableCell>{term.percentage ? `${term.percentage}%` : "—"}</TableCell>
                    <TableCell>{formatVND(term.amount)}</TableCell>
                    <TableCell>{term.dueDate ? formatDateTime(term.dueDate).split(' ')[0] : "—"}</TableCell>
                    <TableCell><StatusBadge status={term.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hạng mục Hợp đồng</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
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
                {contract.items.map((item: any, index: number) => (
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
          </CardContent>
        </Card>

        {contract.signatures && contract.signatures.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Chữ ký điện tử</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                {contract.signatures.map((sig: any) => (
                  <div key={sig.id} className="border rounded-lg p-4 bg-muted/20 text-center min-w-[200px]">
                    <p className="text-sm font-medium mb-4 uppercase">
                      {sig.type === "customer" ? "Đại diện khách hàng" : sig.type === "company_stamp" ? "Con dấu" : "Đại diện công ty"}
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sig.imageData} alt="Signature" className="mx-auto h-24 object-contain" />
                    <p className="text-xs text-muted-foreground mt-4">Ký ngày: {formatDateTime(sig.createdAt).split(' ')[0]}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {(contract.paymentTermsContent || contract.executionTerms || contract.warrantyTerms) && (
          <Card>
            <CardHeader>
              <CardTitle>Điều khoản chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {contract.paymentTermsContent && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Thanh toán</h4>
                  <p className="text-sm whitespace-pre-wrap">{contract.paymentTermsContent}</p>
                </div>
              )}
              {contract.executionTerms && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Thi công & Giao hàng</h4>
                  <p className="text-sm whitespace-pre-wrap">{contract.executionTerms}</p>
                </div>
              )}
              {contract.warrantyTerms && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Bảo hành</h4>
                  <p className="text-sm whitespace-pre-wrap">{contract.warrantyTerms}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bản in Hợp đồng chuyên nghiệp (Print Contract Template) */}
      <div className="hidden print:block p-10 max-w-4xl mx-auto text-black font-sans text-xs space-y-6 leading-relaxed">
        {/* Tiêu đề Quốc hiệu */}
        <div className="text-center space-y-1">
          <h1 className="font-bold text-[13px] uppercase tracking-wide">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h1>
          <h2 className="font-bold text-xs border-b border-black pb-2 max-w-[200px] mx-auto">Độc lập - Tự do - Hạnh phúc</h2>
        </div>

        {/* Tên hợp đồng */}
        <div className="text-center pt-4 space-y-1">
          <h1 className="text-base font-bold uppercase tracking-wider">HỢP ĐỒNG THI CÔNG NỘI THẤT</h1>
          <p className="font-mono text-[10px]">Số: {contract.code}/HĐTC-LUMINON</p>
          <p className="italic text-[10px]">Hôm nay, ngày {formatDate(contract.signDate || contract.createdAt)} tại Văn phòng Công ty LUMINON, chúng tôi gồm:</p>
        </div>

        {/* Thông tin Bên A */}
        <div className="space-y-1">
          <p className="font-bold text-gray-800 uppercase text-xs">BÊN A: CHỦ ĐẦU TƯ (BÊN GIAO THẦU)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pl-4">
            <p><span className="font-semibold">Tên đơn vị / Khách hàng:</span> {contract.customer.name}</p>
            <p><span className="font-semibold">Người đại diện:</span> {contract.customer.contactPerson || contract.customer.name}</p>
            <p><span className="font-semibold">Số điện thoại:</span> {contract.customer.phone || "—"}</p>
            <p><span className="font-semibold">Email:</span> {contract.customer.email || "—"}</p>
            <p className="col-span-2"><span className="font-semibold">Địa chỉ thi công:</span> {contract.constructionAddress || "—"}</p>
          </div>
        </div>

        {/* Thông tin Bên B */}
        <div className="space-y-1">
          <p className="font-bold text-gray-800 uppercase text-xs">BÊN B: ĐƠN VỊ THI CÔNG (BÊN NHẬN THẦU)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pl-4">
            <p><span className="font-semibold">Tên đơn vị:</span> CÔNG TY CỔ PHẦN NỘI THẤT LUMINON</p>
            <p><span className="font-semibold">Đại diện pháp luật:</span> Nguyễn Quản Trị</p>
            <p><span className="font-semibold">Chức vụ:</span> Giám Đốc</p>
            <p><span className="font-semibold">MST:</span> 0312224445</p>
            <p className="col-span-2"><span className="font-semibold">Địa chỉ:</span> 128 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh</p>
          </div>
        </div>

        {/* Điều 1: Phạm vi */}
        <div className="space-y-1">
          <p className="font-bold text-gray-800 uppercase text-[10px]">ĐIỀU 1: PHẠM VI CÔNG VIỆC VÀ VẬT LIỆU THI CÔNG</p>
          <p className="pl-4">Bên B nhận thi công lắp đặt trọn gói công trình nội thất tại địa chỉ của Bên A theo đúng bảng hạng mục dưới đây:</p>
          
          <table className="w-full border-collapse border border-gray-300 text-[10px] mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-center font-bold w-[40px]">STT</th>
                <th className="border border-gray-300 px-2 py-1 text-left font-bold">Hạng mục & Quy cách vật tư</th>
                <th className="border border-gray-300 px-2 py-1 text-center font-bold w-[60px]">ĐVT</th>
                <th className="border border-gray-300 px-2 py-1 text-right font-bold w-[50px]">SL</th>
                <th className="border border-gray-300 px-2 py-1 text-right font-bold w-[90px]">Đơn giá (đ)</th>
                <th className="border border-gray-300 px-2 py-1 text-right font-bold w-[100px]">Thành tiền (đ)</th>
              </tr>
            </thead>
            <tbody>
              {contract.items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    {item.description && <p className="text-[9px] text-gray-500 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">{item.unit}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{item.quantity}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">{formatNumber(item.unitPrice)}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-medium">{formatNumber(item.amount)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={5} className="border border-gray-300 px-2 py-1.5 text-right">Tổng giá trị hợp đồng (trước VAT & Chiết khấu):</td>
                <td className="border border-gray-300 px-2 py-1.5 text-right">{formatNumber(contract.subtotal)}</td>
              </tr>
              {Number(contract.discount) > 0 && (
                <tr className="text-red-600 font-semibold">
                  <td colSpan={5} className="border border-gray-300 px-2 py-1 text-right">Chiết khấu giảm giá:</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    -{formatNumber(
                      contract.discountType === "percent"
                        ? (contract.subtotal * contract.discount / 100)
                        : contract.discount
                    )}
                  </td>
                </tr>
              )}
              {Number(contract.vatAmount) > 0 && (
                <tr className="font-semibold">
                  <td colSpan={5} className="border border-gray-300 px-2 py-1 text-right">Thuế giá trị gia tăng (VAT {contract.vatRate}%):</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">+{formatNumber(contract.vatAmount)}</td>
                </tr>
              )}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={5} className="border border-gray-300 px-2 py-2 text-right uppercase">Tổng cộng thanh toán của Hợp đồng:</td>
                <td className="border border-gray-300 px-2 py-2 text-right text-primary">{formatVND(contract.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Số tiền bằng chữ */}
        <p className="text-[10px] font-semibold italic text-gray-700 bg-gray-50 p-2 rounded border border-gray-200">
          Bằng chữ: {numberToWords(contract.totalAmount)}
        </p>

        {/* Điều 2: Tiến độ thanh toán */}
        <div className="space-y-1">
          <p className="font-bold text-gray-800 uppercase text-[10px]">ĐIỀU 2: TIẾN ĐỘ VÀ PHƯƠNG THỨC THANH TOÁN</p>
          <p className="pl-4">Bên A sẽ thanh toán cho Bên B bằng chuyển khoản ngân hàng theo các đợt tạm ứng sau:</p>
          <div className="pl-4 space-y-1 mt-1 text-[10px]">
            {contract.paymentTerms.map((term: any, index: number) => (
              <p key={term.id}>
                • Đợt {index + 1}: {term.name} - Tỷ lệ: {term.percentage}% - Số tiền: <span className="font-semibold">{formatVND(term.amount)}</span> - Dự kiến thanh toán trước ngày: {formatDate(term.dueDate)}
              </p>
            ))}
          </div>
          {contract.paymentTermsContent && <p className="pl-4 text-[10px] text-gray-600 mt-1 whitespace-pre-wrap">{contract.paymentTermsContent}</p>}
        </div>

        {/* Điều 3: Tiến độ thi công */}
        {(contract.executionTerms || contract.startDate) && (
          <div className="space-y-1">
            <p className="font-bold text-gray-800 uppercase text-[10px]">ĐIỀU 3: THỜI GIAN THI CÔNG DỰ KIẾN</p>
            <p className="pl-4">
              Thời gian khởi công từ ngày <span className="font-semibold">{formatDate(contract.startDate)}</span> đến ngày bàn giao công trình <span className="font-semibold">{formatDate(contract.endDate)}</span>.
            </p>
            {contract.executionTerms && <p className="pl-4 text-[10px] text-gray-600 whitespace-pre-wrap">{contract.executionTerms}</p>}
          </div>
        )}

        {/* Điều 4: Bảo hành */}
        {contract.warrantyTerms && (
          <div className="space-y-1">
            <p className="font-bold text-gray-800 uppercase text-[10px]">ĐIỀU 4: ĐIỀU KHOẢN BẢO HÀNH</p>
            <p className="pl-4 text-[10px] text-gray-600 whitespace-pre-wrap">{contract.warrantyTerms}</p>
          </div>
        )}

        {/* Ký tên các bên kèm chữ ký số */}
        <div className="grid grid-cols-1 md:grid-cols-2 pt-10 text-center gap-6 sm:gap-10">
          <div className="space-y-6">
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wider">ĐẠI DIỆN KHÁCH HÀNG (BÊN A)</p>
              <p className="text-[10px] text-gray-400 italic mt-0.5">(Ký, ghi rõ họ tên và đóng dấu nếu có)</p>
            </div>
            
            {/* Render chữ ký số của Bên A nếu có */}
            {contract.signatures?.find((s: any) => s.type === "customer") ? (
              <div className="h-20 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={contract.signatures.find((s: any) => s.type === "customer").imageData} 
                  alt="Customer Signature" 
                  className="h-16 object-contain"
                />
              </div>
            ) : (
              <div className="h-20"></div>
            )}
            
            <p className="font-semibold text-gray-800">{contract.customer.contactPerson || contract.customer.name}</p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="font-bold text-gray-700 text-xs uppercase tracking-wider">ĐẠI DIỆN LẬP HỢP ĐỒNG (BÊN B)</p>
              <p className="text-[10px] text-gray-400 italic mt-0.5">(Ký, ghi rõ họ tên và đóng dấu nếu có)</p>
            </div>
            
            {/* Render chữ ký số của Bên B / Đại diện công ty nếu có */}
            {contract.signatures?.find((s: any) => s.type === "company" || s.type === "representative") ? (
              <div className="h-20 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={contract.signatures.find((s: any) => s.type === "company" || s.type === "representative").imageData} 
                  alt="Representative Signature" 
                  className="h-16 object-contain"
                />
              </div>
            ) : (
              <div className="h-20"></div>
            )}
            
            <p className="font-semibold text-gray-800">{contract.createdByUser?.fullName || "Nguyễn Quản Trị"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
