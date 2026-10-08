import { parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireAdmin, requireEditor } from "@/lib/auth/auth-guard";
import { workspaceSettingsUpdateSchema } from "@/Schemas/settings.schema";
import { settingsService } from "@/Services/settings.service";

// Editors may read workspace settings; only admins may change them.
export const GET = handle(async () => {
  await requireEditor();
  return ok(await settingsService.get());
});

export const PATCH = handle(async (request: Request) => {
  const actor = await requireAdmin();
  return ok(await settingsService.update(actor, await parseBody(request, workspaceSettingsUpdateSchema)));
});
