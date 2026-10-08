import { z } from "zod";
import { getEnv } from "@/lib/env";

// ─── Domain enums (source of truth for services; mirror prisma/schema.prisma) ──

export const contentStatusSchema = z.enum(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"]);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

export const roleSchema = z.enum(["ADMIN", "EDITOR"]);
export type Role = z.infer<typeof roleSchema>;

export const accountStatusSchema = z.enum(["ACTIVE", "DISABLED"]);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

// ─── Field helpers ────────────────────────────────────────────────────────────

/** Required trimmed text. */
export const text = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`);

/** Optional text; "" and null clear the value (stored as null). */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .nullish()
    .transform((value) => (value ? value : null));

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens.")
  .max(80);

export const httpUrl = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => /^https?:\/\//.test(value), "URL must start with http:// or https://");

/** Cloudinary delivery URL on the configured cloud (matches next.config.ts images allow-list). */
export const cloudinaryUrl = z
  .string()
  .trim()
  .url("Enter a valid URL.")
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        url.hostname === "res.cloudinary.com" &&
        url.pathname.startsWith(`/${getEnv().CLOUDINARY_CLOUD_NAME}/`)
      );
    } catch {
      return false;
    }
  }, "Media must be hosted on the ICAADA Cloudinary account.");

export const optionalCloudinaryUrl = cloudinaryUrl.nullish().or(z.literal("")).transform((v) => (v ? v : null));
export const optionalHttpUrl = httpUrl.nullish().or(z.literal("")).transform((v) => (v ? v : null));
export const optionalPublicId = optionalText(255);

export const stringList = (maxItems: number, maxLength = 120) =>
  z.array(z.string().trim().min(1).max(maxLength)).max(maxItems);

// ─── Requests shared by every module ──────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const contentListQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(200).optional(),
  status: contentStatusSchema.optional(),
});
export type ContentListQuery = z.infer<typeof contentListQuerySchema>;

export const statusChangeSchema = z.object({ status: contentStatusSchema });

export const idSchema = z.string().trim().min(1).max(64);

/** Public form spam trap: real users never see or fill this field. */
export const HONEYPOT_FIELD = "company";
export const honeypotSchema = z.object({
  [HONEYPOT_FIELD]: z.string().max(500).optional(),
});
