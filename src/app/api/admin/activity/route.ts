import { parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { activityListQuerySchema } from "@/Schemas/settings.schema";
import { activityService } from "@/Services/activity.service";

export const GET = handle(async (request: Request) => {
  await requireEditor();
  const { items, meta } = await activityService.list(parseQuery(request, activityListQuerySchema));
  return ok(items, { meta });
});
