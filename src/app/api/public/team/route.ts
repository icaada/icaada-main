import { publicListRoute } from "@/lib/api/content-routes";
import { teamMemberService } from "@/Services/team-member.service";

export const GET = publicListRoute(teamMemberService);
