import { adminStatusRoute } from "@/lib/api/content-routes";
import { partnerService } from "@/Services/partner.service";

export const POST = adminStatusRoute(partnerService);
