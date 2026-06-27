"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { mergeCustomers } from "@/actions/customers";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DuplicateCustomer {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string | Date;
}

interface DuplicateGroup {
  phone: string;
  customers: DuplicateCustomer[];
}

export function DuplicateCustomersPanel({ groups }: { groups: DuplicateGroup[] }) {
  const [pending, startTransition] = useTransition();
  const [confirmTarget, setConfirmTarget] = useState<{ keepId: string; duplicateId: string; keepName: string; duplicateName: string } | null>(null);

  if (groups.length === 0) return null;

  function handleMerge() {
    if (!confirmTarget) return;
    startTransition(async () => {
      try {
        await mergeCustomers(confirmTarget.keepId, confirmTarget.duplicateId);
        toast.success(`Đã gộp "${confirmTarget.duplicateName}" vào "${confirmTarget.keepName}"`);
        setConfirmTarget(null);
      } catch (error: any) {
        toast.error(error.message || "Gộp khách hàng thất bại");
      }
    });
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600" />
            Khách hàng trùng ({groups.length} nhóm)
          </CardTitle>
          <CardDescription>Phát hiện theo số điện thoại trùng nhau. Hãy chọn bản ghi đúng để giữ lại.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {groups.map((group) => (
            <div key={group.phone} className="border rounded-lg p-3 bg-background">
              <p className="text-xs text-muted-foreground mb-2">SĐT: {group.phone}</p>
              <div className="space-y-2">
                {group.customers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <span className="font-medium">{c.name}</span>{" "}
                      <Badge variant="outline" className="ml-1">{c.code}</Badge>
                      <p className="text-xs text-muted-foreground">
                        {c.email || "—"} · Tạo {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {group.customers
                        .filter((other) => other.id !== c.id)
                        .map((other) => (
                          <Button
                            key={other.id}
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                              setConfirmTarget({
                                keepId: c.id,
                                duplicateId: other.id,
                                keepName: c.name,
                                duplicateName: other.name,
                              })
                            }
                          >
                            Giữ &quot;{c.name}&quot;, gộp &quot;{other.name}&quot;
                          </Button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmTarget} onOpenChange={(open) => !open && setConfirmTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận gộp khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Toàn bộ báo giá, hợp đồng, công trình, phiếu thu, công nợ, hóa đơn VAT, hội thoại và ghi chú của{" "}
              <strong>{confirmTarget?.duplicateName}</strong> sẽ được chuyển sang{" "}
              <strong>{confirmTarget?.keepName}</strong>. Bản ghi trùng sẽ bị ẩn (xóa mềm). Hành động này không thể tự hoàn tác qua UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleMerge} disabled={pending}>
              {pending ? "Đang gộp..." : "Xác nhận gộp"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
