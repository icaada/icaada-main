import { z } from "zod";
import { contentBaseShape } from "@/Schemas/content-base.schema";
import { optionalCloudinaryUrl, optionalPublicId, optionalText, text } from "@/Schemas/common.schema";

export const eventPhaseSchema = z.enum(["ENVISIONED", "UPCOMING", "ONGOING", "PAST"]);

const optionalDate = z.coerce.date().nullish().transform((v) => v ?? null);

export const eventCreateSchema = z.object({
  ...contentBaseShape,
  title: text(200, "Title"),
  type: text(80, "Type"),
  location: text(200, "Location"),
  description: text(2000, "Description"),
  body: optionalText(20_000),
  phase: eventPhaseSchema.default("UPCOMING"),
  dateLabel: optionalText(120),
  startsAt: optionalDate,
  endsAt: optionalDate,
  imageUrl: optionalCloudinaryUrl,
  imagePublicId: optionalPublicId,
  contentNote: optionalText(200),
});
export const eventUpdateSchema = eventCreateSchema.partial();

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;
