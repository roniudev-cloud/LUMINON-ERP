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
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VatInvoiceDialog } from "./vat-invoice-form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { MobileEntityCard, MobileEntityCardList } from "@/components/shared/mobile-entity-card";
import { deleteVatInvoice } from "@/actions/vat-invoices";
import { StatusBadge } from "@/components/shared/status-badge";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function ClientVatInvoicesTable({ data }: { data: any[] }) {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleDelete(invoice: any) {
    setDeletingInvoice(invoice);
    setIsDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      await deleteVatInvoice(deletingInvoice.id);
      toast.success("Xóa hóa đơn thành công");
      setIsDeleteOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  }

  function handleEdit(invoice: any) {
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  }

  function handleCreate() {
    setSelectedInvoice(null);
    setIsDialogOpen(true);
  }

  return (
    <>
      <div className="p-4 border-b flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-card">
        <h3 className="font-semibold text-lg">Danh sách Hóa đơn VAT</h3>
        <Button onClick={handleCreate} className="sm:self-auto self-start">+ Thêm hóa đơn</Button>
      </div>
      
      <div className="hidden md:block overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã HĐ</TableHead>
              <TableHead>Ngày xuất</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Khách hàng / Đối tác</TableHead>
              <TableHead className="text-right">Tiền trước thuế</TableHead>
              <TableHead className="text-right">Tiền thuế</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Chưa có hóa đơn VAT nào.
                </TableCell>
              </TableRow>
            ) : (
              data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-blue-600">{invoice.code}</TableCell>
                  <TableCell>
                    {invoice.issueDate ? format(new Date(invoice.issueDate), "dd/MM/yyyy", { locale: vi }) : "—"}
                  </TableCell>
                  <TableCell>
                    {invoice.type === "outbound" ? (
                      <span className="inline-flex items-center text-green-600 font-medium">
                        <ArrowUpRight className="w-4 h-4 mr-1" /> Đầu ra
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-600 font-medium">
                        <ArrowDownLeft className="w-4 h-4 mr-1" /> Đầu vào
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {invoice.type === "outbound" 
                      ? invoice.customer?.name || "—" 
                      : invoice.supplierId || "Nhà cung cấp"}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(invoice.amount)} đ</TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatNumber(invoice.vatAmount)} đ ({Number(invoice.vatRate)}%)
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatNumber(invoice.totalAmount)} đ</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                          <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MobileEntityCardList empty={data.length === 0}>
        {data.map((invoice) => (
          <MobileEntityCard
            key={invoice.id}
            title={invoice.code}
            subtitle={invoice.issueDate ? format(new Date(invoice.issueDate), "dd/MM/yyyy", { locale: vi }) : "—"}
            actions={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                    <Pencil className="mr-2 h-4 w-4" /> Cập nhật
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-destructive focus:bg-destructive/10">
                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            fields={[
              {
                label: "Loại",
                value: invoice.type === "outbound" ? (
                  <span className="inline-flex items-center text-green-600 font-medium"><ArrowUpRight className="w-4 h-4 mr-1" /> Đầu ra</span>
                ) : (
                  <span className="inline-flex items-center text-amber-600 font-medium"><ArrowDownLeft className="w-4 h-4 mr-1" /> Đầu vào</span>
                ),
              },
              { label: "Khách hàng/Đối tác", value: invoice.type === "outbound" ? invoice.customer?.name || "—" : invoice.supplierId || "Nhà cung cấp" },
              { label: "Tiền trước thuế", value: `${formatNumber(invoice.amount)} đ` },
              { label: "Tiền thuế", value: `${formatNumber(invoice.vatAmount)} đ (${Number(invoice.vatRate)}%)` },
              { label: "Tổng tiền", value: <span className="font-bold">{formatNumber(invoice.totalAmount)} đ</span> },
              { label: "Trạng thái", value: <StatusBadge status={invoice.status} /> },
            ]}
          />
        ))}
      </MobileEntityCardList>

      <VatInvoiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        invoice={selectedInvoice}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Xóa hóa đơn VAT"
        description={`Bạn có chắc chắn muốn xóa hóa đơn "${deletingInvoice?.code}"? Thao tác này không thể hoàn tác.`}
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
