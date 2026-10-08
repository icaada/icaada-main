import { adminStatusRoute } from "@/lib/api/content-routes";
import { teamMemberService } from "@/Services/team-member.service";

export const POST = adminStatusRoute(teamMemberService);
