import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatVND, formatDateTime } from "@/lib/utils";

// Lưu ý: Cần import font Unicode (Roboto/Arial) dạng Base64 vào jsPDF để gõ tiếng Việt.
// Do giới hạn framework, ta dùng tiếng Việt không dấu cho chuẩn hoặc tải font add vào.

export function generateReceiptPdf(receipt: any) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("PHIEU THU", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Ma phieu: ${receipt.code}`, 105, 30, { align: "center" });
  doc.text(`Ngay: ${formatDateTime(receipt.date)}`, 105, 38, { align: "center" });

  // Thông tin
  doc.setFontSize(11);
  doc.text(`Ho ten nguoi nop: ${receipt.customer?.name || receipt.submitterName || "Khach Le"}`, 20, 60);
  doc.text(`So dien thoai: ${receipt.customer?.phone || receipt.submitterPhone || "N/A"}`, 20, 70);
  doc.text(`Noi dung thu: ${receipt.description || "Thanh toan"}`, 20, 80);
  doc.text(`Hinh thuc: ${receipt.paymentMethod}`, 20, 90);

  // Số tiền
  doc.setFontSize(14);
  doc.text(`So tien: ${formatVND(receipt.amount)}`, 20, 110);

  // Chữ ký
  doc.setFontSize(12);
  doc.text("Nguoi nop tien", 40, 140, { align: "center" });
  doc.text("(Ky, ho ten)", 40, 148, { align: "center" });

  doc.text("Nguoi lap phieu", 170, 140, { align: "center" });
  doc.text("(Ky, ho ten)", 170, 148, { align: "center" });

  doc.save(`Phieu-Thu-${receipt.code}.pdf`);
}

export function generatePaymentPdf(payment: any) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("PHIEU CHI", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Ma phieu: ${payment.code}`, 105, 30, { align: "center" });
  doc.text(`Ngay: ${formatDateTime(payment.date)}`, 105, 38, { align: "center" });

  doc.setFontSize(11);
  doc.text(`Nguoi nhan: ${payment.receiverName || "N/A"}`, 20, 60);
  doc.text(`Noi dung chi: ${payment.description || "Thanh toan chi phi"}`, 20, 70);
  doc.text(`Hinh thuc: ${payment.paymentMethod}`, 20, 80);

  doc.setFontSize(14);
  doc.text(`So tien: ${formatVND(payment.amount)}`, 20, 100);

  // Chữ ký
  doc.setFontSize(12);
  doc.text("Nguoi nhan tien", 40, 130, { align: "center" });
  doc.text("(Ky, ho ten)", 40, 138, { align: "center" });

  doc.text("Thu quy / Giam doc", 170, 130, { align: "center" });
  doc.text("(Ky, ho ten)", 170, 138, { align: "center" });

  doc.save(`Phieu-Chi-${payment.code}.pdf`);
}
