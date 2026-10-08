import { adminStatusRoute } from "@/lib/api/content-routes";
import { eventService } from "@/Services/event.service";

export const POST = adminStatusRoute(eventService);
