"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RevenueChart } from "@/features/dashboard/revenue-chart";
import { MonthlyReportTable } from "./report-tables";
import { getRevenueReport, type ReportGranularity } from "@/actions/reports";

interface RevenueReportSectionProps {
  initialData: { month: string; revenue: number; expense: number; profit: number }[];
}

const GRANULARITY_OPTIONS: { value: ReportGranularity; label: string }[] = [
  { value: "day", label: "Theo ngày (30 ngày gần nhất)" },
  { value: "week", label: "Theo tuần (12 tuần gần nhất)" },
  { value: "month", label: "Theo tháng (12 tháng gần nhất)" },
];

export function RevenueReportSection({ initialData }: RevenueReportSectionProps) {
  const [granularity, setGranularity] = useState<ReportGranularity>("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  function refetch(g: ReportGranularity, from: string, to: string) {
    startTransition(async () => {
      const result = await getRevenueReport(g, { fromDate: from || undefined, toDate: to || undefined });
      setData(result);
    });
  }

  function handleGranularityChange(value: string) {
    const g = value as ReportGranularity;
    setGranularity(g);
    refetch(g, fromDate, toDate);
  }

  function handleFromChange(value: string) {
    setFromDate(value);
    refetch(granularity, value, toDate);
  }

  function handleToChange(value: string) {
    setToDate(value);
    refetch(granularity, fromDate, value);
  }

  function clearRange() {
    setFromDate("");
    setToDate("");
    refetch(granularity, "", "");
  }

  const hasRange = !!fromDate || !!toDate;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-end gap-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 w-full sm:w-auto">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromChange(e.target.value)}
            className="w-full sm:w-40"
            aria-label="Từ ngày"
          />
          <span className="text-sm text-muted-foreground text-center sm:text-left">đến</span>
          <div className="flex items-center gap-1.5">
            <Input
              type="date"
              value={toDate}
              onChange={(e) => handleToChange(e.target.value)}
              className="w-full sm:w-40"
              aria-label="Đến ngày"
            />
            {hasRange && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={clearRange} title="Xóa lọc theo ngày">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <Select value={granularity} onValueChange={handleGranularityChange}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {GRANULARITY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={isPending ? "opacity-50 transition-opacity" : "transition-opacity"}>
        <div className="border rounded-xl bg-card p-4 shadow-sm">
          <RevenueChart data={data} />
        </div>
        <div className="border rounded-xl bg-card overflow-hidden shadow-sm mt-4">
          <MonthlyReportTable data={data} />
        </div>
      </div>
    </div>
  );
}
