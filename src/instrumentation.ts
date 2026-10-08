// Runs once when a Next.js server instance starts. Validating env here makes a
// misconfigured server refuse to boot instead of failing on the first request.
// Skipped during `next build` so the app can be built without secrets.
export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    const { getEnv } = await import("@/lib/env");
    getEnv();
  }
}
