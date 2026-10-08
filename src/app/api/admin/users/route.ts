import { parseBody, parseQuery } from "@/lib/api/request";
import { created, handle, ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth-guard";
import { userCreateSchema, userListQuerySchema } from "@/Schemas/user.schema";
import { userService } from "@/Services/user.service";

// ADMIN only. There is no public registration; accounts are created here or by the seed.
export const GET = handle(async (request: Request) => {
  await requireAdmin();
  const { items, meta } = await userService.list(parseQuery(request, userListQuerySchema));
  return ok(items, { meta });
});

export const POST = handle(async (request: Request) => {
  const actor = await requireAdmin();
  return created(await userService.create(actor, await parseBody(request, userCreateSchema)));
});
