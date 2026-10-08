import type { z } from "zod";
import { ApiError } from "@/lib/api/api-error";
import { parseBody, parseQuery, type IdParams, type SlugParams } from "@/lib/api/request";
import { created, handle, noContent, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { contentListQuerySchema, statusChangeSchema } from "@/Schemas/common.schema";
import type { ContentService } from "@/Services/content.service";

// Route Handler factories for the seven content modules. They only parse,
// validate, guard and delegate; all rules live in the module's service.

/** /api/admin/{module} → GET (list: search, status, page, pageSize), POST (create) */
export function adminCollectionRoutes<S extends z.ZodTypeAny, TDto>(
  service: ContentService<z.output<S>, never, TDto>,
  createSchema: S,
) {
  return {
    GET: handle(async (request: Request) => {
      await requireEditor();
      const { items, meta } = await service.list(parseQuery(request, contentListQuerySchema));
      return ok(items, { meta });
    }),
    POST: handle(async (request: Request) => {
      const actor = await requireEditor();
      return created(await service.create(actor, await parseBody(request, createSchema)));
    }),
  };
}

/** /api/admin/{module}/[id] → GET, PATCH, DELETE */
export function adminItemRoutes<S extends z.ZodTypeAny, TDto>(
  service: ContentService<never, z.output<S>, TDto>,
  updateSchema: S,
) {
  return {
    GET: handle(async (_request: Request, { params }: IdParams) => {
      await requireEditor();
      return ok(await service.get((await params).id));
    }),
    PATCH: handle(async (request: Request, { params }: IdParams) => {
      const actor = await requireEditor();
      const input = await parseBody(request, updateSchema);
      return ok(await service.update(actor, (await params).id, input));
    }),
    DELETE: handle(async (_request: Request, { params }: IdParams) => {
      const actor = await requireEditor();
      await service.remove(actor, (await params).id);
      return noContent();
    }),
  };
}

/** /api/admin/{module}/[id]/status → POST { status } (publish, archive, send for review, …) */
export function adminStatusRoute<TDto>(service: ContentService<never, never, TDto>) {
  return handle(async (request: Request, { params }: IdParams) => {
    const actor = await requireEditor();
    const { status } = await parseBody(request, statusChangeSchema);
    return ok(await service.changeStatus(actor, (await params).id, status));
  });
}

/** /api/public/{module} → GET published items (no auth). */
export function publicListRoute<TDto>(service: ContentService<never, never, TDto>) {
  return handle(async () => ok(await service.listPublished()));
}

/** /api/public/{module}/[slug] → GET one published item, 404 otherwise. */
export function publicSlugRoute<TDto>(service: ContentService<never, never, TDto>, label: string) {
  return handle(async (_request: Request, { params }: SlugParams) => {
    const item = await service.getPublishedBySlug((await params).slug);
    if (!item) throw ApiError.notFound(`${label} not found.`);
    return ok(item);
  });
}
