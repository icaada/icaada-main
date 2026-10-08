import { parseBody, getClientIp } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { setSessionCookie } from "@/lib/auth/cookies";
import { loginSchema } from "@/Schemas/auth.schema";
import { authService } from "@/Services/auth.service";

export const POST = handle(async (request: Request) => {
  const input = await parseBody(request, loginSchema);
  const { token, user } = await authService.login(input, getClientIp(request));
  await setSessionCookie(token);
  return ok(user);
});
