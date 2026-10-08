import type { NewsletterDraft } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { defined, withPrismaErrors, type ListParams, type Paged } from "@/Repositories/repository-utils";

export type NewsletterDraftRecord = NewsletterDraft;

export const newsletterDraftRepository = {
  async list({ search, skip, take }: ListParams): Promise<Paged<NewsletterDraft>> {
    const where = search ? { subject: { contains: search, mode: "insensitive" as const } } : {};
    const [items, total] = await getPrisma().$transaction([
      getPrisma().newsletterDraft.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().newsletterDraft.count({ where }),
    ]);
    return { items, total };
  },

  findById(id: string) {
    return getPrisma().newsletterDraft.findUnique({ where: { id } });
  },

  create(data: { subject: string; body: string; createdById: string | null }) {
    return getPrisma().newsletterDraft.create({ data });
  },

  update(id: string, data: { subject?: string; body?: string }) {
    return withPrismaErrors(() => getPrisma().newsletterDraft.update({ where: { id }, data: defined(data) }));
  },

  delete(id: string) {
    return withPrismaErrors(() => getPrisma().newsletterDraft.delete({ where: { id } }));
  },
};
