import { parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { messageListQuerySchema } from "@/Schemas/contact.schema";
import { contactMessageService } from "@/Services/contact-message.service";

export const GET = handle(async (request: Request) => {
  await requireEditor();
  const { items, meta } = await contactMessageService.list(parseQuery(request, messageListQuerySchema));
  return ok(items, { meta });
});
