import { adminStatusRoute } from "@/lib/api/content-routes";
import { mediaService } from "@/Services/media.service";

export const POST = adminStatusRoute(mediaService);
