import { adminItemRoutes } from "@/lib/api/content-routes";
import { teamMemberUpdateSchema } from "@/Schemas/team-member.schema";
import { teamMemberService } from "@/Services/team-member.service";

const routes = adminItemRoutes(teamMemberService, teamMemberUpdateSchema);

export const GET = routes.GET;
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
