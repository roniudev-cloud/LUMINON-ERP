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
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { formatVND } from "@/lib/utils";
import { MobileEntityCard, MobileEntityCardList } from "@/components/shared/mobile-entity-card";
import { StockTicketDialog } from "./stock-ticket-form-dialog";

export function ClientStockTicketsTable({ data, type }: { data: any[]; type: "IN" | "OUT" }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="p-4 border-b flex justify-between items-center bg-card">
        <h3 className="font-semibold text-lg">{type === "IN" ? "Phiếu nhập kho" : "Phiếu xuất kho"}</h3>
        <Button onClick={() => setIsDialogOpen(true)}>{type === "IN" ? "+ Lập phiếu nhập" : "+ Lập phiếu xuất"}</Button>
      </div>

      <div className="hidden md:block overflow-x-auto bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã phiếu</TableHead>
              <TableHead>Ngày</TableHead>
              <TableHead>{type === "IN" ? "Nhà cung cấp" : "Người nhận"}</TableHead>
              <TableHead>Vật tư</TableHead>
              <TableHead className="text-right">Tổng giá trị</TableHead>
              <TableHead>Người lập</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có phiếu nào.</TableCell></TableRow>
            ) : (
              data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-primary">{t.code}</TableCell>
                  <TableCell>{format(new Date(t.date), "dd/MM/yyyy", { locale: vi })}</TableCell>
                  <TableCell>{type === "IN" ? (t.supplier?.name || "—") : (t.receiverName || "—")}</TableCell>
                  <TableCell className="max-w-[260px] truncate" title={t.items.map((i: any) => i.material?.name).join(", ")}>
                    {t.items.map((i: any) => `${i.material?.name} (${i.quantity})`).join(", ")}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatVND(t.totalAmount)}</TableCell>
                  <TableCell>{t.createdByUser?.fullName || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MobileEntityCardList empty={data.length === 0}>
        {data.map((t) => (
          <MobileEntityCard
            key={t.id}
            title={t.code}
            subtitle={format(new Date(t.date), "dd/MM/yyyy", { locale: vi })}
            fields={[
              { label: type === "IN" ? "Nhà cung cấp" : "Người nhận", value: type === "IN" ? (t.supplier?.name || "—") : (t.receiverName || "—") },
              { label: "Vật tư", value: t.items.map((i: any) => `${i.material?.name} (${i.quantity})`).join(", ") },
              { label: "Tổng giá trị", value: <span className="font-semibold">{formatVND(t.totalAmount)}</span> },
              { label: "Người lập", value: t.createdByUser?.fullName || "—" },
            ]}
          />
        ))}
      </MobileEntityCardList>

      <StockTicketDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} type={type} />
    </>
  );
}
