import { getClientIp, parseBody } from "@/lib/api/request";
import { handle, ok } from "@/lib/api/response";
import { volunteerSubmitSchema } from "@/Schemas/volunteer.schema";
import { volunteerService } from "@/Services/volunteer.service";

// Public, unauthenticated. Spam protection: honeypot field + per-IP rate limit (in the service).
export const POST = handle(async (request: Request) => {
  const input = await parseBody(request, volunteerSubmitSchema);
  await volunteerService.submit(input, getClientIp(request));
  return ok({ message: "Thank you for volunteering. Our team will contact you." }, { status: 202 });
});
