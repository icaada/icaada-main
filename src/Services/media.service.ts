import { mediaItemRepository, type MediaItemRecord } from "@/Repositories/media.repository";
import type { MediaCreateInput, MediaUpdateInput } from "@/Schemas/media.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface MediaItemDto {
  id: string;
  slug: string;
  status: MediaItemRecord["status"];
  sortOrder: number;
  title: string;
  type: MediaItemRecord["type"];
  category: string;
  description: string | null;
  altText: string | null;
  dateLabel: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  assetUrl: string | null;
  assetPublicId: string | null;
  voiceId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toMediaItemDto = (r: MediaItemRecord): MediaItemDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  title: r.title,
  type: r.type,
  category: r.category,
  description: r.description,
  altText: r.altText,
  dateLabel: r.dateLabel,
  imageUrl: r.imageUrl,
  imagePublicId: r.imagePublicId,
  assetUrl: r.assetUrl,
  assetPublicId: r.assetPublicId,
  voiceId: r.voiceId,
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const mediaService = createContentService<MediaItemRecord, MediaCreateInput, MediaUpdateInput, MediaItemDto>({
  module: "media",
  entityType: "media",
  label: "Media item",
  repository: mediaItemRepository,
  toDto: toMediaItemDto,
  titleOf: (r) => r.title,
  slugSource: (input) => input.title,
  publishProblems: (r) => {
    const problems: string[] = [];
    if (r.type === "IMAGE") {
      if (!r.imageUrl) problems.push("Upload the image before publishing.");
      if (!r.altText) problems.push("Add alt text so the image is accessible.");
    } else if (!r.assetUrl) {
      problems.push(`Upload the ${r.type.toLowerCase()} file before publishing.`);
    }
    return problems;
  },
});
