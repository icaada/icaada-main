import { adminItemRoutes } from "@/lib/api/content-routes";
import { mediaUpdateSchema } from "@/Schemas/media.schema";
import { mediaService } from "@/Services/media.service";

const routes = adminItemRoutes(mediaService, mediaUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
