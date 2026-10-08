import { partnerRepository, type PartnerRecord } from "@/Repositories/partner.repository";
import type { PartnerCreateInput, PartnerUpdateInput } from "@/Schemas/partner.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface PartnerDto {
  id: string;
  slug: string;
  status: PartnerRecord["status"];
  sortOrder: number;
  name: string;
  type: PartnerRecord["type"];
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  logoPublicId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toPartnerDto = (r: PartnerRecord): PartnerDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  name: r.name,
  type: r.type,
  description: r.description,
  website: r.website,
  logoUrl: r.logoUrl,
  logoPublicId: r.logoPublicId,
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const partnerService = createContentService<PartnerRecord, PartnerCreateInput, PartnerUpdateInput, PartnerDto>({
  module: "partners",
  entityType: "partner",
  label: "Partner",
  repository: partnerRepository,
  toDto: toPartnerDto,
  titleOf: (r) => r.name,
  slugSource: (input) => input.name,
});
