"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/utils";

interface MaterialUsage {
  materialId: string;
  materialName: string;
  unit: string;
  quantity: number;
  totalAmount: number;
}

export function ProjectMaterialsTab({ usage }: { usage: MaterialUsage[] }) {
  if (usage.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Chưa có vật tư nào xuất kho cho công trình này. Lập phiếu xuất kho ở trang Kho vật tư và chọn công trình này để ghi nhận.
      </p>
    );
  }

  const total = usage.reduce((sum, u) => sum + u.totalAmount, 0);

  return (
    <div className="space-y-3">
      <div className="border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vật tư</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Giá trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usage.map((u) => (
              <TableRow key={u.materialId}>
                <TableCell className="font-medium">{u.materialName}</TableCell>
                <TableCell className="text-right">{u.quantity} {u.unit}</TableCell>
                <TableCell className="text-right">{formatVND(u.totalAmount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end text-sm font-semibold pr-2">
        Tổng giá trị vật tư đã dùng: <span className="ml-2 text-base">{formatVND(total)}</span>
      </div>
    </div>
  );
}
