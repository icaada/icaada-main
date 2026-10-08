import type { Program } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { ProgramCreateInput, ProgramUpdateInput } from "@/Schemas/program.schema";
import { CONTENT_STATUSES, ci, defined, toStatusCounts, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type ProgramRecord = Program;
type CreateFields = Omit<ProgramCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<ProgramUpdateInput, "slug" | "sortOrder">;

export const programRepository: ContentRepository<Program, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ title: ci(search) }, { summary: ci(search) }, { description: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().program.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().program.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().program.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
  },

  async statusCounts() {
    // Independent reads: no transaction needed, so they never wait for a dedicated connection.
    const counts = await Promise.all(
      CONTENT_STATUSES.map((status) => getPrisma().program.count({ where: { status } })),
    );
    return toStatusCounts(counts);
  },

  findById(id) {
    return getPrisma().program.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().program.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().program.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().program.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().program.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().program.delete({ where: { id } }));
  },
};
