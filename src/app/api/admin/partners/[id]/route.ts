import { adminItemRoutes } from "@/lib/api/content-routes";
import { partnerUpdateSchema } from "@/Schemas/partner.schema";
import { partnerService } from "@/Services/partner.service";

const routes = adminItemRoutes(partnerService, partnerUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
