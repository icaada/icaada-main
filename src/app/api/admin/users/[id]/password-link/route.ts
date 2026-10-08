import type { IdParams } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { userService } from "@/Services/user.service";

/** Emails an invite (never signed in) or a password reset link. */
export const POST = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireAdmin();
  return ok(await userService.sendPasswordLink(actor, (await params).id), { status: 202 });
});
