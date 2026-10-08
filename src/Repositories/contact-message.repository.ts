import type { ContactMessage, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { MessageStatus } from "@/Schemas/contact.schema";
import { ci, defined, withPrismaErrors, type ListParams, type Paged } from "@/Repositories/repository-utils";

export type ContactMessageRecord = ContactMessage;

export const contactMessageRepository = {
  create(data: { name: string; email: string; subject: string; body: string }) {
    return getPrisma().contactMessage.create({ data });
  },

  async list({ search, status, skip, take }: ListParams & { status?: MessageStatus }): Promise<Paged<ContactMessage>> {
    const where: Prisma.ContactMessageWhereInput = {
      ...(status ? { status } : {}),
      ...(search
        ? { OR: [{ name: ci(search) }, { email: ci(search) }, { subject: ci(search) }, { body: ci(search) }] }
        : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().contactMessage.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      getPrisma().contactMessage.count({ where }),
    ]);
    return { items, total };
  },

  countByStatus(status: MessageStatus) {
    return getPrisma().contactMessage.count({ where: { status } });
  },

  findById(id: string) {
    return getPrisma().contactMessage.findUnique({ where: { id } });
  },

  update(id: string, data: { status?: MessageStatus; replyDraft?: string | null; replySavedAt?: Date | null }) {
    return withPrismaErrors(() => getPrisma().contactMessage.update({ where: { id }, data: defined(data) }));
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().contactMessage.delete({ where: { id } }));
  },
};
