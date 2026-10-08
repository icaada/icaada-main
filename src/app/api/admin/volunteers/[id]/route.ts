import { parseBody, type IdParams } from "@/lib/api/request";
import { handle, noContent, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { volunteerUpdateSchema } from "@/Schemas/volunteer.schema";
import { volunteerService } from "@/Services/volunteer.service";

export const GET = handle(async (_request: Request, { params }: IdParams) => {
  await requireEditor();
  return ok(await volunteerService.get((await params).id));
});

export const PATCH = handle(async (request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  const input = await parseBody(request, volunteerUpdateSchema);
  return ok(await volunteerService.update(actor, (await params).id, input));
});

export const DELETE = handle(async (_request: Request, { params }: IdParams) => {
  const actor = await requireEditor();
  await volunteerService.remove(actor, (await params).id);
  return noContent();
});
