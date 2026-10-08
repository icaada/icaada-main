import type { Partner } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { PartnerCreateInput, PartnerUpdateInput } from "@/Schemas/partner.schema";
import { CONTENT_STATUSES, ci, defined, toStatusCounts, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type PartnerRecord = Partner;
type CreateFields = Omit<PartnerCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<PartnerUpdateInput, "slug" | "sortOrder">;

export const partnerRepository: ContentRepository<Partner, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ name: ci(search) }, { description: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().partner.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().partner.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().partner.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
  },

  async statusCounts() {
    // Independent reads: no transaction needed, so they never wait for a dedicated connection.
    const counts = await Promise.all(
      CONTENT_STATUSES.map((status) => getPrisma().partner.count({ where: { status } })),
    );
    return toStatusCounts(counts);
  },

  findById(id) {
    return getPrisma().partner.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().partner.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().partner.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().partner.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().partner.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().partner.delete({ where: { id } }));
  },
};
