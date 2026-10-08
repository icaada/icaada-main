import type { WorkspaceSettings } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { defined } from "@/Repositories/repository-utils";

export type WorkspaceSettingsRecord = WorkspaceSettings;

const ID = "workspace";

export interface WorkspaceSettingsData {
  workspaceName: string;
  contactEmail: string;
  timezone: string;
  language: string;
}

export const workspaceSettingsRepository = {
  find() {
    return getPrisma().workspaceSettings.findUnique({ where: { id: ID } });
  },

  /** Single-row upsert: `defaults` only apply when the row does not exist yet. */
  upsert(data: Partial<WorkspaceSettingsData>, defaults: WorkspaceSettingsData) {
    return getPrisma().workspaceSettings.upsert({
      where: { id: ID },
      create: { id: ID, ...defaults, ...defined(data) },
      update: defined(data),
    });
  },
};
