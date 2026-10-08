import type { MediaItem } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { MediaCreateInput, MediaUpdateInput } from "@/Schemas/media.schema";
import { CONTENT_STATUSES, ci, defined, toStatusCounts, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type MediaItemRecord = MediaItem;
type CreateFields = Omit<MediaCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<MediaUpdateInput, "slug" | "sortOrder">;

export const mediaItemRepository: ContentRepository<MediaItem, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: ci(search) }, { category: ci(search) }, { description: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().mediaItem.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().mediaItem.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().mediaItem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
  },

  async statusCounts() {
    // Independent reads: no transaction needed, so they never wait for a dedicated connection.
    const counts = await Promise.all(
      CONTENT_STATUSES.map((status) => getPrisma().mediaItem.count({ where: { status } })),
    );
    return toStatusCounts(counts);
  },

  findById(id) {
    return getPrisma().mediaItem.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().mediaItem.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().mediaItem.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().mediaItem.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().mediaItem.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().mediaItem.delete({ where: { id } }));
  },
};
