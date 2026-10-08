import { ApiError } from "@/lib/api/api-error";
import { enforceRateLimit, rateLimits } from "@/lib/rate-limit";
import { subscriberRepository, type SubscriberRecord } from "@/Repositories/subscriber.repository";
import { verifySignedValue } from "@/lib/auth/tokens";
import { HONEYPOT_FIELD } from "@/Schemas/common.schema";
import type { SubscribeInput, SubscriberCreateInput, SubscriberListQuery, SubscriberUpdateInput } from "@/Schemas/newsletter.schema";
import { activityService } from "@/Services/activity.service";
import { notificationService, UNSUBSCRIBE_PURPOSE } from "@/Services/notification.service";
import { iso, pageArgs, pageMeta, type Actor } from "@/Services/service-utils";

export interface SubscriberDto {
  id: string;
  email: string;
  name: string | null;
  status: SubscriberRecord["status"];
  subscribedAt: string;
  unsubscribedAt: string | null;
  updatedAt: string;
}

const toDto = (s: SubscriberRecord): SubscriberDto => ({
  id: s.id,
  email: s.email,
  name: s.name,
  status: s.status,
  subscribedAt: s.subscribedAt.toISOString(),
  unsubscribedAt: iso(s.unsubscribedAt),
  updatedAt: s.updatedAt.toISOString(),
});

const getSubscriber = async (id: string) => {
  const subscriber = await subscriberRepository.findById(id);
  if (!subscriber) throw ApiError.notFound("Subscriber not found.");
  return subscriber;
};

export const subscriberService = {
  /**
   * Public sign-up. Idempotent, and the caller always gets the same response
   * whether or not the email was already subscribed (no address enumeration).
   */
  async subscribe(input: SubscribeInput, clientIp: string): Promise<void> {
    enforceRateLimit(`newsletter:${clientIp}`, rateLimits.newsletter);
    if (input[HONEYPOT_FIELD]) return;

    const before = await subscriberRepository.findByEmail(input.email);
    if (before?.status === "SUBSCRIBED") return;
    const subscriber = await subscriberRepository.upsertSubscribed(input.email, input.name);
    await activityService.record(null, before ? "resubscribed" : "subscribed", "subscriber", subscriber.id, `${subscriber.email} subscribed to the newsletter`);
    notificationService.subscriberWelcome(subscriber);
  },

  /**
   * One-click unsubscribe from a signed email link. Idempotent; returns false
   * only when the link is forged or the subscriber no longer exists.
   */
  async unsubscribeByToken(token: string | null): Promise<boolean> {
    const id = verifySignedValue(UNSUBSCRIBE_PURPOSE, token);
    if (!id) return false;
    const subscriber = await subscriberRepository.findById(id);
    if (!subscriber) return false;
    if (subscriber.status === "SUBSCRIBED") {
      await subscriberRepository.update(id, { status: "UNSUBSCRIBED", unsubscribedAt: new Date() });
      await activityService.record(null, "unsubscribed", "subscriber", id, `${subscriber.email} unsubscribed via email link`);
    }
    return true;
  },

  async list(query: SubscriberListQuery) {
    const [{ items, total }, subscribed] = await Promise.all([
      subscriberRepository.list({ search: query.search, status: query.status, ...pageArgs(query) }),
      subscriberRepository.countByStatus("SUBSCRIBED"),
    ]);
    return { items: items.map(toDto), meta: { ...pageMeta(query, total), subscribed } };
  },

  /** Admin-added subscriber (e.g. someone who signed up on paper). */
  async create(actor: Actor, input: SubscriberCreateInput) {
    if (await subscriberRepository.findByEmail(input.email)) {
      throw ApiError.conflict("This email is already on the list.", { email: ["Already subscribed."] });
    }
    const subscriber = await subscriberRepository.create(input);
    await activityService.record(actor, "created", "subscriber", subscriber.id, `Added subscriber ${subscriber.email}`);
    return toDto(subscriber);
  },

  async update(actor: Actor, id: string, input: SubscriberUpdateInput) {
    const existing = await getSubscriber(id);
    const statusChanged = input.status !== undefined && input.status !== existing.status;
    const subscriber = await subscriberRepository.update(id, {
      name: input.name,
      status: input.status,
      ...(statusChanged && input.status === "UNSUBSCRIBED" ? { unsubscribedAt: new Date() } : {}),
      ...(statusChanged && input.status === "SUBSCRIBED" ? { unsubscribedAt: null, subscribedAt: new Date() } : {}),
    });
    await activityService.record(actor, statusChanged ? `status.${subscriber.status.toLowerCase()}` : "updated", "subscriber", id, `Updated subscriber ${subscriber.email}`);
    return toDto(subscriber);
  },

  async remove(actor: Actor, id: string) {
    const existing = await getSubscriber(id);
    await subscriberRepository.delete(id);
    await activityService.record(actor, "deleted", "subscriber", id, `Removed subscriber ${existing.email}`);
  },
};
