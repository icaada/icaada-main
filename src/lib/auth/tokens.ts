import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/env";

/** Random URL-safe token for emailed links (256 bits). */
export const randomToken = () => randomBytes(32).toString("base64url");

/** What we store instead of the raw token. */
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

// Stateless signed values (e.g. newsletter unsubscribe links): `${value}.${hmac}`.
const sign = (purpose: string, value: string) =>
  createHmac("sha256", getEnv().SESSION_SECRET).update(`${purpose}:${value}`).digest("base64url");

export function signValue(purpose: string, value: string): string {
  return `${value}.${sign(purpose, value)}`;
}

/** Returns the value if the signature is valid for this purpose, else null. */
export function verifySignedValue(purpose: string, signed: string | null | undefined): string | null {
  if (!signed) return null;
  const dot = signed.lastIndexOf(".");
  if (dot <= 0) return null;
  const value = signed.slice(0, dot);
  const given = Buffer.from(signed.slice(dot + 1));
  const expected = Buffer.from(sign(purpose, value));
  return given.length === expected.length && timingSafeEqual(given, expected) ? value : null;
}
