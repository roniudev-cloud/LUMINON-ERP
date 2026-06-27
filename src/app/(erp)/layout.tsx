import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import DashboardShell from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If no user is found in our DB (might happen if auth user exists but no profile)
  // redirect to login
  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider initialUser={user}>
      <QueryProvider>
        <DashboardShell>{children}</DashboardShell>
      </QueryProvider>
    </AuthProvider>
  );
}
