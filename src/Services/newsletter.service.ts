import { ApiError } from "@/lib/api/api-error";
import { newsletterDraftRepository, type NewsletterDraftRecord } from "@/Repositories/newsletter-draft.repository";
import type { NewsletterDraftCreateInput, NewsletterDraftUpdateInput } from "@/Schemas/newsletter.schema";
import { activityService } from "@/Services/activity.service";
import { pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

// Drafts only: sending is out of scope until an email provider is chosen.

export interface NewsletterDraftDto {
  id: string;
  subject: string;
  body: string;
  status: "draft";
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

const toDto = (d: NewsletterDraftRecord): NewsletterDraftDto => ({
  id: d.id,
  subject: d.subject,
  body: d.body,
  status: "draft",
  createdById: d.createdById,
  createdAt: d.createdAt.toISOString(),
  updatedAt: d.updatedAt.toISOString(),
});

const getDraft = async (id: string) => {
  const draft = await newsletterDraftRepository.findById(id);
  if (!draft) throw ApiError.notFound("Newsletter draft not found.");
  return draft;
};

export const newsletterService = {
  async list(query: { page: number; pageSize: number; search?: string }) {
    const { items, total } = await newsletterDraftRepository.list({ search: query.search, ...pageArgs(query) });
    return { items: items.map(toDto), meta: pageMeta(query, total) };
  },

  async get(id: string) {
    return toDto(await getDraft(id));
  },

  async create(actor: Actor, input: NewsletterDraftCreateInput) {
    const draft = await newsletterDraftRepository.create({ ...input, createdById: actor.id });
    await activityService.record(actor, "created", "newsletter", draft.id, `Created newsletter draft “${draft.subject}”`);
    return toDto(draft);
  },

  async update(actor: Actor, id: string, input: NewsletterDraftUpdateInput) {
    await getDraft(id);
    const draft = await newsletterDraftRepository.update(id, input);
    await activityService.record(actor, "updated", "newsletter", id, `Updated newsletter draft “${draft.subject}”`);
    return toDto(draft);
  },

  async remove(actor: Actor, id: string) {
    const existing = await getDraft(id);
    await newsletterDraftRepository.delete(id);
    await activityService.record(actor, "deleted", "newsletter", id, `Deleted newsletter draft “${existing.subject}”`);
  },
};
