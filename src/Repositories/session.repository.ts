import type { Session, User } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type SessionWithUser = Session & { user: User };

export const sessionRepository = {
  create(data: { userId: string; expiresAt: Date; userAgent: string | null }) {
    return getPrisma().session.create({ data });
  },

  /** Unrevoked, unexpired session with its user, or null. */
  findActiveWithUser(id: string): Promise<SessionWithUser | null> {
    return getPrisma().session.findFirst({
      where: { id, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  },

  touch(id: string) {
    return getPrisma().session.update({ where: { id }, data: { lastUsedAt: new Date() } });
  },

  revoke(id: string) {
    return getPrisma().session.updateMany({ where: { id, revokedAt: null }, data: { revokedAt: new Date() } });
  },

  /** Revokes every active session for the user, optionally keeping one. Returns the count. */
  async revokeAllForUser(userId: string, exceptId?: string): Promise<number> {
    const { count } = await getPrisma().session.updateMany({
      where: { userId, revokedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) },
      data: { revokedAt: new Date() },
    });
    return count;
  },

  countActiveForUser(userId: string) {
    return getPrisma().session.count({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } } });
  },

  /** Housekeeping: drop expired or long-revoked rows for a user. */
  deleteStaleForUser(userId: string) {
    const weekAgo = new Date(Date.now() - 7 * 86_400_000);
    return getPrisma().session.deleteMany({
      where: { userId, OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: weekAgo } }] },
    });
  },
};
