"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { formatVND } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateCustomerDebtStatus, updateSupplierDebtStatus } from "@/actions/debts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";

export function ClientDebtsTable({ data, type }: { data: any[]; type: "customer" | "supplier" }) {
  const router = useRouter();
  const [payingDebt, setPayingDebt] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  async function handleConfirmPay() {
    if (!payingDebt || !payAmount) return;
    const amount = Number(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    const remaining = Number(payingDebt.remainingAmount);
    if (amount > remaining) {
      toast.error("Số tiền thanh toán không được lớn hơn số còn nợ");
      return;
    }

    setIsPaying(true);
    try {
      const newPaid = Number(payingDebt.paidAmount) + amount;
      const newStatus = newPaid >= Number(payingDebt.totalAmount) ? "paid" : "partial";

      if (type === "customer") {
        await updateCustomerDebtStatus(payingDebt.id, newStatus, String(newPaid));
      } else {
        await updateSupplierDebtStatus(payingDebt.id, newStatus, String(newPaid));
      }

      toast.success("Thanh toán công nợ thành công", {
        description: `Đã thanh toán ${formatVND(amount)}`,
      });
      setPayingDebt(null);
      setPayAmount("");
      router.refresh();
    } catch (error: any) {
      toast.error("Lỗi thanh toán", { description: error.message });
    } finally {
      setIsPaying(false);
    }
  }

  const columns = [
    {
      accessorKey: type === "customer" ? "customer.name" : "supplierName",
      header: type === "customer" ? "Khách hàng" : "Nhà cung cấp",
      cell: ({ row }: any) => <span className="font-medium">{type === "customer" ? row.original.customer?.name : row.original.supplierName}</span>,
    },
    {
      accessorKey: "totalAmount",
      header: "Tổng giá trị",
      cell: ({ row }: any) => <span className="font-semibold">{formatVND(row.original.totalAmount)}</span>,
    },
    {
      accessorKey: "paidAmount",
      header: "Đã thanh toán",
      cell: ({ row }: any) => <span className="text-green-600 font-medium">{formatVND(row.original.paidAmount)}</span>,
    },
    {
      accessorKey: "remainingAmount",
      header: "Còn lại (Công nợ)",
      cell: ({ row }: any) => {
        const remaining = Number(row.original.remainingAmount);
        return <span className={`font-bold ${remaining > 0 ? "text-destructive" : ""}`}>{formatVND(remaining)}</span>;
      },
    },
    {
      id: "progress",
      header: "Tỷ lệ",
      cell: ({ row }: any) => {
        const total = Number(row.original.totalAmount);
        const paid = Number(row.original.paidAmount);
        const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
        return (
          <div className="w-[80px] space-y-1">
            <div className="text-right text-[10px]">{pct}%</div>
            <Progress value={pct} className="h-1.5" />
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }: any) => {
        const remaining = Number(row.original.remainingAmount);
        if (remaining <= 0) {
          return <span className="text-xs text-muted-foreground">Đã thanh toán</span>;
        }
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setPayingDebt(row.original);
              setPayAmount("");
            }}
          >
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Thanh toán
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <DataTable columns={columns} data={data} searchKey={type === "customer" ? "customer_name" : "supplierName"} searchPlaceholder="Tìm tên..." />

      <Dialog open={!!payingDebt} onOpenChange={(open) => { if (!open) { setPayingDebt(null); setPayAmount(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thanh toán công nợ</DialogTitle>
            <DialogDescription>
              {type === "customer"
                ? `Khách hàng: ${payingDebt?.customer?.name || "—"}`
                : `Nhà cung cấp: ${payingDebt?.supplierName || "—"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tổng giá trị:</span>
                <p className="font-semibold">{formatVND(payingDebt?.totalAmount)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Đã thanh toán:</span>
                <p className="font-semibold text-green-600">{formatVND(payingDebt?.paidAmount)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Còn nợ:</span>
                <p className="font-bold text-destructive text-lg">{formatVND(payingDebt?.remainingAmount)}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Label htmlFor="pay-amount">Số tiền thanh toán lần này (VNĐ)</Label>
              <div className="relative">
                <Input
                  id="pay-amount"
                  type="number"
                  min={1}
                  max={Number(payingDebt?.remainingAmount) || 0}
                  placeholder="Nhập số tiền..."
                  className="text-lg font-semibold h-12"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  autoFocus
                />
                <div className="absolute right-3 top-3 text-muted-foreground text-sm">
                  {payAmount ? formatVND(Number(payAmount)) : ""}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayAmount(String(payingDebt?.remainingAmount || 0))}
                >
                  Thanh toán hết
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPayAmount(String(Math.round(Number(payingDebt?.remainingAmount || 0) / 2)))}
                >
                  50%
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => { setPayingDebt(null); setPayAmount(""); }} disabled={isPaying}>
                Hủy
              </Button>
              <Button onClick={handleConfirmPay} disabled={isPaying || !payAmount || Number(payAmount) <= 0}>
                {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Xác nhận thanh toán
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
