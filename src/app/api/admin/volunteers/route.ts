import { parseQuery } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { volunteerListQuerySchema } from "@/Schemas/volunteer.schema";
import { volunteerService } from "@/Services/volunteer.service";

export const GET = handle(async (request: Request) => {
  await requireEditor();
  const { items, meta } = await volunteerService.list(parseQuery(request, volunteerListQuerySchema));
  return ok(items, { meta });
});
