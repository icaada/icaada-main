import { ZodError } from "zod";
import { isProduction } from "@/lib/env";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const statusByCode: Record<ApiErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export interface ApiErrorBody {
  error: { code: ApiErrorCode; message: string; details?: unknown };
}

export class ApiError extends Error {
  readonly status: number;

  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: unknown,
    readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = statusByCode[code];
  }

  static badRequest(message = "Bad request.", details?: unknown) {
    return new ApiError("BAD_REQUEST", message, details);
  }
  static unauthorized(message = "Authentication required.") {
    return new ApiError("UNAUTHORIZED", message);
  }
  static forbidden(message = "You do not have permission to do this.") {
    return new ApiError("FORBIDDEN", message);
  }
  static notFound(message = "Not found.") {
    return new ApiError("NOT_FOUND", message);
  }
  static conflict(message = "This conflicts with an existing record.", details?: unknown) {
    return new ApiError("CONFLICT", message, details);
  }
  static validation(message = "Some fields are invalid.", details?: unknown) {
    return new ApiError("VALIDATION_ERROR", message, details);
  }
  static rateLimited(retryAfterSeconds: number) {
    return new ApiError(
      "RATE_LIMITED",
      "Too many requests. Please try again later.",
      { retryAfterSeconds },
      { "Retry-After": String(retryAfterSeconds) },
    );
  }
}

/** Zod issues → `{ "field.path": ["message", ...] }`. */
export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_root";
    (fields[key] ??= []).push(issue.message);
  }
  return fields;
}

/** Converts any thrown value into the standard error response. */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message, details: error.details } } satisfies ApiErrorBody,
      { status: error.status, headers: error.headers },
    );
  }
  if (error instanceof ZodError) {
    return toErrorResponse(ApiError.validation(undefined, zodFieldErrors(error)));
  }

  // Unknown failure: log the real error server-side, never leak internals in production.
  console.error("[api] unhandled error", error);
  const message =
    !isProduction() && error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message } } satisfies ApiErrorBody,
    { status: 500 },
  );
}
