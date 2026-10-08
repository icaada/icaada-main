import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { voiceCreateSchema } from "@/Schemas/voice.schema";
import { voiceService } from "@/Services/voice.service";

const routes = adminCollectionRoutes(voiceService, voiceCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
