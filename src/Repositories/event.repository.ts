import type { Event } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { EventCreateInput, EventUpdateInput } from "@/Schemas/event.schema";
import { ci, defined, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type EventRecord = Event;
type CreateFields = Omit<EventCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<EventUpdateInput, "slug" | "sortOrder">;

export const eventRepository: ContentRepository<Event, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: ci(search) }, { type: ci(search) }, { location: ci(search) }, { description: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().event.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().event.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().event.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { startsAt: "asc" }, { publishedAt: "desc" }],
    });
  },

  findById(id) {
    return getPrisma().event.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().event.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().event.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().event.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().event.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().event.delete({ where: { id } }));
  },
};
