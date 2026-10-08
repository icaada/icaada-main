import { parseBody, type IdParams } from "@/lib/api/request";
import { handle, noContent, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { messageUpdateSchema } from "@/Schemas/contact.schema";
import { contactMessageService } from "@/Services/contact-message.service";

export const GET = handle(async (_request: Request, { params }: IdParams) => {
  await requireEditor();
  return ok(await contactMessageService.get((await params).id));
});

export const PATCH = handle(async (request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  const input = await parseBody(request, messageUpdateSchema);
  return ok(await contactMessageService.update(actor, (await params).id, input));
});

export const DELETE = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  await contactMessageService.remove(actor, (await params).id);
  return noContent();
});
