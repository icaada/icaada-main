import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { optionalCloudinaryUrl, optionalHttpUrl, optionalPublicId, optionalText, text } from "@/Schemas/common.schema";

export const partnerTypeSchema = z.enum(["INSTITUTIONAL", "COMMUNITY", "FUNDER", "TECHNICAL"]);

export const partnerCreateSchema = z.object({
  ...contentBaseShape,
  name: text(200, "Name"),
  type: partnerTypeSchema.default("INSTITUTIONAL"),
  description: optionalText(2000),
  website: optionalHttpUrl,
  logoUrl: optionalCloudinaryUrl,
  logoPublicId: optionalPublicId,
});
export const partnerUpdateSchema = partnerCreateSchema.partial();

export type PartnerCreateInput = z.infer<typeof partnerCreateSchema>;
export type PartnerUpdateInput = z.infer<typeof partnerUpdateSchema>;
