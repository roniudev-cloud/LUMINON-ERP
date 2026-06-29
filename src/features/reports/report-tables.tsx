"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatVND } from "@/lib/utils";

export function MonthlyReportTable({
  data,
}: {
  data: { month: string; revenue: number; expense: number; profit: number }[];
}) {
  if (data.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">Chưa có dữ liệu thu/chi.</p>;
  }
  return (
    <>
      <div className="md:hidden space-y-4 p-4">
        {data.map((row) => (
          <div key={row.month} className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
            <div className="font-semibold text-base border-b pb-2 border-dashed">{row.month}</div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Doanh thu:</span>
              <span className="font-medium text-green-600">{formatVND(row.revenue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Chi phí:</span>
              <span className="font-medium text-red-600">{formatVND(row.expense)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold border-t pt-2 mt-2">
              <span>Lợi nhuận:</span>
              <span className={row.profit >= 0 ? "text-green-700" : "text-red-700"}>
                {formatVND(row.profit)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kỳ</TableHead>
              <TableHead className="text-right">Doanh thu</TableHead>
              <TableHead className="text-right">Chi phí</TableHead>
              <TableHead className="text-right">Lợi nhuận</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.month}>
                <TableCell className="font-medium">{row.month}</TableCell>
                <TableCell className="text-right text-green-600">{formatVND(row.revenue)}</TableCell>
                <TableCell className="text-right text-red-600">{formatVND(row.expense)}</TableCell>
                <TableCell
                  className={`text-right font-semibold ${row.profit >= 0 ? "text-green-700" : "text-red-700"}`}
                >
                  {formatVND(row.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function ProjectReportTable({
  data,
}: {
  data: {
    id: string;
    code: string;
    name: string;
    status: string;
    progress: number;
    totalValue: number;
    actualCost: number;
    profit: number;
    customerName: string | null;
  }[];
}) {
  if (data.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">Chưa có công trình nào.</p>;
  }
  return (
    <>
      <div className="md:hidden space-y-4 p-4">
        {data.map((row) => (
          <div key={row.id} className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
            <div className="flex justify-between items-start border-b pb-2 border-dashed">
              <div>
                <div className="font-semibold text-base text-primary">{row.code}</div>
                <div className="text-sm font-medium mt-1">{row.name}</div>
              </div>
              <StatusBadge status={row.status} />
            </div>
            {row.customerName && (
              <div className="text-sm text-muted-foreground">Khách: <span className="text-foreground font-medium">{row.customerName}</span></div>
            )}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tiến độ</span>
                <span>{row.progress}%</span>
              </div>
              <Progress value={row.progress} className="h-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm pt-2">
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Giá trị HĐ</div>
                <div className="font-medium">{formatVND(row.totalValue)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-0.5">Chi phí</div>
                <div className="font-medium">{formatVND(row.actualCost)}</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm font-semibold border-t pt-2 mt-2">
              <span>Lời/Lỗ:</span>
              <span className={row.profit >= 0 ? "text-green-700" : "text-red-700"}>
                {formatVND(row.profit)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã CT</TableHead>
              <TableHead>Tên công trình</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tiến độ</TableHead>
              <TableHead className="text-right">Giá trị HĐ</TableHead>
              <TableHead className="text-right">Chi phí thực tế</TableHead>
              <TableHead className="text-right">Lời/Lỗ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-primary">{row.code}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={row.name}>{row.name}</TableCell>
                <TableCell>{row.customerName || "—"}</TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell className="w-[120px]">
                  <div className="flex items-center gap-2">
                    <Progress value={row.progress} className="h-1.5" />
                    <span className="text-xs text-muted-foreground w-8">{row.progress}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatVND(row.totalValue)}</TableCell>
                <TableCell className="text-right">{formatVND(row.actualCost)}</TableCell>
                <TableCell className={`text-right font-semibold ${row.profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {formatVND(row.profit)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function CustomerReportTable({
  data,
}: {
  data: { customerId: string | null; customerName: string; contractCount: number; totalValue: number; totalPaid: number }[];
}) {
  if (data.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">Chưa có hợp đồng nào.</p>;
  }
  return (
    <>
      <div className="md:hidden space-y-4 p-4">
        {data.map((row) => (
          <div key={row.customerId || row.customerName} className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
            <div className="font-semibold text-base border-b pb-2 border-dashed">{row.customerName}</div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Số hợp đồng:</span>
              <span className="font-medium">{row.contractCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Tổng doanh số:</span>
              <span className="font-semibold">{formatVND(row.totalValue)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground">Đã thu:</span>
              <span className="font-medium text-green-600">{formatVND(row.totalPaid)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khách hàng</TableHead>
              <TableHead className="text-center">Số hợp đồng</TableHead>
              <TableHead className="text-right">Tổng doanh số</TableHead>
              <TableHead className="text-right">Đã thu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.customerId || row.customerName}>
                <TableCell className="font-medium">{row.customerName}</TableCell>
                <TableCell className="text-center">{row.contractCount}</TableCell>
                <TableCell className="text-right font-semibold">{formatVND(row.totalValue)}</TableCell>
                <TableCell className="text-right text-green-600">{formatVND(row.totalPaid)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export function EmployeeReportTable({
  data,
}: {
  data: {
    employeeId: string;
    employeeName: string;
    totalQuotes: number;
    convertedQuotes: number;
    conversionRate: number;
    totalContractValue: number;
  }[];
}) {
  if (data.length === 0) {
    return <p className="p-6 text-center text-muted-foreground">Chưa có dữ liệu báo giá/hợp đồng theo nhân viên.</p>;
  }
  return (
    <>
      <div className="md:hidden space-y-4 p-4">
        {data.map((row) => (
          <div key={row.employeeId} className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
            <div className="font-semibold text-base border-b pb-2 border-dashed">{row.employeeName}</div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-muted/50 rounded p-2">
                <div className="text-xs text-muted-foreground mb-1">Báo giá</div>
                <div className="font-medium">{row.totalQuotes}</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="text-xs text-muted-foreground mb-1">Đã chốt</div>
                <div className="font-medium">{row.convertedQuotes}</div>
              </div>
              <div className="bg-muted/50 rounded p-2">
                <div className="text-xs text-muted-foreground mb-1">Tỷ lệ</div>
                <div className="font-medium text-primary">{row.conversionRate}%</div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
              <span className="text-muted-foreground font-medium">Doanh số chốt:</span>
              <span className="font-bold text-destructive">{formatVND(row.totalContractValue)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead className="text-center">Số báo giá</TableHead>
              <TableHead className="text-center">Đã chốt</TableHead>
              <TableHead className="text-center">Tỷ lệ chốt</TableHead>
              <TableHead className="text-right">Doanh số hợp đồng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.employeeId}>
                <TableCell className="font-medium">{row.employeeName}</TableCell>
                <TableCell className="text-center">{row.totalQuotes}</TableCell>
                <TableCell className="text-center">{row.convertedQuotes}</TableCell>
                <TableCell className="text-center">{row.conversionRate}%</TableCell>
                <TableCell className="text-right font-semibold">{formatVND(row.totalContractValue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
