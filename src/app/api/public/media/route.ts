import { publicListRoute } from "@/lib/api/content-routes";
import { mediaService } from "@/Services/media.service";

export const GET = publicListRoute(mediaService);
