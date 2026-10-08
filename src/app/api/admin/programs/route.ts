import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { programCreateSchema } from "@/Schemas/program.schema";
import { programService } from "@/Services/program.service";

const routes = adminCollectionRoutes(programService, programCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
