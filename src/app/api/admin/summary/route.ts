import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { dashboardService } from "@/Services/dashboard.service";

export const GET = handle(async () => {
  await requireEditor();
  return ok(await dashboardService.summary());
});
