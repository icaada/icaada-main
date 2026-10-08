import { ApiError } from "@/lib/api/api-error";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { randomToken } from "@/lib/auth/tokens";
import { sessionRepository } from "@/Repositories/session.repository";
import { userRepository, type UserRecord } from "@/Repositories/user.repository";
import {
  userPreferencesSchema,
  type PasswordChangeInput,
  type ProfileUpdateInput,
  type UserCreateInput,
  type UserListQuery,
  type UserPreferences,
  type UserUpdateInput,
} from "@/Schemas/user.schema";
import { activityService } from "@/Services/activity.service";
import { passwordService } from "@/Services/password.service";
import { iso, pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

/** Public shape of a user. Never includes passwordHash. */
export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRecord["role"];
  status: UserRecord["status"];
  avatarUrl: string | null;
  roleTitle: string | null;
  preferences: UserPreferences;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toUserDto = (u: UserRecord): UserDto => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  avatarUrl: u.avatarUrl,
  roleTitle: u.roleTitle,
  preferences: userPreferencesSchema.parse(u.preferences ?? {}),
  lastLoginAt: iso(u.lastLoginAt),
  createdAt: u.createdAt.toISOString(),
  updatedAt: u.updatedAt.toISOString(),
});

const getUser = async (id: string) => {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound("User not found.");
  return user;
};

/** Refuses changes that would leave the workspace without an active admin. */
async function assertKeepsAnAdmin(target: UserRecord) {
  if (target.role === "ADMIN" && target.status === "ACTIVE" && (await userRepository.countActiveAdmins(target.id)) === 0) {
    throw ApiError.conflict("At least one active admin must remain.");
  }
}

export const userService = {
  // ── ADMIN user management ─────────────────────────────────────────────────
  async list(query: UserListQuery) {
    const { items, total } = await userRepository.list({
      search: query.search,
      role: query.role,
      status: query.status,
      ...pageArgs(query),
    });
    return { items: items.map(toUserDto), meta: pageMeta(query, total) };
  },

  async get(id: string) {
    return toUserDto(await getUser(id));
  },

  async create(actor: Actor, input: UserCreateInput) {
    if (await userRepository.findByEmail(input.email)) {
      throw ApiError.conflict("A user with this email already exists.", { email: ["Already in use."] });
    }
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      role: input.role,
      roleTitle: input.roleTitle,
      // No password given: store an unguessable one and email an invite link instead.
      passwordHash: await hashPassword(input.password ?? randomToken()),
    });
    if (!input.password) await passwordService.issuePasswordLink(user, "INVITE", actor.name);
    await activityService.record(actor, "created", "user", user.id, `Created ${user.role.toLowerCase()} account for ${user.name}${input.password ? "" : " and sent an invite"}`);
    return toUserDto(user);
  },

  async update(actor: Actor, id: string, input: UserUpdateInput) {
    const target = await getUser(id);
    const changesAccess =
      (input.role !== undefined && input.role !== target.role) ||
      (input.status !== undefined && input.status !== target.status);
    if (changesAccess && target.id === actor.id) {
      throw ApiError.forbidden("You cannot change your own role or status.");
    }
    if ((input.role === "EDITOR" || input.status === "DISABLED") && changesAccess) {
      await assertKeepsAnAdmin(target);
    }
    const user = await userRepository.update(id, {
      name: input.name,
      role: input.role,
      status: input.status,
      roleTitle: input.roleTitle,
      ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
    });
    // Disabling or resetting the password ends every session for that user.
    if (input.status === "DISABLED" || input.password) await sessionRepository.revokeAllForUser(id);
    const changes = [
      input.role && input.role !== target.role ? `role → ${input.role}` : null,
      input.status && input.status !== target.status ? `status → ${input.status}` : null,
      input.password ? "password reset" : null,
    ].filter(Boolean);
    await activityService.record(actor, "updated", "user", id, `Updated ${user.name}${changes.length ? ` (${changes.join(", ")})` : ""}`);
    return toUserDto(user);
  },

  async remove(actor: Actor, id: string) {
    const target = await getUser(id);
    if (target.id === actor.id) throw ApiError.forbidden("You cannot delete your own account.");
    await assertKeepsAnAdmin(target);
    await userRepository.delete(id);
    await activityService.record(actor, "deleted", "user", id, `Deleted account for ${target.name}`);
  },

  /** Emails an invite (never signed in) or a reset link (has signed in before). */
  async sendPasswordLink(actor: Actor, id: string) {
    const target = await getUser(id);
    if (target.status !== "ACTIVE") throw ApiError.conflict("Enable this account before sending a password link.");
    const purpose = target.lastLoginAt ? "RESET" : "INVITE";
    await passwordService.issuePasswordLink(target, purpose, actor.name);
    await activityService.record(actor, purpose === "INVITE" ? "invite.sent" : "password.reset_sent", "user", id, `Sent ${purpose === "INVITE" ? "an invite" : "a password reset link"} to ${target.email}`);
    return { purpose };
  },

  /** Signs the user out on every device. */
  async revokeSessions(actor: Actor, id: string) {
    const target = await getUser(id);
    const revoked = await sessionRepository.revokeAllForUser(id, target.id === actor.id ? actor.sessionId : undefined);
    await activityService.record(actor, "sessions.revoked", "user", id, `Signed ${target.name} out of ${revoked} session(s)`);
    return { revoked };
  },

  // ── Own profile (any signed-in user) ─────────────────────────────────────
  async getProfile(actor: Actor) {
    return toUserDto(await getUser(actor.id));
  },

  async updateProfile(actor: Actor, input: ProfileUpdateInput) {
    const current = await getUser(actor.id);
    const preferences = input.preferences
      ? { ...userPreferencesSchema.parse(current.preferences ?? {}), ...input.preferences }
      : undefined;
    const user = await userRepository.update(actor.id, {
      name: input.name,
      roleTitle: input.roleTitle,
      avatarUrl: input.avatarUrl,
      preferences,
    });
    await activityService.record(actor, "updated", "profile", actor.id, `${user.name} updated their profile`);
    return toUserDto(user);
  },

  async changePassword(actor: Actor, input: PasswordChangeInput) {
    const user = await getUser(actor.id);
    if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
      throw ApiError.validation(undefined, { currentPassword: ["Current password is incorrect."] });
    }
    await userRepository.update(actor.id, { passwordHash: await hashPassword(input.newPassword) });
    // Keep this browser signed in; sign out everywhere else.
    const revoked = await sessionRepository.revokeAllForUser(actor.id, actor.sessionId);
    await activityService.record(actor, "password.changed", "profile", actor.id, `${user.name} changed their password${revoked ? `; ${revoked} other session(s) signed out` : ""}`);
  },
};
