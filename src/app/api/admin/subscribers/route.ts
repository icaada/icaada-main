import { parseBody, parseQuery } from "@/lib/api/request";
import { created, handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { subscriberCreateSchema, subscriberListQuerySchema } from "@/Schemas/newsletter.schema";
import { subscriberService } from "@/Services/subscriber.service";

export const GET = handle(async (request: Request) => {
  await requireEditor();
  const { items, meta } = await subscriberService.list(parseQuery(request, subscriberListQuerySchema));
  return ok(items, { meta });
});

export const POST = handle(async (request: Request) => {
  const actor = await requireEditor();
  return created(await subscriberService.create(actor, await parseBody(request, subscriberCreateSchema)));
});
