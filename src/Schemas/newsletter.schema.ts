import { z } from "zod";
import { emailSchema, honeypotSchema, optionalText, paginationQuerySchema, text } from "@/Schemas/common.schema";

export const subscriberStatusSchema = z.enum(["SUBSCRIBED", "UNSUBSCRIBED"]);
export type SubscriberStatus = z.infer<typeof subscriberStatusSchema>;

/** POST /api/public/newsletter/subscribe */
export const subscribeSchema = honeypotSchema.extend({
  email: emailSchema,
  name: optionalText(120),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;

export const subscriberListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(200).optional(),
  status: subscriberStatusSchema.optional(),
});
export const subscriberCreateSchema = z.object({
  email: emailSchema,
  name: optionalText(120),
  status: subscriberStatusSchema.default("SUBSCRIBED"),
});
export type SubscriberCreateInput = z.infer<typeof subscriberCreateSchema>;

export const subscriberUpdateSchema = z.object({
  status: subscriberStatusSchema.optional(),
  name: optionalText(120).optional(),
});
export type SubscriberListQuery = z.infer<typeof subscriberListQuerySchema>;
export type SubscriberUpdateInput = z.infer<typeof subscriberUpdateSchema>;

export const newsletterDraftCreateSchema = z.object({
  subject: text(200, "Subject"),
  body: text(50_000, "Body"),
});
export const newsletterDraftUpdateSchema = newsletterDraftCreateSchema.partial();
export type NewsletterDraftCreateInput = z.infer<typeof newsletterDraftCreateSchema>;
export type NewsletterDraftUpdateInput = z.infer<typeof newsletterDraftUpdateSchema>;
