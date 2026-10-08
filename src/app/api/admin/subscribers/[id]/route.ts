import { parseBody, type IdParams } from "@/lib/api/request";
import { handle, noContent, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { subscriberUpdateSchema } from "@/Schemas/newsletter.schema";
import { subscriberService } from "@/Services/subscriber.service";

export const PATCH = handle(async (request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  const input = await parseBody(request, subscriberUpdateSchema);
  return ok(await subscriberService.update(actor, (await params).id, input));
});

export const DELETE = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  await subscriberService.remove(actor, (await params).id);
  return noContent();
});
