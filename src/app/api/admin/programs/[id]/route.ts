import { adminItemRoutes } from "@/lib/api/content-routes";
import { programUpdateSchema } from "@/Schemas/program.schema";
import { programService } from "@/Services/program.service";

const routes = adminItemRoutes(programService, programUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
