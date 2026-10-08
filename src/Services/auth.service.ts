import { ApiError } from "@/lib/api/api-error";
import { verifyPassword } from "@/lib/auth/password";
import { signSession, verifySession } from "@/lib/auth/session";
import { enforceRateLimit, rateLimits, resetRateLimit } from "@/lib/rate-limit";
import { userRepository } from "@/Repositories/user.repository";
import type { LoginInput } from "@/Schemas/auth.schema";
import { activityService } from "@/Services/activity.service";
import type { Actor } from "@/Services/service-utils";
import { toUserDto, type UserDto } from "@/Services/user.service";

const INVALID_LOGIN = "Invalid email or password.";

export type SessionUser =
  | { ok: true; actor: Actor }
  | { ok: false; reason: "unauthenticated" | "disabled" };

export const authService = {
  /**
   * Verifies credentials and returns a signed session token. Every failure
   * (unknown email, wrong password, disabled account) gets the same message.
   */
  async login(input: LoginInput, clientIp: string): Promise<{ token: string; user: UserDto }> {
    const perAccountKey = `login:${clientIp}:${input.email}`;
    enforceRateLimit(`login-ip:${clientIp}`, rateLimits.loginPerIp);
    enforceRateLimit(perAccountKey, rateLimits.login);

    const user = await userRepository.findByEmail(input.email);
    const passwordOk = await verifyPassword(input.password, user?.passwordHash);
    if (!user || !passwordOk || user.status !== "ACTIVE") {
      throw ApiError.unauthorized(INVALID_LOGIN);
    }

    resetRateLimit(perAccountKey);
    const updated = await userRepository.update(user.id, { lastLoginAt: new Date() });
    const actor: Actor = { id: user.id, name: user.name, email: user.email, role: user.role };
    await activityService.record(actor, "login", "user", user.id, `${user.name} signed in`);
    return { token: await signSession({ sub: user.id, role: user.role }), user: toUserDto(updated) };
  },

  async logout(actor: Actor | null): Promise<void> {
    if (actor) await activityService.record(actor, "logout", "user", actor.id, `${actor.name} signed out`);
  },

  /**
   * Resolves a session token to the current user. The DB is the source of
   * truth for role and status, so disabling or demoting a user takes effect on
   * their very next request even though their JWT is still valid.
   */
  async resolveSession(token: string | undefined): Promise<SessionUser> {
    const payload = await verifySession(token);
    if (!payload) return { ok: false, reason: "unauthenticated" };
    const user = await userRepository.findById(payload.sub);
    if (!user) return { ok: false, reason: "unauthenticated" };
    if (user.status !== "ACTIVE") return { ok: false, reason: "disabled" };
    return { ok: true, actor: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },
};
