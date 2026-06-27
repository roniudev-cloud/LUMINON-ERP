import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";
import { getCurrentUser } from "@/actions/auth";
import { getDashboardData } from "@/actions/dashboard";
import { UniversalDashboard } from "@/features/dashboard/universal-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const data = await getDashboardData();

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hoạt động</p>
      </div>

      <UniversalDashboard data={data} userRoles={user.roles} />
    </Suspense>
  );
}
