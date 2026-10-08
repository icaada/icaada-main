import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { partnerCreateSchema } from "@/Schemas/partner.schema";
import { partnerService } from "@/Services/partner.service";

const routes = adminCollectionRoutes(partnerService, partnerCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
