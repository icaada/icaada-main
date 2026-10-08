import type { IdParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { userService } from "@/Services/user.service";

/** Signs the user out everywhere (revokes all their sessions). */
export const DELETE = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireAdmin();
  return ok(await userService.revokeSessions(actor, (await params).id));
});
