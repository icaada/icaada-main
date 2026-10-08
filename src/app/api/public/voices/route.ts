import { publicListRoute } from "@/lib/api/content-routes";
import { voiceService } from "@/Services/voice.service";

export const GET = publicListRoute(voiceService);
