import { ApiError } from "@/lib/api/api-error";
import { readSessionCookie } from "@/lib/auth/cookies";
import type { Role } from "@/Schemas/common.schema";
import { authService } from "@/Services/auth.service";
import type { Actor } from "@/Services/service-utils";

// Route-level guards. Each one reads the session cookie, re-loads the user from
// the database (so role/status changes apply immediately), and throws an
// ApiError that `handle()` turns into a 401/403 JSON response.

async function requireRole(allowed: readonly Role[]): Promise<Actor> {
  const session = await authService.resolveSession(await readSessionCookie());
  if (!session.ok) {
    if (session.reason === "disabled") throw ApiError.forbidden("This account has been disabled.");
    throw ApiError.unauthorized();
  }
  if (!allowed.includes(session.actor.role)) throw ApiError.forbidden();
  return session.actor;
}

/** Any signed-in, active user. */
export function requireAuth(): Promise<Actor> {
  return requireRole(["ADMIN", "EDITOR"]);
}

/** Content modules, inbox, volunteers, newsletter, own profile. */
export function requireEditor(): Promise<Actor> {
  return requireRole(["ADMIN", "EDITOR"]);
}

/** Users and workspace settings. */
export function requireAdmin(): Promise<Actor> {
  return requireRole(["ADMIN"]);
}

/** For Server Components: the current actor or null (never throws for auth). */
export async function getCurrentActor(): Promise<Actor | null> {
  const session = await authService.resolveSession(await readSessionCookie());
  return session.ok ? session.actor : null;
}
