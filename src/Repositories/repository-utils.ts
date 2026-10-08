import { Prisma } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api/api-error";
import type { ContentStatus } from "@/Schemas/common.schema";

// Shared helpers for the repository layer (the only layer that touches Prisma).

/** Case-insensitive "contains" filter. */
export const ci = (value: string) => ({ contains: value, mode: "insensitive" as const });

export interface ListParams {
  search?: string;
  skip: number;
  take: number;
}

export interface ContentListParams extends ListParams {
  status?: ContentStatus;
}

export interface Paged<T> {
  items: T[];
  total: number;
}

/** Fields the content service controls (never taken raw from request bodies). */
export interface ContentSystemFields {
  slug: string;
  status: ContentStatus;
  publishedAt: Date | null;
  sortOrder: number;
}

/**
 * Uniform contract for the seven content modules. Each module's repository
 * implements it explicitly against its own Prisma delegate.
 */
export interface ContentRepository<TRecord, TCreate, TUpdate> {
  list(params: ContentListParams): Promise<Paged<TRecord>>;
  listPublished(): Promise<TRecord[]>;
  statusCounts(): Promise<Record<ContentStatus, number>>;
  findById(id: string): Promise<TRecord | null>;
  findPublishedBySlug(slug: string): Promise<TRecord | null>;
  slugExists(slug: string, excludeId?: string): Promise<boolean>;
  create(data: TCreate & ContentSystemFields): Promise<TRecord>;
  update(id: string, data: Partial<TUpdate & ContentSystemFields>): Promise<TRecord>;
  delete(id: string): Promise<TRecord>;
}

export const CONTENT_STATUSES = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const satisfies readonly ContentStatus[];

/** Zips per-status counts (in CONTENT_STATUSES order) into a map. */
export function toStatusCounts(counts: number[]): Record<ContentStatus, number> {
  return Object.fromEntries(CONTENT_STATUSES.map((status, i) => [status, counts[i] ?? 0])) as Record<ContentStatus, number>;
}

/** Strips undefined keys so partial updates never overwrite with undefined. */
export function defined<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/** Maps known Prisma errors to ApiErrors (409 unique, 404 missing, 422 bad FK). */
export async function withPrismaErrors<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[] | string | undefined) ?? "field";
        const fields = Array.isArray(target) ? target : [target];
        throw ApiError.conflict(
          `A record with this ${fields.join(", ")} already exists.`,
          Object.fromEntries(fields.map((field) => [field, ["Already in use."]])),
        );
      }
      if (error.code === "P2025") throw ApiError.notFound();
      if (error.code === "P2003") {
        throw ApiError.validation("A linked record does not exist.", {
          [String(error.meta?.field_name ?? "relation")]: ["Linked record not found."],
        });
      }
    }
    throw error;
  }
}
