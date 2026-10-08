import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { mediaCreateSchema } from "@/Schemas/media.schema";
import { mediaService } from "@/Services/media.service";

const routes = adminCollectionRoutes(mediaService, mediaCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
