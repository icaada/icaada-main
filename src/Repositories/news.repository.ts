import type { NewsPost } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { NewsCreateInput, NewsUpdateInput } from "@/Schemas/news.schema";
import { ci, defined, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type NewsPostRecord = NewsPost;
type CreateFields = Omit<NewsCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<NewsUpdateInput, "slug" | "sortOrder">;

export const newsPostRepository: ContentRepository<NewsPost, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: ci(search) }, { category: ci(search) }, { excerpt: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().newsPost.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().newsPost.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().newsPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { sortOrder: "asc" }],
    });
  },

  findById(id) {
    return getPrisma().newsPost.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().newsPost.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().newsPost.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().newsPost.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().newsPost.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().newsPost.delete({ where: { id } }));
  },
};
