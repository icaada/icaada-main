import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { optionalCloudinaryUrl, optionalPublicId, optionalText, text } from "@/Schemas/common.schema";

export const newsCreateSchema = z.object({
  ...contentBaseShape,
  title: text(200, "Title"),
  category: text(80, "Category"),
  excerpt: text(300, "Excerpt"),
  body: optionalText(50_000),
  dateLabel: optionalText(120),
  readLabel: optionalText(60),
  imageUrl: optionalCloudinaryUrl,
  imagePublicId: optionalPublicId,
});
export const newsUpdateSchema = newsCreateSchema.partial();

export type NewsCreateInput = z.infer<typeof newsCreateSchema>;
export type NewsUpdateInput = z.infer<typeof newsUpdateSchema>;
