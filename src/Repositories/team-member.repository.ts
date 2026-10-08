import type { TeamMember } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { TeamMemberCreateInput, TeamMemberUpdateInput } from "@/Schemas/team-member.schema";
import { CONTENT_STATUSES, ci, defined, toStatusCounts, withPrismaErrors, type ContentListParams, type ContentRepository, type ContentSystemFields } from "@/Repositories/repository-utils";

export type TeamMemberRecord = TeamMember;
type CreateFields = Omit<TeamMemberCreateInput, "slug" | "sortOrder">;
type UpdateFields = Omit<TeamMemberUpdateInput, "slug" | "sortOrder">;

export const teamMemberRepository: ContentRepository<TeamMember, CreateFields, UpdateFields> = {
  async list({ search, status, skip, take }: ContentListParams) {
    const where = {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ name: ci(search) }, { position: ci(search) }, { biography: ci(search) }] } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().teamMember.findMany({ where, orderBy: { updatedAt: "desc" }, skip, take }),
      getPrisma().teamMember.count({ where }),
    ]);
    return { items, total };
  },

  listPublished() {
    return getPrisma().teamMember.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
  },

  async statusCounts() {
    // Independent reads: no transaction needed, so they never wait for a dedicated connection.
    const counts = await Promise.all(
      CONTENT_STATUSES.map((status) => getPrisma().teamMember.count({ where: { status } })),
    );
    return toStatusCounts(counts);
  },

  findById(id) {
    return getPrisma().teamMember.findUnique({ where: { id } });
  },

  findPublishedBySlug(slug) {
    return getPrisma().teamMember.findFirst({ where: { slug, status: "PUBLISHED" } });
  },

  async slugExists(slug, excludeId) {
    const found = await getPrisma().teamMember.findUnique({ where: { slug }, select: { id: true } });
    return Boolean(found && found.id !== excludeId);
  },

  create(data: CreateFields & ContentSystemFields) {
    return withPrismaErrors(() => getPrisma().teamMember.create({ data }));
  },

  update(id, data: Partial<UpdateFields & ContentSystemFields>) {
    return withPrismaErrors(() => getPrisma().teamMember.update({ where: { id }, data: defined(data) }));
  },

  delete(id) {
    return withPrismaErrors(() => getPrisma().teamMember.delete({ where: { id } }));
  },
};
