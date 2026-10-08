import { publicSlugRoute } from "@/lib/api/content-routes";
import { eventService } from "@/Services/event.service";

export const GET = publicSlugRoute(eventService, "Event");
