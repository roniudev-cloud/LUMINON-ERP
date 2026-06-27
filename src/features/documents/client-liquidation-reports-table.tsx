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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, PenTool } from "lucide-react";
import { formatDate, formatVND } from "@/lib/utils";
import { signLiquidationReport, deleteLiquidationReport } from "@/actions/documents";
import { toast } from "sonner";

export function ClientLiquidationReportsTable({ data }: { data: any[] }) {
  const [deletingReport, setDeletingReport] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [signingId, setSigningId] = useState<string | null>(null);

  function openDelete(report: any) {
    setDeletingReport(report);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingReport) return;
    setIsDeleting(true);
    try {
      await deleteLiquidationReport(deletingReport.id);
      toast.success("Đã xóa biên bản thanh lý");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSign(id: string) {
    setSigningId(id);
    try {
      await signLiquidationReport(id);
      toast.success("Đã xác nhận ký biên bản thanh lý");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
    } finally {
      setSigningId(null);
    }
  }

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground p-6 text-center">Chưa có biên bản thanh lý nào.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã BB</TableHead>
            <TableHead>Công trình</TableHead>
            <TableHead>Hợp đồng</TableHead>
            <TableHead className="text-right">Giá trị thanh lý</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.code}</TableCell>
              <TableCell>{r.project?.name} <span className="text-xs text-muted-foreground">({r.project?.code})</span></TableCell>
              <TableCell>{r.contract?.code || "—"}</TableCell>
              <TableCell className="text-right">{formatVND(r.finalAmount)}</TableCell>
              <TableCell><StatusBadge status={r.status} /></TableCell>
              <TableCell>{formatDate(r.createdAt)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {r.status !== "signed" && (
                    <Button size="sm" variant="outline" disabled={signingId === r.id} onClick={() => handleSign(r.id)}>
                      <PenTool className="mr-2 h-3.5 w-3.5" /> {signingId === r.id ? "Đang lưu..." : "Xác nhận ký"}
                    </Button>
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

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa biên bản thanh lý"
        description={`Biên bản "${deletingReport?.code}" sẽ được ẩn khỏi danh sách.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
