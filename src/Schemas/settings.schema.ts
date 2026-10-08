import { z } from "zod";
import { emailSchema, paginationQuerySchema, text } from "@/Schemas/common.schema";

export const workspaceSettingsSchema = z.object({
  workspaceName: text(120, "Workspace name"),
  contactEmail: emailSchema,
  timezone: z.string().trim().refine((tz) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Enter a valid IANA time zone, e.g. Africa/Lagos."),
  language: text(40, "Language"),
});
export const workspaceSettingsUpdateSchema = workspaceSettingsSchema.partial();
export type WorkspaceSettingsInput = z.infer<typeof workspaceSettingsSchema>;
export type WorkspaceSettingsUpdateInput = z.infer<typeof workspaceSettingsUpdateSchema>;

export const activityListQuerySchema = paginationQuerySchema.extend({
  entityType: z.string().trim().max(40).optional(),
  actorId: z.string().trim().max(64).optional(),
});
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;
