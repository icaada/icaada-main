import { ApiError } from "@/lib/api/api-error";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";
import { contactMessageRepository, type ContactMessageRecord } from "@/Repositories/contact-message.repository";
import { HONEYPOT_FIELD } from "@/Schemas/common.schema";
import type { ContactSubmitInput, MessageListQuery, MessageUpdateInput } from "@/Schemas/contact.schema";
import { activityService } from "@/Services/activity.service";
import { notificationService } from "@/Services/notification.service";
import { iso, pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

export interface ContactMessageDto {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  status: ContactMessageRecord["status"];
  replyDraft: string | null;
  replySavedAt: string | null;
  receivedAt: string;
  updatedAt: string;
}

const toDto = (m: ContactMessageRecord): ContactMessageDto => ({
  id: m.id,
  name: m.name,
  email: m.email,
  subject: m.subject,
  body: m.body,
  status: m.status,
  replyDraft: m.replyDraft,
  replySavedAt: iso(m.replySavedAt),
  receivedAt: m.createdAt.toISOString(),
  updatedAt: m.updatedAt.toISOString(),
});

const getMessage = async (id: string) => {
  const message = await contactMessageRepository.findById(id);
  if (!message) throw ApiError.notFound("Message not found.");
  return message;
};

export const contactMessageService = {
  /** Public contact form. Honeypot hits are acknowledged but silently dropped. */
  async submit(input: ContactSubmitInput, clientIp: string): Promise<void> {
    enforceRateLimit(`contact:${clientIp}`, rateLimits.contact);
    if (input[HONEYPOT_FIELD]) return;

    const message = await contactMessageRepository.create({
      name: input.name,
      email: input.email,
      subject: input.subject,
      body: input.body,
    });
    await activityService.record(null, "received", "message", message.id, `New message from ${message.name}: “${message.subject}”`);
    notificationService.contactReceived(message);
  },

  async list(query: MessageListQuery) {
    const [{ items, total }, unread] = await Promise.all([
      contactMessageRepository.list({ search: query.search, status: query.status, ...pageArgs(query) }),
      contactMessageRepository.countByStatus("NEW"),
    ]);
    return { items: items.map(toDto), meta: { ...pageMeta(query, total), unread } };
  },

  async get(id: string) {
    return toDto(await getMessage(id));
  },

  async update(actor: Actor, id: string, input: MessageUpdateInput) {
    const existing = await getMessage(id);
    const message = await contactMessageRepository.update(id, {
      status: input.status,
      ...(input.replyDraft !== undefined ? { replyDraft: input.replyDraft, replySavedAt: new Date() } : {}),
    });
    const what = input.status && input.status !== existing.status ? `marked ${input.status.toLowerCase()}` : "saved a reply draft for";
    await activityService.record(actor, input.status ? `status.${input.status.toLowerCase()}` : "updated", "message", id, `${actor.name} ${what} “${message.subject}”`);
    return toDto(message);
  },

  async remove(actor: Actor, id: string) {
    const existing = await getMessage(id);
    await contactMessageRepository.delete(id);
    await activityService.record(actor, "deleted", "message", id, `Deleted message “${existing.subject}”`);
  },
};
