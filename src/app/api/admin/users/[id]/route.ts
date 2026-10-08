import { parseBody, type IdParams } from "@/lib/api/request";
import { handle, noContent, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { userUpdateSchema } from "@/Schemas/user.schema";
import { userService } from "@/Services/user.service";

export const GET = handle(async (_request: Request, { params }: IdParams) => {
  await requireAdmin();
  return ok(await userService.get((await params).id));
});

export const PATCH = handle(async (request: Request, { params }: IdParams) => {
  const actor = await requireAdmin();
  const input = await parseBody(request, userUpdateSchema);
  return ok(await userService.update(actor, (await params).id, input));
});

export const DELETE = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireAdmin();
  await userService.remove(actor, (await params).id);
  return noContent();
});
