import { parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { requireEditor } from "@/lib/auth/auth-guard";
import { signUploadSchema } from "@/Schemas/media.schema";
import { uploadService } from "@/Services/upload.service";

export const POST = handle(async (request: Request) => {
  const actor = await requireEditor();
  return ok(uploadService.signUpload(actor, await parseBody(request, signUploadSchema)));
});
