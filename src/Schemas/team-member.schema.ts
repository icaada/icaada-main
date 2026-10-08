import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { emailSchema, httpUrl, optionalCloudinaryUrl, optionalPublicId, optionalText, stringList, text } from "@/Schemas/common.schema";

export const teamMemberCreateSchema = z.object({
  ...contentBaseShape,
  name: text(120, "Name"),
  position: text(160, "Position"),
  biography: text(5000, "Biography"),
  imageUrl: optionalCloudinaryUrl,
  imagePublicId: optionalPublicId,
  responsibilities: stringList(20, 200).default([]),
  expertise: stringList(20).default([]),
  email: emailSchema.nullish().or(z.literal("")).transform((v) => (v ? v : null)),
  phone: optionalText(40),
  location: optionalText(120),
  socialLinks: z.array(z.object({ label: text(40, "Label"), url: httpUrl })).max(10).default([]),
});
export const teamMemberUpdateSchema = teamMemberCreateSchema.partial();

export type TeamMemberCreateInput = z.infer<typeof teamMemberCreateSchema>;
export type TeamMemberUpdateInput = z.infer<typeof teamMemberUpdateSchema>;
