import { parseBody, type IdParams } from "@/lib/api/request";
import { handle, noContent, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { newsletterDraftUpdateSchema } from "@/Schemas/newsletter.schema";
import { newsletterService } from "@/Services/newsletter.service";

export const GET = handle(async (_request: Request, { params }: IdParams) => {
  await requireEditor();
  return ok(await newsletterService.get((await params).id));
});

export const PATCH = handle(async (request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  const input = await parseBody(request, newsletterDraftUpdateSchema);
  return ok(await newsletterService.update(actor, (await params).id, input));
});

export const DELETE = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  await newsletterService.remove(actor, (await params).id);
  return noContent();
});
