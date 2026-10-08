import { getClientIp, parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { passwordResetConfirmSchema } from "@/Schemas/auth.schema";
import { passwordService } from "@/Services/password.service";

export const POST = handle(async (request: Request) => {
  const input = await parseBody(request, passwordResetConfirmSchema);
  return ok(await passwordService.confirmPasswordReset(input, getClientIp(request)));
});
