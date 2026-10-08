import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

// Public content caching (Next 16, Cache Components NOT enabled → the
// "previous model": unstable_cache + revalidateTag/revalidatePath).
// Public reads are cached per module tag; admin mutations invalidate the tag
// and the public paths that render it.

export type ContentModule =
  | "team"
  | "events"
  | "media"
  | "voices"
  | "news"
  | "programs"
  | "partners";

export const contentTag = (module: ContentModule) => `content:${module}`;

/** Public pages that render each module (see src/app/(public)). */
const publicPaths: Record<ContentModule, string[]> = {
  team: ["/team"],
  events: ["/", "/events"],
  media: ["/media"],
  voices: ["/", "/media", "/events"],
  news: ["/news"],
  programs: ["/", "/about", "/our-work"],
  partners: ["/", "/about"],
};

const detailBase: Partial<Record<ContentModule, string>> = {
  events: "/events",
  news: "/news",
};

/**
 * Caches a public read under the module's tag. Results must be JSON-safe
 * (DTOs use ISO date strings) because unstable_cache serialises them.
 */
export function cachedPublicRead<Args extends unknown[], R>(
  module: ContentModule,
  keyParts: string[],
  fn: (...args: Args) => Promise<R>,
) {
  return unstable_cache(fn, ["public", module, ...keyParts], {
    tags: [contentTag(module)],
    revalidate: 3600,
  });
}

/**
 * Invalidates cached public data after an admin mutation. `expire: 0` so the
 * next visitor sees the change immediately (editors expect publish to be
 * visible at once). Outside a Next request (e.g. scripts) this is a no-op.
 */
export function revalidateContent(module: ContentModule, slugs: (string | null | undefined)[] = []) {
  try {
    revalidateTag(contentTag(module), { expire: 0 });
    for (const path of publicPaths[module]) revalidatePath(path);
    const base = detailBase[module];
    if (base) {
      for (const slug of slugs) if (slug) revalidatePath(`${base}/${slug}`);
    }
  } catch (error) {
    console.warn(`[cache] revalidation skipped for ${module}`, error);
  }
}
