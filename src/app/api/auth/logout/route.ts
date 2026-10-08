import { handle, noContent } from "@/lib/api/response";
import { getCurrentActor } from "@/lib/auth/auth-guard";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { authService } from "@/Services/auth.service";

export const POST = handle(async () => {
  await authService.logout(await getCurrentActor());
  await clearSessionCookie();
  return noContent();
});
