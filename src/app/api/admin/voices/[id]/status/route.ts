import { adminStatusRoute } from "@/lib/api/content-routes";
import { voiceService } from "@/Services/voice.service";

export const POST = adminStatusRoute(voiceService);
