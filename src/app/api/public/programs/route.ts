import { publicListRoute } from "@/lib/api/content-routes";
import { programService } from "@/Services/program.service";

export const GET = publicListRoute(programService);
