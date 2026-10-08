import { z } from "zod";
import { parseBody, parseQuery } from "@/lib/api/request";
import { created, handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { paginationQuerySchema } from "@/Schemas/common.schema";
import { newsletterDraftCreateSchema } from "@/Schemas/newsletter.schema";
import { newsletterService } from "@/Services/newsletter.service";

const draftListQuerySchema = paginationQuerySchema.extend({ search: z.string().trim().max(200).optional() });

// Newsletter drafts (sending is not implemented yet).
export const GET = handle(async (request: Request) => {
  await requireEditor();
  const { items, meta } = await newsletterService.list(parseQuery(request, draftListQuerySchema));
  return ok(items, { meta });
});

export const POST = handle(async (request: Request) => {
  const actor = await requireEditor();
  return created(await newsletterService.create(actor, await parseBody(request, newsletterDraftCreateSchema)));
});
