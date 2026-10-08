import type { Prisma, User } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { AccountStatus, Role } from "@/Schemas/common.schema";
import { ci, defined, withPrismaErrors, type ListParams, type Paged } from "@/Repositories/repository-utils";

export type UserRecord = User;

export interface UserListParams extends ListParams {
  role?: Role;
  status?: AccountStatus;
}

export interface UserWriteData {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status?: AccountStatus;
  roleTitle?: string | null;
  avatarUrl?: string | null;
  preferences?: Prisma.InputJsonValue;
}

export const userRepository = {
  findById(id: string) {
    return getPrisma().user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return getPrisma().user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async list({ search, role, status, skip, take }: UserListParams): Promise<Paged<User>> {
    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ name: ci(search) }, { email: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().user.findMany({ where, orderBy: { createdAt: "asc" }, skip, take }),
      getPrisma().user.count({ where }),
    ]);
    return { items, total };
  },

  countActiveAdmins(excludeId?: string) {
    return getPrisma().user.count({
      where: { role: "ADMIN", status: "ACTIVE", ...(excludeId ? { id: { not: excludeId } } : {}) },
    });
  },

  create(data: UserWriteData) {
    return withPrismaErrors(() =>
      getPrisma().user.create({ data: { ...data, email: data.email.toLowerCase() } }),
    );
  },

  update(id: string, data: Partial<UserWriteData> & { lastLoginAt?: Date }) {
    return withPrismaErrors(() => getPrisma().user.update({ where: { id }, data: defined(data) }));
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().user.delete({ where: { id } }));
  },
};
