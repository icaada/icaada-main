import { adminStatusRoute } from "@/lib/api/content-routes";
import { programService } from "@/Services/program.service";

export const POST = adminStatusRoute(programService);
