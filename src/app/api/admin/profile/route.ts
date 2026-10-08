import { parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth-guard";
import { profileUpdateSchema } from "@/Schemas/user.schema";
import { userService } from "@/Services/user.service";

export const GET = handle(async () => {
  const actor = await requireAuth();
  return ok(await userService.getProfile(actor));
});

export const PATCH = handle(async (request: Request) => {
  const actor = await requireAuth();
  return ok(await userService.updateProfile(actor, await parseBody(request, profileUpdateSchema)));
});
