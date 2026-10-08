import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { optionalCloudinaryUrl, optionalPublicId, optionalText, text } from "@/Schemas/common.schema";

export const programStageSchema = z.enum(["CONCEPT", "PLANNING", "ACTIVE", "REVIEW", "CLOSED"]);

export const programCreateSchema = z.object({
  ...contentBaseShape,
  title: text(200, "Title"),
  summary: text(300, "Summary"),
  description: text(4000, "Description"),
  detail: optionalText(10_000),
  stage: programStageSchema.default("CONCEPT"),
  featured: z.boolean().default(false),
  imageUrl: optionalCloudinaryUrl,
  imagePublicId: optionalPublicId,
});
export const programUpdateSchema = programCreateSchema.partial();

export type ProgramCreateInput = z.infer<typeof programCreateSchema>;
export type ProgramUpdateInput = z.infer<typeof programUpdateSchema>;
