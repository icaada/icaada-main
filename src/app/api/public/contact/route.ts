import { getClientIp, parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { contactSubmitSchema } from "@/Schemas/contact.schema";
import { contactMessageService } from "@/Services/contact-message.service";

// Public, unauthenticated. Spam protection: honeypot field + per-IP rate limit (in the service).
export const POST = handle(async (request: Request) => {
  const input = await parseBody(request, contactSubmitSchema);
  await contactMessageService.submit(input, getClientIp(request));
  return ok({ message: "Thanks for getting in touch. We'll reply soon." }, { status: 202 });
});
