import { adminItemRoutes } from "@/lib/api/content-routes";
import { voiceUpdateSchema } from "@/Schemas/voice.schema";
import { voiceService } from "@/Services/voice.service";

const routes = adminItemRoutes(voiceService, voiceUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
