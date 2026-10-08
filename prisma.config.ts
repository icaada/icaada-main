import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI config (migrate, generate, seed). The CLI connects with DIRECT_URL
// (non-pooled); the app runtime uses DATABASE_URL through src/lib/prisma.ts.
// DIRECT_URL is read leniently so `prisma generate` (postinstall) works on a
// clean clone without a database; migrate/seed fail clearly when it is unset.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
