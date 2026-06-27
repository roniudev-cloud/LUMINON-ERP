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
  );
}
