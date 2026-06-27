import { startOfMonth, endOfMonth, format } from "date-fns";
import { getCalendarEvents } from "@/actions/calendar";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/features/calendar/calendar-view";

export const metadata = {
  title: "Lịch | LUMINON ERP",
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  const monthDate = new Date(year, month - 1, 1);
  const from = format(startOfMonth(monthDate), "yyyy-MM-dd");
  const to = format(endOfMonth(monthDate), "yyyy-MM-dd");

  const events = await getCalendarEvents(from, to);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch"
        description="Tổng hợp mốc thời gian: công việc, báo giá, hợp đồng, công trình, công nợ."
      />
      <CalendarView year={year} month={month} events={events} />
    </div>
  );
}
