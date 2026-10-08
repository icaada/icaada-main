/** "Youth Empowerment & Resilience" → "youth-empowerment-resilience" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "") || "item";
}

/** Appends -2, -3, … until `exists` reports the slug is free. */
export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = slugify(base);
  let candidate = root;
  for (let n = 2; await exists(candidate); n++) {
    candidate = `${root}-${n}`;
  }
  return candidate;
}
