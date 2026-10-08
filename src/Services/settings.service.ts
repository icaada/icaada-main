import { workspaceSettingsRepository, type WorkspaceSettingsData } from "@/Repositories/workspace-settings.repository";
import type { WorkspaceSettingsUpdateInput } from "@/Schemas/settings.schema";
import { activityService } from "@/Services/activity.service";
import type { Actor } from "@/Services/service-utils";

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettingsData = {
  workspaceName: "ICAADA",
  contactEmail: "hello@icaada.org",
  timezone: "Africa/Lagos",
  language: "English",
};

export interface WorkspaceSettingsDto extends WorkspaceSettingsData {
  updatedAt: string | null;
}

export const settingsService = {
  async get(): Promise<WorkspaceSettingsDto> {
    const row = await workspaceSettingsRepository.find();
    if (!row) return { ...DEFAULT_WORKSPACE_SETTINGS, updatedAt: null };
    return {
      workspaceName: row.workspaceName,
      contactEmail: row.contactEmail,
      timezone: row.timezone,
      language: row.language,
      updatedAt: row.updatedAt.toISOString(),
    };
  },

  /** ADMIN only (enforced by the route guard). */
  async update(actor: Actor, input: WorkspaceSettingsUpdateInput): Promise<WorkspaceSettingsDto> {
    const row = await workspaceSettingsRepository.upsert(input, DEFAULT_WORKSPACE_SETTINGS);
    await activityService.record(actor, "updated", "settings", row.id, `${actor.name} updated workspace settings`);
    return {
      workspaceName: row.workspaceName,
      contactEmail: row.contactEmail,
      timezone: row.timezone,
      language: row.language,
      updatedAt: row.updatedAt.toISOString(),
    };
  },
};
