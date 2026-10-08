import { getClientIp, parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { passwordResetRequestSchema } from "@/Schemas/auth.schema";
import { passwordService } from "@/Services/password.service";

// Same response whether or not the address has an account.
export const POST = handle(async (request: Request) => {
  const { email } = await parseBody(request, passwordResetRequestSchema);
  await passwordService.requestPasswordReset(email, getClientIp(request));
  return ok({ message: "If an account exists for that address, we've emailed a link to reset the password." }, { status: 202 });
});
