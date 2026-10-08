import { newsPostRepository, type NewsPostRecord } from "@/Repositories/news.repository";
import type { NewsCreateInput, NewsUpdateInput } from "@/Schemas/news.schema";
import { createContentService } from "@/Services/content.service";
import { iso } from "@/Services/service-utils";

export interface NewsPostDto {
  id: string;
  slug: string;
  status: NewsPostRecord["status"];
  sortOrder: number;
  title: string;
  category: string;
  excerpt: string;
  body: string | null;
  dateLabel: string | null;
  readLabel: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const toNewsPostDto = (r: NewsPostRecord): NewsPostDto => ({
  id: r.id,
  slug: r.slug,
  status: r.status,
  sortOrder: r.sortOrder,
  title: r.title,
  category: r.category,
  excerpt: r.excerpt,
  body: r.body,
  dateLabel: r.dateLabel,
  readLabel: r.readLabel,
  imageUrl: r.imageUrl,
  imagePublicId: r.imagePublicId,
  publishedAt: iso(r.publishedAt),
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export const newsService = createContentService<NewsPostRecord, NewsCreateInput, NewsUpdateInput, NewsPostDto>({
  module: "news",
  entityType: "news",
  label: "News article",
  repository: newsPostRepository,
  toDto: toNewsPostDto,
  titleOf: (r) => r.title,
  slugSource: (input) => input.title,
  publishProblems: (r) => (r.imageUrl ? [] : ["Add a cover image before publishing."]),
});
