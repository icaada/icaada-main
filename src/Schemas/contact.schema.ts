import { z } from "zod";
import { emailSchema, honeypotSchema, paginationQuerySchema, text } from "@/Schemas/common.schema";

export const messageStatusSchema = z.enum(["NEW", "READ", "ARCHIVED"]);
export type MessageStatus = z.infer<typeof messageStatusSchema>;

/** POST /api/public/contact */
export const contactSubmitSchema = honeypotSchema.extend({
  name: text(120, "Name"),
  email: emailSchema,
  subject: text(200, "Subject"),
  body: text(5000, "Message"),
});
export type ContactSubmitInput = z.infer<typeof contactSubmitSchema>;

export const messageListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(200).optional(),
  status: messageStatusSchema.optional(),
});
export const messageUpdateSchema = z.object({
  status: messageStatusSchema.optional(),
  replyDraft: z.string().max(10_000).nullable().optional(),
});
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
export type MessageUpdateInput = z.infer<typeof messageUpdateSchema>;
