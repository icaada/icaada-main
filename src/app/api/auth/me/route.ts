import { handle, ok } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth-guard";
import { userService } from "@/Services/user.service";

export const GET = handle(async () => {
  const actor = await requireAuth();
  return ok(await userService.getProfile(actor));
});
