import { adminItemRoutes } from "@/lib/api/content-routes";
import { eventUpdateSchema } from "@/Schemas/event.schema";
import { eventService } from "@/Services/event.service";

const routes = adminItemRoutes(eventService, eventUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
