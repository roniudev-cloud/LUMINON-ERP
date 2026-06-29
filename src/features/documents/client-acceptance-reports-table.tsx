"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SignaturePadDialog } from "@/components/shared/signature-pad-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, CheckCircle2 } from "lucide-react";
import { MobileEntityCard } from "@/components/shared/mobile-entity-card";
import { formatDate } from "@/lib/utils";
import { saveAcceptanceSignature, deleteAcceptanceReport } from "@/actions/documents";
import { toast } from "sonner";

export function ClientAcceptanceReportsTable({ data }: { data: any[] }) {
  const [deletingReport, setDeletingReport] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleSign(reportId: string, type: "customer" | "company") {
    return async (base64: string) => {
      await saveAcceptanceSignature(reportId, type, base64);
    };
  }

  function openDelete(report: any) {
    setDeletingReport(report);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingReport) return;
    setIsDeleting(true);
    try {
      await deleteAcceptanceReport(deletingReport.id);
      toast.success("Đã xóa biên bản nghiệm thu");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground p-6 text-center">Chưa có biên bản nghiệm thu nào.</p>;
  }

  return (
    <>
      <Table className="hidden md:table">
        <TableHeader>
          <TableRow>
            <TableHead>Mã BB</TableHead>
            <TableHead>Công trình</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Chữ ký</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.code}</TableCell>
              <TableCell>{r.project?.name} <span className="text-xs text-muted-foreground">({r.project?.code})</span></TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant={r.customerSignature ? "default" : "outline"} className={r.customerSignature ? "bg-green-100 text-green-700" : ""}>KH</Badge>
                  <Badge variant={r.companySignature ? "default" : "outline"} className={r.companySignature ? "bg-green-100 text-green-700" : ""}>Cty</Badge>
                </div>
              </TableCell>
              <TableCell>{formatDate(r.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!r.customerSignature && (
                    <SignaturePadDialog triggerLabel="KH ký" title="Khách hàng ký nghiệm thu" onSave={handleSign(r.id, "customer")} />
                  )}
                  {!r.companySignature && (
                    <SignaturePadDialog triggerLabel="Cty ký" title="Đại diện công ty ký nghiệm thu" onSave={handleSign(r.id, "company")} />
                  )}
                  {r.status === "signed" && (
                    <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" /> Đã ký đủ</Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openDelete(r)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="md:hidden space-y-3">
        {data.map((r) => (
          <div key={r.id} className="space-y-2">
            <MobileEntityCard
              title={r.code}
              subtitle={`${r.project?.name} (${r.project?.code})`}
              actions={
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDelete(r); }}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              }
              fields={[
                { label: "Trạng thái", value: <StatusBadge status={r.status} /> },
                {
                  label: "Chữ ký",
                  value: (
                    <div className="flex gap-1 justify-end">
                      <Badge variant={r.customerSignature ? "default" : "outline"} className={r.customerSignature ? "bg-green-100 text-green-700" : ""}>KH</Badge>
                      <Badge variant={r.companySignature ? "default" : "outline"} className={r.companySignature ? "bg-green-100 text-green-700" : ""}>Cty</Badge>
                    </div>
                  ),
                },
                { label: "Ngày tạo", value: formatDate(r.createdAt) },
              ]}
            />
            {(!r.customerSignature || !r.companySignature) && (
              <div className="flex gap-2 justify-end px-1">
                {!r.customerSignature && <SignaturePadDialog triggerLabel="KH ký" title="Khách hàng ký nghiệm thu" onSave={handleSign(r.id, "customer")} />}
                {!r.companySignature && <SignaturePadDialog triggerLabel="Cty ký" title="Đại diện công ty ký nghiệm thu" onSave={handleSign(r.id, "company")} />}
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa biên bản nghiệm thu"
        description={`Biên bản "${deletingReport?.code}" sẽ được ẩn khỏi danh sách.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
