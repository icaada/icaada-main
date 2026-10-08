import type { ActivityLog, Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { Paged } from "@/Repositories/repository-utils";

export type ActivityLogRecord = ActivityLog & { actor: { id: string; name: string } | null };

export interface ActivityCreateData {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
}

export const activityLogRepository = {
  create(data: ActivityCreateData) {
    return getPrisma().activityLog.create({ data });
  },

  async list(params: { entityType?: string; actorId?: string; skip: number; take: number }): Promise<Paged<ActivityLogRecord>> {
    const where: Prisma.ActivityLogWhereInput = {
      ...(params.entityType ? { entityType: params.entityType } : {}),
      ...(params.actorId ? { actorId: params.actorId } : {}),
    };
    const [items, total] = await getPrisma().$transaction([
      getPrisma().activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: params.skip,
        take: params.take,
        include: { actor: { select: { id: true, name: true } } },
      }),
      getPrisma().activityLog.count({ where }),
    ]);
    return { items, total };
  },
};
