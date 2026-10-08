import { ApiError } from "@/lib/api/api-error";
import type { PageMeta } from "@/lib/api/response";
import { cachedPublicRead, revalidateContent, type ContentModule } from "@/lib/cache";
import { uniqueSlug } from "@/lib/slug";
import type { ContentRepository } from "@/Repositories/repository-utils";
import type { ContentListQuery, ContentStatus } from "@/Schemas/common.schema";
import { activityService } from "@/Services/activity.service";
import { pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

// Shared lifecycle for the seven content modules: listing, slugs, the editorial
// status workflow, activity logging and public-cache revalidation. Anything
// module-specific (slug source, publish rules, cross-field checks, DTO shape)
// is passed in by the module's own service file.

/** Editorial workflow (mirrors statusTransitions in components/admin/module-configs.ts). */
export const STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ["REVIEW", "PUBLISHED"],
  REVIEW: ["PUBLISHED", "DRAFT"],
  PUBLISHED: ["ARCHIVED", "DRAFT"],
  ARCHIVED: ["DRAFT"],
};

const STATUS_ACTIONS: Record<ContentStatus, string> = {
  DRAFT: "status.draft",
  REVIEW: "status.review",
  PUBLISHED: "status.published",
  ARCHIVED: "status.archived",
};

interface ContentRecordBase {
  id: string;
  slug: string;
  status: ContentStatus;
  publishedAt: Date | null;
  sortOrder: number;
}

type WithSystemInputs = { slug?: string; sortOrder?: number };

export interface ContentServiceConfig<TRecord extends ContentRecordBase, TCreate extends WithSystemInputs, TUpdate extends WithSystemInputs, TDto> {
  /** Cache/revalidation key and public path group. */
  module: ContentModule;
  /** ActivityLog.entityType, e.g. "event". */
  entityType: string;
  /** Human label for messages, e.g. "Event". */
  label: string;
  repository: ContentRepository<TRecord, Omit<TCreate, "slug" | "sortOrder">, Omit<TUpdate, "slug" | "sortOrder">>;
  toDto: (record: TRecord) => TDto;
  titleOf: (record: TRecord) => string;
  /** Text the slug is generated from when none is supplied. */
  slugSource: (input: TCreate) => string;
  /** Cross-field validation on the merged record; throw ApiError.validation. */
  validate?: (record: TRecord) => void;
  /** Extra publish requirements; return a list of problems (empty = ok). */
  publishProblems?: (record: TRecord) => string[];
}

/** What every content module service exposes (used by the shared route factories). */
export interface ContentService<TCreate, TUpdate, TDto> {
  listPublished(): Promise<TDto[]>;
  getPublishedBySlug(slug: string): Promise<TDto | null>;
  list(query: ContentListQuery): Promise<{ items: TDto[]; meta: PageMeta }>;
  statusCounts(): Promise<Record<ContentStatus, number>>;
  get(id: string): Promise<TDto>;
  create(actor: Actor, input: TCreate): Promise<TDto>;
  update(actor: Actor, id: string, input: TUpdate): Promise<TDto>;
  remove(actor: Actor, id: string): Promise<void>;
  changeStatus(actor: Actor, id: string, status: ContentStatus): Promise<TDto>;
}

export function createContentService<TRecord extends ContentRecordBase, TCreate extends WithSystemInputs, TUpdate extends WithSystemInputs, TDto>(
  config: ContentServiceConfig<TRecord, TCreate, TUpdate, TDto>,
): ContentService<TCreate, TUpdate, TDto> {
  const { repository, toDto, module, entityType, label } = config;

  const getRecord = async (id: string) => {
    const record = await repository.findById(id);
    if (!record) throw ApiError.notFound(`${label} not found.`);
    return record;
  };

  const assertPublishable = (record: TRecord) => {
    const problems = config.publishProblems?.(record) ?? [];
    if (problems.length) {
      throw ApiError.validation(`This ${label.toLowerCase()} cannot be published yet.`, { status: problems });
    }
  };

  const claimSlug = async (requested: string | undefined, fallbackSource: string, excludeId?: string) => {
    if (requested) {
      if (await repository.slugExists(requested, excludeId)) {
        throw ApiError.conflict("This slug is already in use.", { slug: ["Already in use."] });
      }
      return requested;
    }
    return uniqueSlug(fallbackSource, (candidate) => repository.slugExists(candidate, excludeId));
  };

  const touchesPublic = (...statuses: ContentStatus[]) => statuses.includes("PUBLISHED");

  // Public reads (PUBLISHED only), cached under the module tag.
  const listPublishedCached = cachedPublicRead(module, ["list"], async () =>
    (await repository.listPublished()).map(toDto),
  );
  const bySlugCached = cachedPublicRead(module, ["slug"], async (slug: string) => {
    const record = await repository.findPublishedBySlug(slug);
    return record ? toDto(record) : null;
  });

  return {
    // ── Public ──────────────────────────────────────────────────────────────
    /** Published items for public pages and /api/public. Safe to call from Server Components. */
    listPublished: (): Promise<TDto[]> => listPublishedCached(),
    /** Published item by slug, or null (pages should call notFound()). */
    getPublishedBySlug: (slug: string): Promise<TDto | null> => bySlugCached(slug),

    // ── Admin ───────────────────────────────────────────────────────────────
    async list(query: ContentListQuery) {
      const { items, total } = await repository.list({ search: query.search, status: query.status, ...pageArgs(query) });
      return { items: items.map(toDto), meta: pageMeta(query, total) };
    },

    statusCounts: () => repository.statusCounts(),

    async get(id: string): Promise<TDto> {
      return toDto(await getRecord(id));
    },

    async create(actor: Actor, input: TCreate): Promise<TDto> {
      const { slug, sortOrder, ...fields } = input;
      // Cross-field checks run on the candidate before anything is written.
      config.validate?.({ ...fields, status: "DRAFT", publishedAt: null } as unknown as TRecord);
      const record = await repository.create({
        ...fields,
        slug: await claimSlug(slug, config.slugSource(input)),
        sortOrder: sortOrder ?? 0,
        status: "DRAFT",
        publishedAt: null,
      });
      await activityService.record(actor, "created", entityType, record.id, `Created ${label.toLowerCase()} “${config.titleOf(record)}”`);
      return toDto(record);
    },

    async update(actor: Actor, id: string, input: TUpdate): Promise<TDto> {
      const existing = await getRecord(id);
      const { slug, sortOrder, ...fields } = input;
      const nextSlug = slug && slug !== existing.slug ? await claimSlug(slug, slug, id) : undefined;

      // Validate the merged result before writing.
      const merged = { ...existing, ...stripUndefined(fields), ...(nextSlug ? { slug: nextSlug } : {}) } as TRecord;
      config.validate?.(merged);
      if (existing.status === "PUBLISHED") {
        // Block edits that would break a live record, but don't lock records
        // that were already published with gaps (e.g. imported content):
        // only problems introduced by this edit count.
        const before = new Set(config.publishProblems?.(existing) ?? []);
        const introduced = (config.publishProblems?.(merged) ?? []).filter((p) => !before.has(p));
        if (introduced.length) {
          throw ApiError.validation(`This change would leave the published ${label.toLowerCase()} incomplete.`, { status: introduced });
        }
      }

      const patch = {
        ...fields,
        ...(nextSlug ? { slug: nextSlug } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
      } as Parameters<typeof repository.update>[1];
      const record = await repository.update(id, patch);
      await activityService.record(actor, "updated", entityType, id, `Updated ${label.toLowerCase()} “${config.titleOf(record)}”`);
      if (touchesPublic(record.status)) revalidateContent(module, [existing.slug, record.slug]);
      return toDto(record);
    },

    async remove(actor: Actor, id: string): Promise<void> {
      const existing = await getRecord(id);
      await repository.delete(id);
      await activityService.record(actor, "deleted", entityType, id, `Deleted ${label.toLowerCase()} “${config.titleOf(existing)}”`);
      if (touchesPublic(existing.status)) revalidateContent(module, [existing.slug]);
    },

    async changeStatus(actor: Actor, id: string, status: ContentStatus): Promise<TDto> {
      const existing = await getRecord(id);
      if (existing.status === status) {
        throw ApiError.conflict(`This ${label.toLowerCase()} is already ${status.toLowerCase()}.`);
      }
      if (!STATUS_TRANSITIONS[existing.status].includes(status)) {
        throw ApiError.validation(`Cannot move from ${existing.status} to ${status}.`, {
          status: [`Allowed next states: ${STATUS_TRANSITIONS[existing.status].join(", ")}.`],
        });
      }
      if (status === "PUBLISHED") assertPublishable(existing);

      const record = await repository.update(id, {
        status,
        // First publication date is kept on later re-publishes (news ordering relies on it).
        ...(status === "PUBLISHED" && !existing.publishedAt ? { publishedAt: new Date() } : {}),
      } as Parameters<typeof repository.update>[1]);
      await activityService.record(actor, STATUS_ACTIONS[status], entityType, id, `${statusVerb(status)} ${label.toLowerCase()} “${config.titleOf(record)}”`);
      if (touchesPublic(existing.status, status)) revalidateContent(module, [record.slug]);
      return toDto(record);
    },
  };
}

function statusVerb(status: ContentStatus) {
  return { DRAFT: "Returned to draft", REVIEW: "Submitted for review", PUBLISHED: "Published", ARCHIVED: "Archived" }[status];
}

function stripUndefined<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}
