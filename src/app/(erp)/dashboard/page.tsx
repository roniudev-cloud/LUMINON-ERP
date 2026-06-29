import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser } from "@/actions/auth";
import { triggerDashboardBackgroundTasks } from "@/actions/dashboard";
import { DashboardSectionsWrapper } from "@/features/dashboard/dashboard-sections";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  // Fire and forget background tasks
  triggerDashboardBackgroundTasks();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan hoạt động</p>
      </div>

      <DashboardSectionsWrapper />
    </>
  );
}

