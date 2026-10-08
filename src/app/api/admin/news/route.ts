import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { newsCreateSchema } from "@/Schemas/news.schema";
import { newsService } from "@/Services/news.service";

const routes = adminCollectionRoutes(newsService, newsCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
