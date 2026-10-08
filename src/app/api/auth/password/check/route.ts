import { parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { passwordTokenSchema } from "@/Schemas/auth.schema";
import { passwordService } from "@/Services/password.service";

// Validates a reset/invite link before showing the form (POST so the token isn't cached).
export const POST = handle(async (request: Request) => {
  const { token } = await parseBody(request, passwordTokenSchema);
  return ok(await passwordService.checkPasswordToken(token));
});
