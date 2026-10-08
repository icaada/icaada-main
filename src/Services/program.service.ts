import { programRepository, type ProgramRecord } from "@/Repositories/program.repository";
import type { ProgramCreateInput, ProgramUpdateInput } from "@/Schemas/program.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface ProgramDto {
  id: string;
  slug: string;
  status: ProgramRecord["status"];
  sortOrder: number;
  title: string;
  summary: string;
  description: string;
  detail: string | null;
  stage: ProgramRecord["stage"];
  featured: boolean;
  imageUrl: string | null;
  imagePublicId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toProgramDto = (r: ProgramRecord): ProgramDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  title: r.title,
  summary: r.summary,
  description: r.description,
  detail: r.detail,
  stage: r.stage,
  featured: r.featured,
  imageUrl: r.imageUrl,
  imagePublicId: r.imagePublicId,
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const programService = createContentService<ProgramRecord, ProgramCreateInput, ProgramUpdateInput, ProgramDto>({
  module: "programs",
  entityType: "program",
  label: "Program",
  repository: programRepository,
  toDto: toProgramDto,
  titleOf: (r) => r.title,
  slugSource: (input) => input.title,
});
