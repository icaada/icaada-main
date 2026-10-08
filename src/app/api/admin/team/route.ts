import { adminCollectionRoutes } from "@/lib/api/content-routes";
import { teamMemberCreateSchema } from "@/Schemas/team-member.schema";
import { teamMemberService } from "@/Services/team-member.service";

const routes = adminCollectionRoutes(teamMemberService, teamMemberCreateSchema);

export const GET = routes.GET;
export const POST = routes.POST;
