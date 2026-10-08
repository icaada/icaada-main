import { SignJWT, jwtVerify } from "jose";
import { getEnv } from "@/lib/env";

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const ISSUER = "icaada";
const AUDIENCE = "icaada-admin";

export type SessionRole = "ADMIN" | "EDITOR";

export interface SessionPayload {
  /** User id. */
  sub: string;
  role: SessionRole;
  /** Session row id (jti). The session must still exist and be unrevoked in the DB. */
  sid: string;
}

function secretKey() {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setJti(payload.sid)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

/** Returns the payload, or null for a missing/expired/tampered token. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || typeof payload.jti !== "string") return null;
    if (payload.role !== "ADMIN" && payload.role !== "EDITOR") return null;
    return { sub: payload.sub, role: payload.role, sid: payload.jti };
  } catch {
    return null;
  }
}
