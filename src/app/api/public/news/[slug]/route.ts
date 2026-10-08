import { publicSlugRoute } from "@/lib/api/content-routes";
import { newsService } from "@/Services/news.service";

export const GET = publicSlugRoute(newsService, "News article");
