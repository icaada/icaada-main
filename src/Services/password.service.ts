import { ApiError } from "@/lib/api/api-error";
import { hashPassword } from "@/lib/auth/password";
import { hashToken, randomToken } from "@/lib/auth/tokens";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";
import { passwordTokenRepository, type TokenPurpose } from "@/Repositories/password-token.repository";
import { sessionRepository } from "@/Repositories/session.repository";
import { userRepository } from "@/Repositories/user.repository";
import type { PasswordResetConfirmInput } from "@/Schemas/auth.schema";
import { activityService } from "@/Services/activity.service";
import { notificationService } from "@/Services/notification.service";

// Emailed single-use links for setting a password: account invites (new
// users) and password resets (forgotten, or sent by an admin).

const INVALID_LINK = "This link is invalid or has expired. Ask for a new one.";

/** How long emailed links stay valid. */
const LINK_TTL: Record<TokenPurpose, { ms: number; label: string }> = {
  RESET: { ms: 60 * 60_000, label: "1 hour" },
  INVITE: { ms: 72 * 60 * 60_000, label: "3 days" },
};

export const passwordService = {
  /** Creates a single-use link token and emails it (invite or reset). */
  async issuePasswordLink(user: { id: string; name: string; email: string }, purpose: TokenPurpose, inviterName?: string): Promise<void> {
    const token = randomToken();
    await passwordTokenRepository.replaceForUser({
      userId: user.id,
      tokenHash: hashToken(token),
      purpose,
      expiresAt: new Date(Date.now() + LINK_TTL[purpose].ms),
    });
    notificationService.passwordLink(user, token, purpose, LINK_TTL[purpose].label, inviterName);
  },

  /**
   * "Forgot password". Always succeeds from the caller's point of view, so it
   * never reveals whether an address has an account.
   */
  async requestPasswordReset(email: string, clientIp: string): Promise<void> {
    enforceRateLimit(`reset-ip:${clientIp}`, rateLimits.resetPerIp);
    enforceRateLimit(`reset-email:${email}`, rateLimits.resetPerEmail);
    const user = await userRepository.findByEmail(email);
    if (!user || user.status !== "ACTIVE") return;
    await passwordService.issuePasswordLink(user, "RESET");
    await activityService.record(null, "password.reset_requested", "user", user.id, `Password reset requested for ${user.email}`);
  },

  /** Lets the reset page show the right heading before the user types. */
  async checkPasswordToken(token: string): Promise<{ purpose: TokenPurpose; email: string; name: string }> {
    const record = await passwordTokenRepository.findValidByHash(hashToken(token));
    if (!record || record.user.status !== "ACTIVE") throw ApiError.validation(INVALID_LINK, { token: [INVALID_LINK] });
    return { purpose: record.purpose, email: record.user.email, name: record.user.name };
  },

  /** Sets the new password, consumes the token and signs out every session. */
  async confirmPasswordReset(input: PasswordResetConfirmInput, clientIp: string): Promise<{ purpose: TokenPurpose }> {
    enforceRateLimit(`reset-confirm:${clientIp}`, rateLimits.resetPerIp);
    const record = await passwordTokenRepository.findValidByHash(hashToken(input.token));
    if (!record || record.user.status !== "ACTIVE" || !(await passwordTokenRepository.consume(record.id))) {
      throw ApiError.validation(INVALID_LINK, { token: [INVALID_LINK] });
    }
    await userRepository.update(record.userId, { passwordHash: await hashPassword(input.password) });
    const revoked = await sessionRepository.revokeAllForUser(record.userId);
    const verb = record.purpose === "INVITE" ? "set their password (invite accepted)" : "reset their password";
    await activityService.record(
      { id: record.user.id, name: record.user.name, email: record.user.email, role: record.user.role },
      record.purpose === "INVITE" ? "invite.accepted" : "password.reset",
      "user",
      record.userId,
      `${record.user.name} ${verb}${revoked ? `; ${revoked} session(s) signed out` : ""}`,
    );
    return { purpose: record.purpose };
  },
};
