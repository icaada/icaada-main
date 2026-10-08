import type { PasswordToken, PasswordTokenPurpose, User } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type PasswordTokenWithUser = PasswordToken & { user: User };
export type TokenPurpose = PasswordTokenPurpose;

export const passwordTokenRepository = {
  /** Issues a new token and invalidates the user's earlier unused ones. */
  async replaceForUser(data: { userId: string; tokenHash: string; purpose: TokenPurpose; expiresAt: Date }) {
    const prisma = getPrisma();
    const [, token] = await prisma.$transaction([
      prisma.passwordToken.updateMany({ where: { userId: data.userId, usedAt: null }, data: { usedAt: new Date() } }),
      prisma.passwordToken.create({ data }),
    ]);
    return token;
  },

  /** Unused, unexpired token with its user, or null. */
  findValidByHash(tokenHash: string): Promise<PasswordTokenWithUser | null> {
    return getPrisma().passwordToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      include: { user: true },
    });
  },

  /** Marks used only if still unused (guards against double submission). Returns true if this call consumed it. */
  async consume(id: string): Promise<boolean> {
    const { count } = await getPrisma().passwordToken.updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date() } });
    return count === 1;
  },
};
