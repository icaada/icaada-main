import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getEnv } from "@/lib/env";

// Only src/Repositories/** may import this module.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const { DATABASE_URL, DATABASE_POOL_MAX, NODE_ENV } = getEnv();
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL, ...(DATABASE_POOL_MAX ? { max: DATABASE_POOL_MAX } : {}) }),
    log: NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Lazily created so importing a repository never touches env/DB at build time;
// cached on globalThis so dev hot reloads don't exhaust connections.
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) globalForPrisma.prisma = createClient();
  return globalForPrisma.prisma;
}
