import { parseBody } from "@/lib/api/request";
import { handle, noContent } from "@/lib/api/response";
import { requireAuth } from "@/lib/auth/auth-guard";
import { passwordChangeSchema } from "@/Schemas/user.schema";
import { userService } from "@/Services/user.service";

export const POST = handle(async (request: Request) => {
  const actor = await requireAuth();
  await userService.changePassword(actor, await parseBody(request, passwordChangeSchema));
  return noContent();
});
