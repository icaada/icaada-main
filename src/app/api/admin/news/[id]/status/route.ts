import { adminStatusRoute } from "@/lib/api/content-routes";
import { newsService } from "@/Services/news.service";

export const POST = adminStatusRoute(newsService);
