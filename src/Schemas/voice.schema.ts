import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { idSchema, optionalCloudinaryUrl, optionalPublicId, optionalText, text } from "@/Schemas/common.schema";

export const voiceCreateSchema = z.object({
  ...contentBaseShape,
  name: text(120, "Name"),
  role: text(160, "Role"),
  category: optionalText(80),
  quote: text(600, "Quote"),
  description: optionalText(2000),
  imageUrl: optionalCloudinaryUrl,
  imagePublicId: optionalPublicId,
  videoTitle: optionalText(160),
  videoUrl: optionalCloudinaryUrl,
  videoPublicId: optionalPublicId,
  videoPosterUrl: optionalCloudinaryUrl,
  consentConfirmed: z.boolean().default(false),
  eventId: idSchema.nullish().transform((v) => v ?? null),
});
export const voiceUpdateSchema = voiceCreateSchema.partial();

export type VoiceCreateInput = z.infer<typeof voiceCreateSchema>;
export type VoiceUpdateInput = z.infer<typeof voiceUpdateSchema>;
