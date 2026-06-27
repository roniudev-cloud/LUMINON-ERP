"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatVND } from "@/lib/utils";

interface RevenueChartProps {
  data: {
    month: string;
    revenue: number;
    expense: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
        Chưa có dữ liệu tài chính
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" fontSize={12} />
          <YAxis
            fontSize={12}
            tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
          />
          <Tooltip
            formatter={(value: any) => formatVND(Number(value))}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              color: "hsl(var(--card-foreground))"
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="revenue"
            name="Doanh thu"
            fill="var(--chart-2)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="expense"
            name="Chi phí"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
