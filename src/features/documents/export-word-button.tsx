"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateDocx } from "@/lib/services/docx-export";
import { formatVND, formatDate } from "@/lib/utils";

interface QuotationExportData {
  type: "quotation";
  code: string;
  title: string;
  totalAmount: number | string;
  notes?: string | null;
  createdAt: string | Date;
  customer: { name: string; address?: string | null };
  items: { name: string; unit: string; quantity: number | string; unitPrice: number | string; amount: number | string }[];
}

interface ContractExportData {
  type: "contract";
  code: string;
  title: string;
  totalAmount: number | string;
  constructionAddress?: string | null;
  signDate?: string | Date | null;
  createdAt: string | Date;
  customer: { name: string; address?: string | null; taxCode?: string | null };
}

type ExportWordButtonProps = QuotationExportData | ContractExportData;

export function ExportWordButton(props: ExportWordButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const templatePath =
        props.type === "quotation" ? "/templates/quotation-template.docx" : "/templates/contract-template.docx";
      const res = await fetch(templatePath);
      if (!res.ok) throw new Error("Không tải được file mẫu Word");
      const buffer = await res.arrayBuffer();

      if (props.type === "quotation") {
        const itemsText = props.items
          .map((it, idx) => `${idx + 1}. ${it.name} — ${it.quantity} ${it.unit} x ${formatVND(it.unitPrice)} = ${formatVND(it.amount)}`)
          .join("\n");

        generateDocx(
          buffer,
          {
            SO_BAO_GIA: props.code,
            TEN_KHACH: props.customer.name,
            DIA_CHI_KH: props.customer.address || "—",
            NGAY_BAO_GIA: formatDate(props.createdAt),
            TIEU_DE: props.title,
            DANH_SACH_HANG_MUC: itemsText || "—",
            TONG_TIEN: formatVND(props.totalAmount),
            GHI_CHU: props.notes || "—",
          },
          `BaoGia_${props.code}.docx`
        );
      } else {
        generateDocx(
          buffer,
          {
            SO_HD: props.code,
            TIEU_DE_HD: props.title,
            TEN_KHACH: props.customer.name,
            DIA_CHI_KH: props.customer.address || "—",
            MST_KH: props.customer.taxCode || "—",
            DIA_CHI_THI_CONG: props.constructionAddress || "—",
            GIA_TRI_HD: formatVND(props.totalAmount),
            NGAY_KY: props.signDate ? formatDate(props.signDate) : "—",
          },
          `HopDong_${props.code}.docx`
        );
      }
      toast.success("Đã xuất file Word");
    } catch (error: any) {
      toast.error(error.message || "Xuất Word thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
      Xuất Word
    </Button>
  );
}
