import { adminItemRoutes } from "@/lib/api/content-routes";
import { newsUpdateSchema } from "@/Schemas/news.schema";
import { newsService } from "@/Services/news.service";

const routes = adminItemRoutes(newsService, newsUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
