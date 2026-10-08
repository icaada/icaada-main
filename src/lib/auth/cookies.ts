import { cookies } from "next/headers";
import { isProduction } from "@/lib/env";
import { SESSION_TTL_SECONDS } from "@/lib/auth/session";

export const SESSION_COOKIE = "icaada_session";

export async function readSessionCookie(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Route Handlers / Server Functions only (cookies cannot be set while rendering). */
export async function setSessionCookie(token: string, { persistent = true } = {}): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    // Without maxAge the browser drops the cookie when it closes; the JWT
    // itself still expires after SESSION_TTL_SECONDS either way.
    ...(persistent ? { maxAge: SESSION_TTL_SECONDS } : {}),
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
