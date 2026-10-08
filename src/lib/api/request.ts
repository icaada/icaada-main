import type { z } from "zod";
import { ApiError, zodFieldErrors } from "@/lib/api/api-error";

/** Reads and validates a JSON body. Malformed JSON → 400, schema failure → 422. */
export async function parseBody<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw ApiError.badRequest("Request body must be valid JSON.");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw ApiError.validation(undefined, zodFieldErrors(result.error));
  }
  return result.data;
}

/** Validates URL search params (single values only) against a schema. */
export function parseQuery<S extends z.ZodTypeAny>(
  request: Request,
  schema: S,
): z.output<S> {
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const result = schema.safeParse(params);
  if (!result.success) {
    throw ApiError.validation("Invalid query parameters.", zodFieldErrors(result.error));
  }
  return result.data;
}

/** Best-effort client IP for rate limiting (first hop of X-Forwarded-For). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export type IdParams = { params: Promise<{ id: string }> };
export type SlugParams = { params: Promise<{ slug: string }> };
