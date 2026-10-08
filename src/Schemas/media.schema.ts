import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { idSchema, optionalCloudinaryUrl, optionalPublicId, optionalText, text } from "@/Schemas/common.schema";

export const mediaTypeSchema = z.enum(["IMAGE", "VIDEO", "DOCUMENT", "AUDIO"]);

export const mediaCreateSchema = z.object({
  ...contentBaseShape,
  title: text(200, "Title"),
  type: mediaTypeSchema.default("IMAGE"),
  category: text(80, "Category"),
  description: optionalText(2000),
  altText: optionalText(300),
  dateLabel: optionalText(120),
  imageUrl: optionalCloudinaryUrl,
  imagePublicId: optionalPublicId,
  assetUrl: optionalCloudinaryUrl,
  assetPublicId: optionalPublicId,
  voiceId: idSchema.nullish().transform((v) => v ?? null),
});
export const mediaUpdateSchema = mediaCreateSchema.partial();

export type MediaCreateInput = z.infer<typeof mediaCreateSchema>;
export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;

/** POST /api/admin/media/sign-upload */
export const signUploadSchema = z.object({
  resourceType: z.enum(["image", "video", "raw"]).default("image"),
  /** Sub-folder under icaada/, e.g. "team" or "news". */
  folder: z.string().trim().regex(/^[a-z0-9-]+$/).max(40).default("uploads"),
});
export type SignUploadInput = z.infer<typeof signUploadSchema>;
