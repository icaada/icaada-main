import { parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { subscriberListQuerySchema } from "@/Schemas/newsletter.schema";
import { subscriberService } from "@/Services/subscriber.service";

export const GET = handle(async (request: Request) => {
  await requireEditor();
  const { items, meta } = await subscriberService.list(parseQuery(request, subscriberListQuerySchema));
  return ok(items, { meta });
});
