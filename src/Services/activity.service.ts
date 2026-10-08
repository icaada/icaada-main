import { activityLogRepository, type ActivityLogRecord } from "@/Repositories/activity-log.repository";
import type { ActivityListQuery } from "@/Schemas/settings.schema";
import { pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

export interface ActivityDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  summary: string;
  actor: { id: string; name: string } | null;
  createdAt: string;
}

const toDto = (record: ActivityLogRecord): ActivityDto => ({
  id: record.id,
  action: record.action,
  entityType: record.entityType,
  entityId: record.entityId,
  summary: record.summary,
  actor: record.actor,
  createdAt: record.createdAt.toISOString(),
});

export const activityService = {
  /**
   * Records an audit entry. Called by services after every mutation. A logging
   * failure is reported but never undoes or fails the mutation it describes.
   */
  async record(
    actor: Actor | null,
    action: string,
    entityType: string,
    entityId: string | null,
    summary: string,
  ): Promise<void> {
    try {
      await activityLogRepository.create({ actorId: actor?.id ?? null, action, entityType, entityId, summary });
    } catch (error) {
      console.error("[activity] failed to record", { action, entityType, entityId }, error);
    }
  },

  async list(query: ActivityListQuery) {
    const { items, total } = await activityLogRepository.list({
      entityType: query.entityType,
      actorId: query.actorId,
      ...pageArgs(query),
    });
    return { items: items.map(toDto), meta: pageMeta(query, total) };
  },
};
