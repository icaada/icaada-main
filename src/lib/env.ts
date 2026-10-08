import { z } from "zod";

// Server-only environment. Validated once (on first access, and eagerly at
// server boot via src/instrumentation.ts) so a misconfigured deploy fails fast
// with a readable list of problems instead of an obscure runtime error.

const postgresUrl = z
  .string()
  .url("must be a valid URL")
  .refine(
    (value) => /^postgres(ql)?:\/\//.test(value),
    "must start with postgres:// or postgresql://",
  );

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: postgresUrl,
  DIRECT_URL: postgresUrl,
  /** Optional max connections per server instance (pg default: 10). Lower it on serverless hosts. */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).optional(),
  SESSION_SECRET: z
    .string()
    .min(32, "must be at least 32 characters (try: openssl rand -base64 48)"),
  CLOUDINARY_CLOUD_NAME: z
    .string()
    .regex(/^[a-z0-9_-]+$/i, "must be a Cloudinary cloud name, e.g. dcvyjmflf"),
  CLOUDINARY_API_KEY: z.string().regex(/^\d{6,}$/, "must be a numeric API key"),
  CLOUDINARY_API_SECRET: z
    .string()
    .min(20, "looks too short to be a Cloudinary API secret"),
  /** Public base URL used in emailed links. Falls back to Vercel's production URL, then localhost. */
  APP_URL: z.string().url("must be a full URL, e.g. https://www.icaada.com.ng").optional(),
  /** SMTP server for outgoing mail (any provider). Optional: without it, emails are logged instead of sent. */
  SMTP_HOST: z.string().min(1).optional(),
  /** 465 = implicit TLS; 587 (default) or 25 = STARTTLS. */
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  /** Force implicit TLS ("true"/"false"). Defaults to true only on port 465. */
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  /** Sender, e.g. "ICAADA <no-reply@icaada.com.ng>". Required with SMTP_HOST; the provider must allow this address. */
  EMAIL_FROM: z
    .string()
    .regex(/^(?:[^<>]+<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>|[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+)$/, 'must be an address or "Name <address>"')
    .optional(),
}).superRefine((env, ctx) => {
  if (env.SMTP_HOST && !env.EMAIL_FROM) {
    ctx.addIssue({ code: "custom", path: ["EMAIL_FROM"], message: "is required when SMTP_HOST is set" });
  }
  if (Boolean(env.SMTP_USER) !== Boolean(env.SMTP_PASS)) {
    ctx.addIssue({ code: "custom", path: [env.SMTP_USER ? "SMTP_PASS" : "SMTP_USER"], message: "SMTP_USER and SMTP_PASS must be set together" });
  }
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${problems}\nSee .env.example for every required variable.`,
    );
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = () => process.env.NODE_ENV === "production";

/** Base URL for links in emails (no trailing slash). */
export function appUrl(): string {
  const configured = getEnv().APP_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}
