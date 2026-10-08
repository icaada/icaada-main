import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getCurrentActor } from "@/lib/auth/auth-guard";
import { AdminProvider } from "@/lib/admin/admin-store";
import { dashboardService } from "@/Services/dashboard.service";
import { settingsService } from "@/Services/settings.service";
import { userService } from "@/Services/user.service";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Server-side gate for every admin screen. Signed-out, disabled or deleted
// users are sent to the login page before any admin UI renders. (Every
// /api/admin/** call is guarded independently as well.)
export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/admin/login");

  const [me, workspace, summary] = await Promise.all([
    userService.getProfile(actor),
    settingsService.get(),
    dashboardService.summary(),
  ]);

  return (
    <AdminProvider initialMe={me} initialWorkspace={workspace} initialSummary={summary}>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  );
}
