import { z } from "zod";
import { slugSchema } from "@/Schemas/common.schema";

/** Fields every content module accepts on create/update (status changes go through /status). */
export const contentBaseShape = {
  slug: slugSchema.optional(),
  sortOrder: z.coerce.number().int().min(0).max(100_000).optional(),
};
