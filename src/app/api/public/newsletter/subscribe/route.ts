import { getClientIp, parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { subscribeSchema } from "@/Schemas/newsletter.schema";
import { subscriberService } from "@/Services/subscriber.service";

// Public, unauthenticated. Spam protection: honeypot field + per-IP rate limit (in the service).
export const POST = handle(async (request: Request) => {
  const input = await parseBody(request, subscribeSchema);
  await subscriberService.subscribe(input, getClientIp(request));
  return ok({ message: "You're on the list. Thank you." }, { status: 202 });
});
