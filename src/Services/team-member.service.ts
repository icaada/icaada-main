import { teamMemberRepository, type TeamMemberRecord } from "@/Repositories/team-member.repository";
import type { TeamMemberCreateInput, TeamMemberUpdateInput } from "@/Schemas/team-member.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface TeamMemberDto {
  id: string;
  slug: string;
  status: TeamMemberRecord["status"];
  sortOrder: number;
  name: string;
  position: string;
  biography: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  responsibilities: string[];
  expertise: string[];
  email: string | null;
  phone: string | null;
  location: string | null;
  socialLinks: { label: string; url: string }[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toTeamMemberDto = (r: TeamMemberRecord): TeamMemberDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  name: r.name,
  position: r.position,
  biography: r.biography,
  imageUrl: r.imageUrl,
  imagePublicId: r.imagePublicId,
  responsibilities: r.responsibilities,
  expertise: r.expertise,
  email: r.email,
  phone: r.phone,
  location: r.location,
  socialLinks: Array.isArray(r.socialLinks) ? (r.socialLinks as TeamMemberDto["socialLinks"]) : [],
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const teamMemberService = createContentService<TeamMemberRecord, TeamMemberCreateInput, TeamMemberUpdateInput, TeamMemberDto>({
  module: "team",
  entityType: "team",
  label: "Team profile",
  repository: teamMemberRepository,
  toDto: toTeamMemberDto,
  titleOf: (r) => r.name,
  slugSource: (input) => input.name,
  publishProblems: (r) => (r.imageUrl ? [] : ["Add a profile photo before publishing."]),
});
