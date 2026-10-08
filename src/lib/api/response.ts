import { toErrorResponse } from "@/lib/api/api-error";

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T, M = undefined> {
  data: T;
  meta?: M;
}

export function ok<T>(data: T, init?: ResponseInit & { meta?: unknown }) {
  const { meta, ...rest } = init ?? {};
  return Response.json(meta === undefined ? { data } : { data, meta }, rest);
}

export function created<T>(data: T) {
  return ok(data, { status: 201 });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

/**
 * Wraps a Route Handler so every thrown error (ApiError, ZodError, unknown)
 * becomes the standard `{ error: { code, message, details? } }` response.
 */
export function handle<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
