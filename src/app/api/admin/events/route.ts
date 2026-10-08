import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { eventCreateSchema } from "@/Schemas/event.schema";
import { eventService } from "@/Services/event.service";

const routes = adminCollectionRoutes(eventService, eventCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
