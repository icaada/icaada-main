import { z } from "zod";
import { emailSchema, honeypotSchema, optionalText, paginationQuerySchema, stringList, text } from "@/Schemas/common.schema";

export const volunteerStatusSchema = z.enum(["NEW", "CONTACTED", "ARCHIVED"]);
export type VolunteerStatus = z.infer<typeof volunteerStatusSchema>;

/** POST /api/public/volunteers (native replacement for the old Google Form). */
export const volunteerSubmitSchema = honeypotSchema.extend({
  name: text(120, "Name"),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Enter a valid phone number.")
    .nullish()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  state: text(60, "State"),
  lga: optionalText(80),
  interests: stringList(10, 80).min(1, "Choose at least one area of interest."),
  availability: optionalText(200),
  message: optionalText(3000),
});
export type VolunteerSubmitInput = z.infer<typeof volunteerSubmitSchema>;

export const volunteerListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(200).optional(),
  status: volunteerStatusSchema.optional(),
});
export const volunteerUpdateSchema = z.object({ status: volunteerStatusSchema });
export type VolunteerListQuery = z.infer<typeof volunteerListQuerySchema>;
export type VolunteerUpdateInput = z.infer<typeof volunteerUpdateSchema>;
