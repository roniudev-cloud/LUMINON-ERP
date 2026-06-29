"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent, CalendarEventType } from "@/actions/calendar";

const TYPE_COLORS: Record<CalendarEventType, string> = {
  task: "bg-blue-100 text-blue-700",
  quotation_expiry: "bg-purple-100 text-purple-700",
  contract_sign: "bg-indigo-100 text-indigo-700",
  contract_payment_term: "bg-orange-100 text-orange-700",
  project_start: "bg-cyan-100 text-cyan-700",
  project_end: "bg-teal-100 text-teal-700",
  customer_debt_due: "bg-red-100 text-red-700",
};

const TYPE_DOT_COLORS: Record<CalendarEventType, string> = {
  task: "bg-blue-500",
  quotation_expiry: "bg-purple-500",
  contract_sign: "bg-indigo-500",
  contract_payment_term: "bg-orange-500",
  project_start: "bg-cyan-500",
  project_end: "bg-teal-500",
  customer_debt_due: "bg-red-500",
};

interface CalendarViewProps {
  year: number;
  month: number; // 1-12
  events: CalendarEvent[];
}

export function CalendarView({ year, month, events }: CalendarViewProps) {
  const router = useRouter();
  const current = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const eventsByDate = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const list = eventsByDate.get(e.date) || [];
    list.push(e);
    eventsByDate.set(e.date, list);
  }

  function goToMonth(delta: number) {
    const next = new Date(year, month - 1 + delta, 1);
    router.push(`/calendar?year=${next.getFullYear()}&month=${next.getMonth() + 1}`, { scroll: false });
  }

  const today = new Date();
  const weekDayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] min-w-0">
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden min-w-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg capitalize">
            {format(current, "MMMM yyyy", { locale: vi })}
          </h3>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => goToMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => goToMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-0">
            <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-muted-foreground">
              {weekDayLabels.map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

        <div className="grid grid-cols-7">
          {days.map((d) => {
            const dateKey = format(d, "yyyy-MM-dd");
            const dayEvents = eventsByDate.get(dateKey) || [];
            const inMonth = isSameMonth(d, current);
            const isToday = isSameDay(d, today);

            return (
              <div
                key={dateKey}
                className={cn(
                  "min-h-[52px] sm:min-h-[96px] border-b border-r p-1 sm:p-1.5 align-top overflow-hidden",
                  !inMonth && "bg-muted/30 text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs mb-1",
                    isToday && "bg-primary text-primary-foreground font-semibold"
                  )}
                >
                  {d.getDate()}
                </div>

                {/* Mobile: chỉ hiện chấm màu theo loại sự kiện, xem chi tiết ở danh sách "Sự kiện trong tháng" dưới */}
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 sm:hidden">
                    {dayEvents.slice(0, 4).map((e) => (
                      <span
                        key={e.id}
                        className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT_COLORS[e.type])}
                      />
                    ))}
                  </div>
                )}

                {/* Desktop/tablet: hiện tiêu đề sự kiện đầy đủ */}
                <div className="hidden sm:block space-y-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <Link
                      key={e.id}
                      href={e.link}
                      title={e.title}
                      className={cn(
                        "block truncate rounded px-1 py-0.5 text-[10px] font-medium hover:opacity-80",
                        TYPE_COLORS[e.type]
                      )}
                    >
                      {e.title}
                    </Link>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] text-muted-foreground px-1">+{dayEvents.length - 3} khác</p>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-xl bg-card shadow-sm p-4 space-y-3 h-fit min-w-0">
        <h3 className="font-semibold">Sự kiện trong tháng ({events.length})</h3>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có mốc thời gian nào trong tháng này.</p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {events.map((e) => (
              <Link
                key={e.id}
                href={e.link}
                className="block rounded-lg border p-2 hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium shrink-0", TYPE_COLORS[e.type])}>
                    {format(new Date(e.date), "dd/MM")}
                  </span>
                  <span className="text-xs truncate flex-1">{e.title}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
