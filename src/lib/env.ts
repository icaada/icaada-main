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
