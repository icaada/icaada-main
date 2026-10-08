import { ApiError } from "@/lib/api/api-error";
import { verifyPassword } from "@/lib/auth/password";
import { SESSION_TTL_SECONDS, signSession, verifySession } from "@/lib/auth/session";
import { enforceRateLimit, rateLimits, resetRateLimit } from "@/lib/rate-limit";
import { sessionRepository } from "@/Repositories/session.repository";
import { userRepository } from "@/Repositories/user.repository";
import type { LoginInput } from "@/Schemas/auth.schema";
import { activityService } from "@/Services/activity.service";
import type { Actor } from "@/Services/service-utils";
import { toUserDto, type UserDto } from "@/Services/user.service";

const INVALID_LOGIN = "Invalid email or password.";
/** Refresh Session.lastUsedAt at most this often (avoids a write per request). */
const TOUCH_INTERVAL_MS = 10 * 60_000;

export type SessionUser =
  | { ok: true; actor: Actor }
  | { ok: false; reason: "unauthenticated" | "disabled" };

export const authService = {
  /**
   * Verifies credentials, creates a Session row and returns a signed token
   * referencing it. Every failure (unknown email, wrong password, disabled
   * account) gets the same message.
   */
  async login(input: LoginInput, clientIp: string, userAgent: string | null): Promise<{ token: string; user: UserDto }> {
    const perAccountKey = `login:${clientIp}:${input.email}`;
    enforceRateLimit(`login-ip:${clientIp}`, rateLimits.loginPerIp);
    enforceRateLimit(perAccountKey, rateLimits.login);

    const user = await userRepository.findByEmail(input.email);
    const passwordOk = await verifyPassword(input.password, user?.passwordHash);
    if (!user || !passwordOk || user.status !== "ACTIVE") {
      throw ApiError.unauthorized(INVALID_LOGIN);
    }

    resetRateLimit(perAccountKey);
    await sessionRepository.deleteStaleForUser(user.id);
    const session = await sessionRepository.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
      userAgent: userAgent?.slice(0, 300) ?? null,
    });
    const updated = await userRepository.update(user.id, { lastLoginAt: new Date() });
    const actor: Actor = { id: user.id, name: user.name, email: user.email, role: user.role, sessionId: session.id };
    await activityService.record(actor, "login", "user", user.id, `${user.name} signed in`);
    return {
      token: await signSession({ sub: user.id, role: user.role, sid: session.id }),
      user: toUserDto(updated),
    };
  },

  /** Ends this browser's session server-side (the JWT stops working immediately). */
  async logout(actor: Actor | null): Promise<void> {
    if (!actor) return;
    if (actor.sessionId) await sessionRepository.revoke(actor.sessionId);
    await activityService.record(actor, "logout", "user", actor.id, `${actor.name} signed out`);
  },

  /**
   * Resolves a token to the current user. Both the session row and the user
   * are re-read every request, so revoking a session, disabling the account
   * or changing the role takes effect immediately.
   */
  async resolveSession(token: string | undefined): Promise<SessionUser> {
    const payload = await verifySession(token);
    if (!payload) return { ok: false, reason: "unauthenticated" };
    const session = await sessionRepository.findActiveWithUser(payload.sid);
    if (!session || session.userId !== payload.sub) return { ok: false, reason: "unauthenticated" };
    const { user } = session;
    if (user.status !== "ACTIVE") return { ok: false, reason: "disabled" };
    if (Date.now() - session.lastUsedAt.getTime() > TOUCH_INTERVAL_MS) {
      await sessionRepository.touch(session.id).catch(() => undefined);
    }
    return { ok: true, actor: { id: user.id, name: user.name, email: user.email, role: user.role, sessionId: session.id } };
  },
};
