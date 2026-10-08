import type { Voice } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { VoiceCreateInput, VoiceUpdateInput } from "@/Schemas/voice.schema";
import { ci, defined, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type VoiceRecord = Voice;
type CreateFields = Omit<VoiceCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<VoiceUpdateInput, "slug" | "sortOrder">;

export const voiceRepository: ContentRepository<Voice, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ name: ci(search) }, { role: ci(search) }, { quote: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().voice.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().voice.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().voice.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
  },

  findById(id) {
    return getPrisma().voice.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().voice.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().voice.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().voice.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().voice.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().voice.delete({ where: { id } }));
  },
};
