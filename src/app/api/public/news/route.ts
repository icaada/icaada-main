import { publicListRoute } from "@/lib/api/content-routes";
import { newsService } from "@/Services/news.service";

export const GET = publicListRoute(newsService);
