import { publicListRoute } from "@/lib/api/content-routes";
import { partnerService } from "@/Services/partner.service";

export const GET = publicListRoute(partnerService);
